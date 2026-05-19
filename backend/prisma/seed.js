const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  // Create default admin user
  await prisma.user.upsert({
    where: { username: "Admin" },
    update: { password: hashedPassword, displayName: "ผู้ดูแลระบบ" },
    create: {
      username: "Admin",
      displayName: "ผู้ดูแลระบบ",
      phone: "0000000000",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
