ALTER TABLE "certificados" ADD COLUMN "id_nota_origen" BIGINT;

CREATE INDEX "idx_certificados_nota_origen" ON "certificados"("id_nota_origen");

ALTER TABLE "certificados" ADD CONSTRAINT "fk_certificados_nota_origen"
  FOREIGN KEY ("id_nota_origen") REFERENCES "notas"("id_nota") ON DELETE SET NULL ON UPDATE NO ACTION;
