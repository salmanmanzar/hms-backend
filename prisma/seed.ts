import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'superadmin@hms.com' },
  });

  if (existingAdmin) {
    console.log('Super Admin already exists:', existingAdmin.email);
    return;
  }

  const hashedPassword = await bcrypt.hash('SuperAdmin@123', 10);

  const superAdmin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'superadmin@hms.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('Super Admin created:', superAdmin.email);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());