/** Match the schema emitted by generate-release-manifest.mjs, not an invented SHA label. */
export function matchesExpectedRelease(release,expected){
 return /^[a-f0-9]{40}$/.test(expected??'') && release?.commitSha===expected && release?.profileSchema===4;
}
