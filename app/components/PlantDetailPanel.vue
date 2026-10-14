<script setup lang="ts">
import { onKeyStroke, useScrollLock } from '@vueuse/core'

const store = usePlantsStore()
const { selectedSlug, close } = usePlantPanel()

const plant = computed<Record<string, any> | null>(
  () => store.plants.find(p => p.slug === selectedSlug.value) ?? null
)

const groups = computed(() =>
  detailGroups
    .map(g => g.filter(f => plant.value?.[f.key]))
    .filter(g => g.length)
)

onKeyStroke('Escape', () => { if (plant.value) close() })

const body = ref<HTMLElement | null>(null)
onMounted(() => { body.value = document.body })
const locked = useScrollLock(body)

const closeBtn = ref<HTMLButtonElement | null>(null)

function setBackgroundInert(value: boolean) {
  document.getElementById('__nuxt')?.toggleAttribute('inert', value)
}

watch(plant, async (current, previous) => {
  locked.value = !!current
  setBackgroundInert(!!current)
  await nextTick()
  if (current) {
    closeBtn.value?.focus({ preventScroll: true })
  } else if (previous) {
    // Rend le focus au bouton « Détail » de la carte qui a ouvert le panneau.
    document.querySelector<HTMLElement>(`[data-plant-trigger="${previous.slug}"]`)?.focus()
  }
})

// Si on quitte la page avec le panneau ouvert, on remet tout en état.
onBeforeUnmount(() => {
  selectedSlug.value = null
  setBackgroundInert(false)
  locked.value = false
})

// --- Partage ---
const copied = ref(false)

async function share() {
  if (!plant.value) return
  const url = `${location.origin}${location.pathname}#plant=${plant.value.slug}`
  const useNativeShare =
    typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches
  try {
    if (useNativeShare) {
      await navigator.share({ title: plant.value.scientificName, url })
    } else {
      await navigator.clipboard.writeText(url)
      copied.value = true
      setTimeout(() => (copied.value = false), 2000)
    }
  } catch {
    // Partage annulé par l'utilisateur, ou presse-papiers refusé : rien à faire.
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="panel">
      <div v-if="plant" class="plant-panel__overlay" @click.self="close">
        <aside
          class="plant-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="plant-panel-title"
        >
          <header class="plant-panel__header">
            <div>
              <h2 id="plant-panel-title" class="plant-panel__title">
                {{ plant.scientificName }}
                <span v-for="flag in plantFlags(plant)" :key="flag.title" :title="flag.title">{{ flag.icon }}</span>
              </h2>
              <p v-if="plant.vernacularName" class="plant-panel__subtitle">{{ plant.vernacularName }}</p>
            </div>
            <div class="plant-panel__actions">
              <button class="plant-panel__share" aria-live="polite" @click="share">
                {{ copied ? '✓' : '🔗' }}
              </button>
              <button ref="closeBtn" class="plant-panel__close" aria-label="Fermer" @click="close">✕</button>
            </div>
          </header>

          <div class="plant-panel__body">
            <dl v-for="(group, gi) in groups" :key="gi" class="plant-panel__group">
              <template v-for="field in group" :key="field.key">
                <dt class="plant-panel__label">{{ field.label }}</dt>
                <dd>{{ plant[field.key] }}</dd>
              </template>
            </dl>

            <div v-if="plantSources(plant).length" class="plant-panel__group">
              <h3 class="plant-panel__label">Source</h3>
              <p class="plant-panel__sources">
                <span v-for="label in plantSources(plant)" :key="label">{{ label }}</span>
              </p>
            </div>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.plant-panel__overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.4);
}
.plant-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  width: min(26rem, 100vw);
  background: #fff;
  box-shadow: 0 0 2px rgba(17, 17, 17, 0.35), -2px 2px 2px rgba(17, 17, 17, 0.1), 2px 0 2px rgba(17, 17, 17, 0.1);

  @media screen and (min-width: 421px) {
    border-radius: .75rem;
    top: .75rem;
    right: .75rem;
    bottom: .75rem;
  }
}


.plant-panel__header {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: #f6f6f6;

  @media screen and (min-width: 421px) {
    border-top-left-radius: .75rem;
    border-top-right-radius: .75rem;
  }
}
.plant-panel__title { margin: 0; font-size: 1.25rem; }
.plant-panel__subtitle { margin: 0.25rem 0 0; color: #4f4f4f; }
.plant-panel__close {
  align-self: flex-start;
  padding: 0;
  background: #fefefe;
  border: 1px solid #dee1ed;
  color: #6b6b6b;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 50%;
  height: 2.5rem;
  width: 2.5rem;
}
.plant-panel__body {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 1.5rem;
  padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
}
.plant-panel__group {
  margin: 0 0 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eef0f6;
}
.plant-panel__label {
  color: #666;
  font-size: 0.8rem;
  font-weight: normal;
  margin-bottom: 0.25rem;
  margin-top: 0.5rem;
  text-transform: uppercase;
}
.plant-panel__group dd { margin: 0.1rem 0 0; }
.plant-panel__sources {
  display: flex;
  margin: 0;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.plant-panel__sources span {
  padding: 0.15rem 0.5rem;
  background: #f5f6fb;
  border-radius: 999px;
  font-size: 0.85rem;
}

/* Animation : fondu du fond + glissement du panneau (même durée des deux côtés). */
.panel-enter-active,
.panel-leave-active { transition: opacity 0.25s ease; }
.panel-enter-active .plant-panel,
.panel-leave-active .plant-panel { transition: transform 0.25s ease; }
.panel-enter-from,
.panel-leave-to { opacity: 0; }
.panel-enter-from .plant-panel,
.panel-leave-to .plant-panel { transform: translateX(100%); }

.plant-panel__actions {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}
.plant-panel__share {
  /* padding: 0.25rem 0.6rem; */
  /* background: none; */
  /* border: 1px solid #dee1ed; */
  /* border-radius: 4px; */
  align-self: flex-start;
  padding: 0;
  background: none;
  border: 1px solid #dee1ed;
  color: #6b6b6b;
  font-size: .8rem;
  cursor: pointer;
  border-radius: 50%;
  height: 2.5rem;
  width: 2.5rem;
}

@media (prefers-reduced-motion: reduce) {
  .panel-enter-active,
  .panel-leave-active,
  .panel-enter-active .plant-panel,
  .panel-leave-active .plant-panel {
    transition: none;
  }
}
</style>
