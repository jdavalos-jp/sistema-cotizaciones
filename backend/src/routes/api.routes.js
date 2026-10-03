const express = require('express');

const { router: authRouter } = require('../modules/auth/auth.routes');
const { router: clientesRouter } = require('../modules/clientes/clientes.routes');
const { router: cotizacionesRouter } = require('../modules/cotizaciones/cotizaciones.routes');
const { router: productosRouter } = require('../modules/productos/productos.routes');
const { router: componentesRouter } = require('../modules/componentes/componentes.routes');
const { router: categoriasRouter } = require('../modules/categorias/categorias.routes');
const { router: subcategoriasRouter } = require('../modules/subcategorias/subcategorias.routes');
const { router: imagenesRouter } = require('../modules/imagenes/imagenes.routes');
const { router: dashboardRouter } = require('../modules/dashboard/dashboard.routes');
const { router: usuariosRouter } = require('../modules/usuarios/usuarios.routes');
const { router: rotulosRouter } = require('../modules/rotulos/rotulos.routes');
const { router: cartasRouter } = require('../modules/cartas/cartas.routes');
const { router: certificadosRouter } = require('../modules/certificados/certificados.routes');
const { router: notasRouter } = require('../modules/notas/notas.routes');
const { verifyJwtToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Auth routes (públicas)
router.use('/auth', authRouter);

// Protected routes
router.use(verifyJwtToken);

router.use('/clientes', clientesRouter);
router.use('/dashboard', dashboardRouter);
router.use('/productos', productosRouter);
router.use('/componentes', componentesRouter);
router.use('/cotizaciones', cotizacionesRouter);
router.use('/categorias', categoriasRouter);
router.use('/subcategorias', subcategoriasRouter);
router.use('/usuarios', usuariosRouter);
router.use('/rotulos', rotulosRouter);
router.use('/cartas', cartasRouter);
router.use('/certificados', certificadosRouter);
router.use('/notas', notasRouter);
router.use(imagenesRouter);

module.exports = { router };
