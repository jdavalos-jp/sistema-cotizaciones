const express = require('express');

const { router: authRouter } = require('../modules/auth/auth.routes');
const { router: clientesRouter } = require('../modules/clientes/clientes.routes');
const { router: cotizacionesRouter } = require('../modules/cotizaciones/cotizaciones.routes');
const { router: productosRouter } = require('../modules/productos/productos.routes');
const { router: componentesRouter } = require('../modules/componentes/componentes.routes');
const { router: categoriasRouter } = require('../modules/categorias/categorias.routes');
const { router: subcategoriasRouter } = require('../modules/subcategorias/subcategorias.routes');
const { router: imagenesRouter } = require('../modules/imagenes/imagenes.routes');

const router = express.Router();

// Auth routes (públicas)
router.use('/auth', authRouter);

// Protected routes
router.use('/clientes', clientesRouter);
router.use('/productos', productosRouter);
router.use('/componentes', componentesRouter);
router.use('/cotizaciones', cotizacionesRouter);
router.use('/categorias', categoriasRouter);
router.use('/subcategorias', subcategoriasRouter);
router.use(imagenesRouter);

module.exports = { router };
