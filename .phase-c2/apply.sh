#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f .phase-c2/FullApp.tsx || ! -f .phase-c2/package.json ]]; then
  echo "Phase C2 templates already applied."
  exit 0
fi

cp .phase-c2/FullApp.tsx web/src/FullApp.tsx
cp .phase-c2/package.json web/package.json

npm ci --prefix web --progress=false
npm test --prefix web
npm run build --prefix web

rm -rf .phase-c2

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git add web/src/FullApp.tsx web/package.json .phase-c2
if git diff --cached --quiet; then
  echo "No Phase C2 integration changes to commit."
  exit 0
fi
git commit -m "Apply Phase C2 creative and memory integration [c2-sync]"
git push origin HEAD:phase-c2/creative-home-memory
