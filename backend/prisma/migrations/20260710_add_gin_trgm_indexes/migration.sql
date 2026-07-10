CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_clientes_nombre_trgm ON clientes USING gin (nombre_completo gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clientes_email_trgm ON clientes USING gin (email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clientes_telefono_trgm ON clientes USING gin (telefono gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clientes_institucion_trgm ON clientes USING gin (institucion gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clientes_ciudad_trgm ON clientes USING gin (ciudad gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_productos_nombre_trgm ON productos USING gin (nombre gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_productos_descripcion_trgm ON productos USING gin (descripcion gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_componentes_nombre_trgm ON componentes USING gin (nombre gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_componentes_descripcion_trgm ON componentes USING gin (descripcion gin_trgm_ops);
