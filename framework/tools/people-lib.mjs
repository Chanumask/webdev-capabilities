/**
 * People assets (decisions 0017 and 0020): Microsoft Rocketbox avatars (MIT) fetched once into a site.
 * Pure helpers: a TGA decoder (sharp cannot read TGA) and naming of the converted textures.
 */

export const ROCKETBOX_REPO = 'microsoft/Microsoft-Rocketbox';
export const ROCKETBOX_CATEGORIES = ['Adults', 'Children', 'Professions'];
export const ROCKETBOX_LICENSE_URL = `https://raw.githubusercontent.com/${ROCKETBOX_REPO}/master/LICENSE.md`;

/** Decodes an uncompressed 24 or 32 bit TGA. Returns { width, height, channels, data } with data as RGB(A), top row first. */
export function decodeTga(buf) {
  if (buf.length < 18) throw new Error('not a TGA file');
  const idLen = buf[0];
  const type = buf[2];
  const width = buf.readUInt16LE(12);
  const height = buf.readUInt16LE(14);
  const bpp = buf[16];
  const topOrigin = (buf[17] & 0x20) !== 0;
  if (type !== 2 || (bpp !== 24 && bpp !== 32)) throw new Error(`unsupported TGA (type ${type}, ${bpp} bit)`);
  const channels = bpp / 8;
  const start = 18 + idLen;
  if (buf.length < start + width * height * channels) throw new Error('TGA data is truncated');
  const data = Buffer.alloc(width * height * channels);
  for (let y = 0; y < height; y++) {
    const srcRow = topOrigin ? y : height - 1 - y;
    for (let x = 0; x < width; x++) {
      const s = start + (srcRow * width + x) * channels;
      const d = (y * width + x) * channels;
      data[d] = buf[s + 2];
      data[d + 1] = buf[s + 1];
      data[d + 2] = buf[s];
      if (channels === 4) data[d + 3] = buf[s + 3];
    }
  }
  return { width, height, channels, data };
}

/**
 * Output name of a Rocketbox texture: `m009_body_color.tga` becomes `m009_body_color.jpg`;
 * the opacity map keeps its alpha channel and becomes a PNG.
 */
export function convertedName(tgaName) {
  const base = tgaName.replace(/\.tga$/i, '');
  return `${base}.${/_opacity_/.test(base) ? 'png' : 'jpg'}`;
}

/** Part and kind of a Rocketbox texture file name, for example m009_head_normal.tga -> { prefix: 'm009', part: 'head', kind: 'normal' }. */
export function textureParts(name) {
  const m = /^([a-z]\d+)_(body|head|opacity)_(color|normal|specular)\./i.exec(name);
  return m ? { prefix: m[1], part: m[2], kind: m[3] } : null;
}
