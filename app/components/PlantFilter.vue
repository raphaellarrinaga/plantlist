<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useDebounceFn, onClickOutside } from '@vueuse/core'
import { usePlantsStore } from '~/stores/plants'

const store = usePlantsStore()
const showFilters = ref(false)

const searchInput = ref(store.search)
const debouncedSearch = useDebounceFn((v: string) => (store.search = v), 400)
watch(searchInput, debouncedSearch)

onMounted(() => store.initHeightRange())

const orderOptions = [
  { label: 'Nom scientifique', value: 'scientificName' },
  { label: 'Nom vernaculaire', value: 'vernacularName' },
  { label: 'Famille', value: 'family' },
]
const orderLabel = computed(() =>
  orderOptions.find(o => o.value === store.order)?.label ?? 'Trier par'
)
const showOrderOptions = ref(false)
const orderDropdown = ref(null)
onClickOutside(orderDropdown, () => (showOrderOptions.value = false))

function selectOrder(value: typeof store.order) {
  store.order = value
  showOrderOptions.value = false
}

const monthNames = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
function monthLabel(n: number) {
  return monthNames[n - 1] ?? String(n)
}

const showBloomDropdown = ref(false)
const bloomDropdown = ref(null)
onClickOutside(bloomDropdown, () => (showBloomDropdown.value = false))

const isBloomFiltered = computed(() =>
  store.bloomRange[0] !== 1 || store.bloomRange[1] !== 12
)

const showHeightDropdown = ref(false)
const heightDropdown = ref(null)
onClickOutside(heightDropdown, () => (showHeightDropdown.value = false))

const isHeightFiltered = computed(() =>
  store.heightRange[0] !== store.heightBounds[0] ||
  store.heightRange[1] !== store.heightBounds[1]
)

onMounted(() => store.initHeightRange())
</script>

<template>
  <div class="form l-constrain">
    <div class="form-filter">
      <div class="form-item form-item--search">
        <input v-model="searchInput" type="search" class="input-search"
        placeholder="Nom scientifique ou vernaculaire" aria-label="Rechercher">
      </div>

      <div class="form-group-toggle">
        <button class="button button--form" @click="showFilters = !showFilters">Filtrer ▾</button>
      </div>

      <div :class="{ 'js-open': showFilters }" class="form-group">
        <div class="form-group__inner">
          <FilterDropdown icon="🌴" label="Catégorie" multiple
            :values="store.categoryValues" v-model="store.category" />
          <FilterDropdown icon="☘️" label="Type" multiple
            :values="store.typeValues" v-model="store.type" />
          <FilterDropdown icon="🗄️" label="Source" multiple
            :values="store.sourceValues" v-model="store.source" />
          <FilterDropdown icon="💐" label="Famille"
            :values="store.familyValues" v-model="store.family" />
          <FilterDropdown icon="🌈" label="Fleur" multiple
            :values="store.flowerColorValues" v-model="store.flowerColor" />
          <div ref="bloomDropdown" class="form-item form-item--dropdown">
            <p
              class="dropdown-toggle button button--form"
              :class="{ 'is-active': isBloomFiltered }"
              @click="showBloomDropdown = !showBloomDropdown"
            >
              🌼
              <span v-if="!isBloomFiltered">Floraison</span>
              <span v-else>{{ monthLabel(store.bloomRange[0]) }} – {{ monthLabel(store.bloomRange[1]) }}</span>
              ▾
            </p>
            <div v-show="showBloomDropdown" class="dropdown dropdown--large">
              <div class="dropdown__content">
                <RangeSlider
                  v-model="store.bloomRange"
                  :min="1"
                  :max="12"
                  :step="1"
                  :format-label="monthLabel"
                />
              </div>
            </div>
          </div>
          <FilterDropdown icon="☀️" label="Exposition"
            :values="store.exposureValues" v-model="store.exposure" />
          <FilterDropdown icon="🇧🇪" label="Origine"
            :values="store.originValues" v-model="store.origin" />

          <div ref="heightDropdown" class="form-item form-item--dropdown">
            <p
              class="dropdown-toggle button button--form"
              :class="{ 'is-active': isHeightFiltered }"
              @click="showHeightDropdown = !showHeightDropdown"
            >
              ⬆️
              <span v-if="!isHeightFiltered">Taille</span>
              <span v-else>{{ store.heightRange[0] }}–{{ store.heightRange[1] }}cm</span>
              ▾
            </p>
            <div v-show="showHeightDropdown" class="dropdown dropdown--large">
              <div class="dropdown__content">
                <RangeSlider
                  v-model="store.heightRange"
                  :min="0"
                  :max="store.heightBounds[1]"
                  unit="cm"
                />
              </div>
            </div>
          </div>

          <label class="form-item form-item--checkbox button" :class="{ 'is-active': store.edible }">
            <input type="checkbox" v-model="store.edible"> Comestible
          </label>
          <label class="form-item form-item--checkbox button" :class="{ 'is-active': store.medicinal }">
            <input type="checkbox" v-model="store.medicinal"> Médicinale
          </label>
          <label class="form-item form-item--checkbox button" :class="{ 'is-active': store.invasive }">
            <input type="checkbox" v-model="store.invasive"> Invasive
          </label>
          <label class="form-item form-item--checkbox button" :class="{ 'is-active': store.hasPhoto }">
            <input type="checkbox" v-model="store.hasPhoto"> Photo
          </label>
        </div>
      </div>
    </div>

    <div class="form-count">{{ store.filteredPlants.length }} résultats</div>

    <div class="form-order-group">
      <div ref="orderDropdown" class="form-item form-item--dropdown">
        <p class="dropdown-toggle" @click="showOrderOptions = !showOrderOptions">
          <span class="dropdown__label">⩦&nbsp;<span>Trier par&nbsp;</span></span>
          <span class="dropdown__current">{{ orderLabel }}</span>
        </p>
        <ul v-show="showOrderOptions" class="dropdown">
          <li v-for="opt in orderOptions" :key="opt.value" @click="selectOrder(opt.value as any)">
            {{ opt.label }}
          </li>
        </ul>
      </div>
      <div class="form-layout">
        <a class="button" :class="{ 'button--active': store.layout === 'table' }" @click="store.layout = 'table'">⫢ Tableau</a>
        <a class="button" :class="{ 'button--active': store.layout === 'grid' }" @click="store.layout = 'grid'">⊞ Grille</a>
      </div>
    </div>
  </div>
</template>
