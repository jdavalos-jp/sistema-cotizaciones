-- AddUniqueConstraint on sku field in productos table
-- First, handle any existing duplicate SKU values (if they exist and are not NULL)
-- PostgreSQL treats NULL as unique, so multiple NULLs are allowed with UNIQUE constraint

-- Add unique constraint to sku column
ALTER TABLE "productos" ADD CONSTRAINT "productos_sku_key" UNIQUE ("sku");
