export const DOCUMENT_FOOTER_TEXT = 'TELEFONO: 4-4292937 - CEL: 70769521 - AV. CIRCUNVALACION, ENTRE C. VATICANO Y GUTIERREZ, COCHABAMBA - BOLIVIA'

export function createDocumentWordFooter(docx) {
  return new docx.Footer({
    children: [new docx.Paragraph({
      children: [new docx.TextRun({
        font: 'Arial',
        size: 18,
        bold: true,
        text: DOCUMENT_FOOTER_TEXT,
      })],
      alignment: docx.AlignmentType.CENTER,
      spacing: { before: 100, line: 220 },
      border: {
        top: {
          style: docx.BorderStyle.SINGLE,
          size: 12,
          color: '4F9BD3',
          space: 8,
        },
      },
    })],
  })
}
