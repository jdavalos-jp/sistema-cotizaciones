-- CreateTable
CREATE TABLE "certificados" (
    "id_certificado" BIGSERIAL NOT NULL,
    "id_cliente" BIGINT,
    "cliente_entidad" VARCHAR(250) NOT NULL,
    "objeto_contratacion" TEXT NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "revision" VARCHAR(20),
    "garantia_anos" SMALLINT,
    "fecha_desde" DATE,
    "fecha_hasta" DATE,
    "condiciones_html" TEXT,
    "empresa_firmante" VARCHAR(20),
    "firmante_nombre" VARCHAR(200),
    "firmante_cargo" VARCHAR(200),
    "firmante_documento" VARCHAR(50),
    "firmante_telefono" VARCHAR(30),
    "papel" VARCHAR(10) NOT NULL DEFAULT 'a4',
    "estado" VARCHAR(20) NOT NULL DEFAULT 'borrador',
    "id_usuario_creador" BIGINT,
    "fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificados_pkey" PRIMARY KEY ("id_certificado")
);

-- CreateTable
CREATE TABLE "certificado_items" (
    "id_item" BIGSERIAL NOT NULL,
    "id_certificado" BIGINT NOT NULL,
    "tipo_catalogo" VARCHAR(20) NOT NULL,
    "id_producto" BIGINT,
    "id_componente" BIGINT,
    "descripcion" VARCHAR(300) NOT NULL,
    "marca" VARCHAR(150),
    "modelo" VARCHAR(150),
    "cantidad" INTEGER NOT NULL,
    "aclaraciones" VARCHAR(250),
    "orden" INTEGER NOT NULL,

    CONSTRAINT "certificado_items_pkey" PRIMARY KEY ("id_item"),
    CONSTRAINT "chk_certificado_items_tipo_catalogo" CHECK ("tipo_catalogo" IN ('producto', 'componente')),
    CONSTRAINT "chk_certificado_items_catalogo" CHECK (
      ("tipo_catalogo" = 'producto' AND "id_producto" IS NOT NULL AND "id_componente" IS NULL)
      OR ("tipo_catalogo" = 'componente' AND "id_componente" IS NOT NULL AND "id_producto" IS NULL)
    ),
    CONSTRAINT "chk_certificado_items_cantidad" CHECK ("cantidad" > 0)
);

-- CreateIndex
CREATE INDEX "idx_certificados_cliente" ON "certificados"("id_cliente");
CREATE INDEX "idx_certificados_usuario" ON "certificados"("id_usuario_creador");
CREATE INDEX "idx_certificados_fecha_actualizacion" ON "certificados"("fecha_actualizacion");
CREATE INDEX "idx_certificados_estado" ON "certificados"("estado");
CREATE INDEX "idx_certificado_items_certificado" ON "certificado_items"("id_certificado");
CREATE INDEX "idx_certificado_items_producto" ON "certificado_items"("id_producto");
CREATE INDEX "idx_certificado_items_componente" ON "certificado_items"("id_componente");

-- AddForeignKey
ALTER TABLE "certificados" ADD CONSTRAINT "fk_certificados_cliente"
  FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id_cliente") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "certificados" ADD CONSTRAINT "fk_certificados_usuario"
  FOREIGN KEY ("id_usuario_creador") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "certificado_items" ADD CONSTRAINT "fk_certificado_items_certificado"
  FOREIGN KEY ("id_certificado") REFERENCES "certificados"("id_certificado") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "certificado_items" ADD CONSTRAINT "fk_certificado_items_producto"
  FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "certificado_items" ADD CONSTRAINT "fk_certificado_items_componente"
  FOREIGN KEY ("id_componente") REFERENCES "componentes"("id_componente") ON DELETE SET NULL ON UPDATE NO ACTION;
