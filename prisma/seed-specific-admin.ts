import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'trushyasree@gmail.com';
  const password = 'trushyasree';
  
  console.log(`Hashing password for ${email}...`);
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(`Upserting admin user...`);
  await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
      password: hashedPassword
    },
    create: {
      email,
      name: 'Trushyasree Admin',
      role: 'ADMIN',
      password: hashedPassword,
      image: 'https://ui-avatars.com/api/?name=Trushyasree+Admin&background=FF7A00&color=fff',
    }
  });

  console.log("Specific admin seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
