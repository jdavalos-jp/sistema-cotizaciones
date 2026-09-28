import { formatLetterDate, safeFileName, sanitizeCartaHtml } from './cartaFormatters.js'

const PAPER_DIMENSIONS_MM = Object.freeze({
  letter: { width: 215.9, height: 279.4 },
  legal: { width: 215.9, height: 355.6 },
  a4: { width: 210, height: 297 },
})

const BASE_RUN_OPTIONS = Object.freeze({ font: 'Arial', size: 22, color: '000000' })
const BODY_SPACING = Object.freeze({ after: 160, line: 276 })

function runOptionsFromElement(element, inherited = {}) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) return inherited

  const tag = element.tagName
  return {
    ...inherited,
    bold: inherited.bold || tag === 'B' || tag === 'STRONG',
    italics: inherited.italics || tag === 'I' || tag === 'EM',
    strike: inherited.strike || tag === 'S' || tag === 'STRIKE',
    underline: inherited.underline || tag === 'U' ? {} : undefined,
  }
}

function createInlineRuns(node, docx, inherited = {}) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent
      ? [new docx.TextRun({ ...BASE_RUN_OPTIONS, ...inherited, text: node.textContent })]
      : []
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return []
  if (node.tagName === 'BR') return [new docx.TextRun({ ...BASE_RUN_OPTIONS, break: 1 })]

  const options = runOptionsFromElement(node, inherited)
  return Array.from(node.childNodes).flatMap((child) => createInlineRuns(child, docx, options))
}

function getAlignment(element, docx, fallback = docx.AlignmentType.JUSTIFIED) {
  const mapping = {
    left: docx.AlignmentType.LEFT,
    right: docx.AlignmentType.RIGHT,
    center: docx.AlignmentType.CENTER,
    justify: docx.AlignmentType.JUSTIFIED,
  }
  return mapping[element?.style?.textAlign] || fallback
}

function paragraphFromElement(element, docx, extra = {}) {
  const headingSize = { H1: 32, H2: 28, H3: 24 }[element.tagName]
  const runs = createInlineRuns(element, docx, headingSize ? { bold: true, size: headingSize } : {})
  return new docx.Paragraph({
    children: runs.length ? runs : [new docx.TextRun({ ...BASE_RUN_OPTIONS, text: '' })],
    alignment: getAlignment(element, docx),
    spacing: BODY_SPACING,
    ...extra,
  })
}

function buildBodyParagraphs(html, docx) {
  const sanitized = sanitizeCartaHtml(html)
  const parsed = new DOMParser().parseFromString(`<div>${sanitized}</div>`, 'text/html')
  const root = parsed.body.firstElementChild
  const paragraphs = []

  Array.from(root.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.trim()) {
        paragraphs.push(new docx.Paragraph({
          children: [new docx.TextRun({ ...BASE_RUN_OPTIONS, text: node.textContent.trim() })],
          alignment: docx.AlignmentType.JUSTIFIED,
          spacing: BODY_SPACING,
        }))
      }
      return
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return

    if (node.tagName === 'UL' || node.tagName === 'OL') {
      Array.from(node.children).forEach((item) => {
        const listOptions = node.tagName === 'UL'
          ? { bullet: { level: 0 } }
          : { numbering: { reference: 'letter-numbering', level: 0 } }
        paragraphs.push(paragraphFromElement(item, docx, {
          ...listOptions,
          alignment: docx.AlignmentType.LEFT,
        }))
      })
      return
    }

    if (node.tagName === 'BLOCKQUOTE') {
      paragraphs.push(paragraphFromElement(node, docx, {
        indent: { left: docx.convertMillimetersToTwip(10) },
      }))
      return
    }

    paragraphs.push(paragraphFromElement(node, docx))
  })

  return paragraphs.length
    ? paragraphs
    : [new docx.Paragraph({ children: [new docx.TextRun(BASE_RUN_OPTIONS)] })]
}

function textParagraph(text, docx, options = {}) {
  return new docx.Paragraph({
    children: [new docx.TextRun({ ...BASE_RUN_OPTIONS, text: String(text || ''), ...options.run })],
    spacing: options.spacing || { after: 0 },
    alignment: options.alignment,
    keepNext: options.keepNext,
  })
}

function recipientParagraphs(carta, docx) {
  const values = [
    carta.tratamiento,
    carta.destinatario,
    carta.cargoDestinatario,
    carta.institucion,
  ].filter(Boolean)
  const paragraphs = values.map((value) => textParagraph(value.toUpperCase(), docx, {
    run: { bold: true },
    keepNext: true,
  }))

  if (carta.presente) paragraphs.push(textParagraph(carta.presente, docx, { keepNext: true }))
  return paragraphs
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('No se pudo procesar una imagen de la carta'))
    image.src = source
  })
}

async function createImageRun(source, docx, maxWidth, maxHeight) {
  if (!/^data:image\/(png|jpeg|webp);base64,/i.test(source || '')) return null

  const image = await loadImage(source)
  const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight, 1)
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  canvas.getContext('2d').drawImage(image, 0, 0)
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('No se pudo convertir una imagen de la carta')

  return new docx.ImageRun({
    type: 'png',
    data: await blob.arrayBuffer(),
    transformation: { width, height },
    altText: { title: 'Imagen de la carta', description: 'Firma o sello', name: 'Imagen' },
  })
}

async function signatureParagraphs(carta, docx) {
  const paragraphs = []
  const signature = await createImageRun(carta.firmaImagen, docx, 150, 70)
  const stamp = await createImageRun(carta.selloImagen, docx, 150, 80)

  if (signature) {
    paragraphs.push(new docx.Paragraph({ children: [signature], alignment: docx.AlignmentType.CENTER }))
  }

  const signerLines = [
    { value: carta.firmanteNombre?.toUpperCase(), bold: true },
    { value: carta.firmanteCargo },
    { value: carta.firmanteDocumento },
    { value: carta.firmanteTelefono },
  ].filter((item) => item.value)

  signerLines.forEach((item) => {
    paragraphs.push(textParagraph(item.value, docx, {
      alignment: docx.AlignmentType.CENTER,
      run: { bold: item.bold },
    }))
  })

  if (stamp) {
    paragraphs.push(new docx.Paragraph({
      children: [stamp],
      alignment: docx.AlignmentType.CENTER,
      spacing: { before: 80 },
    }))
  }

  return paragraphs
}

function triggerDownload(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export async function downloadCartaWord(carta) {
  const docx = await import('docx')
  const dimensions = PAPER_DIMENSIONS_MM[carta.papel] || PAPER_DIMENSIONS_MM.letter
  const body = buildBodyParagraphs(carta.cuerpoHtml, docx)
  const signature = await signatureParagraphs(carta, docx)
  const children = [
    textParagraph(formatLetterDate(carta.fecha, carta.ciudadFecha), docx, {
      alignment: docx.AlignmentType.RIGHT,
      spacing: { after: 440 },
    }),
    ...recipientParagraphs(carta, docx),
    textParagraph(`REF.: ${String(carta.referencia || '').toUpperCase()}`, docx, {
      run: { bold: true },
      spacing: { before: 260, after: 100 },
      keepNext: Boolean(carta.numero),
    }),
    ...(carta.numero
      ? [textParagraph(`N.º ${carta.numero}`, docx, { run: { bold: true }, spacing: { after: 180 } })]
      : []),
    ...body,
    textParagraph(carta.despedida, docx, { spacing: { before: 220, after: 180 } }),
    ...signature,
  ]

  const document = new docx.Document({
    creator: 'JDBLab Sistema de Cotizaciones',
    title: carta.referencia || 'Carta',
    description: `Carta dirigida a ${carta.destinatario || 'destinatario'}`,
    numbering: {
      config: [{
        reference: 'letter-numbering',
        levels: [{
          level: 0,
          format: docx.LevelFormat.DECIMAL,
          text: '%1.',
          alignment: docx.AlignmentType.LEFT,
          style: {
            paragraph: {
              indent: {
                left: docx.convertMillimetersToTwip(8),
                hanging: docx.convertMillimetersToTwip(4),
              },
            },
          },
        }],
      }],
    },
    sections: [{
      properties: {
        page: {
          size: {
            width: docx.convertMillimetersToTwip(dimensions.width),
            height: docx.convertMillimetersToTwip(dimensions.height),
            orientation: docx.PageOrientation.PORTRAIT,
          },
          margin: {
            top: docx.convertMillimetersToTwip(20),
            right: docx.convertMillimetersToTwip(22),
            bottom: docx.convertMillimetersToTwip(20),
            left: docx.convertMillimetersToTwip(22),
          },
        },
      },
      children,
    }],
  })

  const blob = await docx.Packer.toBlob(document)
  triggerDownload(blob, `${safeFileName(carta.numero || carta.referencia)}.docx`)
}

