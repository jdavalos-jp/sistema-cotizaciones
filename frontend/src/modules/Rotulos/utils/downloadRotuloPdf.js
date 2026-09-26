function loadImageAsDataUrl(source) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      canvas.getContext('2d').drawImage(image, 0, 0)
      resolve({
        dataUrl: canvas.toDataURL('image/jpeg', 0.92),
        width: image.naturalWidth,
        height: image.naturalHeight,
      })
    }
    image.onerror = () => reject(new Error('No se pudo cargar la imagen del remitente'))
    image.src = source
  })
}

function safeFileName(value) {
  return String(value || 'rotulo')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

export async function downloadRotuloPdf(rotulo, logoSource, paperSize = 'letter') {
  const { jsPDF } = await import('jspdf')
  const format = paperSize === 'legal' ? 'legal' : 'letter'
  const document = new jsPDF({ orientation: 'landscape', unit: 'mm', format })
  const width = document.internal.pageSize.getWidth()
  const height = document.internal.pageSize.getHeight()
  const margin = 18

  document.setTextColor(22, 119, 255)
  document.setFont('helvetica', 'bold')
  document.setFontSize(18)
  document.text('DESTINATARIO', margin, 28)

  document.setTextColor(17, 24, 39)
  document.setFont('helvetica', 'bold')
  document.setFontSize(38)
  const nameLines = document.splitTextToSize(`SEÑOR: ${rotulo.nombre}`.toUpperCase(), width - 2 * margin)
  document.text(nameLines, margin, 54)

  let cursorY = 54 + nameLines.length * 15
  document.setFont('helvetica', 'bold')
  document.setFontSize(24)

  const details = [
    rotulo.cargo,
    rotulo.correo ? `CORREO: ${rotulo.correo}` : '',
    rotulo.telefono ? `TELÉFONO: ${rotulo.telefono}` : '',
    rotulo.ciudad ? `CIUDAD: ${rotulo.ciudad}` : '',
  ].filter(Boolean)

  details.forEach((detail) => {
    const lines = document.splitTextToSize(String(detail).toUpperCase(), width - 2 * margin)
    document.text(lines, margin, cursorY)
    cursorY += lines.length * 12
  })

  const logo = await loadImageAsDataUrl(logoSource)
  const logoWidth = 105
  const logoHeight = logoWidth * (logo.height / logo.width)
  document.addImage(logo.dataUrl, 'JPEG', width - margin - logoWidth, height - margin - logoHeight, logoWidth, logoHeight)
  document.save(`${safeFileName(rotulo.nombre)}.pdf`)
}
