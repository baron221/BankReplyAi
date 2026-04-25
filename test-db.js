const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const DB = require("better-sqlite3");
const db = new DB("./dev.db");
const adapter = new PrismaBetterSqlite3(db);
const prisma = new PrismaClient({ adapter });
prisma.user.count()
  .then(n => { console.log("Users:", n); return prisma.$disconnect(); })
  .catch(e => { console.error(e.message); return prisma.$disconnect(); });
