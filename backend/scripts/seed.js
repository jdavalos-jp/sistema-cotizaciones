const { prisma } = require('../src/db/prisma');

async function seed() {
  try {
    console.log('🌱 Iniciando seed de datos...');

    // Instituciones
    const instituciones = await prisma.institucion.createMany({
      data: [
        {
          nombre: 'Instituto Universal',
          tipoInstitucion: 'Educativo',
          direccion: 'Calle Principal 123',
          telefono: '22-123-4567',
          email: 'info@universal.edu.bo',
          estado: 'activo',
        },
        {
          nombre: 'Empresa Constructora ABC',
          tipoInstitucion: 'Corporativo',
          direccion: 'Avenida Central 456',
          telefono: '22-234-5678',
          email: 'contacto@abc.bo',
          estado: 'activo',
        },
        {
          nombre: 'Hospital Regional',
          tipoInstitucion: 'Salud',
          direccion: 'Calle Médica 789',
          telefono: '22-345-6789',
          email: 'admin@hospital.bo',
          estado: 'activo',
        },
      ],
    });
    console.log(`✅ ${instituciones.count} instituciones creadas`);

    // Categorías
    const categorias = await prisma.categoria.createMany({
      data: [
        { nombre: 'Sistemas de Drenaje', descripcion: 'Productos para sistemas de drenaje y tuberías', estado: 'activo' },
        { nombre: 'Filtración', descripcion: 'Equipos y componentes de filtración', estado: 'activo' },
        { nombre: 'Bombeo', descripcion: 'Bombas y equipos de bombeo', estado: 'activo' },
        { nombre: 'Accesorios', descripcion: 'Accesorios y piezas complementarias', estado: 'activo' },
      ],
    });
    console.log(`✅ ${categorias.count} categorías creadas`);

    // Obtener IDs de categorías
    const cats = await prisma.categoria.findMany();
    const catMap = Object.fromEntries(cats.map((c, i) => [i + 1, c.idCategoria]));

    // Subcategorías
    const subcategorias = await prisma.subcategoria.createMany({
      data: [
        { idCategoria: catMap[1], nombre: 'Tuberías PVC', descripcion: 'Tuberías de PVC para sistemas de drenaje' },
        { idCategoria: catMap[1], nombre: 'Cajas de Inspección', descripcion: 'Cajas y cámaras de inspección' },
        { idCategoria: catMap[2], nombre: 'Filtros de Arena', descripcion: 'Filtros con base de arena' },
        { idCategoria: catMap[2], nombre: 'Filtros de Carbón', descripcion: 'Filtros con carbón activado' },
        { idCategoria: catMap[3], nombre: 'Bombas Centrífugas', descripcion: 'Bombas centrífugas de varios modelos' },
        { idCategoria: catMap[3], nombre: 'Bombas Sumergibles', descripcion: 'Bombas sumergibles para agua' },
        { idCategoria: catMap[4], nombre: 'Válvulas', descripcion: 'Válvulas de aire y control' },
        { idCategoria: catMap[4], nombre: 'Mallas y Rejillas', descripcion: 'Mallas de protección y rejillas' },
      ],
    });
    console.log(`✅ ${subcategorias.count} subcategorías creadas`);

    // Obtener IDs de subcategorías
    const subcats = await prisma.subcategoria.findMany();

    // Productos
    const productos = await prisma.producto.createMany({
      data: [
        {
          idCategoria: catMap[1],
          idSubcategoria: subcats[0].idSubcategoria,
          nombre: 'Tubería PVC 110mm',
          descripcion: 'Tubería PVC de 110mm x 3 metros',
          precioBase: 2500,
          cantidad: 50,
          sku: 'PROD-PVC-110',
          estado: 'activo',
        },
        {
          idCategoria: catMap[1],
          idSubcategoria: subcats[0].idSubcategoria,
          nombre: 'Tubería PVC 160mm',
          descripcion: 'Tubería PVC de 160mm x 3 metros',
          precioBase: 4200,
          cantidad: 30,
          sku: 'PROD-PVC-160',
          estado: 'activo',
        },
        {
          idCategoria: catMap[1],
          idSubcategoria: subcats[1].idSubcategoria,
          nombre: 'Caja Inspección 60x60',
          descripcion: 'Caja de inspección 60x60cm con tapa',
          precioBase: 8500,
          cantidad: 20,
          sku: 'PROD-CAJA-60',
          estado: 'activo',
        },
        {
          idCategoria: catMap[2],
          idSubcategoria: subcats[2].idSubcategoria,
          nombre: 'Filtro Arena 1000L',
          descripcion: 'Filtro de arena de 1000 litros/hora',
          precioBase: 15000,
          cantidad: 15,
          sku: 'PROD-FILTRO-ARENA',
          estado: 'activo',
        },
        {
          idCategoria: catMap[2],
          idSubcategoria: subcats[3].idSubcategoria,
          nombre: 'Filtro Carbón Activado',
          descripcion: 'Filtro de carbón activado 500L',
          precioBase: 12000,
          cantidad: 10,
          sku: 'PROD-FILTRO-CARBON',
          estado: 'activo',
        },
        {
          idCategoria: catMap[3],
          idSubcategoria: subcats[4].idSubcategoria,
          nombre: 'Bomba Centrífuga 5HP',
          descripcion: 'Bomba centrífuga 5HP 220V',
          precioBase: 35000,
          cantidad: 8,
          sku: 'PROD-BOMBA-5HP',
          estado: 'activo',
        },
        {
          idCategoria: catMap[3],
          idSubcategoria: subcats[5].idSubcategoria,
          nombre: 'Bomba Sumergible 2HP',
          descripcion: 'Bomba sumergible 2HP resistente',
          precioBase: 18000,
          cantidad: 12,
          sku: 'PROD-BOMBA-SUM-2',
          estado: 'activo',
        },
        {
          idCategoria: catMap[4],
          idSubcategoria: subcats[6].idSubcategoria,
          nombre: 'Válvula Check 110mm',
          descripcion: 'Válvula check de retención 110mm',
          precioBase: 2800,
          cantidad: 40,
          sku: 'PROD-VALV-CHECK',
          estado: 'activo',
        },
        {
          idCategoria: catMap[4],
          idSubcategoria: subcats[7].idSubcategoria,
          nombre: 'Malla Protección 50m',
          descripcion: 'Malla de protección 50 metros',
          precioBase: 5500,
          cantidad: 25,
          sku: 'PROD-MALLA-50',
          estado: 'activo',
        },
      ],
    });
    console.log(`✅ ${productos.count} productos creados`);

    // Componentes
    const componentes = await prisma.componente.createMany({
      data: [
        { nombre: 'Junta de Goma 110mm', descripcion: 'Junta de goma para tuberías 110mm', precioBase: 450, sku: 'COMP-JUNTA-110', estado: 'activo' },
        { nombre: 'Junta de Goma 160mm', descripcion: 'Junta de goma para tuberías 160mm', precioBase: 650, sku: 'COMP-JUNTA-160', estado: 'activo' },
        { nombre: 'Codo PVC 90 grados', descripcion: 'Codo de 90 grados para tuberías', precioBase: 800, sku: 'COMP-CODO-90', estado: 'activo' },
        { nombre: 'Tee PVC', descripcion: 'Pieza en T para división de tuberías', precioBase: 1200, sku: 'COMP-TEE', estado: 'activo' },
        { nombre: 'Reductor PVC', descripcion: 'Reductor de 160mm a 110mm', precioBase: 950, sku: 'COMP-REDUCTOR', estado: 'activo' },
        { nombre: 'Tapón de Goma', descripcion: 'Tapón de goma para tuberías', precioBase: 320, sku: 'COMP-TAPON', estado: 'activo' },
        { nombre: 'Abrazadera Metálica', descripcion: 'Abrazadera de metal para sujeción', precioBase: 580, sku: 'COMP-ABRAZA', estado: 'activo' },
        { nombre: 'Mortero Específico', descripcion: 'Mortero especializado para juntas', precioBase: 250, sku: 'COMP-MORTERO', estado: 'activo' },
      ],
    });
    console.log(`✅ ${componentes.count} componentes creados`);

    // Clientes
    const inst = await prisma.institucion.findMany();
    const instMap = Object.fromEntries(inst.map((i, idx) => [idx + 1, i.idInstitucion]));

    const clientes = await prisma.cliente.createMany({
      data: [
        { nombreCompleto: 'Carlos García López', telefono: '22-111-2222', email: 'carlos.garcia@email.com', ciudad: 'La Paz', cargo: 'Ingeniero', idInstitucion: instMap[1], direccion: 'Calle 1 #123', observaciones: 'Cliente preferente' },
        { nombreCompleto: 'María Rodríguez Pérez', telefono: '22-333-4444', email: 'maria.rodriguez@email.com', ciudad: 'La Paz', cargo: 'Jefa de Proyectos', idInstitucion: instMap[2], direccion: 'Avenida 2 #456', observaciones: 'Proyecto grande' },
        { nombreCompleto: 'Juan Martínez Silva', telefono: '22-555-6666', email: 'juan.martinez@email.com', ciudad: 'Santa Cruz', cargo: 'Técnico', idInstitucion: instMap[3], direccion: 'Calle 3 #789', observaciones: 'Contacto técnico' },
        { nombreCompleto: 'Ana Fernández Díaz', telefono: '22-777-8888', email: 'ana.fernandez@email.com', ciudad: 'La Paz', cargo: 'Directora', idInstitucion: instMap[1], direccion: 'Avenida 4 #101' },
        { nombreCompleto: 'Roberto Quispe Luna', telefono: '22-999-0000', email: 'roberto.quispe@email.com', ciudad: 'Cochabamba', cargo: 'Supervisor', direccion: 'Calle 5 #202', observaciones: 'Nuevo cliente' },
      ],
    });
    console.log(`✅ ${clientes.count} clientes creados`);

    // Servicios
    const servicios = await prisma.servicio.createMany({
      data: [
        { idCategoria: catMap[1], nombre: 'Instalación Tubería Drenaje', descripcion: 'Servicio de instalación de sistema de drenaje', precioBase: 5000, estado: 'activo' },
        { idCategoria: catMap[2], nombre: 'Instalación Filtro Arena', descripcion: 'Instalación y puesta en marcha de filtro', precioBase: 8000, estado: 'activo' },
        { idCategoria: catMap[3], nombre: 'Instalación Bomba Centrífuga', descripcion: 'Instalación, prueba y capacitación de bomba', precioBase: 12000, estado: 'activo' },
        { idCategoria: catMap[1], nombre: 'Mantenimiento Anual', descripcion: 'Servicio de mantenimiento anual completo', precioBase: 3500, estado: 'activo' },
        { nombre: 'Consultoría Técnica', descripcion: 'Consultoría y diseño de sistemas', precioBase: 4000, estado: 'activo' },
      ],
    });
    console.log(`✅ ${servicios.count} servicios creados`);

    // Usuarios
    const usuarios = await prisma.usuario.createMany({
      data: [
        { nombre: 'Admin', apellido: 'Sistema', email: 'admin@cotizaciones.bo', telefono: '22-000-0000', passwordHash: '$2b$10$YkKxKekKPQCQdpCfqNCvq.uNy5ysvFm7pGNEJqKxJhMX5rVR6g23q', rol: 'admin', estado: 'activo' },
        { nombre: 'Usuario', apellido: 'Vendedor', email: 'vendedor@cotizaciones.bo', telefono: '22-111-1111', passwordHash: '$2b$10$YkKxKekKPQCQdpCfqNCvq.uNy5ysvFm7pGNEJqKxJhMX5rVR6g23q', rol: 'usuario', estado: 'activo' },
      ],
    });
    console.log(`✅ ${usuarios.count} usuarios creados`);

    console.log('\n✨ ¡Seed completado exitosamente!');
    console.log('\n📝 Datos de prueba:');
    console.log('   Email Admin: admin@cotizaciones.bo');
    console.log('   Email Vendedor: vendedor@cotizaciones.bo');
    console.log('   Contraseña: (usa la que tenías configurada)');

  } catch (error) {
    console.error('❌ Error durante seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
