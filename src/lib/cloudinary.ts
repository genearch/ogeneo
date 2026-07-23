// Image URL builder + signed upload for Cloudinary.

/** Build a delivery URL. Seed data uses the public `demo` cloud's sample
 *  images (public IDs starting with `samples/`), so those are routed there
 *  until your own cloud is configured. */
export function imgUrl(
  cloudName: string | undefined,
  publicId: string,
  transform = 'f_auto,q_auto,w_1200'
): string {
  const cloud =
    !cloudName || cloudName === 'REPLACE_ME' || publicId.startsWith('samples/')
      ? 'demo'
      : cloudName;
  return `https://res.cloudinary.com/${cloud}/image/upload/${transform}/${publicId}`;
}

async function sha1hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface CloudinaryUploadResult {
  public_id: string;
  width: number;
  height: number;
  secure_url: string;
}

/** Signed upload of an image (as a Blob/File) to Cloudinary. */
export async function uploadToCloudinary(
  file: Blob,
  opts: { cloudName: string; apiKey: string; apiSecret: string; folder?: string }
): Promise<CloudinaryUploadResult> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = opts.folder ?? 'ogeneo';
  // Params must be sorted alphabetically for the signature.
  const toSign = `folder=${folder}&timestamp=${timestamp}${opts.apiSecret}`;
  const signature = await sha1hex(toSign);

  const form = new FormData();
  form.set('file', file);
  form.set('api_key', opts.apiKey);
  form.set('timestamp', timestamp);
  form.set('folder', folder);
  form.set('signature', signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${opts.cloudName}/image/upload`,
    { method: 'POST', body: form }
  );
  if (!res.ok) {
    throw new Error(`Cloudinary upload failed (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as CloudinaryUploadResult;
}
