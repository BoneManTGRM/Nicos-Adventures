// Workers Builds exposes these variables before the configured npm build.
// Fail closed for non-main builds until preview isolation is restored.
const workers = ['WORKERS_CI', 'WORKERS_CI_BUILD_UUID', 'WORKERS_CI_COMMIT_SHA', 'WORKERS_CI_BRANCH'].some(key => Object.hasOwn(process.env, key));
if (workers && process.env.WORKERS_CI_BRANCH !== 'main') {
  console.error('Deployment boundary: Cloudflare Workers builds are restricted to main. Feature-branch deployment is blocked pending verified preview isolation.');
  process.exit(1);
}
