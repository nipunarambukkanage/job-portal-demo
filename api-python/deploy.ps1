Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Unsec([SecureString]$s) {
  $b = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($s)
  [Runtime.InteropServices.Marshal]::PtrToStringBSTR($b)
}

Write-Host "`n=== Azure Subscription / Resource Group ==="

$SUB = Read-Host "Azure Subscription ID or Name"
$RG  = Read-Host "Resource Group Name (e.g., rg-jobportal)"
$LOC = Read-Host "Azure Region (e.g., eastus)"

Write-Host "`n=== Names (non-secret) ==="
$ACR = Read-Host "ACR name (must be globally unique, e.g., jobportalacr1234)"
$ENV = Read-Host "Container Apps Environment name (e.g., env-jobportal)"
$APP = Read-Host "Container App name for API (e.g., api-python)"
$WORKER = Read-Host "Container App name for Celery worker (e.g., api-python-worker)"
$JOB = Read-Host "Container Apps Job name for migrations (e.g., api-python-migrate)"
$IMAGE_TAG = Read-Host "Image tag (e.g., 1.0.0 or $(Get-Date -Format yyyyMMddHHmmss))"

Write-Host "`n=== Secrets (prompted, not echoed) ==="
$DBURL_S  = Read-Host -AsSecureString "DATABASE_URL (postgresql+asyncpg://...jobportal_pyapi?sslmode=require)"
$REDIS_S  = Read-Host -AsSecureString "REDIS_URL (e.g., redis://:password@host:port/1)"
$BLOB_S   = Read-Host -AsSecureString "AZURE_BLOB_CONNECTION_STRING"
$CL_ISS_S = Read-Host -AsSecureString "CLERK_ISSUER (e.g., https://trusted-swan-44.clerk.accounts.dev)"
$CL_JWKS_S= Read-Host -AsSecureString "CLERK_JWKS_URL (e.g., https://.../jwks.json)"
$CL_AUD_S = Read-Host -AsSecureString "CLERK_AUDIENCE (e.g., jobportal-api)"

$CORS = Read-Host "CORS origins (comma-separated) [`"http://localhost:5173,https://jobportal971778.z29.web.core.windows.net,https://jobportal.nipunarambukkanage.dev`"]"
if ([string]::IsNullOrWhiteSpace($CORS)) {
  $CORS_JSON = '["http://localhost:5173","https://jobportal971778.z29.web.core.windows.net","https://jobportal.nipunarambukkanage.dev"]'
} else {
  $arr = $CORS.Split(",") | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
  $CORS_JSON = ($arr | ConvertTo-Json)
}

$DBURL  = Unsec $DBURL_S
$REDIS  = Unsec $REDIS_S
$BLOB   = Unsec $BLOB_S
$CL_ISS = Unsec $CL_ISS_S
$CL_JWKS= Unsec $CL_JWKS_S
$CL_AUD = Unsec $CL_AUD_S

Write-Host "`n=== Azure Login / Subscription ==="
az login | Out-Null
az account set --subscription "$SUB"

Write-Host "`n=== Resource Group ==="
az group create -n $RG -l $LOC | Out-Null

Write-Host "`n=== Azure Container Registry (ACR) ==="
az acr create -g $RG -n $ACR --sku Basic | Out-Null
az acr login -n $ACR | Out-Null

# Build & push
$ACR_IMG = "$ACR.azurecr.io/api-python:$IMAGE_TAG"
Write-Host "`n=== Docker Build & Push: $ACR_IMG ==="
docker build -t $ACR_IMG .
docker push $ACR_IMG

Write-Host "`n=== Log Analytics Workspace (for Container Apps logs) ==="
$LAW = "law-" + $RG
$lawExists = az monitor log-analytics workspace show -g $RG -n $LAW 2>$null
if (-not $?) {
  az monitor log-analytics workspace create -g $RG -n $LAW -l $LOC | Out-Null
}
$LAW_ID = az monitor log-analytics workspace show -g $RG -n $LAW --query customerId -o tsv
$LAW_KEY = az monitor log-analytics workspace get-shared-keys -g $RG -n $LAW --query primarySharedKey -o tsv

Write-Host "`n=== Container Apps Environment ==="
az provider register --namespace Microsoft.App  | Out-Null
az provider register --namespace Microsoft.OperationalInsights | Out-Null

$envExists = az containerapp env show -g $RG -n $ENV 2>$null
if (-not $?) {
  az containerapp env create `
    -g $RG -n $ENV -l $LOC `
    --logs-destination log-analytics `
    --logs-workspace-id $LAW_ID `
    --logs-workspace-key $LAW_KEY | Out-Null
}

Write-Host "`n=== Allow ACA to pull from ACR ==="
az acr update -n $ACR --admin-enabled true | Out-Null
$ACR_USR = az acr credential show -n $ACR --query username -o tsv
$ACR_PSW = az acr credential show -n $ACR --query passwords[0].value -o tsv

Write-Host "`n=== Create/Update API Container App: $APP ==="
$exists = az containerapp show -g $RG -n $APP 2>$null
if (-not $?) {
  az containerapp create -g $RG -n $APP --environment $ENV `
    --image $ACR_IMG `
    --registry-server "$ACR.azurecr.io" --registry-username $ACR_USR --registry-password $ACR_PSW `
    --ingress external --target-port 8000 `
    --secrets db-url="$DBURL" redis-url="$REDIS" blob-conn="$BLOB" clerk-issuer="$CL_ISS" clerk-jwks="$CL_JWKS" clerk-aud="$CL_AUD" `
    --env-vars `
      DATABASE_URL=secretref:db-url `
      REDIS_URL=secretref:redis-url `
      AZURE_BLOB_CONNECTION_STRING=secretref:blob-conn `
      CLERK_ISSUER=secretref:clerk-issuer `
      CLERK_JWKS_URL=secretref:clerk-jwks `
      CLERK_AUDIENCE=secretref:clerk-aud `
      CORS_ORIGINS="$CORS_JSON" `
      OTEL_SERVICE_NAME=JobPortal.Api `
      OTEL_SERVICE_VERSION=1.0.0 `
      OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317 `
      PYTHONUNBUFFERED=1 `
    --min-replicas 1 --max-replicas 3 | Out-Null
} else {
  az containerapp update -g $RG -n $APP `
    --image $ACR_IMG `
    --set-env-vars `
      CORS_ORIGINS="$CORS_JSON" `
      OTEL_SERVICE_NAME=JobPortal.Api `
      OTEL_SERVICE_VERSION=1.0.0 `
      OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317 `
      PYTHONUNBUFFERED=1 `
    --secrets db-url="$DBURL" redis-url="$REDIS" blob-conn="$BLOB" clerk-issuer="$CL_ISS" clerk-jwks="$CL_JWKS" clerk-aud="$CL_AUD" | Out-Null
}

Write-Host "`n=== Create/Update Migration Job: $JOB ==="
$jobExists = az containerapp job show -g $RG -n $JOB 2>$null
if (-not $?) {
  az containerapp job create -g $RG -n $JOB --environment $ENV `
    --image $ACR_IMG `
    --registry-server "$ACR.azurecr.io" --registry-username $ACR_USR --registry-password $ACR_PSW `
    --secrets db-url="$DBURL" `
    --env-vars DATABASE_URL=secretref:db-url `
    --replica-timeout 1800 --parallelism 1 --replica-completion-count 1 `
    --trigger-type Manual `
    --command "python" "-m" "alembic" "upgrade" "head" | Out-Null
} else {
  az containerapp job update -g $RG -n $JOB `
    --image $ACR_IMG `
    --secrets db-url="$DBURL" `
    --set-env-vars DATABASE_URL=secretref:db-url `
    --command "python" "-m" "alembic" "upgrade" "head" | Out-Null
}

Write-Host "`n=== Run migrations (job start) ==="
az containerapp job start -g $RG -n $JOB | Out-Null

Write-Host "`n=== Create/Update Celery Worker: $WORKER ==="
$workerExists = az containerapp show -g $RG -n $WORKER 2>$null
if (-not $?) {
  az containerapp create -g $RG -n $WORKER --environment $ENV `
    --image $ACR_IMG `
    --registry-server "$ACR.azurecr.io" --registry-username $ACR_USR --registry-password $ACR_PSW `
    --ingress disabled `
    --secrets db-url="$DBURL" redis-url="$REDIS" blob-conn="$BLOB" `
    --env-vars `
      DATABASE_URL=secretref:db-url `
      REDIS_URL=secretref:redis-url `
      AZURE_BLOB_CONNECTION_STRING=secretref:blob-conn `
      PYTHONUNBUFFERED=1 `
    --command "celery" "-A" "app.workers.celery_app.celery_app" "worker" "-Q" "default" "-l" "INFO" `
    --min-replicas 1 --max-replicas 3 | Out-Null
} else {
  az containerapp update -g $RG -n $WORKER `
    --image $ACR_IMG `
    --secrets db-url="$DBURL" redis-url="$REDIS" blob-conn="$BLOB" `
    --set-env-vars `
      DATABASE_URL=secretref:db-url `
      REDIS_URL=secretref:redis-url `
      AZURE_BLOB_CONNECTION_STRING=secretref:blob-conn `
      PYTHONUNBUFFERED=1 `
    --command "celery" "-A" "app.workers.celery_app.celery_app" "worker" "-Q" "default" "-l" "INFO" | Out-Null
}

Write-Host "`n=== Public URL ==="
$FQDN = az containerapp show -g $RG -n $APP --query properties.configuration.ingress.fqdn -o tsv
Write-Host "API URL: https://$FQDN"

Write-Host "`nAll done. Migrations job kicked off; check its execution with:"
Write-Host "  az containerapp job list-executions -g $RG -n $JOB -o table"
