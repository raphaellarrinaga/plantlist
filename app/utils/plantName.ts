export function varietyLabel(plant: Record<string, any>) {
  const variety = (plant.variety ?? '').replace(/^['‘’"“”]+|['‘’"“”]+$/g, '').trim()
  return variety ? `'${variety}'` : ''
}

export function plantTitle(plant: Record<string, any>) {
  return [plant.scientificName, varietyLabel(plant)].filter(Boolean).join(' ')
}
