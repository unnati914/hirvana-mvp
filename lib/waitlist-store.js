import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const WAITLIST_FILE = path.join(DATA_DIR, "waitlist.json");

function useDatabase() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

async function getPrisma() {
  const { prisma } = await import("./prisma.js");
  return prisma;
}

export async function readWaitlist() {
  if (useDatabase()) {
    const prisma = await getPrisma();
    const rows = await prisma.waitlistEntry.findMany({
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  try {
    const raw = await fs.readFile(WAITLIST_FILE, "utf8");
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function appendWaitlistEntry(entry) {
  if (useDatabase()) {
    const prisma = await getPrisma();
    await prisma.waitlistEntry.create({
      data: {
        name: entry.name,
        email: entry.email,
        role: entry.role ?? null,
      },
    });
    return;
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  let list = [];
  try {
    const raw = await fs.readFile(WAITLIST_FILE, "utf8");
    list = JSON.parse(raw);
    if (!Array.isArray(list)) list = [];
  } catch {
    list = [];
  }
  list.push(entry);
  await fs.writeFile(WAITLIST_FILE, JSON.stringify(list, null, 2), "utf8");
}
