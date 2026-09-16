<script setup lang="ts">
import { ref, computed } from 'vue'
import Lightgallery from 'lightgallery/vue'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgZoom from 'lightgallery/plugins/zoom'
import 'lightgallery/css/lightgallery.css'
import 'lightgallery/css/lg-thumbnail.css'
import 'lightgallery/css/lg-zoom.css'
const plugins = [lgThumbnail, lgZoom]

const props = defineProps<{ plant: Record<string, any> }>()

const gridThumbFailed = ref(false)
const tableThumbFailed = ref(false)
const imageFailed = ref(false)
const thumbUrl = computed(() =>
  props.plant.images[0] ? `${props.plant.images[0].url}?tr=w-400,q-80` : null
)
const gridImage = computed(() => props.plant.images[0]?.url ?? null)

const store = usePlantsStore()

const isOpen = ref(false)
function toggleMore() {
  isOpen.value = !isOpen.value
}

// --- Groupes de champs détaillés, séparés visuellement par un <hr> ---
const detailGroups = [
  [
    { key: 'type', label: 'Type' },
    { key: 'origin', label: 'Origine' },
    { key: 'family', label: 'Famille' },
    { key: 'cycle', label: 'Cycle' },
    { key: 'rusticity', label: 'Rusticité' },
    { key: 'leaves', label: 'Feuillage' },
  ],
  [
    { key: 'exposure', label: 'Exposition' },
    { key: 'biotope', label: 'Biotope' },
    { key: 'soilType', label: 'Sol' },
    { key: 'acidity', label: 'Acidité' },
    { key: 'humidity', label: 'Humidité' },
  ],
  [
    { key: 'edible', label: 'Comestible' },
    { key: 'melliferous', label: 'Mellifère' },
    { key: 'invasive', label: 'Invasive' },
    { key: 'toxic', label: 'Toxique' },
    { key: 'medicinal', label: 'Médicinale' },
    { key: 'usage', label: 'Utilisation' },
    { key: 'description', label: 'Description' },
  ],
]

// Champs "base de données" : traités à part car regroupés sur une seule ligne (Ecosem / Ecoflora).
const databaseLabels = computed(() => {
  const labels: string[] = []
  if (props.plant.ecosem) labels.push('Ecosem')
  if (props.plant.ecoflora) labels.push('Ecoflora')
  if (props.plant.ifapme) labels.push('IFAPME')
  if (props.plant.natagora) labels.push('Natagora')
  if (props.plant.sourceOther) labels.push('Autre')
  return labels
})

const hasAnyDetail = computed(() =>
  detailGroups.flat().some(f => props.plant[f.key]) || databaseLabels.value.length > 0
)

const isMedicinal = computed(() => props.plant.medicinal?.trim().toLowerCase() === 'oui')
const isInvasive = computed(() => props.plant.invasive?.trim().toLowerCase() === 'oui')
const isToxic = computed(() => props.plant.toxic?.trim().toLowerCase() === 'oui')
const isNative = computed(() => props.plant.origin === 'Indigène')
</script>

<template>
  <div class="plant__inner">
    <div class="plant__item plant__item-name has-value">
      <div class="plant__item-image">
        <div v-if="plant.images.length" class="plant__images-count">
          {{ plant.images.length }}
        </div>

        <ClientOnly v-if="plant.images.length">
        </ClientOnly>

        <ClientOnly v-if="plant.images.length">
          <Lightgallery :settings="{ speed: 400 }" :plugins="plugins" class="plant__gallery">
            <a
              v-for="(img, i) in plant.images"
              :key="img.url"
              :href="img.url"
              :data-sub-html="img.caption || ''"
              :style="i === 0 ? {} : { display: 'none' }"
            >
              <template v-if="i === 0">
                <img
                  v-if="gridImage && !gridThumbFailed"
                  :src="gridImage"
                  :alt="plant.vernacularName || plant.scientificName"
                  class="plant__thumb plant__thumb--grid"
                  loading="lazy"
                  @error="gridThumbFailed = true"
                >
                <div v-else class="plant__thumb-placeholder plant__thumb-placeholder--grid">🌿</div>

                <img
                  v-if="plant.thumbnail && !tableThumbFailed"
                  :src="plant.thumbnail"
                  :alt="plant.vernacularName || plant.scientificName"
                  class="plant__thumb plant__thumb--table"
                  loading="lazy"
                  @error="tableThumbFailed = true"
                >
                <div v-else class="plant__thumb-placeholder plant__thumb-placeholder--table">🌿</div>
              </template>
            </a>
          </Lightgallery>
        </ClientOnly>

        <div v-else class="plant__thumb-placeholder">🌿</div>
      </div>

      <div class="plant__header">
        <p class="plant__latin">
          {{ store.order === 'vernacularName' ? plant.vernacularName : plant.scientificName }}
          <span v-if="isToxic" title="Toxique">☠️</span>
          <span v-if="isInvasive" title="Invasive">⛔️</span>
          <span v-if="plant.edible" title="Comestible">😋</span>
          <span v-if="plant.melliferous" title="Mellifère">🐝</span>
          <span v-if="isNative" title="Indigène">🇧🇪</span>
        </p>
        <p class="plant__vernaculaire">
          {{ store.order === 'vernacularName' ? plant.scientificName : plant.vernacularName }}
        </p>
      </div>
    </div>

    <div :class="{ 'has-value': plant.category }" class="plant__item plant__item-categorie">
      <h3 v-if="plant.category">Catégorie</h3>
      <p class="plant__categorie">{{ plant.category }}</p>
    </div>
    <div :class="{ 'has-value': plant.type }" class="plant__item plant__item-type">
      <h3>Type</h3>
      <p class="plant__type">{{ plant.type }}</p>
    </div>
    <div :class="{ 'has-value': plant.height }" class="plant__item plant__item-hauteur">
      <h3>Taille</h3>
      <p class="plant__hauteur">{{ plant.height }}</p>
    </div>
    <div :class="{ 'has-value': plant.bloomMonths }" class="plant__item plant__item-floraison">
      <h3>Floraison</h3>
      <p class="plant__floraison">{{ plant.bloomMonths }}</p>
    </div>
    <div :class="{ 'has-value': plant.flowerColor }" class="plant__item plant__item-color">
      <h3>Fleur</h3>
      <p class="plant__color">{{ plant.flowerColor }}</p>
    </div>

    <div class="plant__item plant__item-actions">
      <button
        class="button"
        :class="hasAnyDetail ? 'plants-toggle' : 'plants-toggle-disabled'"
        :disabled="!hasAnyDetail"
        @click="toggleMore"
      >
        Détail <i>▾</i>
      </button>
    </div>

    <div v-if="hasAnyDetail && isOpen" class="plant__more">
      <template v-for="(group, gi) in detailGroups" :key="gi">
        <div
          v-for="field in group.filter(f => plant[f.key])"
          :key="field.key"
          :class="`plant__more-item plant__more-item--${field.key}`"
        >
          <h3>{{ field.label }}</h3>
          <p>{{ plant[field.key] }}</p>
        </div>
        <hr v-if="gi < detailGroups.length - 1" class="separator">
      </template>

      <div v-if="databaseLabels.length" class="plant__more-item plant__more-item--database">
        <h3>Source</h3>
        <p class="plant__database">
          <span v-for="label in databaseLabels" :key="label">{{ label }}</span>
        </p>
      </div>
    </div>
  </div>
</template>
