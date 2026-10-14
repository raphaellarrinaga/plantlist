export function formatHeight(cm: number) {
  if (cm < 100) return `${cm} cm`
  return `${String(cm / 100).replace('.', ',')} m`
}
