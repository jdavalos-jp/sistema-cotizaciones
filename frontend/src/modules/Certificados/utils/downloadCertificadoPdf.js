import { safeCertificateFileName } from './certificadoFormatters.js'
import { DOCUMENT_FOOTER_TEXT } from '../../../shared/utils/documentFooter.js'

const FORMATS = { a4: 'a4', letter: 'letter' }
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

export async function downloadCertificadoPdf(certificado, previewElement) {
  if (!previewElement) throw new Error('No se encontró la vista previa')
  const [{ jsPDF }, canvasModule] = await Promise.all([import('jspdf'), import('html2canvas')])
  const html2canvas = canvasModule.default || canvasModule
  const format = FORMATS[certificado.papel] || 'a4'
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format })
  const width = pdf.internal.pageSize.getWidth()
  const height = pdf.internal.pageSize.getHeight()
  previewElement.classList.add('certificado-preview--export')
  try {
    const canvas = await html2canvas(previewElement, {
      backgroundColor: '#fff', logging: false, scale: 2, useCORS: true,
      width: previewElement.scrollWidth, height: previewElement.scrollHeight,
    })
    const pagePixels = Math.round(canvas.width * height / width)
    const pages = Math.max(1, Math.ceil(canvas.height / pagePixels))
    for (let index = 0; index < pages; index += 1) {
      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = canvas.width
      pageCanvas.height = pagePixels
      const context = pageCanvas.getContext('2d')
      context.fillStyle = '#fff'
      context.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
      context.drawImage(canvas, 0, index * pagePixels, canvas.width, Math.min(pagePixels, canvas.height - index * pagePixels), 0, 0, canvas.width, Math.min(pagePixels, canvas.height - index * pagePixels))
      if (index) pdf.addPage(format, 'portrait')
      pdf.addImage(pageCanvas.toDataURL('image/jpeg', .95), 'JPEG', 0, 0, width, height)
      drawFooter(pdf, width, height)
    }
    pdf.save(`${safeCertificateFileName(certificado.codigo)}.pdf`)
  } finally {
    previewElement.classList.remove('certificado-preview--export')
  }
}

