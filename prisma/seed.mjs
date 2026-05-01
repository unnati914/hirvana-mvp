import { PrismaClient } from "@prisma/client";
import { DEFAULT_FEATURES } from "../lib/features-seed.js";

const prisma = new PrismaClient();

async function main() {
  const features = [...DEFAULT_FEATURES];
  for (let i = 0; i < features.length; i++) {
    const f = features[i];
    await prisma.feature.upsert({
      where: { id: f.id },
      create: {
        id: f.id,
        title: f.title,
        description: f.description,
        status: f.status,
        sortOrder: i,
      },
      update: {
        title: f.title,
        description: f.description,
        status: f.status,
        sortOrder: i,
      },
    });
  }
}

main()
  .then(() => console.log("Prisma seed: features upserted."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
