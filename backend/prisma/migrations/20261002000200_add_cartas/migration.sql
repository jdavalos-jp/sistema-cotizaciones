-- CreateTable
CREATE TABLE "cartas" (
    "id_carta" BIGSERIAL NOT NULL,
    "id_cliente" BIGINT,
    "ciudad_fecha" VARCHAR(100) NOT NULL,
    "fecha" DATE NOT NULL,
    "numero" VARCHAR(50),
    "tratamiento" VARCHAR(50),
    "destinatario" VARCHAR(200) NOT NULL,
    "cargo_destinatario" VARCHAR(150),
    "institucion" VARCHAR(150),
    "presente" VARCHAR(100),
    "referencia" VARCHAR(300) NOT NULL,
    "cuerpo_html" TEXT NOT NULL,
    "despedida" VARCHAR(100),
    "empresa_firmante" VARCHAR(20),
    "firmante_nombre" VARCHAR(200),
    "firmante_cargo" VARCHAR(200),
    "firmante_documento" VARCHAR(50),
    "firmante_telefono" VARCHAR(30),
    "papel" VARCHAR(10) NOT NULL DEFAULT 'letter',
    "estado" VARCHAR(20) NOT NULL DEFAULT 'borrador',
    "id_usuario_creador" BIGINT,
    "fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cartas_pkey" PRIMARY KEY ("id_carta")
);

-- CreateIndex
CREATE INDEX "idx_cartas_cliente" ON "cartas"("id_cliente");
CREATE INDEX "idx_cartas_usuario" ON "cartas"("id_usuario_creador");
CREATE INDEX "idx_cartas_fecha_actualizacion" ON "cartas"("fecha_actualizacion");
CREATE INDEX "idx_cartas_estado" ON "cartas"("estado");

-- AddForeignKey
ALTER TABLE "cartas" ADD CONSTRAINT "fk_cartas_cliente"
  FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id_cliente") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "cartas" ADD CONSTRAINT "fk_cartas_usuario"
  FOREIGN KEY ("id_usuario_creador") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE NO ACTION;
