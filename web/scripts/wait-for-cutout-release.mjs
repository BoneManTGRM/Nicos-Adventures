import { writeFileSync } from 'node:fs';
const expected=process.env.GITHUB_SHA;
if(!/^[a-f0-9]{40}$/.test(expected??''))throw new Error('Exact release SHA required');
let release;
for(let attempt=0;attempt<60;attempt++){
  try{
    const response=await fetch(`https://nicos-world.com/release.json?cutout=${expected}-${Date.now()}`,{cache:'no-store',signal:AbortSignal.timeout(15000)});
    if(response.ok){const candidate=await response.json();if(candidate.commitSha===expected){release=candidate;break;}}
  }catch{}
  await new Promise(resolve=>setTimeout(resolve,10000));
}
if(!release)throw new Error('Expected cutout release is not deployed; production is NOT verified');
writeFileSync('cutout-production-release.json',JSON.stringify({verifiedAt:new Date().toISOString(),origin:'https://nicos-world.com',release},null,2)+'\n');
console.log('Verified exact production commit',release.commitSha);
