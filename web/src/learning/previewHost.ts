// Version URLs only: the unprefixed production Worker and custom domain stay off.
export function isLearningVersionHost(hostname: string): boolean {
  return /^[a-z0-9][a-z0-9-]*-nicos-world\.[a-z0-9-]+\.workers\.dev$/.test(hostname);
}
