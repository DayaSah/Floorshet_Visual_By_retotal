/**
 * Utility to format and download data as a CSV file in the browser.
 */
export interface CsvColumn<T = any> {
  key: keyof T | string
  label: string
  formatter?: (value: any, row: T) => string | number
}

function escapeCsvCell(cell: any): string {
  if (cell === null || cell === undefined) return ''
  const str = String(cell)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportToCsv<T extends Record<string, any>>(
  filename: string,
  columns: CsvColumn<T>[],
  data: T[]
): void {
  if (!data || data.length === 0) return

  const headerRow = columns.map((col) => escapeCsvCell(col.label)).join(',')
  const dataRows = data.map((row) =>
    columns
      .map((col) => {
        const raw = (row as any)[col.key]
        const formatted = col.formatter ? col.formatter(raw, row) : raw
        return escapeCsvCell(formatted)
      })
      .join(',')
  )

  const csvContent = [headerRow, ...dataRows].join('\r\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
