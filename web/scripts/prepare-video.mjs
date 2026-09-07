import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '../public/assets/nico/video');
const encoded = Array.from({length: 11}, (_, i) => readFileSync(resolve(root, `nico-basketball.part${String(i+1).padStart(2, '0')}.b64`), 'utf8').trim()).join('');
writeFileSync(resolve(root, 'nico-basketball.mp4'), Buffer.from(encoded, 'base64'));
writeFileSync(resolve(root, 'nico-basketball-poster.jpg'), Buffer.from(readFileSync(resolve(root, 'nico-basketball-poster.b64'), 'utf8').trim(), 'base64'));
