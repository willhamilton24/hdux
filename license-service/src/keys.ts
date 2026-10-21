import { randomBytes } from 'crypto';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function segment(): string {
  return Array.from(randomBytes(4), (b) => CHARS[b % CHARS.length]).join('');
}

export function generateKey(): string {
  return `HDUX-PRO-${segment()}-${segment()}-${segment()}-${segment()}`;
}
