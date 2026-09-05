import { readFileSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
for (const file of ['src/world/FriendsMap.tsx', 'src/game/friendsMap/renderer.ts', 'src/game/friendsMap/simulation.ts']) {
  const code = readFileSync(path.join(root, file), 'utf8');
  if (/from\s*['"](?:three|@react-three|phaser)|\b(?:WebSocket|RTCPeerConnection|setInterval)\s*\(/.test(code)) throw new Error('Unbounded/heavy runtime in ' + file);
}
const name = readdirSync(path.join(root, 'dist/assets')).find(n => /^FriendsMap-[^.]+\.js$/.test(n));
if (!name) throw new Error('Lazy FriendsMap chunk is missing');
const bytes = gzipSync(readFileSync(path.join(root, 'dist/assets', name))).length;
if (bytes > 22000) throw new Error('FriendsMap exceeds its 22KB gzip code budget: ' + bytes);
console.log(JSON.stringify({ friendsMapGzipBytes: bytes, engine: 'Canvas 2D', newRuntimeDependencies: 0, newServerRuntime: false }));
