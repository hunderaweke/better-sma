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

function fnv1a32(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function rotl32(v: number, n: number): number {
  return ((v << n) | (v >>> (32 - n))) >>> 0;
}

export function getVibrantColorHex(str: string): string {
  const base = fnv1a32(str);
  const tail = fnv1a32(str.slice(-5));
  const mix = Math.imul(rotl32(base ^ tail, 5), 0x9e3779b9) >>> 0;

  const hue = (mix / 0xffffffff) * 360;
  const s = 55 + (((mix >>> 16) & 0xff) / 255) * 35;
  const l = 40 + (((mix >>> 24) & 0xff) / 255) * 20;

  return hslToHex(hue, s, l);
}

function getVibrantColor(str: string): string {
  const base = fnv1a32(str);
  const tail = fnv1a32(str.slice(-5));
  const mix = Math.imul(rotl32(base ^ tail, 11), 0x9e3779b9) >>> 0;

  const h = (mix / 0xffffffff) * 360;
  const s = 55 + (((mix >>> 0) & 0xff) / 255) * 35;
  const l = 40 + (((mix >>> 8) & 0xff) / 255) * 20;
  return hslToHex(h, s, l);
}

export default getVibrantColor;
