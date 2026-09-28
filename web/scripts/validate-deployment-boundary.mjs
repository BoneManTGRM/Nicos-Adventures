// Workers Builds exposes these variables before the configured npm build.
// Owner corrected nicos-world to versions upload and disabled legacy branch builds.
// Permit only the reviewed tutor branch in addition to main; unknown metadata fails closed.
const workers = ['WORKERS_CI', 'WORKERS_CI_BUILD_UUID', 'WORKERS_CI_COMMIT_SHA', 'WORKERS_CI_BRANCH'].some(key => Object.hasOwn(process.env, key));
if (workers && !['main', 'feat/learning-lab-robot-rescue'].includes(process.env.WORKERS_CI_BRANCH)) {
  console.error('Deployment boundary: Cloudflare Workers builds are restricted to main and the reviewed tutor version branch.');
  process.exit(1);
}
