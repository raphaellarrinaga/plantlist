<script setup lang="ts">
import { onKeyStroke, useScrollLock } from '@vueuse/core'

import Lightgallery from 'lightgallery/vue'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgZoom from 'lightgallery/plugins/zoom'
import 'lightgallery/css/lightgallery.css'
import 'lightgallery/css/lg-thumbnail.css'
import 'lightgallery/css/lg-zoom.css'

const plugins = [lgThumbnail, lgZoom]
const galleryOpen = ref(false)
const thumbFailed = ref(false)

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

onKeyStroke('Escape', () => {
  if (plant.value && !galleryOpen.value) close()
})

const body = ref<HTMLElement | null>(null)
onMounted(() => { body.value = document.body })
const locked = useScrollLock(body)

const closeBtn = ref<HTMLButtonElement | null>(null)

function setBackgroundInert(value: boolean) {
  document.getElementById('__nuxt')?.toggleAttribute('inert', value)
}

watch(plant, async (current, previous) => {
  thumbFailed.value = false
  galleryOpen.value = false
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

// --- Share ---
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
    // Share canceled by user, or clipboard denied: nothing to do.
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
                <span v-if="varietyLabel(plant)" class="plant-panel__variety">{{ varietyLabel(plant) }}</span>
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
            <Lightgallery
              v-if="plant.images.length && !thumbFailed"
              :key="plant.slug"
              class="plant-panel__gallery"
              :settings="{ speed: 150 }"
              :plugins="plugins"
              :onAfterOpen="() => (galleryOpen = true)"
              :onAfterClose="() => (galleryOpen = false)"
            >
              <a
                v-for="(img, i) in plant.images"
                :key="img.url"
                :href="img.url"
                :data-sub-html="galleryItemHtml(img)"
                :aria-label="i === 0 ? `Agrandir les photos de ${plantTitle(plant)} (${plant.images.length})` : undefined"
                :style="i === 0 ? {} : { display: 'none' }"
              >
                <img
                  v-if="i === 0"
                  :src="img.url"
                  :alt="plant.vernacularName || plant.scientificName"
                  class="plant-panel__thumb"
                  @error="thumbFailed = true"
                >
              </a>
            </Lightgallery>
          </header>

          <div class="plant-panel__body">
            <div v-for="(group, gi) in groups" :key="gi" class="plant-panel__group">
              <template v-for="field in group" :key="field.key">
                <div class="plant-panel__field">
                  <div class="plant-panel__label">{{ field.label }}</div>
                  <div class="plant-panel__value">{{ plant[field.key] }}</div>
                </div>
              </template>
            </div>

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

<style scoped lang="scss">
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
  background-color: $page-color;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem;

  > div:first-child {
    flex: 1;
    min-width: 0;
  }

  @media screen and (min-width: 421px) {
    border-top-left-radius: .75rem;
    border-top-right-radius: .75rem;
  }
}

.plant-panel__title {
  margin: 0;
  font-size: 1.25rem;
}

.plant-panel__subtitle {
  margin: 0.25rem 0 0;
  color: $text-mid;
}

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
  padding-bottom: .25rem;
  border-bottom: 1px solid #eef0f6;

  &:nth-child(2) {
    column-count: 2;
    column-gap: 1rem;
    padding-bottom: 1rem;
  }
}

.plant-panel__field {
  break-inside: avoid;
  margin-bottom: 0.75rem;
}

.plant-panel__label {
  color: #666;
  font-size: 0.8rem;
  font-weight: normal;
  text-transform: uppercase;
  margin: 0 0 .25rem;
}

.plant-panel__sources {
  display: flex;
  margin: 0 0 .75rem;
  flex-wrap: wrap;
  gap: 0.4rem;

  span {
    padding: 0.15rem 0.5rem;
    background: #f5f6fb;
    border-radius: 999px;
    font-size: 0.85rem;
  }
}

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

.plant-panel__gallery {
  display: block;
  flex-basis: 100%;

  a {
    cursor: zoom-in;
  }
}

.plant-panel__thumb {
  border-radius: .5rem;
  width: 100%;
  aspect-ratio: 2 / 1;
  object-fit: cover;
}
</style>
