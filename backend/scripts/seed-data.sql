-- Script para repoblar datos después de reset
-- Ejecutar en Supabase SQL Editor

-- Instituciones
INSERT INTO instituciones (nombre, tipo_institucion, direccion, telefono, email, estado)
VALUES 
  ('Instituto Universal', 'Educativo', 'Calle Principal 123', '22-123-4567', 'info@universal.edu.bo', 'activo'),
  ('Empresa Constructora ABC', 'Corporativo', 'Avenida Central 456', '22-234-5678', 'contacto@abc.bo', 'activo'),
  ('Hospital Regional', 'Salud', 'Calle Médica 789', '22-345-6789', 'admin@hospital.bo', 'activo');

-- Categorias
INSERT INTO categorias (nombre, descripcion, estado)
VALUES 
  ('Sistemas de Drenaje', 'Productos para sistemas de drenaje y tuberías', 'activo'),
  ('Filtración', 'Equipos y componentes de filtración', 'activo'),
  ('Bombeo', 'Bombas y equipos de bombeo', 'activo'),
  ('Accesorios', 'Accesorios y piezas complementarias', 'activo');

-- Subcategorias
INSERT INTO subcategorias (id_categoria, nombre, descripcion)
VALUES 
  (1, 'Tuberías PVC', 'Tuberías de PVC para sistemas de drenaje'),
  (1, 'Cajas de Inspección', 'Cajas y cámaras de inspección'),
  (2, 'Filtros de Arena', 'Filtros con base de arena'),
  (2, 'Filtros de Carbón', 'Filtros con carbón activado'),
  (3, 'Bombas Centrífugas', 'Bombas centrífugas de varios modelos'),
  (3, 'Bombas Sumergibles', 'Bombas sumergibles para agua'),
  (4, 'Válvulas', 'Válvulas de aire y control'),
  (4, 'Mallas y Rejillas', 'Mallas de protección y rejillas');

-- Productos
INSERT INTO productos (id_categoria, id_subcategoria, nombre, descripcion, precio_base, cantidad, sku, estado)
VALUES 
  (1, 1, 'Tubería PVC 110mm', 'Tubería PVC de 110mm x 3 metros', 2500, 50, 'PROD-PVC-110', 'activo'),
  (1, 1, 'Tubería PVC 160mm', 'Tubería PVC de 160mm x 3 metros', 4200, 30, 'PROD-PVC-160', 'activo'),
  (1, 2, 'Caja Inspección 60x60', 'Caja de inspección 60x60cm con tapa', 8500, 20, 'PROD-CAJA-60', 'activo'),
  (2, 3, 'Filtro Arena 1000L', 'Filtro de arena de 1000 litros/hora', 15000, 15, 'PROD-FILTRO-ARENA', 'activo'),
  (2, 4, 'Filtro Carbón Activado', 'Filtro de carbón activado 500L', 12000, 10, 'PROD-FILTRO-CARBON', 'activo'),
  (3, 5, 'Bomba Centrífuga 5HP', 'Bomba centrífuga 5HP 220V', 35000, 8, 'PROD-BOMBA-5HP', 'activo'),
  (3, 6, 'Bomba Sumergible 2HP', 'Bomba sumergible 2HP resistente', 18000, 12, 'PROD-BOMBA-SUM-2', 'activo'),
  (4, 7, 'Válvula Check 110mm', 'Válvula check de retención 110mm', 2800, 40, 'PROD-VALV-CHECK', 'activo'),
  (4, 8, 'Malla Protección 50m', 'Malla de protección 50 metros', 5500, 25, 'PROD-MALLA-50', 'activo');

-- Componentes
INSERT INTO componentes (nombre, descripcion, precio_base, sku, estado)
VALUES 
  ('Junta de Goma 110mm', 'Junta de goma para tuberías 110mm', 450, 'COMP-JUNTA-110', 'activo'),
  ('Junta de Goma 160mm', 'Junta de goma para tuberías 160mm', 650, 'COMP-JUNTA-160', 'activo'),
  ('Codo PVC 90 grados', 'Codo de 90 grados para tuberías', 800, 'COMP-CODO-90', 'activo'),
  ('Tee PVC', 'Pieza en T para división de tuberías', 1200, 'COMP-TEE', 'activo'),
  ('Reductor PVC', 'Reductor de 160mm a 110mm', 950, 'COMP-REDUCTOR', 'activo'),
  ('Tapón de Goma', 'Tapón de goma para tuberías', 320, 'COMP-TAPON', 'activo'),
  ('Abrazadera Metálica', 'Abrazadera de metal para sujeción', 580, 'COMP-ABRAZA', 'activo'),
  ('Mortero Específico', 'Mortero especializado para juntas', 250, 'COMP-MORTERO', 'activo');

-- Clientes
INSERT INTO clientes (nombre_completo, telefono, email, ciudad, cargo, id_institucion, direccion, observaciones)
VALUES 
  ('Carlos García López', '22-111-2222', 'carlos.garcia@email.com', 'La Paz', 'Ingeniero', 1, 'Calle 1 #123', 'Cliente preferente'),
  ('María Rodríguez Pérez', '22-333-4444', 'maria.rodriguez@email.com', 'La Paz', 'Jefa de Proyectos', 2, 'Avenida 2 #456', 'Proyecto grande'),
  ('Juan Martínez Silva', '22-555-6666', 'juan.martinez@email.com', 'Santa Cruz', 'Técnico', 3, 'Calle 3 #789', 'Contacto técnico'),
  ('Ana Fernández Díaz', '22-777-8888', 'ana.fernandez@email.com', 'La Paz', 'Directora', 1, 'Avenida 4 #101', NULL),
  ('Roberto Quispe Luna', '22-999-0000', 'roberto.quispe@email.com', 'Cochabamba', 'Supervisor', NULL, 'Calle 5 #202', 'Nuevo cliente');

-- Servicios
INSERT INTO servicios (id_categoria, id_subcategoria, nombre, descripcion, precio_base, estado)
VALUES 
  (1, 1, 'Instalación Tubería Drenaje', 'Servicio de instalación de sistema de drenaje', 5000, 'activo'),
  (2, 3, 'Instalación Filtro Arena', 'Instalación y puesta en marcha de filtro', 8000, 'activo'),
  (3, 5, 'Instalación Bomba Centrífuga', 'Instalación, prueba y capacitación de bomba', 12000, 'activo'),
  (1, NULL, 'Mantenimiento Anual', 'Servicio de mantenimiento anual completo', 3500, 'activo'),
  (NULL, NULL, 'Consultoría Técnica', 'Consultoría y diseño de sistemas', 4000, 'activo');

-- Usuarios (Admin)
INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, rol, estado)
VALUES 
  ('Admin', 'Sistema', 'admin@cotizaciones.bo', '22-000-0000', '$2b$10$YkKxKekKQ.', 'admin', 'activo'),
  ('Usuario', 'Vendedor', 'vendedor@cotizaciones.bo', '22-111-1111', '$2b$10$YkKxKekKQ.', 'usuario', 'activo');

COMMIT;
