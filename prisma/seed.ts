import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "officer@example.com";
  const passwordHash = await bcrypt.hash("Password123!", 10);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, fullName: "Officer Demo", role: "officer" },
    create: { email, passwordHash, fullName: "Officer Demo", role: "officer" }
  });

  console.log(`Seeded demo user: ${email} / Password123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
