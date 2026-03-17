const express = require('express');

const { router: clientesRouter } = require('../modules/clientes/clientes.routes');
const { router: cotizacionesRouter } = require('../modules/cotizaciones/cotizaciones.routes');
const { router: productosRouter } = require('../modules/productos/productos.routes');
const { router: componentesRouter } = require('../modules/componentes/componentes.routes');

const router = express.Router();

router.use('/clientes', clientesRouter);
router.use('/productos', productosRouter);
router.use('/componentes', componentesRouter);
router.use('/cotizaciones', cotizacionesRouter);

module.exports = { router };
