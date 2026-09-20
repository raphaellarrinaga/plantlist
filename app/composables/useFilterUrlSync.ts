import { useDebounceFn } from '@vueuse/core'
import { usePlantsStore } from '~/stores/plants'

const FILTER_KEYS = [
  'search', 'category', 'type', 'family', 'flowerColor',
  'exposure', 'origin', 'edible', 'medicinal', 'invasive',
  'hasPhoto', 'source', 'heightRange', 'bloomRange',
] as const

const DISPLAY_KEYS = ['layout', 'order'] as const

export function useFilterUrlSync() {
  const store = usePlantsStore()
  const router = useRouter()
  const route = useRoute()

  // Avoids reading the hash from immediately triggering a write back to the URL.
  let syncing = false

  function serialize() {
    const params = new URLSearchParams()

    if (store.search) params.set('q', store.search)
    if (store.category.length) params.set('category', store.category.join(','))
    if (store.type.length) params.set('type', store.type.join(','))
    if (store.family !== 'all') params.set('family', store.family)
    if (store.flowerColor.length) params.set('flowerColor', store.flowerColor.join(','))
    if (store.exposure !== 'all') params.set('exposure', store.exposure)
    if (store.origin !== 'all') params.set('origin', store.origin)
    if (store.edible) params.set('edible', '1')
    if (store.medicinal) params.set('medicinal', '1')
    if (store.invasive) params.set('invasive', '1')
    if (store.hasPhoto) params.set('hasPhoto', '1')
    if (store.source.length) params.set('source', store.source.join(','))

    const [hMin, hMax] = store.heightRange
    const [boundMin, boundMax] = store.heightBounds
    if (hMin !== boundMin || hMax !== boundMax) params.set('height', `${hMin}-${hMax}`)

    const [bMin, bMax] = store.bloomRange
    if (bMin !== 1 || bMax !== 12) params.set('bloom', `${bMin}-${bMax}`)

    if (store.layout !== 'table') params.set('layout', store.layout)
    if (store.order !== 'scientificName') params.set('order', store.order)

    return params.toString()
  }

  function applyFromHash() {
    const raw = route.hash.replace(/^#/, '')
    if (!raw) return
    const params = new URLSearchParams(raw)

    syncing = true
    if (params.has('q')) store.search = params.get('q')!
    if (params.has('category')) store.category = params.get('category')!.split(',')
    if (params.has('type')) store.type = params.get('type')!.split(',')
    if (params.has('family')) store.family = params.get('family')!
    if (params.has('flowerColor')) store.flowerColor = params.get('flowerColor')!.split(',')
    if (params.has('exposure')) store.exposure = params.get('exposure')!
    if (params.has('origin')) store.origin = params.get('origin')!
    if (params.has('edible')) store.edible = true
    if (params.has('medicinal')) store.medicinal = true
    if (params.has('invasive')) store.invasive = true
    if (params.has('hasPhoto')) store.hasPhoto = true
    if (params.has('source')) store.source = params.get('source')!.split(',')
    if (params.has('height')) {
      const [min, max] = params.get('height')!.split('-').map(Number)
      store.heightRange = [min, max]
    }
    if (params.has('bloom')) {
      const [min, max] = params.get('bloom')!.split('-').map(Number)
      store.bloomRange = [min, max]
    }

    if (params.has('layout')) store.layout = params.get('layout') as 'grid' | 'table'
    if (params.has('order')) store.order = params.get('order') as typeof store.order

    nextTick(() => { syncing = false })
  }

  const writeHash = useDebounceFn(() => {
    if (syncing) return
    const hash = serialize()
    router.replace({ path: route.path, hash: hash ? `#${hash}` : '' })
  }, 300)

  onMounted(() => {
    store.initHeightRange()
    applyFromHash()
  })

  watch(
    () => [...FILTER_KEYS, ...DISPLAY_KEYS].map(k => JSON.stringify((store as any)[k])),
    writeHash
  )
}
