import { defineStore } from 'pinia'
import plantsData from '#data/plants.generated.json'

const SOURCE_FIELDS: Record<string, string> = {
  Ecosem: 'ecosem',
  Ecoflora: 'ecoflora',
  IFAPME: 'ifapme',
  Natagora: 'natagora',
  Autre: 'sourceOther',
}

// Display order of gradients (otherwise alphabetical order would be misleading).
const HUMIDITY_ORDER = ['Marécageux', 'Humide', 'Frais', 'Sec', 'Très sec']
const FERTILITY_ORDER = ['Pauvre', 'Moyen', 'Riche']
const ACIDITY_ORDER = ['Acide', 'Faiblement acide', 'Neutre', 'Basique']
const EXPOSURE_ORDER = ['Soleil', 'Mi-ombre', 'Ombre']

const ALL_VALUE = 'Indifférent'

function optionValues(list: string[]) {
  const values = uniqueValues(list)
  return values.includes(ALL_VALUE)
    ? [ALL_VALUE, ...values.filter(v => v !== ALL_VALUE)]
    : values
}

function sortByScale(values: string[], scale: string[]) {
  const rank = (v: string) => {
    if (v === ALL_VALUE) return -1
    const i = scale.indexOf(v)
    return i === -1 ? scale.length : i
  }
  return [...values].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
}

function matchesAny(selected: string[], value?: string) {
  return selected.length === 0 || splitField(value).some(v => selected.includes(v))
}

function splitField(value: string | undefined) {
  return value ? value.split(',').map(v => v.trim()).filter(Boolean) : []
}

function uniqueValues(list: string[]) {
  return [...new Set(list)].sort()
}

const HEIGHT_STOPS = [
  0, 10, 20, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300,
  400, 500, 750, 1000, 1500, 2000, 3000, 5000,
]

function parseHeightRange(value: string | undefined): number[] {
  if (!value) return []
  return value.split('-').map(v => Number(v.trim())).filter(n => !isNaN(n))
}

function rangesOverlap(entryRange: number[], min: number, max: number) {
  if (entryRange.length === 0) return true
  if (entryRange.length === 1) return entryRange[0] >= min && entryRange[0] <= max
  const [start, end] = entryRange
  return start <= max && end >= min
}

type Plant = typeof plantsData[number]

export const usePlantsStore = defineStore('plants', {
  state: () => ({
    plants: plantsData as Plant[],
    search: '',
    category: [] as string[],
    type: [] as string[],
    family: 'all',
    flowerColor: [] as string[],
    exposure: 'all',
    bloomRange: [1, 12] as [number, number],
    origin: 'all',
    heightRange: [0, 0] as [number, number],
    biotope: [] as string[],
    humidity: [] as string[],
    fertility: [] as string[],
    acidity: [] as string[],
    texture: [] as string[],
    edible: false,
    medicinal: false,
    invasive: false,
    hasPhoto: false,
    order: 'scientificName' as 'scientificName' | 'vernacularName' | 'family',
    layout: 'table' as 'grid' | 'table',
    source: [] as string[],
  }),

  getters: {
    categoryValues: (s) => uniqueValues(s.plants.map(p => p.category).filter(Boolean)),
    typeValues: (s) => uniqueValues(s.plants.flatMap(p => splitField(p.type))),
    familyValues: (s) => uniqueValues(s.plants.map(p => p.family).filter(Boolean)),
    originValues: (s) => uniqueValues(s.plants.flatMap(p => splitField(p.origin))),
    flowerColorValues: (s) => uniqueValues(s.plants.flatMap(p => splitField(p.flowerColor))),
    exposureValues: (s) => sortByScale(optionValues(s.plants.flatMap(p => splitField(p.exposure))), EXPOSURE_ORDER),
    sourceValues: () => Object.keys(SOURCE_FIELDS),
    // Soil.
    biotopeValues: (s) => uniqueValues(s.plants.flatMap(p => splitField(p.biotope))),
    humidityValues: (s) => sortByScale(uniqueValues(s.plants.flatMap(p => splitField(p.humidity))), HUMIDITY_ORDER),
    fertilityValues: (s) => sortByScale(uniqueValues(s.plants.flatMap(p => splitField(p.fertility))), FERTILITY_ORDER),
    acidityValues: (s) => sortByScale(uniqueValues(s.plants.flatMap(p => splitField(p.acidity))), ACIDITY_ORDER),
    textureValues: (s) => uniqueValues(s.plants.flatMap(p => splitField(p.texture))),

    heightBounds: (s) => {
      const all = s.plants.flatMap(p => parseHeightRange(p.height))
      return [0, all.length ? Math.max(...all) : 100] as [number, number]
    },

    heightStops(): number[] {
      const max = this.heightBounds[1]
      return [...HEIGHT_STOPS.filter(v => v < max), max]
    },

    filteredPlants: (s) => {
      const q = s.search.trim().toLowerCase()
      return s.plants
        .filter(p => {
          const matchesSearch = !q ||
            p.variety?.toLowerCase().includes(q) ||
            p.vernacularName?.toLowerCase().includes(q) ||
            p.scientificName?.toLowerCase().includes(q)
          const matchesCategory = s.category.length === 0 || s.category.includes(p.category)
          const matchesType = s.type.length === 0 || splitField(p.type).some(t => s.type.includes(t))
          const matchesFamily = s.family === 'all' || p.family === s.family
          const matchesFlowerColor = s.flowerColor.length === 0 || splitField(p.flowerColor).some(c => s.flowerColor.includes(c))
          const exposureOf = splitField(p.exposure)
          const matchesExposure = s.exposure === 'all'
            || exposureOf.includes(ALL_VALUE)
            || exposureOf.includes(s.exposure)
          const matchesOrigin = s.origin === 'all' || splitField(p.origin).includes(s.origin)
          const matchesBloom = (s.bloomRange[0] === 1 && s.bloomRange[1] === 12) || rangesOverlap(parseHeightRange(p.bloomMonths), s.bloomRange[0], s.bloomRange[1])
          const matchesEdible = !s.edible || !!p.edible?.trim()
          const matchesMedicinal = !s.medicinal || p.medicinal?.trim().toLowerCase() === 'oui'
          const matchesInvasive = !s.invasive || p.invasive?.trim().toLowerCase() === 'oui'
          const matchesPhoto = !s.hasPhoto || (p.images?.length ?? 0) > 0
          const [min, max] = s.heightRange
          const heights = parseHeightRange(p.height)
          const matchesHeight = rangesOverlap(parseHeightRange(p.height), min, max)
          const matchesSoil =
            matchesAny(s.biotope, p.biotope) &&
            matchesAny(s.humidity, p.humidity) &&
            matchesAny(s.fertility, p.fertility) &&
            matchesAny(s.acidity, p.acidity) &&
            matchesAny(s.texture, p.texture)

          const matchesSource = s.source.length === 0 ||
            s.source.some(label => !!p[SOURCE_FIELDS[label]])

          return matchesSearch && matchesCategory && matchesType && matchesFamily &&
            matchesFlowerColor && matchesExposure && matchesOrigin && matchesBloom &&
            matchesEdible && matchesMedicinal && matchesInvasive && matchesPhoto && matchesHeight && matchesSource && matchesSoil
        })
        .sort((a, b) => {
          const key = (p: any) => s.order === 'scientificName' ? plantTitle(p) : (p[s.order] || '')
          return key(a).localeCompare(key(b))
        })
    },
  },

  actions: {
    initHeightRange() {
      this.heightRange = this.heightBounds
    },
    resetFilters() {
      this.search = ''
      this.category = []
      this.type = []
      this.family = 'all'
      this.flowerColor = []
      this.exposure = 'all'
      this.origin = 'all'
      this.edible = false
      this.medicinal = false
      this.invasive = false
      this.hasPhoto = false
      this.source = []
      this.heightRange = this.heightBounds
      this.bloomRange = [1, 12]
      this.biotope = []
      this.humidity = []
      this.fertility = []
      this.acidity = []
      this.texture = []
      // `order` and `layout` are ignored.
    },
  },
})
