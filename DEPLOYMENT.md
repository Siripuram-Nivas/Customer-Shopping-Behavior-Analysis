# Deployment

The React frontend is deployed to Vercel and the FastAPI backend to Render.

## Render API

Create a Render Blueprint from this repository and use `render.yaml`. Set
`CORS_ORIGINS` to the deployed Vercel origin, for example
`https://your-project.vercel.app`. For multiple allowed origins, separate them
with commas.

The API health check is available at `/api/health`.

## Vercel frontend

Create a Vercel project with `frontend` as its Root Directory. Vercel detects
Vite and uses the project build script and `dist` output directory. The
`frontend/vercel.json` rewrite supports client-side routes.

Set this project environment variable for production and redeploy:

```text
VITE_API_BASE_URL=https://your-api.onrender.com/api
```

For local development, the frontend defaults to
`http://127.0.0.1:8000/api`.
