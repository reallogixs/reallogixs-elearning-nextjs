export interface ReadFile {
  fileName: string;
  mimeType: string;
  url: string;
}

const MAX_EDGE = 1400;

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Shrinks big photos so the demo's localStorage doesn't fill up. */
async function downscale(
  file: File,
  maxEdge: number,
  type: "image/jpeg" | "image/png",
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL(type, 0.72);
}

/**
 * MOCK UPLOAD: turns a receipt into a data URL kept in the browser. Cloudinary
 * replaces this with a signed upload that returns a hosted URL. Type and size are
 * already checked by the Yup schema before this runs.
 */
export async function readReceiptFile(file: File): Promise<ReadFile> {
  const isImage = file.type.startsWith("image/");
  const url = isImage ? await downscale(file, MAX_EDGE, "image/jpeg") : await readAsDataUrl(file);
  return { fileName: file.name, mimeType: isImage ? "image/jpeg" : file.type, url };
}

/** MOCK UPLOAD for payment method logos (SVG kept as-is, rasters shrunk, transparency kept). */
export async function readLogoFile(file: File): Promise<string> {
  return file.type === "image/svg+xml" ? readAsDataUrl(file) : downscale(file, 256, "image/png");
}
