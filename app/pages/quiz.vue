<script setup lang="ts">
import { VueAgile } from 'vue-agile'
import { usePlantsStore } from '~/stores/plants'

const QUIZ_SOURCE_FIELDS: Record<string, string> = {
  Natagora: 'natagora',
  Ecosem: 'ecosem',
  Ecoflora: 'ecoflora',
  IFAPME: 'ifapme',
}

const store = usePlantsStore()
const selectedSource = ref<keyof typeof QUIZ_SOURCE_FIELDS>('Natagora')
const currentSlide = ref(0)
const revealed = ref<Set<string>>(new Set())
const imageIndexBySlug = ref<Record<string, number>>({})
const carousel = ref<InstanceType<typeof VueAgile> | null>(null)

const quizPlants = computed(() =>
  store.plants.filter(p =>
    p.images.length > 0 && !!(p as any)[QUIZ_SOURCE_FIELDS[selectedSource.value]]
  )
)

function currentImage(plant: any) {
  const idx = imageIndexBySlug.value[plant.slug] ?? 0
  return plant.images[idx]?.url
}

function toggleImage(plant: any) {
  const total = plant.images.length
  if (total <= 1) return
  const current = imageIndexBySlug.value[plant.slug] ?? 0
  imageIndexBySlug.value[plant.slug] = (current + 1) % total
}

function toggleName(slug: string) {
  revealed.value.has(slug) ? revealed.value.delete(slug) : revealed.value.add(slug)
}

function afterChange(e: { currentSlide: number }) {
  currentSlide.value = e.currentSlide
  revealed.value.clear()
}

function resetSlide() {
  currentSlide.value = 0
  carousel.value?.goTo(0)
}

function slidesJump() {
  const total = quizPlants.value.length
  const next = currentSlide.value + 10
  carousel.value?.goTo(next < total ? next : 0)
}

// Reset carousel when changing source (the filtered list changes length).
watch(selectedSource, () => {
  currentSlide.value = 0
  revealed.value.clear()
})
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">
        <NuxtLink to="/" class="nav-list__link">
          <span class="page-title__text">Plantlist</span>
          <img src="~/assets/images/logo.svg" data-not-lazy />
        </NuxtLink>
      </h1>

      <MainNavigation/>
    </header>

    <main class="l-constrain quiz-content">
      <ClientOnly v-if="quizPlants.length">
        <VueAgile
          :key="selectedSource"
          ref="carousel"
          :dots="false"
          :swipe-distance="100"
          :infinite="true"
          @after-change="afterChange"
        >
          <template #caption>
            <button class="button-quiz-reset button-quiz" @click="resetSlide">
              {{ currentSlide + 1 }}/{{ quizPlants.length }}
            </button>
            <button class="quiz-item__slide-jump button-quiz" @click="slidesJump">+10</button>
          </template>

          <div
            v-for="plant in quizPlants"
            :key="plant.slug"
            class="slide quiz-item"
            :class="{ 'is-revealed': revealed.has(plant.slug) }"
          >
            <button class="quiz-item__solution-toggle button-quiz" @click="toggleName(plant.slug)">👀</button>
            <div class="quiz-item__front">
              <button class="quiz-item__image-toggle" @click="toggleImage(plant)">Changer d'image</button>
              <img
                :src="currentImage(plant)"
                class="quiz-item__image is-active"
                :alt="plant.vernacularName || plant.scientificName"
              >
            </div>
            <div class="quiz-item__back">
              <h1 class="quiz-item__botanical">{{ plant.scientificName }}</h1>
              <h2 class="quiz-item__familiar">{{ plant.vernacularName }}</h2>
              <div class="quiz-item__metas">
                <p class="quiz-item__type"><span class="quiz-item__label">Type: </span>{{ plant.type }}</p>
                <p class="quiz-item__cycle"><span class="quiz-item__label">Cycle: </span>{{ plant.cycle }}</p>
                <p class="quiz-item__bloomMonths"><span class="quiz-item__label">Floraison: </span>{{ plant.bloomMonths }}</p>
              </div>
            </div>
          </div>
        </VueAgile>
      </ClientOnly>

      <div v-else>
        <p>Aucune plante avec photo pour cette source.</p>
      </div>

      <div class="quiz-filter">
        <span class="quiz-filter__title">Source:</span>
        <label v-for="label in Object.keys(QUIZ_SOURCE_FIELDS)" :key="label" class="quiz-filter__option">
          <input type="radio" name="quiz-source" :value="label" v-model="selectedSource">
          {{ label }}
        </label>
      </div>

    </main>
  </div>
</template>
