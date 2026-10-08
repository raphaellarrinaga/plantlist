const isYes = (value?: string) => value?.trim().toLowerCase() === 'oui'

export function plantFlags(plant: Record<string, any>) {
  const flags: { icon: string; title: string }[] = []

  if (isYes(plant.toxic)) flags.push({ icon: '☠️', title: 'Toxique' })
  if (isYes(plant.invasive)) flags.push({ icon: '⛔️', title: 'Invasive' })
  if (plant.edible) flags.push({ icon: '😋', title: 'Comestible' })
  if (plant.melliferous) flags.push({ icon: '🐝', title: 'Mellifère' })
  if (plant.origin?.split(',').some((o: string) => o.trim() === 'Indigène')) {
    flags.push({ icon: '🇧🇪', title: 'Indigène' })
  }

  return flags
}
