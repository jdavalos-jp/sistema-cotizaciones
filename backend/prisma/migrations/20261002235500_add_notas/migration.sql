-- CreateTable
CREATE TABLE "notas" (
    "id_nota" BIGSERIAL NOT NULL,
    "id_cliente" BIGINT,
    "codigo" VARCHAR(50),
    "revision" VARCHAR(20),
    "numero" VARCHAR(50),
    "cliente_entidad" VARCHAR(250) NOT NULL,
    "institucion" VARCHAR(200),
    "objeto_contratacion" TEXT,
    "lugar_entrega" VARCHAR(250),
    "fecha_entrega" DATE,
    "introduccion" TEXT,
    "empresa_entregado_por" VARCHAR(20),
    "entregado_nombre" VARCHAR(200),
    "entregado_cargo" VARCHAR(200),
    "entregado_firma_url" TEXT,
    "recibido_nombre" VARCHAR(200),
    "recibido_cargo" VARCHAR(200),
    "recibido_firma_url" TEXT,
    "papel" VARCHAR(10) NOT NULL DEFAULT 'letter',
    "estado" VARCHAR(20) NOT NULL DEFAULT 'borrador',
    "id_usuario_creador" BIGINT,
    "fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notas_pkey" PRIMARY KEY ("id_nota"),
    CONSTRAINT "chk_notas_papel" CHECK ("papel" IN ('letter', 'a4')),
    CONSTRAINT "chk_notas_estado" CHECK ("estado" IN ('borrador', 'finalizada')),
    CONSTRAINT "chk_notas_empresa_entregado" CHECK ("empresa_entregado_por" IS NULL OR "empresa_entregado_por" IN ('tecnoequip', 'jdblab'))
);

-- CreateTable
CREATE TABLE "nota_items" (
    "id_item" BIGSERIAL NOT NULL,
    "id_nota" BIGINT NOT NULL,
    "tipo_catalogo" VARCHAR(20) NOT NULL,
    "id_producto" BIGINT,
    "id_componente" BIGINT,
    "nombre" VARCHAR(250) NOT NULL,
    "descripcion" TEXT,
    "codigo" VARCHAR(100),
    "numero_serie" VARCHAR(150),
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(12,2) NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "nota_items_pkey" PRIMARY KEY ("id_item"),
    CONSTRAINT "chk_nota_items_tipo_catalogo" CHECK ("tipo_catalogo" IN ('producto', 'componente')),
    CONSTRAINT "chk_nota_items_catalogo" CHECK (
      ("id_producto" IS NULL AND "id_componente" IS NULL)
      OR ("tipo_catalogo" = 'producto' AND "id_producto" IS NOT NULL AND "id_componente" IS NULL)
      OR ("tipo_catalogo" = 'componente' AND "id_componente" IS NOT NULL AND "id_producto" IS NULL)
    ),
    CONSTRAINT "chk_nota_items_cantidad" CHECK ("cantidad" > 0),
    CONSTRAINT "chk_nota_items_precio" CHECK ("precio_unitario" >= 0)
);

-- CreateIndex
CREATE INDEX "idx_notas_cliente" ON "notas"("id_cliente");
CREATE INDEX "idx_notas_usuario" ON "notas"("id_usuario_creador");
CREATE INDEX "idx_notas_fecha_actualizacion" ON "notas"("fecha_actualizacion");
CREATE INDEX "idx_notas_estado" ON "notas"("estado");
CREATE INDEX "idx_nota_items_nota" ON "nota_items"("id_nota");
CREATE INDEX "idx_nota_items_producto" ON "nota_items"("id_producto");
CREATE INDEX "idx_nota_items_componente" ON "nota_items"("id_componente");

-- AddForeignKey
ALTER TABLE "notas" ADD CONSTRAINT "fk_notas_cliente"
  FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id_cliente") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "notas" ADD CONSTRAINT "fk_notas_usuario"
  FOREIGN KEY ("id_usuario_creador") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "nota_items" ADD CONSTRAINT "fk_nota_items_nota"
  FOREIGN KEY ("id_nota") REFERENCES "notas"("id_nota") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "nota_items" ADD CONSTRAINT "fk_nota_items_producto"
  FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "nota_items" ADD CONSTRAINT "fk_nota_items_componente"
  FOREIGN KEY ("id_componente") REFERENCES "componentes"("id_componente") ON DELETE SET NULL ON UPDATE NO ACTION;
