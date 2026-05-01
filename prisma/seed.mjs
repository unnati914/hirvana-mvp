import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

async function loadFeatures() {
  const path = join(__dirname, "..", "data", "features.json");
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    const { DEFAULT_FEATURES } = await import("../lib/features-seed.js");
    return DEFAULT_FEATURES;
  }
}

async function main() {
  const features = await loadFeatures();
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
