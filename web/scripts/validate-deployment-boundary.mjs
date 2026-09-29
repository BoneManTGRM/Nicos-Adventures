// Production remains main. Only explicitly reviewed feature branches may upload preview versions.
// A successful version upload is not permission to activate a production release.
const workers = ['WORKERS_CI', 'WORKERS_CI_BUILD_UUID', 'WORKERS_CI_COMMIT_SHA', 'WORKERS_CI_BRANCH'].some(key => Object.hasOwn(process.env, key));
const approved = ['main', 'feat/learning-lab-robot-rescue', 'feat/becca-unicorn-play', 'feat/monster-garage-rainbow-kingdom'];
if (workers && !approved.includes(process.env.WORKERS_CI_BRANCH)) {
  console.error('Deployment boundary: Cloudflare Workers builds are restricted to main and explicitly reviewed preview branches.');
  process.exit(1);
}
