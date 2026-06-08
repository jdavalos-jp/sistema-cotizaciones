const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');
const { toDateOnlyString, formatDateDMY, toUtcMidnightDate } = require('../../utils/dateOnly');
const { getSettings, settingsToBrand } = require('../settings/settings.service');
const { addDaysToDate, countBusinessDays, formatCurrency } = require('./converters');

function formatMoney(value, moneda) {
  // Ya están como enteros en la BD, no needed toNumber()
  const n = Number(value ?? 0);
  const curr = String(moneda || '').trim() || 'Bs';
  return `${curr} ${Math.floor(n).toLocaleString('es-BO')}`;
}

function formatAmount(value) {
  const n = Number(value ?? 0);
  return Math.floor(n).toLocaleString('es-BO');
}

function safeText(value) {
  if (value === null || value === undefined) return '';
  return String(value);
}

function decodeHtmlEntities(value) {
  return safeText(value)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => {
      const n = Number(code);
      return Number.isFinite(n) ? String.fromCodePoint(n) : _;
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => {
      const n = Number.parseInt(code, 16);
      return Number.isFinite(n) ? String.fromCodePoint(n) : _;
    });
}

function richTextToPdfText(value) {
  const raw = safeText(value).trim();
  if (!raw) return '';

  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(raw);
  if (!hasHtml) return decodeHtmlEntities(raw);

  return decodeHtmlEntities(raw)
    .replace(/\r?\n/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p\s*>/gi, '\n')
    .replace(/<p\b[^>]*>/gi, '')
    .replace(/<\/div\s*>/gi, '\n')
    .replace(/<div\b[^>]*>/gi, '')
    .replace(/<\/h[1-6]\s*>/gi, '\n')
    .replace(/<h[1-6]\b[^>]*>/gi, '')
    .replace(/<li\b[^>]*>/gi, '\n- ')
    .replace(/<\/li\s*>/gi, '')
    .replace(/<\/?(ul|ol)\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
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
  return formatDateDMY(value);
}

function calcularDiasHabiles(desde, hasta) {
  return countBusinessDays(desde, hasta);
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
  const logoW = compact ? 150 : 260;
  const logoH = compact ? 95 : 135;
  const hasLogo = Boolean(logoPath);

  // Cuadro datos (derecha)
  const boxW = compact ? 220 : 250;
  const boxH = compact ? 52 : 64;
  const boxX = right - boxW;
  const boxY = topY;

  // Columna izquierda (logo + datos debajo)
  const gap = 12;
  const leftColW = Math.max(100, boxX - left - gap);

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
  doc.y = textY;

  // Dirección
  doc.font('Helvetica').fontSize(compact ? 7 : 8).fillColor('#374151');
  if (brand.brandAddress) {
    doc.text(`Av. ${safeText(brand.brandAddress)}`, left, doc.y + 2, { width: leftColW, align: 'left' });
  }

  // Teléfonos
  doc.font('Helvetica').fontSize(compact ? 7 : 8).fillColor('#374151');

  const phones = [
    brand.brandPhone ? `Tel: ${safeText(brand.brandPhone)}` : null,
    brand.brandPhone2 ? `Tel: ${safeText(brand.brandPhone2)}` : null,
  ]
    .filter(Boolean)
    .join('     |    ');

  if (phones) {
    doc.text(phones, left, doc.y + 2, {
      width: leftColW,
      align: 'left',
    });
  }
  // Web y Email en la misma línea
  doc.font('Helvetica').fontSize(compact ? 7 : 8).fillColor('#374151');

  const webEmail = [
    brand.brandWebsite ? `Web: ${safeText(brand.brandWebsite)}` : null,
    brand.brandEmail ? `Email: ${safeText(brand.brandEmail)}` : null,
  ]
    .filter(Boolean)
    .join('     |    ');

  if (webEmail) {
    doc.text(webEmail, left, doc.y + 2, {
      width: leftColW,
      align: 'left',
    });
  }
  const tagline = brand.brandTagline;
  if (tagline) {
    doc.font('Helvetica-Oblique').fontSize(compact ? 6.5 : 7.5).fillColor('#9CA3AF');
    doc.text(safeText(tagline), left, doc.y + 3, { width: leftColW, align: 'left' });
  }

  const leftBlockBottom = Math.max(topY + (hasLogo ? logoH : 0), doc.y);
  doc.restore();

  doc.save();
  doc.roundedRect(boxX, boxY, boxW, boxH, 6).fillAndStroke('#FFFFFF', '#E5E7EB');
  doc.fillColor('#111827');

  const fechaEmision = cotizacion.fechaEmision || new Date().toISOString().split('T')[0];
  let validez = cotizacion.fechaValidez;

  if (!validez) {
    validez = addDaysToDate(fechaEmision, 7);
  }

  const validezStr = toDateOnlyString(validez);

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
  drawKV(boxY + 42, 'Validez:', formatDate(validezStr));
  doc.restore();

  // Banda PROFORMA (solo en primera página)
  const bandY = topY + boxH + (compact ? 6 : 10);
  if (!compact) {
    const bandW = 250;
    const bandX = right - bandW;
    const bandH = 50;
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
  const bottomLimit = doc.page.height - doc.page.margins.bottom - 40; // reserva más grande para footer
  if (doc.y + neededHeight <= bottomLimit) return;
  addPageWithFooter(doc, meta);
  if (typeof onNewPage === 'function') onNewPage();
  doc.y = doc.page.margins.top + 50; // Posicionar correctamente después de nuevo página
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
  const descText = richTextToPdfText(row.descripcion);
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
    if (c.key === 'unit') text = formatAmount(row.unitario);
    if (c.key === 'total') text = formatAmount(row.total);

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
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });

      doc.info.Title = `Cotización ${safeText(cotizacion.numeroCotizacion)}`;
      doc.info.Author = String(process.env.COMPANY_NAME || '').trim() || undefined;

      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const moneda = cotizacion.moneda ?? 'Bs';

      // Obtener brand info desde DB
      const settings = await getSettings();
      const brand = settingsToBrand(settings);

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
        .roundedRect(left, clientBoxY, right - left, 90, 6)
        .fillAndStroke('#FFFFFF', '#E5E7EB');

      // Nombre del cliente (Bold)
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827');
      doc.text(cliente ? safeText(cliente.nombreCompleto) : '—', left + 12, clientBoxY + 12, {
        width: right - left - 24,
      });

      // Institución + Cargo
      doc.font('Helvetica').fontSize(9).fillColor('#374151');
      const line1 = [
        cliente?.institucion ? `${safeText(cliente.institucion)}` : null,
        cliente?.cargo ? `Cargo: ${safeText(cliente.cargo)}` : null,
      ]
        .filter(Boolean)
        .join('   |   ');
      doc.text(line1 || ' ', left + 12, clientBoxY + 30, { width: right - left - 24 });

      // Email, Teléfono, Ciudad
      const line2 = [
        cliente?.email ? `Email: ${cliente.email}` : null,
        cliente?.telefono ? `Tel: ${cliente.telefono}` : null,
        cliente?.ciudad ? `Ciudad: ${cliente.ciudad}` : null,
      ]
        .filter(Boolean)
        .join('   |   ');
      doc.text(line2 || ' ', left + 12, clientBoxY + 48, { width: right - left - 24 });

      // Dirección
      doc.font('Helvetica').fontSize(8).fillColor('#6B7280');
      const direccion = cliente?.direccion ? `Dirección: ${safeText(cliente.direccion)}` : '';
      doc.text(direccion || ' ', left + 12, clientBoxY + 66, { width: right - left - 24 });

      const line3 = [brand.brandEmail ? `Email: ${brand.brandEmail}` : null, brand.brandPhone ? `Tel: ${brand.brandPhone}` : null]
        .filter(Boolean)
        .join('   |   ');

      doc.y = clientBoxY + 102;

      // Items
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text('Detalle de ítems', left, doc.y);
      doc.moveDown(0.4);

      const tableLeft = left;
      const tableWidth = right - left;

      const cols = [
        { key: 'item', title: 'Ítem', x: tableLeft + 0, w: Math.floor(tableWidth * 0.42), align: 'left' },
        { key: 'sku', title: 'SKU', x: tableLeft + Math.floor(tableWidth * 0.39), w: Math.floor(tableWidth * 0.15), align: 'left' },
        { key: 'dias', title: 'Entrega', x: tableLeft + Math.floor(tableWidth * 0.54), w: Math.floor(tableWidth * 0.20), align: 'center' },
        { key: 'cant', title: 'Cant.', x: tableLeft + Math.floor(tableWidth * 0.74), w: Math.floor(tableWidth * 0.08), align: 'right' },
        { key: 'unit', title: 'P. Unit', x: tableLeft + Math.floor(tableWidth * 0.82), w: Math.floor(tableWidth * 0.09), align: 'right' },
        { key: 'total', title: 'Total', x: tableLeft + Math.floor(tableWidth * 0.91), w: Math.floor(tableWidth * 0.09), align: 'right' },
      ];

      const fechaEmisionTable = cotizacion.fechaEmision || new Date().toISOString().split('T')[0];
      let validezTable = cotizacion.fechaValidez;

      // Asegurar que validez es un Date o string en formato ISO
      if (!validezTable) {
        validezTable = addDaysToDate(fechaEmisionTable, 7);
      }

      const validezStr = toDateOnlyString(validezTable);

      // USAR diasEntrega del objeto cotizacion, NO calcular
      const diasHabilesGlobal = cotizacion.diasEntrega ?? 5;

      const calcularDiasPorItem = (observaciones) => {
        if (!observaciones) return diasHabilesGlobal;
        const textoOriginal = safeText(observaciones).trim();
        const texto = textoOriginal.toLowerCase();
        
        if (texto.includes('inmediata') || texto.includes('inmedita')) {
          return 'Inmediata';
        }
        
        // Buscar un patrón como "entrega: X" o "dias: X"
        const match = textoOriginal.match(/(?:entrega|dias|días)\s*:\s*([^,;\n]+)/i);
        if (match && match[1]) {
          return match[1].trim();
        }

        const daysMatch = textoOriginal.match(/^(\d+)(?:\s*(?:dias|días|d\.?))?$/i);
        if (daysMatch && daysMatch[1]) {
          return daysMatch[1];
        }
        
        return diasHabilesGlobal;
      };

      const items = [
        ...(cotizacion.productos ?? [])
          .slice()
          .sort((a, b) => Number(a.ordenVisual ?? 0) - Number(b.ordenVisual ?? 0))
          .map((p) => ({
            sku: p?.producto?.sku ?? null,
            item: p.nombreItem,
            descripcion: joinNonEmpty([richTextToPdfText(p.descripcionItem), formatIncludedComponents(p?.producto)]),
            cantidad: p.cantidad,
            unitario: p.precioUnitario,
            total: p.subtotal,
            diasHabiles: calcularDiasPorItem(p.observaciones),
          })),
        ...(cotizacion.componentes ?? [])
          .slice()
          .sort((a, b) => Number(a.ordenVisual ?? 0) - Number(b.ordenVisual ?? 0))
          .map((c) => ({
            sku: c?.componente?.sku ?? null,
            item: c.nombreItem,
            descripcion: richTextToPdfText(c.descripcionItem),
            cantidad: c.cantidad,
            unitario: c.precioUnitario,
            total: c.subtotal,
            diasHabiles: calcularDiasPorItem(c.observaciones),
          })),
      ];

      // Header tabla
      drawTableHeader(doc, cols);

      const redrawOnNewPage = () => {
        // En nuevas páginas, solo redibuja el header de tabla (sin encabezado de marca)
        doc.y = 40; // Margen superior
        drawTableHeader(doc, cols);
      };

      items.forEach((row, idx) => {
        // Estimar altura de fila con márgenes de seguridad (puede ser más alta si hay descripciones largas)
        const estimatedRowHeight = 60; // Margen conservador para descripciones
        ensureSpace(doc, estimatedRowHeight, { meta, onNewPage: redrawOnNewPage });
        drawRow(doc, row, cols, { moneda, zebra: true, index: idx });
      });

      // Totales
      ensureSpace(doc, 140, { meta, onNewPage: redrawOnNewPage });
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
      doc.text(
        'Banco de Credito.\nJorge Davalos Crespo.\nNº Cuenta: 3015040742318.\n',
        { width: right - left }
      );

      doc.text(
        'Todos los equipos o Accesorios cuentan con 1 año de garantía',
        {
          width: right - left,
          align: 'center'
        }
      );
      // Renderizar footers en todas las páginas
      const range = doc.bufferedPageRange();
      meta.totalPages = range.count;
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        drawFooter(doc, i - range.start + 1, range.count);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { buildCotizacionPdf };
