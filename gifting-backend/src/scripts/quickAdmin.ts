import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@kasturi.com";
  const password = "kasturi1234";
  const name = "Vaibhav";

  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await prisma.admin.findUnique({ where: { email } });

  if (existing) {
    await prisma.admin.update({
      where: { email },
      data: { passwordHash, name },
    });
    console.log(`Updated admin: ${email}`);
  } else {
    await prisma.admin.create({
      data: { email, passwordHash, name },
    });
    console.log(`Created admin: ${email}`);
  }

  console.log(`\nLogin credentials:`);
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
