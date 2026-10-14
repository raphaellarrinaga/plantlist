function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function galleryItemHtml(img: { caption: string | null; credit: any }) {
  const credit = creditLabel(img.credit)
  const parts: string[] = []
  if (img.caption) parts.push(escapeHtml(img.caption))
  if (credit) parts.push(`<small>${escapeHtml(credit)}</small>`)
  return parts.join('<br>')
}

export function creditLabel(credit: { author: string; source: string } | null) {
  if (!credit || !credit.author) return null
  return `Copyright © ${credit.author}, ${credit.source}`
}
