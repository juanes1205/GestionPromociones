const { PrismaClient } = require('@prisma/client');
const { seedCategories } = require('./categoriesSeed');
const { seedPromotions } = require('./promotionsSeed');

const prisma = new PrismaClient();

async function main() {

  await seedCategories(prisma);
  await seedPromotions(prisma);

  console.log('Seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

