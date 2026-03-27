import type { Simulation, SimulationResult } from '../types'

export function exportToCSV(sim: Simulation, result: SimulationResult): void {
  const headers = ['timestamp', 'x', 'y', 'z']
  const rows = result.dataPoints.map((p) =>
    [p.timestamp, p.x, p.y, p.z ?? ''].join(',')
  )
  const csv = [headers.join(','), ...rows].join('\n')
  downloadFile(`${sim.name.replace(/\s+/g, '_')}_result.csv`, csv, 'text/csv')
}

export function exportToJSON(sim: Simulation, result: SimulationResult): void {
  const data = {
    simulation: { id: sim.id, name: sim.name, category: sim.category },
    parameters: sim.parameters.reduce<Record<string, unknown>>((acc, p) => {
      acc[p.id] = { value: p.value, unit: p.unit }
      return acc
    }, {}),
    result: {
      runAt: result.runAt,
      duration: result.duration,
      summary: result.summary,
      dataPoints: result.dataPoints,
    },
  }
  downloadFile(
    `${sim.name.replace(/\s+/g, '_')}_result.json`,
    JSON.stringify(data, null, 2),
    'application/json'
  )
}

function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
