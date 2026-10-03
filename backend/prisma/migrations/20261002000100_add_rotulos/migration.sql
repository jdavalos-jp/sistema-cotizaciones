-- CreateTable
CREATE TABLE "rotulos" (
    "id_rotulo" BIGSERIAL NOT NULL,
    "id_cliente" BIGINT NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "cargo" VARCHAR(150),
    "correo" VARCHAR(150),
    "telefono" VARCHAR(30),
    "ciudad" VARCHAR(100),
    "tamano_papel" VARCHAR(10) NOT NULL DEFAULT 'letter',
    "id_usuario_creador" BIGINT,
    "fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rotulos_pkey" PRIMARY KEY ("id_rotulo")
);

-- CreateIndex
CREATE INDEX "idx_rotulos_cliente" ON "rotulos"("id_cliente");

-- CreateIndex
CREATE INDEX "idx_rotulos_fecha_creacion" ON "rotulos"("fecha_creacion");

-- AddForeignKey
ALTER TABLE "rotulos" ADD CONSTRAINT "fk_rotulos_cliente"
  FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id_cliente") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rotulos" ADD CONSTRAINT "fk_rotulos_usuario"
  FOREIGN KEY ("id_usuario_creador") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE NO ACTION;