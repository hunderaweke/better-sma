function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }
  const R = Math.round((r + m) * 255);
  const G = Math.round((g + m) * 255);
  const B = Math.round((b + m) * 255);
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(R)}${toHex(G)}${toHex(B)}`;
}

function murmur3_32(str: string, seed = 0): number {
  let h = seed >>> 0;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;
  let i = 0;
  const len = str.length;
  while (i + 4 <= len) {
    let k =
      (str.charCodeAt(i) & 0xff) |
      ((str.charCodeAt(i + 1) & 0xff) << 8) |
      ((str.charCodeAt(i + 2) & 0xff) << 16) |
      ((str.charCodeAt(i + 3) & 0xff) << 24);
    i += 4;
    k = Math.imul(k, c1);
    k = (k << 15) | (k >>> 17);
    k = Math.imul(k, c2);
    h ^= k;
    h = (h << 13) | (h >>> 19);
    h = (Math.imul(h, 5) + 0xe6546b64) >>> 0;
  }
  let k1 = 0;
  const rem = len & 3;
  if (rem === 3) k1 ^= (str.charCodeAt(i + 2) & 0xff) << 16;
  if (rem >= 2) k1 ^= (str.charCodeAt(i + 1) & 0xff) << 8;
  if (rem >= 1) k1 ^= str.charCodeAt(i) & 0xff;
  if (rem) {
    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);
    h ^= k1;
  }
  h ^= len;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

function getVibrantColor(str: string): string {
  const a = murmur3_32(str, 0x1234abcd);
  const b = murmur3_32([...str].reverse().join(""), 0xdeadbeef);
  const mix = (a ^ b) >>> 0;

  const hue = (mix / 0xffffffff) * 360;
  const s = 55 + (((mix >>> 16) & 0xff) / 255) * 35;
  const l = 40 + (((mix >>> 24) & 0xff) / 255) * 20;

  return hslToHex(hue, s, l);
}

export default getVibrantColor;
