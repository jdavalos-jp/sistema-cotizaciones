function loadImageAsDataUrl(source) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      canvas.getContext('2d').drawImage(image, 0, 0)
      resolve(canvas.toDataURL('image/jpeg', 0.92))
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

export async function downloadRotuloPdf(rotulo, logoSource) {
  const { jsPDF } = await import('jspdf')
  const document = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a6' })
  const width = document.internal.pageSize.getWidth()
  const height = document.internal.pageSize.getHeight()
  const margin = 10

  document.setTextColor(22, 119, 255)
  document.setFont('helvetica', 'bold')
  document.setFontSize(10)
  document.text('DESTINATARIO', margin, 14)

  document.setTextColor(17, 24, 39)
  document.setFont('helvetica', 'bold')
  document.setFontSize(20)
  const nameLines = document.splitTextToSize(`SEÑOR: ${rotulo.nombre}`.toUpperCase(), width - 2 * margin)
  document.text(nameLines, margin, 24)

  let cursorY = 24 + nameLines.length * 9
  document.setFont('helvetica', 'bold')
  document.setFontSize(12)

  const details = [
    rotulo.cargo,
    rotulo.correo ? `CORREO: ${rotulo.correo}` : '',
    rotulo.telefono ? `TELÉFONO: ${rotulo.telefono}` : '',
    rotulo.ciudad ? `CIUDAD: ${rotulo.ciudad}` : '',
  ].filter(Boolean)

  details.forEach((detail) => {
    const lines = document.splitTextToSize(String(detail).toUpperCase(), width - 2 * margin)
    document.text(lines, margin, cursorY)
    cursorY += lines.length * 6.5
  })

  const logo = await loadImageAsDataUrl(logoSource)
  document.addImage(logo, 'JPEG', width - 66, height - 36, 58, 27.5)
  document.save(`${safeFileName(rotulo.nombre)}.pdf`)
}
