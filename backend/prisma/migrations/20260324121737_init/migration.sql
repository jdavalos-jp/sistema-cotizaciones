-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100),
    "email" VARCHAR(150) NOT NULL,
    "telefono" VARCHAR(30),
    "password_hash" TEXT NOT NULL,
    "rol" VARCHAR(50) DEFAULT 'admin',
    "estado" VARCHAR(20) DEFAULT 'activo',
    "fecha_creacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "instituciones" (
    "id_institucion" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "tipo_institucion" VARCHAR(100),
    "direccion" TEXT,
    "telefono" VARCHAR(30),
    "email" VARCHAR(150),
    "estado" VARCHAR(20) DEFAULT 'activo',

    CONSTRAINT "instituciones_pkey" PRIMARY KEY ("id_institucion")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id_cliente" BIGSERIAL NOT NULL,
    "nombre_completo" VARCHAR(200) NOT NULL,
    "telefono" VARCHAR(30),
    "email" VARCHAR(150),
    "ciudad" VARCHAR(100),
    "cargo" VARCHAR(150),
    "id_institucion" BIGINT,
    "direccion" TEXT,
    "observaciones" TEXT,
    "fecha_creacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id_categoria" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "estado" VARCHAR(20) DEFAULT 'activo',

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "subcategorias" (
    "id_subcategoria" BIGSERIAL NOT NULL,
    "id_categoria" BIGINT NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "subcategorias_pkey" PRIMARY KEY ("id_subcategoria")
);

-- CreateTable
CREATE TABLE "productos" (
    "id_producto" BIGSERIAL NOT NULL,
    "id_categoria" BIGINT,
    "id_subcategoria" BIGINT,
    "nombre" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "precio_base" INTEGER NOT NULL DEFAULT 0,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "sku" VARCHAR(100),
    "estado" VARCHAR(20) DEFAULT 'activo',

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "producto_imagenes" (
    "id_imagen" BIGSERIAL NOT NULL,
    "id_producto" BIGINT NOT NULL,
    "url_imagen" TEXT NOT NULL,
    "orden" INTEGER DEFAULT 1,
    "principal" BOOLEAN DEFAULT false,
    "fecha_creacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "producto_imagenes_pkey" PRIMARY KEY ("id_imagen")
);

-- CreateTable
CREATE TABLE "componentes" (
    "id_componente" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "precio_base" INTEGER NOT NULL DEFAULT 0,
    "sku" VARCHAR(100),
    "estado" VARCHAR(20) DEFAULT 'activo',

    CONSTRAINT "componentes_pkey" PRIMARY KEY ("id_componente")
);

-- CreateTable
CREATE TABLE "producto_componentes" (
    "id_producto_componente" BIGSERIAL NOT NULL,
    "id_producto" BIGINT NOT NULL,
    "id_componente" BIGINT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precio_referencial" INTEGER DEFAULT 0,
    "observaciones" TEXT,

    CONSTRAINT "producto_componentes_pkey" PRIMARY KEY ("id_producto_componente")
);

-- CreateTable
CREATE TABLE "servicios" (
    "id_servicio" BIGSERIAL NOT NULL,
    "id_categoria" BIGINT,
    "id_subcategoria" BIGINT,
    "nombre" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "precio_base" INTEGER NOT NULL DEFAULT 0,
    "estado" VARCHAR(20) DEFAULT 'activo',

    CONSTRAINT "servicios_pkey" PRIMARY KEY ("id_servicio")
);

-- CreateTable
CREATE TABLE "servicio_imagenes" (
    "id_imagen" BIGSERIAL NOT NULL,
    "id_servicio" BIGINT NOT NULL,
    "url_imagen" TEXT NOT NULL,
    "orden" INTEGER DEFAULT 1,
    "principal" BOOLEAN DEFAULT false,
    "fecha_creacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "servicio_imagenes_pkey" PRIMARY KEY ("id_imagen")
);

-- CreateTable
CREATE TABLE "cotizaciones" (
    "id_cotizacion" BIGSERIAL NOT NULL,
    "numero_cotizacion" VARCHAR(50) NOT NULL,
    "id_cliente" BIGINT NOT NULL,
    "fecha_emision" DATE NOT NULL DEFAULT CURRENT_DATE,
    "fecha_validez" DATE,
    "estado" VARCHAR(50) DEFAULT 'borrador',
    "subtotal" INTEGER DEFAULT 0,
    "descuento" INTEGER DEFAULT 0,
    "impuestos" INTEGER DEFAULT 0,
    "total" INTEGER DEFAULT 0,
    "moneda" VARCHAR(10) DEFAULT 'Bs',
    "observaciones" TEXT,
    "terminos_condiciones" TEXT,
    "id_usuario_creador" BIGINT,
    "fecha_creacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cotizaciones_pkey" PRIMARY KEY ("id_cotizacion")
);

-- CreateTable
CREATE TABLE "cotizacion_productos" (
    "id_detalle_producto" BIGSERIAL NOT NULL,
    "id_cotizacion" BIGINT NOT NULL,
    "id_producto" BIGINT NOT NULL,
    "nombre_item" VARCHAR(200) NOT NULL,
    "descripcion_item" TEXT,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precio_unitario" INTEGER NOT NULL DEFAULT 0,
    "descuento" INTEGER DEFAULT 0,
    "subtotal" INTEGER DEFAULT 0,
    "orden_visual" INTEGER DEFAULT 1,
    "observaciones" TEXT,

    CONSTRAINT "cotizacion_productos_pkey" PRIMARY KEY ("id_detalle_producto")
);

-- CreateTable
CREATE TABLE "cotizacion_servicios" (
    "id_detalle_servicio" BIGSERIAL NOT NULL,
    "id_cotizacion" BIGINT NOT NULL,
    "id_servicio" BIGINT NOT NULL,
    "nombre_item" VARCHAR(200) NOT NULL,
    "descripcion_item" TEXT,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precio_unitario" INTEGER NOT NULL DEFAULT 0,
    "descuento" INTEGER DEFAULT 0,
    "subtotal" INTEGER DEFAULT 0,
    "orden_visual" INTEGER DEFAULT 1,
    "observaciones" TEXT,

    CONSTRAINT "cotizacion_servicios_pkey" PRIMARY KEY ("id_detalle_servicio")
);

-- CreateTable
CREATE TABLE "cotizacion_componentes" (
    "id_detalle_componente" BIGSERIAL NOT NULL,
    "id_cotizacion" BIGINT NOT NULL,
    "id_componente" BIGINT NOT NULL,
    "nombre_item" VARCHAR(200) NOT NULL,
    "descripcion_item" TEXT,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precio_unitario" INTEGER NOT NULL DEFAULT 0,
    "descuento" INTEGER DEFAULT 0,
    "subtotal" INTEGER DEFAULT 0,
    "orden_visual" INTEGER DEFAULT 1,
    "observaciones" TEXT,

    CONSTRAINT "cotizacion_componentes_pkey" PRIMARY KEY ("id_detalle_componente")
);

-- CreateTable
CREATE TABLE "solicitudes_cotizacion_web" (
    "id_solicitud" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "telefono" VARCHAR(30),
    "correo" VARCHAR(150),
    "asunto" VARCHAR(250),
    "fecha_creacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitudes_cotizacion_web_pkey" PRIMARY KEY ("id_solicitud")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "idx_clientes_institucion" ON "clientes"("id_institucion");

-- CreateIndex
CREATE INDEX "idx_subcategorias_categoria" ON "subcategorias"("id_categoria");

-- CreateIndex
CREATE INDEX "idx_productos_categoria" ON "productos"("id_categoria");

-- CreateIndex
CREATE INDEX "idx_productos_subcategoria" ON "productos"("id_subcategoria");

-- CreateIndex
CREATE INDEX "idx_productos_nombre" ON "productos"("nombre");

-- CreateIndex
CREATE INDEX "idx_producto_imagenes_producto" ON "producto_imagenes"("id_producto");

-- CreateIndex
CREATE INDEX "idx_producto_componentes_producto" ON "producto_componentes"("id_producto");

-- CreateIndex
CREATE INDEX "idx_producto_componentes_componente" ON "producto_componentes"("id_componente");

-- CreateIndex
CREATE INDEX "idx_servicios_categoria" ON "servicios"("id_categoria");

-- CreateIndex
CREATE INDEX "idx_servicios_subcategoria" ON "servicios"("id_subcategoria");

-- CreateIndex
CREATE INDEX "idx_servicios_nombre" ON "servicios"("nombre");

-- CreateIndex
CREATE INDEX "idx_servicio_imagenes_servicio" ON "servicio_imagenes"("id_servicio");

-- CreateIndex
CREATE UNIQUE INDEX "cotizaciones_numero_cotizacion_key" ON "cotizaciones"("numero_cotizacion");

-- CreateIndex
CREATE INDEX "idx_cotizaciones_cliente" ON "cotizaciones"("id_cliente");

-- CreateIndex
CREATE INDEX "idx_cotizaciones_usuario" ON "cotizaciones"("id_usuario_creador");

-- CreateIndex
CREATE INDEX "idx_cotizaciones_fecha" ON "cotizaciones"("fecha_emision");

-- CreateIndex
CREATE INDEX "idx_cotizacion_productos_cotizacion" ON "cotizacion_productos"("id_cotizacion");

-- CreateIndex
CREATE INDEX "idx_cotizacion_productos_producto" ON "cotizacion_productos"("id_producto");

-- CreateIndex
CREATE INDEX "idx_cotizacion_servicios_cotizacion" ON "cotizacion_servicios"("id_cotizacion");

-- CreateIndex
CREATE INDEX "idx_cotizacion_servicios_servicio" ON "cotizacion_servicios"("id_servicio");

-- CreateIndex
CREATE INDEX "idx_cotizacion_componentes_cotizacion" ON "cotizacion_componentes"("id_cotizacion");

-- CreateIndex
CREATE INDEX "idx_cotizacion_componentes_componente" ON "cotizacion_componentes"("id_componente");

-- CreateIndex
CREATE INDEX "idx_solicitudes_cotizacion_web_fecha" ON "solicitudes_cotizacion_web"("fecha_creacion");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "fk_clientes_institucion" FOREIGN KEY ("id_institucion") REFERENCES "instituciones"("id_institucion") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subcategorias" ADD CONSTRAINT "fk_subcategorias_categoria" FOREIGN KEY ("id_categoria") REFERENCES "categorias"("id_categoria") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "fk_productos_categoria" FOREIGN KEY ("id_categoria") REFERENCES "categorias"("id_categoria") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "fk_productos_subcategoria" FOREIGN KEY ("id_subcategoria") REFERENCES "subcategorias"("id_subcategoria") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "producto_imagenes" ADD CONSTRAINT "fk_producto_imagenes_producto" FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "producto_componentes" ADD CONSTRAINT "fk_producto_componentes_componente" FOREIGN KEY ("id_componente") REFERENCES "componentes"("id_componente") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "producto_componentes" ADD CONSTRAINT "fk_producto_componentes_producto" FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "servicios" ADD CONSTRAINT "fk_servicios_categoria" FOREIGN KEY ("id_categoria") REFERENCES "categorias"("id_categoria") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "servicios" ADD CONSTRAINT "fk_servicios_subcategoria" FOREIGN KEY ("id_subcategoria") REFERENCES "subcategorias"("id_subcategoria") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "servicio_imagenes" ADD CONSTRAINT "fk_servicio_imagenes_servicio" FOREIGN KEY ("id_servicio") REFERENCES "servicios"("id_servicio") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "fk_cotizaciones_cliente" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id_cliente") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "fk_cotizaciones_usuario" FOREIGN KEY ("id_usuario_creador") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cotizacion_productos" ADD CONSTRAINT "fk_cotizacion_productos_cotizacion" FOREIGN KEY ("id_cotizacion") REFERENCES "cotizaciones"("id_cotizacion") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cotizacion_productos" ADD CONSTRAINT "fk_cotizacion_productos_producto" FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cotizacion_servicios" ADD CONSTRAINT "fk_cotizacion_servicios_cotizacion" FOREIGN KEY ("id_cotizacion") REFERENCES "cotizaciones"("id_cotizacion") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cotizacion_servicios" ADD CONSTRAINT "fk_cotizacion_servicios_servicio" FOREIGN KEY ("id_servicio") REFERENCES "servicios"("id_servicio") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cotizacion_componentes" ADD CONSTRAINT "fk_cotizacion_componentes_componente" FOREIGN KEY ("id_componente") REFERENCES "componentes"("id_componente") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cotizacion_componentes" ADD CONSTRAINT "fk_cotizacion_componentes_cotizacion" FOREIGN KEY ("id_cotizacion") REFERENCES "cotizaciones"("id_cotizacion") ON DELETE CASCADE ON UPDATE NO ACTION;
