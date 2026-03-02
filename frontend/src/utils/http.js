export function extractHttpStatus(value) {
  const m = String(value ?? '').match(/HTTP\s+(\d{3})/)
  return m ? Number(m[1]) : undefined
}
