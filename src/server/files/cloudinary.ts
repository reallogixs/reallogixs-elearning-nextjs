import { createHash } from "node:crypto";

interface Config {
  cloud: string;
  key: string;
  secret: string;
}

type Resource = "raw" | "image";
type Delivery = "private" | "upload";

const TIMEOUT_MS = 20_000;
const LINK_SECONDS = 60;

/** Null when Cloudinary isn't set up. */
export function cloudinaryConfig(): Config | null {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) return null;
  return {
    cloud: CLOUDINARY_CLOUD_NAME,
    key: CLOUDINARY_API_KEY,
    secret: CLOUDINARY_API_SECRET,
  };
}

/** Cloudinary's request signature: the sorted parameters plus the secret, hashed. */
export function signParams(params: Record<string, string>, secret: string): string {
  const text = Object.entries(params)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return createHash("sha1")
    .update(text + secret)
    .digest("hex");
}

function signed(config: Config, params: Record<string, string>): Record<string, string> {
  const all = { ...params, timestamp: String(Math.floor(Date.now() / 1000)) };
  return { ...all, api_key: config.key, signature: signParams(all, config.secret) };
}

function endpoint(config: Config, resource: Resource, action: string): string {
  return `https://api.cloudinary.com/v1_1/${config.cloud}/${resource}/${action}`;
}

async function post(url: string, fields: Record<string, string>, file?: Blob): Promise<void> {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) body.set(key, value);
  if (file) body.set("file", file, "file");
  const response = await fetch(url, {
    method: "POST",
    body,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Cloudinary answered ${response.status}.`);
}

export async function upload(
  config: Config,
  resource: Resource,
  type: Delivery,
  publicId: string,
  file: Blob,
): Promise<void> {
  // Newer Cloudinary accounts group files by folder, not by name, so both are given.
  const folder = publicId.slice(0, publicId.lastIndexOf("/"));
  const fields = signed(config, { public_id: publicId, asset_folder: folder, type });
  await post(endpoint(config, resource, "upload"), fields, file);
}

export async function destroy(
  config: Config,
  resource: Resource,
  type: Delivery,
  publicId: string,
): Promise<void> {
  const fields = signed(config, { public_id: publicId, type, invalidate: "true" });
  await post(endpoint(config, resource, "destroy"), fields);
}

/** Reads a private file with a link that is signed here and expires in a minute. */
export async function download(config: Config, publicId: string): Promise<ArrayBuffer | null> {
  const query = signed(config, {
    public_id: publicId,
    type: "private",
    expires_at: String(Math.floor(Date.now() / 1000) + LINK_SECONDS),
  });
  const url = `${endpoint(config, "raw", "download")}?${new URLSearchParams(query).toString()}`;
  const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Cloudinary answered ${response.status}.`);
  return response.arrayBuffer();
}

export function imageUrl(config: Config, publicId: string): string {
  return `https://res.cloudinary.com/${config.cloud}/image/upload/c_limit,w_256,f_auto,q_auto/${publicId}`;
}
