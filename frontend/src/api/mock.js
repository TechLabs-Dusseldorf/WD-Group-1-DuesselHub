export async function getMockIssues() {
  const mod = await import('../dataMock/mockIssues.js')
  return Array.isArray(mod?.mockIssues) ? mod.mockIssues : []
}
