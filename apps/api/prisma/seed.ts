import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Running seed...");

  // Create sample user
  const passwordHash = await argon2.hash("password123");

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      passwordHash,
    },
  });

  console.log(`✅ User created: ${admin.email} (id: ${admin.id})`);

  // Create sample tasks
  await prisma.task.createMany({
    data: [
      {
        title: "Set up the development environment",
        description: "Install dependencies and configure environment variables",
        status: "DONE",
        userId: admin.id,
      },
      {
        title: "Implement JWT authentication",
        description: "Login with argon2 + jose",
        status: "IN_PROGRESS",
        userId: admin.id,
      },
      {
        title: "Write integration tests",
        description: "Cover auth and task endpoints with Supertest",
        status: "PENDING",
        userId: admin.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Sample tasks created");
  console.log("");
  console.log("─────────────────────────────────────────");
  console.log("Sample credentials:");
  console.log("  Email:    admin@example.com");
  console.log("  Password: password123");
  console.log("─────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
