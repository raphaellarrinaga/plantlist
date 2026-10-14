export const detailGroups = [
  [
    { key: 'category', label: 'Catégorie' },
    { key: 'type', label: 'Type' },
    { key: 'family', label: 'Famille' },
    { key: 'origin', label: 'Origine' },
    { key: 'cycle', label: 'Cycle' },
    { key: 'rusticity', label: 'Rusticité' },
    { key: 'leaves', label: 'Feuillage' },
    { key: 'height', label: 'Hauteur' },
    { key: 'bloomMonths', label: 'Floraison' },
    { key: 'flowerColor', label: 'Fleur' },
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

export function plantSources(plant: Record<string, any>) {
  const labels: string[] = []
  if (plant.ecosem) labels.push('Ecosem')
  if (plant.ecoflora) labels.push('Ecoflora')
  if (plant.ifapme) labels.push('IFAPME')
  if (plant.natagora) labels.push('Natagora')
  if (plant.sourceOther) labels.push('Autre')
  return labels
}

export function hasPlantDetail(plant: Record<string, any>) {
  return detailGroups.flat().some(f => plant[f.key]) || plantSources(plant).length > 0
}
