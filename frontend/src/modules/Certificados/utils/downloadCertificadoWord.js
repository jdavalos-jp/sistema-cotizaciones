import { formatCertificateDate, safeCertificateFileName } from './certificadoFormatters.js'
import { createDocumentWordFooter } from '../../../shared/utils/documentFooter.js'

const BLUE = '82DDF5'
const borders = { top: { style: 'single', size: 8 }, bottom: { style: 'single', size: 8 }, left: { style: 'single', size: 8 }, right: { style: 'single', size: 8 }, insideHorizontal: { style: 'single', size: 8 }, insideVertical: { style: 'single', size: 8 } }
const JDBLAB_STAMP_SIZE = Object.freeze({
  width: Math.round(4.5 * 96 / 2.54),
  height: Math.round(1.8 * 96 / 2.54),
})

function text(docx, value, options = {}) {
  return new docx.TextRun({ text: String(value || ''), font: 'Arial', size: 20, ...options })
}
function paragraph(docx, value, options = {}) {
  return new docx.Paragraph({ children: [text(docx, value, options.run)], alignment: options.alignment, spacing: options.spacing || { after: 0 } })
}
function cell(docx, children, options = {}) {
  return new docx.TableCell({ children: Array.isArray(children) ? children : [paragraph(docx, children, options)], shading: options.blue ? { fill: BLUE } : undefined, columnSpan: options.columnSpan, rowSpan: options.rowSpan, width: options.width ? { size: options.width, type: docx.WidthType.PERCENTAGE } : undefined, verticalAlign: docx.VerticalAlign.CENTER })
}
function htmlText(html) {
  const element = document.createElement('div'); element.innerHTML = html || ''; return element.textContent || ''
}
function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('No se pudo procesar una imagen del certificado'))
    image.src = source
  })
}
async function imageRun(source, docx, maxWidth, maxHeight, exactSize) {
  if (!source) return null
  const image = await loadImage(source)
  const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight, 1)
  const width = exactSize?.width || Math.max(1, Math.round(image.naturalWidth * scale))
  const height = exactSize?.height || Math.max(1, Math.round(image.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  canvas.getContext('2d').drawImage(image, 0, 0)
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('No se pudo convertir una imagen del certificado')

  return new docx.ImageRun({ type: 'png', data: await blob.arrayBuffer(), transformation: { width, height } })
}
function download(blob, name) {
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 0)
}

export async function downloadCertificadoWord(certificado, logoSource) {
  const docx = await import('docx')
  const logo = await imageRun(logoSource, docx, 150, 65)
  const signatureMaxSize = certificado.empresaFirmante
    ? { width: 170, height: 80 }
    : { width: 150, height: 70 }
  const signature = await imageRun(
    certificado.firmaImagen,
    docx,
    signatureMaxSize.width,
    signatureMaxSize.height,
  )
  const stampSize = certificado.empresaFirmante === 'jdblab' ? JDBLAB_STAMP_SIZE : undefined
  const stamp = await imageRun(certificado.selloImagen, docx, 150, 80, stampSize)
  const header = new docx.Table({ width: { size: 100, type: docx.WidthType.PERCENTAGE }, borders, rows: [
    new docx.TableRow({ children: [cell(docx, [new docx.Paragraph({ children: logo ? [logo] : [], alignment: docx.AlignmentType.CENTER })], { rowSpan: 3, width: 22 }), cell(docx, [paragraph(docx, 'SISTEMA DE GESTIÓN DE LA CALIDAD', { alignment: docx.AlignmentType.CENTER, run: { bold: true, size: 24 } })], { width: 48 }), cell(docx, 'Código', { width: 12 }), cell(docx, certificado.codigo, { width: 18 })] }),
    new docx.TableRow({ children: [cell(docx, 'REGISTRO'), cell(docx, 'Revisión'), cell(docx, certificado.revision)] }),
    new docx.TableRow({ children: [cell(docx, 'CERTIFICADO DE GARANTÍA'), cell(docx, 'Página'), cell(docx, '1 de 1')] }),
  ] })
  const info = new docx.Table({ width: { size: 100, type: docx.WidthType.PERCENTAGE }, borders, rows: [
    new docx.TableRow({ children: [cell(docx, 'CLIENTE O ENTIDAD CONTRATANTE:', { blue: true, width: 39 }), cell(docx, certificado.clienteEntidad, { width: 61 })] }),
    new docx.TableRow({ children: [cell(docx, 'OBJETO DE LA CONTRATACIÓN:', { blue: true, width: 39 }), cell(docx, certificado.objetoContratacion, { width: 61 })] }),
    new docx.TableRow({ children: [cell(docx, [paragraph(docx, `TIEMPO DE GARANTÍA ${certificado.garantiaAnos} AÑO${certificado.garantiaAnos === 1 ? '' : 'S'}`, { alignment: docx.AlignmentType.CENTER, run: { bold: true } })], { blue: true, columnSpan: 2 })] }),
    new docx.TableRow({ children: [cell(docx, `DESDE: ${formatCertificateDate(certificado.fechaDesde)}`), cell(docx, `HASTA: ${formatCertificateDate(certificado.fechaHasta)}`)] }),
  ] })
  const items = new docx.Table({ width: { size: 100, type: docx.WidthType.PERCENTAGE }, borders, rows: [
    new docx.TableRow({ tableHeader: true, children: ['ÍTEM', 'DESCRIPCIÓN', 'CANTIDAD', 'ACLARACIONES'].map((value) => cell(docx, value, { blue: true })) }),
    ...(certificado.items || []).map((item, index) => new docx.TableRow({ children: [
      cell(docx, String(index + 1)),
      cell(docx, [
        paragraph(docx, item.descripcion, { run: { bold: true } }),
        paragraph(docx, `MARCA: ${item.marca || '-'}  MODELO: ${item.modelo || '-'}`),
      ]),
      cell(docx, String(item.cantidad)),
      cell(docx, item.aclaraciones),
    ] })),
  ] })
  const conditions = htmlText(certificado.condicionesHtml).split(/\n+/).filter(Boolean).map((line) => paragraph(docx, line, { alignment: docx.AlignmentType.JUSTIFIED, spacing: { after: 160 }, run: { italics: true } }))
  const children = [header, paragraph(docx, '', { spacing: { after: 120 } }), info, paragraph(docx, '1.  DESCRIPCIÓN DE LA ENTREGA.', { spacing: { before: 240, after: 160 }, run: { bold: true } }), items, paragraph(docx, 'CERTIFICADO DE GARANTÍA', { alignment: docx.AlignmentType.CENTER, spacing: { before: 240, after: 120 }, run: { bold: true } }), ...conditions]
  if (signature) children.push(new docx.Paragraph({ children: [signature], alignment: docx.AlignmentType.CENTER, spacing: { before: 180 } }))
  const signerLines = [
    { value: certificado.firmanteNombre?.toUpperCase(), bold: true },
    { value: certificado.firmanteCargo },
    { value: certificado.firmanteDocumento },
    { value: certificado.firmanteTelefono },
  ].filter((item) => item.value)
  signerLines.forEach((item) => {
    children.push(paragraph(docx, item.value, {
      alignment: docx.AlignmentType.CENTER,
      run: { bold: item.bold },
    }))
  })
  if (stamp) children.push(new docx.Paragraph({ children: [stamp], alignment: docx.AlignmentType.CENTER, spacing: { before: 80 } }))
  const file = new docx.Document({
    sections: [{
      properties: {
        page: {
          size: {
            width: docx.convertMillimetersToTwip(certificado.papel === 'letter' ? 215.9 : 210),
            height: docx.convertMillimetersToTwip(certificado.papel === 'letter' ? 279.4 : 297),
          },
          margin: { top: 900, right: 900, bottom: 1360, left: 900, footer: 454 },
        },
      },
      footers: { default: createDocumentWordFooter(docx) },
      children,
    }],
  })
  download(await docx.Packer.toBlob(file), `${safeCertificateFileName(certificado.codigo)}.docx`)
}

