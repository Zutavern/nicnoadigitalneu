'use client'

import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

// A4 Dimensionen in verschiedenen Einheiten
const A4_MM = { width: 210, height: 297 }
const A4_PX_96DPI = { width: 794, height: 1123 }

export interface PDFExportOptions {
  filename?: string
  format?: 'a4' | 'letter'
  orientation?: 'portrait' | 'landscape'
  quality?: number
  scale?: number
}

const DEFAULT_OPTIONS: PDFExportOptions = {
  filename: 'preisliste',
  format: 'a4',
  orientation: 'portrait',
  quality: 0.98,
  scale: 3, // Höhere Skalierung für bessere Qualität
}

/**
 * Exportiert ein HTML-Element als PDF mit korrektem A4-Format
 * Das Hintergrundbild wird nicht abgeschnitten
 */
export async function exportToPDF(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Speichere die ursprüngliche Transform, um sie später wiederherzustellen
  const originalTransform = element.style.transform
  const originalWidth = element.style.width
  const originalHeight = element.style.height

  // Setze das Element auf die volle A4-Größe ohne Skalierung für den Export
  element.style.transform = 'none'
  element.style.width = `${A4_PX_96DPI.width}px`
  element.style.height = `${A4_PX_96DPI.height}px`

  try {
    // Warte kurz, damit das DOM aktualisiert wird
    await new Promise(resolve => setTimeout(resolve, 100))

    // Canvas aus Element erstellen mit voller Größe
    const canvas = await html2canvas(element, {
      scale: opts.scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null, // Transparenter Hintergrund
      logging: false,
      width: A4_PX_96DPI.width,
      height: A4_PX_96DPI.height,
      windowWidth: A4_PX_96DPI.width,
      windowHeight: A4_PX_96DPI.height,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
    })

    // PDF-Dimensionen
    const pdfWidth = opts.format === 'a4' ? A4_MM.width : 215.9
    const pdfHeight = opts.format === 'a4' ? A4_MM.height : 279.4

    // PDF erstellen
    const pdf = new jsPDF({
      orientation: opts.orientation,
      unit: 'mm',
      format: opts.format,
    })

    // Bild in PDF einfügen - exakt passend auf A4
    const imgData = canvas.toDataURL('image/png', opts.quality)
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

    return pdf.output('blob')
  } finally {
    // Stelle die ursprünglichen Styles wieder her
    element.style.transform = originalTransform
    element.style.width = originalWidth
    element.style.height = originalHeight
  }
}

/**
 * Exportiert und lädt PDF herunter
 */
export async function downloadPDF(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const blob = await exportToPDF(element, opts)

  // Download triggern
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${opts.filename}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * React Hook für PDF-Export
 */
export function usePDFExport() {
  const exportPDF = async (
    elementRef: React.RefObject<HTMLElement>,
    options?: PDFExportOptions
  ): Promise<boolean> => {
    if (!elementRef.current) {
      console.error('Element reference is null')
      return false
    }

    try {
      await downloadPDF(elementRef.current, options)
      return true
    } catch (error) {
      console.error('PDF export failed:', error)
      return false
    }
  }

  return { exportPDF }
}


