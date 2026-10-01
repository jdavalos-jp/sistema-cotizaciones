import { safeNotaFileName } from './notaFormatters.js'
import { DOCUMENT_FOOTER_TEXT } from '../../../shared/utils/documentFooter.js'

const FOOTER_SPACE_MM = 12
const FOOTER_MARGIN_BOTTOM = 8
const FOOTER_LINE_Y_OFFSET = 3
const FOOTER_SIDE_MARGIN = 25

function drawFooter(pdf, pageWidth, pageHeight) {
  const footerY = pageHeight - FOOTER_MARGIN_BOTTOM
  const lineY = footerY - FOOTER_LINE_Y_OFFSET
  pdf.setDrawColor(79, 155, 211)
  pdf.setLineWidth(0.5)
  pdf.line(FOOTER_SIDE_MARGIN, lineY, pageWidth - FOOTER_SIDE_MARGIN, lineY)
  pdf.setFont('Helvetica', 'bold')
  pdf.setFontSize(6.5)
  pdf.setTextColor(0, 0, 0)
  pdf.text(DOCUMENT_FOOTER_TEXT, pageWidth / 2, footerY, { align: 'center', maxWidth: pageWidth - FOOTER_SIDE_MARGIN * 2 })
}

function pageBreaks(previewElement, canvas, contentPixels) {
  const previewTop = previewElement.getBoundingClientRect().top
  const scale = canvas.width / previewElement.scrollWidth
  const boundaries = Array.from(previewElement.querySelectorAll('tr, .nota-preview__signatures'))
    .map((element) => Math.round((element.getBoundingClientRect().bottom - previewTop) * scale))
    .filter((position) => position > 0 && position < canvas.height)
    .sort((left, right) => left - right)
  const slices = []
  let start = 0

  while (start < canvas.height) {
    const target = Math.min(start + contentPixels, canvas.height)
    const safeBoundary = boundaries.filter((position) => position > start && position <= target).pop()
    const end = safeBoundary && safeBoundary - start >= contentPixels * 0.35 ? safeBoundary : target
    slices.push({ start, end })
    start = end
  }

  return slices
}

export async function downloadNotaPdf(nota, previewElement) {
  if (!previewElement) throw new Error('No se encontró la vista previa de la nota')
  const [{ jsPDF }, canvasModule] = await Promise.all([import('jspdf'), import('html2canvas')])
  const html2canvas = canvasModule.default || canvasModule
  const format = nota.papel === 'a4' ? 'a4' : 'letter'
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  previewElement.classList.add('nota-preview--export')
  try {
    const canvas = await html2canvas(previewElement, {
      backgroundColor: '#fff',
      scale: 2,
      useCORS: true,
      logging: false,
      width: previewElement.scrollWidth,
      height: previewElement.scrollHeight,
    })
    const pagePixels = Math.round(canvas.width * pageHeight / pageWidth)
    const contentPixels = Math.round(canvas.width * (pageHeight - FOOTER_SPACE_MM) / pageWidth)
    const slices = pageBreaks(previewElement, canvas, contentPixels)
    for (let index = 0; index < slices.length; index += 1) {
      const { start, end } = slices[index]
      const slice = document.createElement('canvas')
      slice.width = canvas.width
      slice.height = pagePixels
      const context = slice.getContext('2d')
      context.fillStyle = '#fff'
      context.fillRect(0, 0, slice.width, slice.height)
      const height = end - start
      context.drawImage(canvas, 0, start, canvas.width, height, 0, 0, canvas.width, height)
      if (index) pdf.addPage(format, 'portrait')
      pdf.addImage(slice.toDataURL('image/jpeg', 0.96), 'JPEG', 0, 0, pageWidth, pageHeight)
      drawFooter(pdf, pageWidth, pageHeight)
    }
    pdf.save(`${safeNotaFileName(nota.numero ? `nota-${nota.numero}` : 'nota-entrega')}.pdf`)
  } finally {
    previewElement.classList.remove('nota-preview--export')
  }
}
