const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.legalDoc.count();
  console.log("LegalDoc count:", count);
  const docs = await prisma.legalDoc.findMany({ take: 5 });
  console.log("Sample docs:", JSON.stringify(docs, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
