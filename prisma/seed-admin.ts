import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@getmytra.com';
  
  console.log(`Checking for admin: ${adminEmail}...`);
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingAdmin) {
    console.log("Admin already exists. Updating role to ADMIN...");
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: 'ADMIN' }
    });
  } else {
    console.log("Creating new admin user...");
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Mytra Admin',
        role: 'ADMIN',
        image: 'https://ui-avatars.com/api/?name=Mytra+Admin&background=FF7A00&color=fff'
      }
    });
  }

  console.log("Admin seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
