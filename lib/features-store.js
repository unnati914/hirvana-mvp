import fs from "fs/promises";
import path from "path";
import { DEFAULT_FEATURES } from "./features-seed.js";

const FEATURES_PATH = path.join(process.cwd(), "data", "features.json");
const ALLOWED_STATUS = new Set(["soon", "beta", "live"]);

function useDatabase() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

async function getPrisma() {
  const { prisma } = await import("./prisma.js");
  return prisma;
}

async function ensureFeaturesSeeded(prisma) {
  const n = await prisma.feature.count();
  if (n > 0) return;

  let seedList = DEFAULT_FEATURES;
  try {
    const raw = await fs.readFile(FEATURES_PATH, "utf8");
    const parsed = JSON.parse(raw);
    const list = normalizeList(parsed);
    if (list) seedList = list;
  } catch {
    /* use DEFAULT_FEATURES */
  }

  for (let i = 0; i < seedList.length; i++) {
    const f = seedList[i];
    await prisma.feature.create({
      data: {
        id: f.id,
        title: f.title,
        description: f.description,
        status: f.status,
        sortOrder: i,
      },
    });
  }
}

function normalizeFeature(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const description = typeof raw.description === "string" ? raw.description.trim() : "";
  const statusRaw = typeof raw.status === "string" ? raw.status.trim().toLowerCase() : "";
  if (!id || !title || !description || !ALLOWED_STATUS.has(statusRaw)) return null;
  return { id, title, description, status: statusRaw };
}

function normalizeList(arr) {
  if (!Array.isArray(arr)) return null;
  const out = [];
  for (const item of arr) {
    const n = normalizeFeature(item);
    if (n) out.push(n);
  }
  return out.length ? out : null;
}

async function writeFeaturesFile(features) {
  await fs.mkdir(path.dirname(FEATURES_PATH), { recursive: true });
  await fs.writeFile(FEATURES_PATH, JSON.stringify(features, null, 2), "utf8");
}

async function tryWriteFeaturesFile(features) {
  try {
    await writeFeaturesFile(features);
  } catch {
    /* read-only FS */
  }
}

export async function getFeatures() {
  if (useDatabase()) {
    const prisma = await getPrisma();
    await ensureFeaturesSeeded(prisma);
    const rows = await prisma.feature.findMany({ orderBy: { sortOrder: "asc" } });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      status: r.status,
    }));
  }

  try {
    const raw = await fs.readFile(FEATURES_PATH, "utf8");
    const parsed = JSON.parse(raw);
    const list = normalizeList(parsed);
    if (!list) {
      await tryWriteFeaturesFile(DEFAULT_FEATURES);
      return [...DEFAULT_FEATURES];
    }
    return list;
  } catch {
    await tryWriteFeaturesFile(DEFAULT_FEATURES);
    return [...DEFAULT_FEATURES];
  }
}

export async function saveFeatures(features) {
  const list = normalizeList(features);
  if (!list) {
    throw new Error("Invalid features payload");
  }

  if (useDatabase()) {
    const prisma = await getPrisma();
    await prisma.$transaction([
      prisma.feature.deleteMany({}),
      prisma.feature.createMany({
        data: list.map((f, i) => ({
          id: f.id,
          title: f.title,
          description: f.description,
          status: f.status,
          sortOrder: i,
        })),
      }),
    ]);
    return list;
  }

  await writeFeaturesFile(list);
  return list;
}

export async function getFeatureById(id) {
  const list = await getFeatures();
  return list.find((f) => f.id === id) ?? null;
}

export async function patchFeature(id, patch) {
  if (useDatabase()) {
    const prisma = await getPrisma();
    const existing = await prisma.feature.findUnique({ where: { id } });
    if (!existing) return null;

    const data = {};
    if (patch.status !== undefined) {
      const s = String(patch.status).trim().toLowerCase();
      if (!ALLOWED_STATUS.has(s)) throw new Error("Invalid status");
      data.status = s;
    }
    if (patch.title !== undefined) {
      const t = String(patch.title).trim();
      if (!t) throw new Error("Invalid title");
      data.title = t;
    }
    if (patch.description !== undefined) {
      const d = String(patch.description).trim();
      if (!d) throw new Error("Invalid description");
      data.description = d;
    }

    const updated = await prisma.feature.update({ where: { id }, data });
    return {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      status: updated.status,
    };
  }

  const list = await getFeatures();
  const idx = list.findIndex((f) => f.id === id);
  if (idx === -1) return null;

  const next = { ...list[idx] };
  if (patch.status !== undefined) {
    const s = String(patch.status).trim().toLowerCase();
    if (!ALLOWED_STATUS.has(s)) throw new Error("Invalid status");
    next.status = s;
  }
  if (patch.title !== undefined) {
    const t = String(patch.title).trim();
    if (!t) throw new Error("Invalid title");
    next.title = t;
  }
  if (patch.description !== undefined) {
    const d = String(patch.description).trim();
    if (!d) throw new Error("Invalid description");
    next.description = d;
  }

  const updated = [...list];
  updated[idx] = next;
  await writeFeaturesFile(updated);
  return next;
}
