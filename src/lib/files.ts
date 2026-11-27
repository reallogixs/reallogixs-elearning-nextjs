const MAX_EDGE = 1600;
const LOGO_EDGE = 256;

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function draw(file: File, maxEdge: number): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas;
}

/** Shrinks a photo so it uploads quickly on mobile data. PDFs go up as they are. */
export async function prepareReceipt(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  const canvas = await draw(file, MAX_EDGE);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.8),
  );
  return blob && blob.size < file.size ? new File([blob], file.name, { type: "image/jpeg" }) : file;
}

/** A banner for the form's preview: 1600 px wide at most, as a JPEG. */
export async function readBannerFile(file: File): Promise<string> {
  return (await draw(file, 1600)).toDataURL("image/jpeg", 0.82);
}

/** A logo for the form's preview: SVG as it is, others shrunk with transparency kept. */
export async function readLogoFile(file: File): Promise<string> {
  if (file.type === "image/svg+xml") return readAsDataUrl(file);
  return (await draw(file, LOGO_EDGE)).toDataURL("image/png");
}
