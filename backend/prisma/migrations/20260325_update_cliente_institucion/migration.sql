-- Remove foreign key constraint if exists
ALTER TABLE "clientes" DROP CONSTRAINT IF EXISTS "fk_clientes_institucion";

-- Drop index if exists
DROP INDEX IF EXISTS "idx_clientes_institucion";

-- Drop id_institucion column
ALTER TABLE "clientes" DROP COLUMN IF EXISTS "id_institucion";

-- Add institucion column as VARCHAR
ALTER TABLE "clientes" ADD COLUMN "institucion" VARCHAR(150) NULL;
