import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

import { RECEIPT_TYPES } from "@/lib/validation/checkout";
import { LOGO_MAX_BYTES, LOGO_TYPES } from "@/lib/validation/admin";
import { ActionError } from "@/server/core/errors";

import { cloudinaryConfig, destroy, download, imageUrl, upload } from "./cloudinary";
import { sniffType } from "./sniff";

/*
 * Receipts are private and only leave through /api/receipts, which checks who is asking.
 * Logos are public. Development without Cloudinary keeps both in the git-ignored .uploads
 * folder; in production, missing Cloudinary settings are an error.
 */
type Kind = "receipts" | "logos";

const LOCAL = "local/";
const DIR = ".uploads";

export interface StoredFile {
  publicId: string;
  mimeType: string;
  bytes: number;
}

function localPath(kind: Kind, publicId: string): string {
  return join(process.cwd(), DIR, kind, basename(publicId));
}

async function save(kind: Kind, data: ArrayBuffer, mimeType: string): Promise<StoredFile> {
  const config = cloudinaryConfig();
  const name = randomUUID();
  if (config) {
    const publicId = `academy/${kind}/${name}`;
    const file = new Blob([data], { type: mimeType });
    try {
      if (kind === "receipts") await upload(config, "raw", "private", publicId, file);
      else await upload(config, "image", "upload", publicId, file);
    } catch (error) {
      console.error("[files]", error instanceof Error ? error.message : "unknown");
      throw new ActionError("We couldn't save the file. Please try again.");
    }
    return { publicId, mimeType, bytes: data.byteLength };
  }
  if (process.env.NODE_ENV === "production") throw new Error("Cloudinary is not set up.");
  const publicId = `${LOCAL}${kind}/${name}`;
  await mkdir(join(process.cwd(), DIR, kind), { recursive: true });
  await writeFile(localPath(kind, publicId), new Uint8Array(data));
  return { publicId, mimeType, bytes: data.byteLength };
}

export async function saveReceipt(file: File): Promise<StoredFile> {
  const data = await file.arrayBuffer();
  const mimeType = sniffType(data);
  if (!mimeType || !RECEIPT_TYPES.includes(mimeType))
    throw new ActionError("That file isn't a JPG, PNG, WebP or PDF.");
  return save("receipts", data, mimeType);
}

/** A logo arrives as the data URL shown in the form's preview. */
export async function saveLogo(dataUrl: string): Promise<string> {
  const match = /^data:image\/[a-z+]+;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  const bytes = match?.[1] ? Uint8Array.from(Buffer.from(match[1], "base64")) : null;
  const mimeType = bytes && sniffType(bytes.buffer);
  if (!bytes || !mimeType || !LOGO_TYPES.includes(mimeType) || bytes.byteLength > LOGO_MAX_BYTES)
    throw new ActionError("Use a PNG, JPG, WebP or SVG logo under 512 KB.");
  return (await save("logos", bytes.buffer, mimeType)).publicId;
}

export async function readReceipt(publicId: string): Promise<ArrayBuffer | null> {
  if (publicId.startsWith(LOCAL)) return readLocal("receipts", publicId);
  const config = cloudinaryConfig();
  return config ? download(config, publicId) : null;
}

export async function readLocal(kind: Kind, publicId: string): Promise<ArrayBuffer | null> {
  try {
    return Uint8Array.from(await readFile(localPath(kind, publicId))).buffer;
  } catch {
    return null;
  }
}

/** Tidies up after a failed save or a replaced logo. Never fails the action. */
export async function removeFile(kind: Kind, publicId: string): Promise<void> {
  try {
    const config = cloudinaryConfig();
    if (publicId.startsWith(LOCAL)) await rm(localPath(kind, publicId), { force: true });
    else if (config && kind === "receipts") await destroy(config, "raw", "private", publicId);
    else if (config) await destroy(config, "image", "upload", publicId);
  } catch (error) {
    console.error("[files]", error instanceof Error ? error.message : "unknown");
  }
}

export function logoUrl(publicId: string | null): string | null {
  if (!publicId) return null;
  if (publicId.startsWith(LOCAL)) return `/api/dev-logos/${basename(publicId)}`;
  const config = cloudinaryConfig();
  return config && imageUrl(config, publicId);
}
