const { DiscountType, PromotionStatus } = require('@prisma/client');

async function seedPromotions(prisma) {
  console.log('Seeding default promotions...');

  // Buscar categorías para asociarlas por nombre
  const tecnologia = await prisma.category.findUnique({ where: { name: 'Tecnología' } });
  const ropa = await prisma.category.findUnique({ where: { name: 'Ropa' } });
  const alimentos = await prisma.category.findUnique({ where: { name: 'Alimentos' } });

  if (!tecnologia || !ropa || !alimentos) {
    throw new Error('Required categories not found. Please run category seeds first.');
  }

  const promotions = [
    {
      name: 'Descuento Tecnológico de Fin de Mes',
      categoryId: tecnologia.id,
      discountType: DiscountType.PORCENTAJE,
      discountValue: 15,
      startDate: new Date(`${getRelativeDateStr(0)}T00:00:00-05:00`),
      endDate: new Date(`${getRelativeDateStr(7)}T23:59:59-05:00`),
      status: PromotionStatus.ACTIVA,
    },
    {
      name: 'Liquidación Ropa de Temporada',
      categoryId: ropa.id,
      discountType: DiscountType.MONTO_FIJO,
      discountValue: 20000,
      startDate: new Date(`${getRelativeDateStr(15)}T00:00:00-05:00`),
      endDate: new Date(`${getRelativeDateStr(22)}T23:59:59-05:00`),
      status: PromotionStatus.PROGRAMADA,
    },
    {
      name: 'Super Oferta Canasta Básica',
      categoryId: alimentos.id,
      discountType: DiscountType.PORCENTAJE,
      discountValue: 5,
      startDate: new Date(`${getRelativeDateStr(-10)}T00:00:00-05:00`),
      endDate: new Date(`${getRelativeDateStr(-1)}T23:59:59-05:00`),
      status: PromotionStatus.FINALIZADA,
    }
  ];

  for (const promo of promotions) {
    await prisma.promotion.upsert({
      where: {
        id: await getPromoIdByName(prisma, promo.name) || 0,
      },
      update: {
        categoryId: promo.categoryId,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        startDate: promo.startDate,
        endDate: promo.endDate,
        status: promo.status,
      },
      create: promo,
    });
  }

  console.log('Promotions seeding completed!');
}

// Helper para obtener fechas relativas en formato YYYY-MM-DD
function getRelativeDateStr(offsetDays) {
  const d = new Date();
  // Aplicar offset en días
  d.setDate(d.getDate() + offsetDays);

  // Extraer año, mes y día
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper para evitar duplicación al ejecutar los seeders
async function getPromoIdByName(prisma, name) {
  const promo = await prisma.promotion.findFirst({
    where: { name },
    select: { id: true },
  });
  return promo ? promo.id : null;
}

module.exports = { seedPromotions };
