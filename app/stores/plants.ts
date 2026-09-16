import { defineStore } from 'pinia'
import plantsData from '#data/plants.generated.json'

const SOURCE_FIELDS: Record<string, string> = {
  Ecosem: 'ecosem',
  Ecoflora: 'ecoflora',
  IFAPME: 'ifapme',
  Natagora: 'natagora',
  Autre: 'sourceOther',
}

function splitField(value: string | undefined) {
  return value ? value.split(',').map(v => v.trim()).filter(Boolean) : []
}

function uniqueValues(list: string[]) {
  return [...new Set(list)].sort()
}

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
    exposureValues: (s) => uniqueValues(s.plants.flatMap(p => splitField(p.exposure))),
    sourceValues: () => Object.keys(SOURCE_FIELDS),

    heightBounds: (s) => {
      const all = s.plants.flatMap(p => parseHeightRange(p.height))
      return [0, all.length ? Math.max(...all) : 100] as [number, number]
    },

    filteredPlants: (s) => {
      const q = s.search.trim().toLowerCase()
      return s.plants
        .filter(p => {
          const matchesSearch = !q ||
            p.vernacularName?.toLowerCase().includes(q) ||
            p.scientificName?.toLowerCase().includes(q)
          const matchesCategory = s.category.length === 0 || s.category.includes(p.category)
          const matchesType = s.type.length === 0 || splitField(p.type).some(t => s.type.includes(t))
          const matchesFamily = s.family === 'all' || p.family === s.family
          const matchesFlowerColor = s.flowerColor.length === 0 || splitField(p.flowerColor).some(c => s.flowerColor.includes(c))
          const matchesExposure = s.exposure === 'all' || splitField(p.exposure).includes(s.exposure)
          const matchesOrigin = s.origin === 'all' || splitField(p.origin).includes(s.origin)
          const matchesBloom = (s.bloomRange[0] === 1 && s.bloomRange[1] === 12) || rangesOverlap(parseHeightRange(p.bloomMonths), s.bloomRange[0], s.bloomRange[1])
          const matchesEdible = !s.edible || !!p.edible?.trim()
          const matchesMedicinal = !s.medicinal || p.medicinal?.trim().toLowerCase() === 'oui'
          const matchesInvasive = !s.invasive || p.invasive?.trim().toLowerCase() === 'oui'
          const matchesPhoto = !s.hasPhoto || (p.images?.length ?? 0) > 0
          const [min, max] = s.heightRange
          const heights = parseHeightRange(p.height)
          const matchesHeight = heights.length === 0 || heights.some(h => h >= min && h <= max)

          const matchesSource = s.source.length === 0 ||
            s.source.some(label => !!p[SOURCE_FIELDS[label]])

          return matchesSearch && matchesCategory && matchesType && matchesFamily &&
            matchesFlowerColor && matchesExposure && matchesOrigin && matchesBloom &&
            matchesEdible && matchesMedicinal && matchesInvasive && matchesPhoto && matchesHeight && matchesSource
        })
        .sort((a, b) => (a[s.order] || '').localeCompare(b[s.order] || ''))
    },
  },

  actions: {
    initHeightRange() {
      this.heightRange = this.heightBounds
    },
  },
})
