import { safeNotaFileName } from './notaFormatters.js'

export async function downloadNotaPdf(nota, previewElement) {
  if (!previewElement) throw new Error('No se encontró la vista previa de la nota')
  const [{ jsPDF }, canvasModule] = await Promise.all([import('jspdf'), import('html2canvas')])
  const html2canvas = canvasModule.default || canvasModule
  const format = nota.papel === 'a4' ? 'a4' : 'letter'
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const canvas = await html2canvas(previewElement, {
    backgroundColor: '#fff',
    scale: 2,
    useCORS: true,
    logging: false,
    width: previewElement.scrollWidth,
    height: previewElement.scrollHeight,
  })
  const pagePixels = Math.round(canvas.width * pageHeight / pageWidth)
  const pages = Math.max(1, Math.ceil(canvas.height / pagePixels))
  for (let index = 0; index < pages; index += 1) {
    const slice = document.createElement('canvas')
    slice.width = canvas.width
    slice.height = pagePixels
    const context = slice.getContext('2d')
    context.fillStyle = '#fff'
    context.fillRect(0, 0, slice.width, slice.height)
    const remaining = Math.min(pagePixels, canvas.height - index * pagePixels)
    context.drawImage(canvas, 0, index * pagePixels, canvas.width, remaining, 0, 0, canvas.width, remaining)
    if (index) pdf.addPage(format, 'portrait')
    pdf.addImage(slice.toDataURL('image/jpeg', 0.96), 'JPEG', 0, 0, pageWidth, pageHeight)
  }
  pdf.save(`${safeNotaFileName(nota.numero ? `nota-${nota.numero}` : 'nota-entrega')}.pdf`)
}
