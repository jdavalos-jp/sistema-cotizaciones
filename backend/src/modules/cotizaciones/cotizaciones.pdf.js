const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');

function formatMoney(value, moneda) {
  // value puede venir como Decimal de Prisma
  const n = typeof value?.toNumber === 'function' ? value.toNumber() : Number(value ?? 0);
  const curr = String(moneda || '').trim() || 'Bs';
  return `${curr} ${n.toFixed(2)}`;
}

function safeText(value) {
  if (value === null || value === undefined) return '';
  return String(value);
}

function joinNonEmpty(lines) {
  return (lines ?? [])
    .map((x) => (x === null || x === undefined ? '' : String(x)).trim())
    .filter(Boolean)
    .join('\n');
}

function formatIncludedComponents(producto) {
  const comps = producto?.componentes;
  if (!Array.isArray(comps) || comps.length === 0) return '';

  const parts = comps
    .map((pc) => {
      const name = pc?.componente?.nombre ? String(pc.componente.nombre).trim() : '';
      if (!name) return null;
      const qty = Number(pc?.cantidad ?? 1);
      if (Number.isFinite(qty) && qty > 1) return `${name} (x${qty})`;
      return name;
    })
    .filter(Boolean);

  if (parts.length === 0) return '';
  // Cada componente en su propia fila
  return joinNonEmpty(['Incluye:', ...parts.map((p) => `• ${p}`)]);
}

function formatDate(value) {
  try {
    const d = value instanceof Date ? value : new Date(value);
    return d.toLocaleDateString('es-BO');
  } catch {
    return '';
  }
}

function addDays(dateValue, days) {
  try {
    const d = dateValue instanceof Date ? new Date(dateValue) : new Date(dateValue);
    if (Number.isNaN(d.getTime())) return null;
    d.setDate(d.getDate() + Number(days || 0));
    return d;
  } catch {
    return null;
  }
}

function calcularDiasHabiles(hasta) {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const fechaHasta = hasta instanceof Date ? new Date(hasta) : new Date(hasta);
    fechaHasta.setHours(0, 0, 0, 0);
    
    if (isNaN(fechaHasta.getTime())) return 0;
    
    let diasHabiles = 0;
    const actual = new Date(hoy);
    
    while (actual <= fechaHasta) {
      const dayOfWeek = actual.getDay();
      // 1 = Lunes, 5 = Viernes, 0 = Domingo, 6 = Sábado
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        diasHabiles++;
      }
      actual.setDate(actual.getDate() + 1);
    }
    
    return diasHabiles;
  } catch {
    return 0;
  }
}

function resolveCompanyLogoPath() {
  const fromEnv = (process.env.COMPANY_LOGO_PATH || '').trim();
  if (fromEnv) {
    const p = path.isAbsolute(fromEnv) ? fromEnv : path.resolve(process.cwd(), fromEnv);
    if (fs.existsSync(p)) return p;
  }

  // Por defecto, intenta tomar el logo desde el frontend
  const workspaceRoot = path.resolve(__dirname, '../../../../');
  const imagesDir = path.join(workspaceRoot, 'frontend', 'images');

  const preferred = path.join(imagesDir, 'logojdblab.jpeg');
  if (fs.existsSync(preferred)) return preferred;

  try {
    const files = fs.readdirSync(imagesDir);
    const img = files.find((f) => /\.(png|jpe?g)$/i.test(f));
    if (img) return path.join(imagesDir, img);
  } catch {
    // ignore
  }

  return null;
}

function drawHeader(doc, cotizacion, brand, { moneda, compact = false } = {}) {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const topY = 40;

  const logoPath = resolveCompanyLogoPath();
  const logoW = compact ? 70 : 92;
  const logoH = compact ? 34 : 48;
  const hasLogo = Boolean(logoPath);

  // Cuadro datos (derecha)
  const boxW = compact ? 220 : 250;
  const boxH = compact ? 52 : 64;
  const boxX = right - boxW;
  const boxY = topY;

  // Columna izquierda (logo + datos debajo)
  const gap = 12;
  const leftColW = Math.max(120, boxX - left - gap);

  // Logo (arriba a la izquierda)
  if (hasLogo) {
    try {
      doc.image(logoPath, left, topY, { fit: [Math.min(logoW, leftColW), logoH] });
    } catch {
      // ignore (imagen inválida/no soportada)
    }
  }

  // Bloque empresa: JUSTO debajo del logo
  const textY = topY + (hasLogo ? logoH + (compact ? 4 : 6) : 0);
  doc.save();
  doc.fillColor('#111827');
  if (brand.brandName) {
    doc.font('Helvetica-Bold').fontSize(compact ? 12 : 16);
    doc.text(brand.brandName, left, textY, { width: leftColW, align: 'left' });
  } else {
    doc.y = textY;
  }

  doc.font('Helvetica').fontSize(compact ? 8 : 9).fillColor('#374151');
  if (brand.brandTagline) {
    doc.text(brand.brandTagline, left, doc.y + 2, { width: leftColW, align: 'left' });
  }

  const lineA = [brand.brandAddress ? safeText(brand.brandAddress) : null, brand.brandWebsite ? safeText(brand.brandWebsite) : null]
    .filter(Boolean)
    .join('   |   ');
  if (lineA) {
    doc.font('Helvetica').fontSize(compact ? 7.5 : 8).fillColor('#6B7280');
    doc.text(lineA, left, doc.y + 2, { width: leftColW, align: 'left' });
  }

  const lineB = [brand.brandPhone ? `Tel: ${safeText(brand.brandPhone)}` : null, brand.brandEmail ? `Email: ${safeText(brand.brandEmail)}` : null]
    .filter(Boolean)
    .join('   |   ');
  if (lineB) {
    doc.font('Helvetica').fontSize(compact ? 7.5 : 8).fillColor('#6B7280');
    doc.text(lineB, left, doc.y + 2, { width: leftColW, align: 'left' });
  }
  const leftBlockBottom = Math.max(topY + (hasLogo ? logoH : 0), doc.y);
  doc.restore();

  doc.save();
  doc.roundedRect(boxX, boxY, boxW, boxH, 6).fillAndStroke('#FFFFFF', '#E5E7EB');
  doc.fillColor('#111827');

  const fechaEmision = cotizacion.fechaEmision;
  const validez = cotizacion.fechaValidez || addDays(fechaEmision, 7);

  const labelWidth = compact ? 92 : 120;
  const valueWidth = boxW - 24 - labelWidth;

  const drawKV = (y, label, value) => {
    doc.font('Helvetica-Bold').fontSize(compact ? 8 : 9).fillColor('#111827');
    doc.text(label, boxX + 12, y, { width: labelWidth });
    doc.font('Helvetica').fontSize(compact ? 8 : 9).fillColor('#111827');
    doc.text(safeText(value), boxX + 12 + labelWidth, y, { width: valueWidth });
  };

  drawKV(boxY + 10, 'Nro de Proforma:', safeText(cotizacion.numeroCotizacion));
  drawKV(boxY + 26, 'Fecha:', formatDate(fechaEmision));
  drawKV(boxY + 42, 'Validez:', validez ? formatDate(validez) : '');
  doc.restore();

  // Banda PROFORMA (solo en primera página)
  const bandY = topY + boxH + (compact ? 6 : 10);
  if (!compact) {
    const bandW = 300;
    const bandX = right - bandW;
    const bandH = 34;
    doc.save();
    doc.rect(bandX, bandY, bandW, bandH).fillAndStroke('#FEF3C7', '#E5E7EB');
    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(22);
    doc.text('PROFORMA', bandX, bandY + 6, { width: bandW, align: 'center' });
    doc.restore();
  }

  const rightBottom = boxY + boxH;
  const bandBottom = compact ? rightBottom : bandY + 34;
  const endY = Math.max(leftBlockBottom, bandBottom) + 8;
  hr(doc, endY, { color: '#E5E7EB', thickness: 1 });
  return endY + 10;
}

function hr(doc, y, { color = '#E5E7EB', thickness = 1 } = {}) {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  doc.save();
  doc
    .lineWidth(thickness)
    .strokeColor(color)
    .moveTo(left, y)
    .lineTo(right, y)
    .stroke();
  doc.restore();
}

function drawLabelValue(doc, x, y, label, value, { labelWidth = 85, valueWidth = 220 } = {}) {
  doc.save();
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#111827').text(label, x, y, {
    width: labelWidth,
    continued: false,
  });
  doc.font('Helvetica').fontSize(9).fillColor('#111827').text(safeText(value), x + labelWidth, y, {
    width: valueWidth,
  });
  doc.restore();
}

function drawFooter(doc, pageNumber, totalPages) {
  const bottom = doc.page.height - doc.page.margins.bottom;
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;

  const companyName = String(process.env.COMPANY_NAME || '').trim();
  const footerLeft = companyName
    ? `Documento generado por ${companyName}`
    : 'Documento generado';

  doc.save();
  hr(doc, bottom - 18, { color: '#E5E7EB', thickness: 1 });
  doc.font('Helvetica').fontSize(8).fillColor('#6B7280');
  doc.text(footerLeft, left, bottom - 14, {
    width: right - left,
    align: 'left',
  });
  doc.text(`Página ${pageNumber} de ${totalPages}`, left, bottom - 14, {
    width: right - left,
    align: 'right',
  });
  doc.restore();
}

function addPageWithFooter(doc, meta) {
  // Renderiza footer de la página anterior
  meta.pageNumber += 1;
  doc.addPage();
}

function ensureSpace(doc, neededHeight, { meta, onNewPage } = {}) {
  const bottomLimit = doc.page.height - doc.page.margins.bottom - 28; // reserva para footer
  if (doc.y + neededHeight <= bottomLimit) return;
  if (typeof onNewPage === 'function') onNewPage();
  addPageWithFooter(doc, meta);
}

function drawTableHeader(doc, cols) {
  doc.save();

  const y = doc.y;
  const height = 22;
  const left = doc.page.margins.left;
  const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  doc
    .rect(left, y, tableWidth, height)
    .fill('#F3F4F6');

  doc.fillColor('#111827').font('Helvetica-Bold').fontSize(9);

  for (const c of cols) {
    doc.text(c.title, c.x, y + 6, { width: c.w, align: c.align ?? 'left' });
  }

  doc.restore();
  doc.moveDown(0.5);
  doc.y = y + height + 6;
  hr(doc, doc.y - 2, { color: '#E5E7EB', thickness: 1 });
}

function drawRow(doc, row, cols, { moneda, zebra, index } = {}) {
  const left = doc.page.margins.left;
  const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const paddingY = 6;
  const paddingX = 0;

  // Calcula alturas por celda (solo para la columna de item/desc)
  doc.font('Helvetica').fontSize(9);
  const itemCol = cols.find((c) => c.key === 'item');
  const itemText = safeText(row.item);
  const descText = safeText(row.descripcion);
  const itemHeight = doc.heightOfString(itemText, { width: itemCol.w, align: 'left' });
  doc.font('Helvetica').fontSize(8);
  const descHeight = descText
    ? doc.heightOfString(descText, { width: itemCol.w, align: 'left' })
    : 0;
  const contentHeight = itemHeight + (descText ? 2 + descHeight : 0);
  const rowHeight = Math.max(22, contentHeight + paddingY * 2);

  const y = doc.y;

  if (zebra && index % 2 === 1) {
    doc.save();
    doc.rect(left, y, tableWidth, rowHeight).fill('#FAFAFA');
    doc.restore();
  }

  // item + desc
  doc.save();
  doc.fillColor('#111827');
  doc.font('Helvetica').fontSize(9);
  doc.text(itemText, itemCol.x + paddingX, y + paddingY, { width: itemCol.w, align: 'left' });
  if (descText) {
    doc.font('Helvetica').fontSize(8).fillColor('#6B7280');
    doc.text(descText, itemCol.x + paddingX, y + paddingY + itemHeight + 2, {
      width: itemCol.w,
      align: 'left',
    });
  }
  doc.restore();

  // resto columnas
  for (const c of cols) {
    if (c.key === 'item') continue;

    let text = '';
    if (c.key === 'sku') text = safeText(row.sku || '-');
    if (c.key === 'dias') text = safeText(row.diasHabiles || '-');
    if (c.key === 'cant') text = safeText(row.cantidad);
    if (c.key === 'unit') text = formatMoney(row.unitario, moneda);
    if (c.key === 'total') text = formatMoney(row.total, moneda);

    doc.save();
    doc.font('Helvetica').fontSize(9).fillColor('#111827');
    doc.text(text, c.x, y + paddingY, {
      width: c.w,
      align: c.align ?? 'left',
    });
    doc.restore();
  }

  // Separador inferior
  hr(doc, y + rowHeight, { color: '#F1F5F9', thickness: 1 });
  doc.y = y + rowHeight + 2;

  return rowHeight;
}

function buildCotizacionPdf(cotizacion) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });

    doc.info.Title = `Cotización ${safeText(cotizacion.numeroCotizacion)}`;
    doc.info.Author = String(process.env.COMPANY_NAME || '').trim() || undefined;

    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const moneda = cotizacion.moneda ?? 'Bs';
    const brand = {
      brandName: String(process.env.COMPANY_NAME || '').trim(),
      brandTagline: String(process.env.COMPANY_TAGLINE || '').trim(),
      brandEmail: process.env.COMPANY_EMAIL || '',
      brandPhone: process.env.COMPANY_PHONE || '',
      brandAddress: process.env.COMPANY_ADDRESS || '',
      brandWebsite: process.env.COMPANY_WEBSITE || '',
    };

    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;

    // Meta para footers
    const meta = {
      pageNumber: 0,
      totalPages: 0,
    };

    // Encabezado (estilo proforma)
    doc.y = drawHeader(doc, cotizacion, brand, { moneda, compact: false });

    // Cliente + contacto
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text('Cliente', left, doc.y);
    doc.moveDown(0.3);

    const cliente = cotizacion.cliente ?? null;
    const clientBoxY = doc.y;
    doc
      .roundedRect(left, clientBoxY, right - left, 70, 6)
      .fillAndStroke('#FFFFFF', '#E5E7EB');

    doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827');
    doc.text(cliente ? safeText(cliente.nombreCompleto) : '—', left + 12, clientBoxY + 12, {
      width: right - left - 24,
    });
    doc.font('Helvetica').fontSize(9).fillColor('#374151');
    const line2 = [
      cliente?.email ? `Email: ${cliente.email}` : null,
      cliente?.telefono ? `Tel: ${cliente.telefono}` : null,
      cliente?.ciudad ? `Ciudad: ${cliente.ciudad}` : null,
    ]
      .filter(Boolean)
      .join('   |   ');
    doc.text(line2 || ' ', left + 12, clientBoxY + 30, { width: right - left - 24 });

    const line3 = [brand.brandEmail ? `Email: ${brand.brandEmail}` : null, brand.brandPhone ? `Tel: ${brand.brandPhone}` : null]
      .filter(Boolean)
      .join('   |   ');
    if (line3) {
      doc.font('Helvetica').fontSize(8).fillColor('#6B7280');
      doc.text(`Contacto: ${line3}`, left + 12, clientBoxY + 48, { width: right - left - 24 });
    }

    doc.y = clientBoxY + 82;

    // Items
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text('Detalle de ítems', left, doc.y);
    doc.moveDown(0.4);

    const tableLeft = left;
    const tableWidth = right - left;

    const cols = [
      { key: 'item', title: 'Ítem', x: tableLeft + 0, w: Math.floor(tableWidth * 0.42), align: 'left' },
      { key: 'sku', title: 'SKU', x: tableLeft + Math.floor(tableWidth * 0.42), w: Math.floor(tableWidth * 0.18), align: 'left' },
      { key: 'dias', title: 'Entrega de Días Hábiles', x: tableLeft + Math.floor(tableWidth * 0.60), w: Math.floor(tableWidth * 0.14), align: 'center' },
      { key: 'cant', title: 'Cant.', x: tableLeft + Math.floor(tableWidth * 0.74), w: Math.floor(tableWidth * 0.08), align: 'right' },
      { key: 'unit', title: 'P. Unit', x: tableLeft + Math.floor(tableWidth * 0.82), w: Math.floor(tableWidth * 0.09), align: 'right' },
      { key: 'total', title: 'Total', x: tableLeft + Math.floor(tableWidth * 0.91), w: Math.floor(tableWidth * 0.09), align: 'right' },
    ];

    const validez = cotizacion.fechaValidez || addDays(cotizacion.fechaEmision, 7);
    const diasHabiles = calcularDiasHabiles(validez);

    const items = [
      ...(cotizacion.productos ?? [])
        .slice()
        .sort((a, b) => Number(a.ordenVisual ?? 0) - Number(b.ordenVisual ?? 0))
        .map((p) => ({
          sku: p?.producto?.sku ?? null,
          item: p.nombreItem,
          descripcion: joinNonEmpty([p.descripcionItem, formatIncludedComponents(p?.producto)]),
          cantidad: p.cantidad,
          unitario: p.precioUnitario,
          total: p.subtotal,
          diasHabiles: diasHabiles,
        })),
      ...(cotizacion.componentes ?? [])
        .slice()
        .sort((a, b) => Number(a.ordenVisual ?? 0) - Number(b.ordenVisual ?? 0))
        .map((c) => ({
          sku: c?.componente?.sku ?? null,
          item: c.nombreItem,
          descripcion: c.descripcionItem,
          cantidad: c.cantidad,
          unitario: c.precioUnitario,
          total: c.subtotal,
          diasHabiles: diasHabiles,
        })),
    ];

    // Header tabla
    drawTableHeader(doc, cols);

    const redrawOnNewPage = () => {
      // Encabezado compacto en páginas siguientes
      doc.y = drawHeader(doc, cotizacion, brand, { moneda, compact: true });
      drawTableHeader(doc, cols);
    };

    items.forEach((row, idx) => {
      // estimación conservadora antes de dibujar
      ensureSpace(doc, 52, { meta, onNewPage: redrawOnNewPage });
      drawRow(doc, row, cols, { moneda, zebra: true, index: idx });
    });

    // Totales
    ensureSpace(doc, 120, { meta, onNewPage: redrawOnNewPage });
    doc.moveDown(0.6);

    const totalsBoxW = 260;
    const totalsX = right - totalsBoxW;
    const totalsY = doc.y;
    doc
      .roundedRect(totalsX, totalsY, totalsBoxW, 86, 6)
      .fillAndStroke('#F9FAFB', '#E5E7EB');

    doc.font('Helvetica').fontSize(9).fillColor('#111827');
    const lineY = (y, label, value, bold = false) => {
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica');
      doc.text(label, totalsX + 12, y, { width: 120, align: 'left' });
      doc.text(value, totalsX + 132, y, { width: totalsBoxW - 144, align: 'right' });
    };

    lineY(totalsY + 12, 'Subtotal', formatMoney(cotizacion.subtotal, moneda));
    lineY(totalsY + 30, 'Descuento', formatMoney(cotizacion.descuento, moneda));
    lineY(totalsY + 48, 'Impuestos', formatMoney(cotizacion.impuestos, moneda));
    doc.save();
    doc.fillColor('#111827');
    lineY(totalsY + 66, 'TOTAL', formatMoney(cotizacion.total, moneda), true);
    doc.restore();

    doc.y = totalsY + 98;

    // Observaciones y términos
    const obs = safeText(cotizacion.observaciones).trim();
    if (obs) {
      ensureSpace(doc, 80, { meta, onNewPage: redrawOnNewPage });
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827').text('Observaciones', left, doc.y);
      doc.moveDown(0.2);
      doc.font('Helvetica').fontSize(9).fillColor('#374151').text(obs, {
        width: right - left,
      });
      doc.moveDown(0.6);
    }

    // Condiciones mínimas (MVP)
    ensureSpace(doc, 70, { meta, onNewPage: redrawOnNewPage });
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827').text('INFORMACION DE PAGO', left, doc.y);
    doc.moveDown(0.2);
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#374151')
      .text(
        '• Banco de credito.\n• Jorge Davalos Crespo.\n• Nº Cuenta: 3015040742318',
        { width: right - left },
       
      );
      
    // Renderizar footers en todas las páginas
    const range = doc.bufferedPageRange(); // { start, count }
    meta.totalPages = range.count;
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      drawFooter(doc, i - range.start + 1, range.count);
    }

    doc.end();
  });
}

module.exports = { buildCotizacionPdf };
