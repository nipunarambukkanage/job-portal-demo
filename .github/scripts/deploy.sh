#!/usr/bin/env bash
set -euo pipefail

RG="rg-jobportal-centralindia"
APP_NAME="api-python"

if [[ -n "${IMAGE:-}" ]]; then
  IMG="$IMAGE"
else
  IMG="$(az containerapp show -g "$RG" -n "$APP_NAME" --query "template.containers[0].image" -o tsv)"
  if [[ -z "${IMG:-}" ]]; then
    echo "Could not resolve current image. Set IMAGE env var before running." >&2
    exit 1
  fi
fi

# Make sure ingress points to the right port (idempotent)
az containerapp ingress update -g "$RG" -n "$APP_NAME" --target-port 8000 --transport Auto >/dev/null

# Update only image and env vars (no registry / secret flags here)
az containerapp update -g "$RG" -n "$APP_NAME" \
  --image "$IMG" \
  --set-env-vars \
    ENV=dev \
    PORT=8000 \
    LOG_LEVEL=INFO \
    DATABASE_URL=secretref:db-url \
    REDIS_URL=secretref:redis-url \
    AZURE_BLOB_CONNECTION_STRING=secretref:blob-conn \
    CLERK_ISSUER=secretref:clerk-issuer \
    CLERK_JWKS_URL=secretref:clerk-jwks \
    CLERK_AUDIENCE=secretref:clerk-aud \
    CORS_ORIGINS='*' \
    DOC_INTEL_MODEL=prebuilt-resume \
    DOC_INTEL_API_VERSION=2024-07-31 \
    DOC_INTEL_POLL_SECONDS=1 \
    DOC_INTEL_POLL_ATTEMPTS=3 \
    PYTHONUNBUFFERED=1

echo "✅ Deployed $APP_NAME with image: $IMG"
