-- Add rutaBucket column to producto_imagenes table for tracking image storage paths
ALTER TABLE "producto_imagenes" ADD COLUMN "ruta_bucket" VARCHAR(255) NULL;

-- Add an index to improve lookups when deleting images
CREATE INDEX "idx_producto_imagenes_ruta_bucket" ON "producto_imagenes"("ruta_bucket");
