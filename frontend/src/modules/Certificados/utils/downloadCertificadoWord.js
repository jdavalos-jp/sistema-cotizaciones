import { formatCertificateDate, safeCertificateFileName } from './certificadoFormatters.js'
import { createDocumentWordFooter } from '../../../shared/utils/documentFooter.js'

const BLUE = '82DDF5'
const borders = { top: { style: 'single', size: 8 }, bottom: { style: 'single', size: 8 }, left: { style: 'single', size: 8 }, right: { style: 'single', size: 8 }, insideHorizontal: { style: 'single', size: 8 }, insideVertical: { style: 'single', size: 8 } }

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
async function imageRun(source, docx, maxWidth, maxHeight) {
  if (!source) return null
  const response = await fetch(source); const blob = await response.blob(); const image = new Image()
  await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = URL.createObjectURL(blob) })
  const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight, 1)
  const type = blob.type.includes('jpeg') ? 'jpg' : 'png'
  return new docx.ImageRun({ type, data: await blob.arrayBuffer(), transformation: { width: Math.round(image.naturalWidth * scale), height: Math.round(image.naturalHeight * scale) } })
}
function download(blob, name) {
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 0)
}

export async function downloadCertificadoWord(certificado, logoSource) {
  const docx = await import('docx')
  const logo = await imageRun(logoSource, docx, 150, 65)
  const signature = await imageRun(certificado.firmaImagen, docx, 150, 65)
  const header = new docx.Table({ width: { size: 100, type: docx.WidthType.PERCENTAGE }, borders, rows: [
    new docx.TableRow({ children: [cell(docx, [new docx.Paragraph({ children: logo ? [logo] : [], alignment: docx.AlignmentType.CENTER })], { rowSpan: 3, width: 22 }), cell(docx, [paragraph(docx, 'SISTEMA DE GESTIÓN DE LA CALIDAD', { alignment: docx.AlignmentType.CENTER, run: { bold: true, size: 24 } })], { width: 48 }), cell(docx, 'Código', { width: 12 }), cell(docx, certificado.codigo, { width: 18 })] }),
    new docx.TableRow({ children: [cell(docx, 'REGISTRO'), cell(docx, 'Revisión'), cell(docx, certificado.revision)] }),
    new docx.TableRow({ children: [cell(docx, 'CERTIFICADO DE GARANTÍA'), cell(docx, 'Página'), cell(docx, '1 de 1')] }),
  ] })
  const info = new docx.Table({ width: { size: 100, type: docx.WidthType.PERCENTAGE }, borders, rows: [
    new docx.TableRow({ children: [cell(docx, 'CLIENTE O ENTIDAD CONTRATANTE:', { blue: true, width: 39 }), cell(docx, certificado.clienteEntidad, { width: 61 })] }),
    new docx.TableRow({ children: [cell(docx, 'OBJETO DE LA CONTRATACIÓN:', { blue: true }), cell(docx, certificado.objetoContratacion)] }),
    new docx.TableRow({ children: [cell(docx, [paragraph(docx, `TIEMPO DE GARANTÍA ${certificado.garantiaAnos} AÑO${certificado.garantiaAnos === 1 ? '' : 'S'}`, { alignment: docx.AlignmentType.CENTER, run: { bold: true } })], { blue: true, columnSpan: 2 })] }),
    new docx.TableRow({ children: [cell(docx, `DESDE: ${formatCertificateDate(certificado.fechaDesde)}`), cell(docx, `HASTA: ${formatCertificateDate(certificado.fechaHasta)}`)] }),
  ] })
  const items = new docx.Table({ width: { size: 100, type: docx.WidthType.PERCENTAGE }, borders, rows: [
    new docx.TableRow({ tableHeader: true, children: ['ÍTEM', 'DESCRIPCIÓN', 'CANTIDAD', 'ACLARACIONES'].map((value) => cell(docx, value, { blue: true })) }),
    ...(certificado.items || []).map((item, index) => new docx.TableRow({ children: [cell(docx, String(index + 1)), cell(docx, `${item.descripcion}\nMARCA: ${item.marca || '-'}  MODELO: ${item.modelo || '-'}`), cell(docx, String(item.cantidad)), cell(docx, item.aclaraciones)] })),
  ] })
  const conditions = htmlText(certificado.condicionesHtml).split(/\n+/).filter(Boolean).map((line) => paragraph(docx, line, { alignment: docx.AlignmentType.JUSTIFIED, spacing: { after: 160 }, run: { italics: true } }))
  const children = [header, paragraph(docx, '', { spacing: { after: 120 } }), info, paragraph(docx, '1.  DESCRIPCIÓN DE LA ENTREGA.', { spacing: { before: 240, after: 160 }, run: { bold: true } }), items, paragraph(docx, 'CERTIFICADO DE GARANTÍA', { alignment: docx.AlignmentType.CENTER, spacing: { before: 240, after: 120 }, run: { bold: true } }), ...conditions]
  if (signature) children.push(new docx.Paragraph({ children: [signature], alignment: docx.AlignmentType.CENTER, spacing: { before: 180 } }))
  children.push(paragraph(docx, certificado.firmanteNombre?.toUpperCase(), { alignment: docx.AlignmentType.CENTER, run: { bold: true } }), paragraph(docx, certificado.firmanteCargo, { alignment: docx.AlignmentType.CENTER, run: { bold: true, italics: true } }))
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

