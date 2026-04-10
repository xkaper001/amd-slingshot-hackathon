# NourishAI — Deployment Runbook

> Project: `micro-mediator-427111-v9` · Region: `us-central1` · Service: `nourishai-api`

---

## Prerequisites (one-time setup)

### 1. Create the Artifact Registry repository

```bash
gcloud artifacts repositories create nourishai \
  --repository-format=docker \
  --location=us-central1 \
  --project=micro-mediator-427111-v9 \
  --description="NourishAI container images"
```

### 2. Store secrets in Secret Manager

```bash
# Gemini API key
echo -n "YOUR_GEMINI_API_KEY" | \
  gcloud secrets create GEMINI_API_KEY \
    --data-file=- \
    --project=micro-mediator-427111-v9

# Google Maps API key
echo -n "YOUR_GOOGLE_MAPS_API_KEY" | \
  gcloud secrets create GOOGLE_MAPS_API_KEY \
    --data-file=- \
    --project=micro-mediator-427111-v9
```

To update a secret later:
```bash
echo -n "NEW_VALUE" | gcloud secrets versions add GEMINI_API_KEY --data-file=-
```

### 3. Grant Cloud Build and Cloud Run access to secrets

```bash
PROJECT_NUMBER=$(gcloud projects describe micro-mediator-427111-v9 --format="value(projectNumber)")

# ── A. Grant Secret access to Cloud Build (for build time, if needed)
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=micro-mediator-427111-v9

gcloud secrets add-iam-policy-binding GOOGLE_MAPS_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=micro-mediator-427111-v9

# ── B. Grant Secret access to Cloud Run (for runtime)
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=micro-mediator-427111-v9

gcloud secrets add-iam-policy-binding GOOGLE_MAPS_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=micro-mediator-427111-v9

# ── C. Grant Cloud Build permissions to deploy to Cloud Run
gcloud projects add-iam-policy-binding micro-mediator-427111-v9 \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding micro-mediator-427111-v9 \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

---

## Deploy the API (Cloud Run)

### Option A — via Cloud Build CI/CD

```bash
gcloud builds submit \
  --config=cloudbuild.yaml \
  --project=micro-mediator-427111-v9 \
  .
```

### Option B — manual Docker + gcloud

```bash
# 1. Authenticate Docker
gcloud auth configure-docker us-central1-docker.pkg.dev

# 2. Build
docker build \
  -t us-central1-docker.pkg.dev/micro-mediator-427111-v9/nourishai/nourishai-api:latest \
  -f server/Dockerfile \
  server/

# 3. Push
docker push us-central1-docker.pkg.dev/micro-mediator-427111-v9/nourishai/nourishai-api:latest

# 4. Deploy
gcloud run deploy nourishai-api \
  --image=us-central1-docker.pkg.dev/micro-mediator-427111-v9/nourishai/nourishai-api:latest \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=3001 \
  --min-instances=0 \
  --max-instances=5 \
  --memory=512Mi \
  --cpu=1 \
  --set-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest,GOOGLE_MAPS_API_KEY=GOOGLE_MAPS_API_KEY:latest \
  --set-env-vars=NODE_ENV=production,FRONTEND_ORIGIN=https://micro-mediator-427111-v9.web.app \
  --project=micro-mediator-427111-v9
```

Get the deployed URL:
```bash
gcloud run services describe nourishai-api \
  --region=us-central1 \
  --format="value(status.url)" \
  --project=micro-mediator-427111-v9
```

---

## Deploy the Frontend (Firebase Hosting)

### Before building — switch API_BASE for production

Edit `src/pages/Home.tsx`:
```diff
-const API_BASE = "http://localhost:3001";
+const API_BASE = "";  // relative path → Firebase Hosting rewrite handles /api/**
```

### Build and deploy

```bash
# 1. Build
npm run build

# 2. Deploy hosting only
npx firebase-tools@latest deploy --only hosting \
  --project=micro-mediator-427111-v9

# OR deploy everything (hosting + Firestore rules)
npx firebase-tools@latest deploy \
  --project=micro-mediator-427111-v9
```

> The `/api/**` → Cloud Run proxy in `firebase.json` uses
> `"run": { "serviceId": "nourishai-api", "region": "us-central1" }` —
> Firebase resolves the Cloud Run URL automatically, no URL hardcoding needed.

---

## Verify

```bash
# Cloud Run health check
curl $(gcloud run services describe nourishai-api \
  --region=us-central1 --format="value(status.url)" \
  --project=micro-mediator-427111-v9)/health

# End-to-end through Firebase Hosting proxy
curl -X POST https://micro-mediator-427111-v9.web.app/api/suggest \
  -H "Content-Type: application/json" \
  -d '{"craving":"pasta","dietType":"vegetarian","allergies":[]}'
```
