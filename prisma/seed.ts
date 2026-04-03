import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcrypt";
import { PrismaClient, Role, Status } from "@prisma/client";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin123456!";

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Check your .env file.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg(connectionString),
  });
  try {
    const passwordHash = await hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: passwordHash,
        role: Role.ADMIN,
        status: Status.ACTIVE,
      },
      create: {
        email,
        password: passwordHash,
        role: Role.ADMIN,
        status: Status.ACTIVE,
      },
      select: { id: true, email: true, role: true, status: true },
    });

    console.log(`Seeded admin: ${user.email} (${user.id})`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
