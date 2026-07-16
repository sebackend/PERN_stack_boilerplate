import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import argon2 from "argon2";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] ?? "" });
const prisma = new PrismaClient({ adapter });

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
  const day = 24 * 60 * 60 * 1000;
  await prisma.task.createMany({
    data: [
      {
        title: "Set up the development environment",
        description: "Install dependencies and configure environment variables",
        status: "DONE",
        priority: "MEDIUM",
        dueDate: new Date(Date.now() - 3 * day),
        userId: admin.id,
      },
      {
        title: "Implement JWT authentication",
        description: "Login with argon2 + jose",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: new Date(Date.now() + 2 * day),
        userId: admin.id,
      },
      {
        title: "Write integration tests",
        description: "Cover auth and task endpoints with Supertest",
        status: "PENDING",
        priority: "LOW",
        dueDate: new Date(Date.now() + 7 * day),
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
