import { google } from 'googleapis'
import { writeFile, mkdir } from 'node:fs/promises'
import 'dotenv/config'

// Headers mapping ---
const FIELD_MAP = {
  'Nom': 'scientificName',
  'NomVernaculaire': 'vernacularName',
  'Sous-espece': 'subspecies',
  'Famille': 'family',
  'Variete': 'variety',
  'Origine': 'origin',
  'Type': 'type',
  'Categorie': 'category',
  'Cycle': 'cycle',
  'Rusticite': 'rusticity',
  'Feuillage': 'leaves',
  'Hauteur': 'height',
  'ProfondeurAquatique': 'aquaticDepth',
  'Fleur': 'flowerColor',
  'Floraison': 'bloomMonths',
  'Exposition': 'exposure',
  'Biotope': 'biotope',
  'Sol': 'soilType',
  'Acidite': 'acidity',
  'Humidite': 'humidity',
  'Densite': 'density',
  'Comestible': 'edible',
  'Mellifere': 'melliferous',
  'Medicinale': 'medicinal',
  'Toxique': 'toxic',
  'Description': 'description',
  'Utilisation': 'usage',
  'Ecosem': 'ecosem',
  'Ecoflora': 'ecoflora',
  'ifapme': 'ifapme',
  'Natagora': 'natagora',
  'sourceAutre': 'sourceOther',
  'Invasive': 'invasive',
  'Ressemblante': 'resembling'
}

const THUMB_FILENAME_RE = /^(.+)-thumb\.(jpe?g|png|webp)$/i
const IMAGE_FILENAME_RE = /^(.+?)-(\d{2})(?:-(.+))?\.(jpe?g|png|webp)$/i
const SHEET_TABS = ['data', 'ifapme', 'natagora']

async function fetchImageKitFiles() {
  const auth = 'Basic ' + Buffer.from(process.env.IMAGEKIT_PRIVATE_KEY + ':').toString('base64')
  const files = []
  let skip = 0
  const limit = 1000

  while (true) {
    const res = await fetch(
      `https://api.imagekit.io/v1/files?path=/PlantBrowser&limit=${limit}&skip=${skip}`,
      { headers: { Authorization: auth } }
    )
    if (!res.ok) throw new Error(`ImageKit API error: ${res.status} ${await res.text()}`)
    const batch = await res.json()
    if (!Array.isArray(batch) || batch.length === 0) break
    files.push(...batch)
    if (batch.length < limit) break
    skip += limit
  }
  return files
}

async function fetchCredits(auth, sheetId) {
  const sheets = google.sheets({ version: 'v4', auth })
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'credits!A1:C1000',
  })
  if (!data.values) return {}

  const [headers, ...rows] = data.values
  const fileIdx = headers.indexOf('Fichier')
  const authorIdx = headers.indexOf('Auteur')
  const sourceIdx = headers.indexOf('Source')

  const creditsByFile = {}
  for (const row of rows) {
    const fileName = (row[fileIdx] || '').trim()
    if (!fileName) continue
    creditsByFile[fileName.toLowerCase()] = {
      author: (row[authorIdx] || '').trim(),
      source: (row[sourceIdx] || '').trim(),
    }
  }
  return creditsByFile
}

function buildImagesBySlug(files, creditsByFile) {
  const imagesMap = {}
  const thumbMap = {}
  const unmatched = []
  const uncredited = []

  for (const file of files) {
    const credit = creditsByFile[file.name.toLowerCase()] || null
    if (!credit) uncredited.push(file.name)

    const thumbMatch = file.name.match(THUMB_FILENAME_RE)
    if (thumbMatch) {
      const slug = slugify(thumbMatch[1].replace(/_/g, ' '))
      thumbMap[slug] = { url: file.url, credit }
      continue
    }


    const imgMatch = file.name.match(IMAGE_FILENAME_RE)
    if (imgMatch) {
      const [, rawName, index, caption] = imgMatch
      const slug = slugify(rawName.replace(/_/g, ' '))
      if (!imagesMap[slug]) imagesMap[slug] = []
      imagesMap[slug].push({
        index: Number(index),
        caption: caption ? caption.replace(/_/g, ' ') : null,
        url: file.url,
        credit,
      })
      continue
    }

    unmatched.push(file.name)
  }

  for (const slug in imagesMap) {
    imagesMap[slug].sort((a, b) => a.index - b.index)
  }

  if (uncredited.length) {
    console.warn(`⚠ ${uncredited.length} image(s) sans entrée dans l'onglet Credits :`, uncredited)
  }
  if (unmatched.length) {
    console.warn(`⚠ ${unmatched.length} fichier(s) ImageKit ignoré(s) (nom non conforme) :`, unmatched)
  }

  return { imagesMap, thumbMap }
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

// Transform a row line in a clean object.
function mapRow(headers, row) {
  const raw = {}
  headers.forEach((header, i) => {
    raw[header] = (row[i] ?? '').trim()
  })

  const entry = {}
  for (const [frHeader, enKey] of Object.entries(FIELD_MAP)) {
    entry[enKey] = raw[frHeader] ?? ''
  }

  entry.slug = slugify(entry.scientificName || entry.vernacularName || '')

  return entry
}

async function fetchSheet(auth, sheetId, range) {
  const sheets = google.sheets({ version: 'v4', auth })
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  })
  const [headers, ...rows] = data.values
  return rows
    .filter(row => Array.isArray(row) && row.length)
    .map(row => mapRow(headers, row))
}

async function main() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })

  const tabResults = await Promise.all(
    SHEET_TABS.map(tab => fetchSheet(auth, process.env.GOOGLE_SHEET_ID, `${tab}!A1:AZ550`))
  )
  const plants = tabResults.flat()

  const creditsByFile = await fetchCredits(auth, process.env.GOOGLE_SHEET_ID)
  const imagekitFiles = await fetchImageKitFiles()
  const { imagesMap, thumbMap } = buildImagesBySlug(imagekitFiles, creditsByFile)

  const unmatchedPlants = []
  for (const plant of plants) {
    plant.images = imagesMap[plant.slug] || []
    plant.thumbnail = thumbMap[plant.slug]?.url || plant.images[0]?.url || null
    plant.thumbnailCredit = thumbMap[plant.slug]?.credit || plant.images[0]?.credit || null
    if (!plant.images.length) unmatchedPlants.push(plant.scientificName)
  }

  if (unmatchedPlants.length) {
    console.warn(`⚠ ${unmatchedPlants.length} plant(s) without pictures found on ImageKit`)
  }

  plants.sort((a, b) => a.scientificName.localeCompare(b.scientificName))

  await mkdir('content', { recursive: true })
  await writeFile('content/plants.generated.json', JSON.stringify(plants, null, 2))

  console.log(`✔ ${plants.length} plants (${SHEET_TABS.join(', ')}), ${imagekitFiles.length} images processed`)
}

main().catch((err) => {
  console.error('✘ Plants data generation failed :', err.message)
  process.exit(1)
})
