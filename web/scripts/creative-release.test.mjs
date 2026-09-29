import {test,expect} from 'vitest';
import {matchesExpectedRelease} from './creative-release.mjs';
const sha='a'.repeat(40);
test('accepts the actual release manifest schema',()=>expect(matchesExpectedRelease({commitSha:sha,profileSchema:4},sha)).toBe(true));
test('rejects a different live commit',()=>expect(matchesExpectedRelease({commitSha:'b'.repeat(40),profileSchema:4},sha)).toBe(false));
test('does not confuse an arbitrary sha property with the release manifest',()=>expect(matchesExpectedRelease({sha,profileSchema:4},sha)).toBe(false));
test('rejects missing or malformed release data',()=>{for(const value of [null,{}, {commitSha:sha,profileSchema:3}])expect(matchesExpectedRelease(value,sha)).toBe(false);});
