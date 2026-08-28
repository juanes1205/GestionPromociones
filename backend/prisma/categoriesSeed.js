async function seedCategories(prisma) {
  console.log('Seeding default categories...');

  const categories = [
    {
      name: 'Tecnología',
      description:
        'Dispositivos electrónicos, computadoras, celulares y accesorios.',
    },
    {
      name: 'Ropa',
      description:
        'Prendas de vestir para adultos, niños, calzado y accesorios de moda.',
    },
    {
      name: 'Alimentos',
      description:
        'Productos comestibles, abarrotes, bebidas y frescos.',
    },
    {
      name: 'Hogar',
      description:
        'Muebles, decoración, utensilios de cocina y artículos para el hogar.',
    },
    {
      name: 'Deportes',
      description:
        'Equipamiento deportivo, ropa de entrenamiento y camping.',
    },
    {
      name: 'Belleza y Cuidado Personal',
      description:
        'Cosméticos, productos de higiene, cuidado de la piel y cuidado personal.',
    },
    {
      name: 'Salud',
      description:
        'Productos para el bienestar, cuidado personal y artículos de salud.',
    },
    {
      name: 'Juguetes',
      description:
        'Juguetes, juegos de mesa, videojuegos y productos de entretenimiento infantil.',
    },
    {
      name: 'Automotriz',
      description:
        'Accesorios, repuestos, herramientas y productos para vehículos.',
    },
    {
      name: 'Libros y Papelería',
      description:
        'Libros, cuadernos, útiles escolares, material de oficina y papelería.',
    },
    {
      name: 'Mascotas',
      description:
        'Alimentos, accesorios, juguetes y productos para mascotas.',
    },
    {
      name: 'Herramientas',
      description:
        'Herramientas manuales, eléctricas, equipos y accesorios para reparación.',
    },
    {
      name: 'Electrodomésticos',
      description:
        'Electrodomésticos para cocina, limpieza, climatización y hogar.',
    },
    {
      name: 'Jardinería',
      description:
        'Herramientas, plantas, semillas, fertilizantes y accesorios de jardinería.',
    },
    {
      name: 'Oficina',
      description:
        'Muebles, equipos, accesorios y suministros para oficinas y espacios de trabajo.',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        name: category.name,
      },
      update: {},
      create: category,
    });
  }

  console.log('Categories seeding completed successfully!');
}

module.exports = {
  seedCategories,
};