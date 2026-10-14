export function usePlantPanel() {
  const selectedSlug = useState<string | null>('plant-panel', () => null)
  const open = (slug: string) => { selectedSlug.value = slug }
  const close = () => { selectedSlug.value = null }
  return { selectedSlug, open, close }
}
