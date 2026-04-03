const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10)

  // Create default admin user
  await prisma.user.upsert({
    where: { username: 'Admin' },
    update: { password: hashedPassword },
    create: {
      username: 'Admin',
      phone: '0000000000',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  // Create sample vehicles
  const vehicles = [
    { type: 'รถตู้', licensePlate: 'กข 1234' },
    { type: 'รถกระบะ', licensePlate: 'คง 5678' },
    { type: 'รถเก๋ง', licensePlate: 'จฉ 9012' }
  ]

  for (const v of vehicles) {
    await prisma.vehicle.upsert({
      where: { licensePlate: v.licensePlate },
      update: {},
      create: v
    })
  }

  console.log('Seed completed')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
