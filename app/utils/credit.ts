export function creditLabel(credit: { author: string; source: string } | null) {
  if (!credit || !credit.author) return null
  return `Copyright © ${credit.author}, ${credit.source}`
}
