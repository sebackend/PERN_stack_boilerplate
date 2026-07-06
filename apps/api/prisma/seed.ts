import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Ejecutando seed...");

  // Crear usuario de prueba
  const passwordHash = await argon2.hash("password123");

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      passwordHash,
    },
  });

  console.log(`✅ Usuario creado: ${admin.email} (id: ${admin.id})`);

  // Crear tareas de ejemplo
  await prisma.task.createMany({
    data: [
      {
        title: "Configurar entorno de desarrollo",
        description: "Instalar dependencias y configurar variables de entorno",
        status: "DONE",
        userId: admin.id,
      },
      {
        title: "Implementar autenticación JWT",
        description: "Login con argon2 + jose",
        status: "IN_PROGRESS",
        userId: admin.id,
      },
      {
        title: "Escribir tests de integración",
        description: "Cubrir endpoints de auth y tasks con Supertest",
        status: "PENDING",
        userId: admin.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Tareas de ejemplo creadas");
  console.log("");
  console.log("─────────────────────────────────────────");
  console.log("Credenciales de prueba:");
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
