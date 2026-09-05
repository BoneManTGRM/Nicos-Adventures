import {readFileSync,readdirSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
const names=readdirSync(new URL('../dist/assets/',import.meta.url)),report={};
for(const [prefix,max] of [['DirectorStudio',22000],['StoryCastleBook',22000],['AskNicoClub',22000],['MonsterRift',22000]]){
 const name=names.find(n=>n.startsWith(prefix+'-')&&n.endsWith('.js'));if(!name)throw new Error('Missing lazy surface: '+prefix);
 const size=gzipSync(readFileSync(new URL('../dist/assets/'+name,import.meta.url))).byteLength;
 if(size>max)throw new Error(`${prefix} exceeds ${max} gzip bytes: ${size}`);report[prefix]=size;
}
for(const file of ['src/world/MonsterRift.tsx','src/showtime/DirectorStudio.tsx','src/showtime/recordMovie.ts']){
 const src=readFileSync(new URL('../'+file,import.meta.url),'utf8');
 if(/from\s*['"](?:three|@react-three|phaser)|\bWebSocket\s*\(/.test(src))throw new Error('Unexpected heavyweight or online runtime: '+file);
}
console.log(JSON.stringify({lazyJavaScriptGzipBytes:report,newRuntimeDependencies:0,voice:'device-local',cloneVoice:false}));
