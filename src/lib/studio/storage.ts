import { promises as fs } from "fs";
import path from "path";

// Media lives on the local machine until a storage platform is chosen. Every
// caller goes through these three functions, so moving to S3/R2/Supabase
// Storage later only means rewriting this file.
// Local disk only works on a long-running server or in dev: the serverless
// filesystem on Vercel is read-only and ephemeral.
const ROOT = path.resolve(process.env.STUDIO_STORAGE_DIR ?? ".studio-storage");

function resolveKey(key: string) {
  const full = path.resolve(ROOT, key);
  if (!full.startsWith(ROOT + path.sep)) throw new Error("Invalid storage key");
  return full;
}

export async function saveFile(key: string, data: Buffer) {
  const full = resolveKey(key);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, data);
  return key;
}

export async function readFile(key: string) {
  return fs.readFile(resolveKey(key));
}

export async function deleteFile(key: string) {
  await fs.rm(resolveKey(key), { force: true });
}
