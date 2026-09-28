import { PAPER_SIZES } from '../domain/carta.js'
import { safeFileName } from './cartaFormatters.js'

function createPageCanvas(sourceCanvas, sourceY, sourceHeight, fullPageHeight) {
  const pageCanvas = document.createElement('canvas')
  pageCanvas.width = sourceCanvas.width
  pageCanvas.height = fullPageHeight
  const context = pageCanvas.getContext('2d')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
  context.drawImage(
    sourceCanvas,
    0,
    sourceY,
    sourceCanvas.width,
    sourceHeight,
    0,
    0,
    sourceCanvas.width,
    sourceHeight,
  )
  return pageCanvas
}

export async function downloadCartaPdf(carta, previewElement) {
  if (!previewElement) throw new Error('No se encontró la vista previa de la carta')

  const [{ jsPDF }, html2canvasModule] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ])
  const html2canvas = html2canvasModule.default || html2canvasModule
  const paper = PAPER_SIZES[carta.papel] || PAPER_SIZES.letter
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: paper.format })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  previewElement.classList.add('carta-preview--export')
  try {
    const canvas = await html2canvas(previewElement, {
      backgroundColor: '#ffffff',
      logging: false,
      scale: 2,
      useCORS: true,
      width: previewElement.scrollWidth,
      height: previewElement.scrollHeight,
      windowWidth: previewElement.scrollWidth,
      windowHeight: previewElement.scrollHeight,
    })

    const pageHeightInPixels = Math.round(canvas.width * (pageHeight / pageWidth))
    const pageCount = Math.max(1, Math.ceil(canvas.height / pageHeightInPixels))

    for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
      const sourceY = pageIndex * pageHeightInPixels
      const remainingHeight = canvas.height - sourceY
      const sourceHeight = Math.min(pageHeightInPixels, remainingHeight)
      const pageCanvas = createPageCanvas(canvas, sourceY, sourceHeight, pageHeightInPixels)

      if (pageIndex > 0) pdf.addPage(paper.format, 'portrait')
      pdf.addImage(pageCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pageWidth, pageHeight)
    }

    pdf.save(`${safeFileName(carta.numero || carta.referencia)}.pdf`)
  } finally {
    previewElement.classList.remove('carta-preview--export')
  }
}

