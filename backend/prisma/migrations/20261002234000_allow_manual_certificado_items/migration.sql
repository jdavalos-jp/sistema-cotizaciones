ALTER TABLE "certificado_items"
  DROP CONSTRAINT "chk_certificado_items_catalogo";

ALTER TABLE "certificado_items"
  ADD CONSTRAINT "chk_certificado_items_catalogo" CHECK (
    ("id_producto" IS NULL AND "id_componente" IS NULL)
    OR ("tipo_catalogo" = 'producto' AND "id_producto" IS NOT NULL AND "id_componente" IS NULL)
    OR ("tipo_catalogo" = 'componente' AND "id_componente" IS NOT NULL AND "id_producto" IS NULL)
  );
