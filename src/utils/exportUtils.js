import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export const formatDateTime = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleString('en-AU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

export const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export const sanitizeCSVValue = (value) => {
  if (value === null || value === undefined) return ''

  let stringValue = String(value)
  stringValue = stringValue.replace(/\n/g, ' ').replace(/\r/g, '')

  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    stringValue = '"' + stringValue.replace(/"/g, '""') + '"'
  }

  return stringValue
}

export const exportToCSV = ({ data, columns, filename, onProgress }) => {
  return new Promise((resolve, reject) => {
    try {
      if (!data || data.length === 0) {
        throw new Error('No data to export')
      }

      if (onProgress) onProgress(10)

      const headers = columns.map(col => col.label).join(',')

      if (onProgress) onProgress(30)

      const rows = data.map((item, index) => {
        if (onProgress && index % 100 === 0) {
          const progress = 30 + Math.floor((index / data.length) * 50)
          onProgress(progress)
        }

        return columns.map(col => {
          let value = item[col.key]

          if (col.format) {
            value = col.format(value, item)
          }

          return sanitizeCSVValue(value)
        }).join(',')
      })

      if (onProgress) onProgress(90)

      const csv = '\uFEFF' + [headers, ...rows].join('\n')

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)

      if (onProgress) onProgress(100)

      setTimeout(() => resolve({ success: true, rowCount: data.length }), 100)
    } catch (error) {
      console.error('CSV export error:', error)
      reject(error)
    }
  })
}

export const exportToPDF = ({ data, columns, filename, title, filters, onProgress }) => {
  return new Promise((resolve, reject) => {
    try {
      if (!data || data.length === 0) {
        throw new Error('No data to export')
      }

      if (onProgress) onProgress(10)

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      if (onProgress) onProgress(20)

      doc.setFontSize(16)
      doc.setFont(undefined, 'bold')
      doc.text(title || 'Data Export', pageWidth / 2, 15, { align: 'center' })

      let yPosition = 25

      if (filters && Object.keys(filters).length > 0) {
        doc.setFontSize(9)
        doc.setFont(undefined, 'normal')
        const filterText = 'Filters: ' + Object.entries(filters)
          .filter(([_, value]) => value && value !== 'all')
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')
        doc.text(filterText, 14, yPosition)
        yPosition += 5
      }

      doc.setFontSize(8)
      doc.setTextColor(100)
      doc.text(`Export Date: ${new Date().toLocaleString('en-AU')}`, 14, yPosition)
      yPosition += 5

      if (onProgress) onProgress(40)

      const tableColumns = columns.map(col => ({
        header: col.label,
        dataKey: col.key
      }))

      const tableRows = data.map((item, index) => {
        if (onProgress && index % 50 === 0) {
          const progress = 40 + Math.floor((index / data.length) * 40)
          onProgress(progress)
        }

        const row = {}
        columns.forEach(col => {
          let value = item[col.key]
          if (col.format) {
            value = col.format(value, item)
          }
          row[col.key] = value || 'N/A'
        })
        return row
      })

      if (onProgress) onProgress(85)

      autoTable(doc, {
        columns: tableColumns,
        body: tableRows,
        startY: yPosition + 5,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak',
          halign: 'left'
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { top: 30, bottom: 20, left: 14, right: 14 },
        didDrawPage: (data) => {
          doc.setFontSize(8)
          doc.setTextColor(150)
          const pageNumber = doc.internal.getNumberOfPages()
          const currentPage = doc.internal.getCurrentPageInfo().pageNumber
          doc.text(
            `Page ${currentPage} of ${pageNumber}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          )

          doc.text(
            `Total Records: ${tableRows.length}`,
            pageWidth - 14,
            pageHeight - 10,
            { align: 'right' }
          )
        }
      })

      if (onProgress) onProgress(95)

      doc.save(filename)

      if (onProgress) onProgress(100)

      setTimeout(() => resolve({ success: true, rowCount: data.length }), 100)
    } catch (error) {
      console.error('PDF export error:', error)
      reject(error)
    }
  })
}

export const generateExportFilename = (prefix, extension, filters = {}) => {
  const timestamp = new Date().toISOString()
    .replace(/T/, '_')
    .replace(/\..+/, '')
    .replace(/:/g, '-')
    .slice(0, 16)

  const filterPart = Object.entries(filters)
    .filter(([_, value]) => value && value !== 'all')
    .map(([key, value]) => `${key}-${value}`)
    .join('_')

  const filenameParts = [prefix, filterPart, timestamp]
    .filter(Boolean)
    .join('_')

  return `${filenameParts}.${extension}`
}

export const validateExportData = (data) => {
  if (!data) {
    throw new Error('No data provided for export')
  }

  if (!Array.isArray(data)) {
    throw new Error('Export data must be an array')
  }

  if (data.length === 0) {
    throw new Error('No data to export. Try adjusting your filters.')
  }

  const MAX_ROWS = 10000
  if (data.length > MAX_ROWS) {
    throw new Error(`Dataset too large (${data.length} rows). Maximum ${MAX_ROWS} rows allowed for direct export.`)
  }

  return true
}
