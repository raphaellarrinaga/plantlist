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

const { open } = usePlantPanel()

const gridThumbFailed = ref(false)
const tableThumbFailed = ref(false)
const gridImage = computed(() => props.plant.images[0]?.url ?? null)

const store = usePlantsStore()
</script>

<template>
  <div class="plant__inner">
    <div class="plant__item plant__item-name has-value">
      <div class="plant__item-image">
        <div v-if="plant.images.length" class="plant__images-count">
          {{ plant.images.length }}
        </div>

        <ClientOnly v-if="plant.images.length">
          <Lightgallery :settings="{ speed: 150 }" :plugins="plugins" class="plant__gallery">
            <a
              v-for="(img, i) in plant.images"
              :key="img.url"
              :href="img.url"
              :data-sub-html="galleryItemHtml(img)"
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
          <template v-if="store.order === 'vernacularName'">{{ plant.vernacularName }}</template>
          <template v-else>
            {{ plant.scientificName }}
            <span v-if="varietyLabel(plant)" class="plant__variety">{{ varietyLabel(plant) }}</span>
          </template>
          <span v-for="flag in plantFlags(plant)" :key="flag.title" :title="flag.title">{{ flag.icon }}</span>
        </p>
        <p class="plant__vernaculaire">
          <template v-if="store.order === 'vernacularName'">
            {{ plant.scientificName }}
            <span v-if="varietyLabel(plant)" class="plant__variety">{{ varietyLabel(plant) }}</span>
          </template>
          <template v-else>{{ plant.vernacularName }}</template>
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
        :class="hasPlantDetail(plant) ? 'plants-toggle' : 'plants-toggle-disabled'"
        :disabled="!hasPlantDetail(plant)"
        :data-plant-trigger="plant.slug"
        @click="open(plant.slug)"
      >
        <span>Détail ▸</span>
      </button>
    </div>
  </div>
</template>
