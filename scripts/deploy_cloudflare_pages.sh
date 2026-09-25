#!/usr/bin/env bash
# ==============================================================================
# B-SDD LEGAL Cloudflare Pages Automated Deployer
# Deploys b-sdd-legal-ui/dist to Cloudflare Pages via deployment runner 192.168.3.184
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REMOTE_HOST="192.168.3.184"
CF_ACCOUNT_ID="${CF_ACCOUNT_ID:-c354ea45a11a1e1c14f1f41fe780cb34}"
PROJECT_NAME="b-sdd-legal-ui"

echo "=== [1/4] Pre-flight Invariant Verification ==="
cd "${ROOT_DIR}"
python3 -m unittest discover tests

echo "=== [2/4] Building Production Frontend Bundle ==="
cd "${ROOT_DIR}/b-sdd-legal-ui"
npm run build

echo "=== [3/4] Synchronizing dist/ to Deployment Runner (${REMOTE_HOST}) ==="
ssh -o StrictHostKeyChecking=no "${REMOTE_HOST}" "mkdir -p /tmp/b-sdd-legal-ui-dist"
rsync -avz "${ROOT_DIR}/b-sdd-legal-ui/dist/" "${REMOTE_HOST}:/tmp/b-sdd-legal-ui-dist/"

echo "=== [4/4] Deploying to Cloudflare Pages ==="
ssh -o StrictHostKeyChecking=no "${REMOTE_HOST}" "
  CF_ENV_FILE='/home/vokov/workspace/ai-drakon-scaffolder/cloudflare-worker/.env'
  if [ -f \"\${CF_ENV_FILE}\" ]; then
    TOKEN=\$(grep '^CLOUDFLARE_API_TOKEN=' \"\${CF_ENV_FILE}\" | cut -d '=' -f 2)
  else
    TOKEN=\"\${CLOUDFLARE_API_TOKEN:-}\"
  fi
  if [ -z \"\${TOKEN}\" ]; then
    echo '❌ Error: CLOUDFLARE_API_TOKEN not found'
    exit 1
  fi
  CLOUDFLARE_ACCOUNT_ID='${CF_ACCOUNT_ID}' CLOUDFLARE_API_TOKEN=\"\${TOKEN}\" npx wrangler pages project create '${PROJECT_NAME}' --production-branch=production 2>/dev/null || true
  CLOUDFLARE_ACCOUNT_ID='${CF_ACCOUNT_ID}' CLOUDFLARE_API_TOKEN=\"\${TOKEN}\" npx wrangler pages deploy /tmp/b-sdd-legal-ui-dist --project-name='${PROJECT_NAME}' --branch=production
"

echo ""
echo "✓ B-SDD Legal Advocate Cockpit deployed successfully!"
echo "  - Live UI: https://${PROJECT_NAME}.pages.dev"
