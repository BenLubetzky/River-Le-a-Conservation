# Monitorização Leça

A field guide for recognising and reporting invasive plants along the Rio Leça in Porto.

- **Species guide:** nine invasive plants with photos, key characteristics, local names and legal status.
- **Native look-alikes:** how to tell each invasive plant apart from the native plants it resembles, so nothing is removed by mistake.
- **Removal procedures:** step-by-step guidance and warnings for each species.
- **Sighting reports:** log an occurrence with a photo, date, abundance, growth stage and flowering or fruiting. Search and filter reports, and edit your own.
- **Map:** reports with a location along the Rio Leça shown as markers on an OpenStreetMap; select one to open the report. The area is a rectangle around the river, set in `frontend/src/lib/riverArea.ts`.

The site opens on a login page; everything else needs an account. Reports are stored in a database and linked to the user who made them. People can edit their own reports; only the admin page can delete them.

## Project structure

| Folder | What's in it |
| --- | --- |
| [`frontend/`](frontend) | The website: a [Next.js](https://nextjs.org) app (React, TypeScript). |
| [`backend/`](backend) | The API: FastAPI, SQLAlchemy and Alembic, on a Supabase Postgres database. |
| [`design/`](design) | The original design files and the "Organic" design system the frontend is based on. |

## Running it

You need [Node.js](https://nodejs.org) 20.9+, Python 3.12+ and [uv](https://docs.astral.sh/uv/).

First time:

```bash
npm run install:frontend
npm run install:backend
```

Then fill in `backend/.env` (see [backend/README.md](backend/README.md)) and create the database tables:

```bash
npm run db:migrate
```

To run the project, start the API and the website in two terminals:

```bash
npm run dev:backend
npm run dev
```

Then open http://localhost:3000 and log in.

Accounts are created, and reports deleted, on the admin page, a small [Streamlit](https://streamlit.io) app that runs on your own computer:

```bash
npm run admin
```

It opens on http://localhost:8502. The API runs on http://localhost:8000; the website reaches it through its own `/api` path, which Next.js forwards to the API.

## Deploying

| Part | Where | Address |
| --- | --- | --- |
| Website | Cloudflare Workers | https://conservacao-leca.benlubetzky.workers.dev |
| API | Render (Frankfurt, free plan) | https://conservacao-leca-api.onrender.com |
| Database and photos | Supabase | |

The browser only talks to the website. `npm run build` exports the site as static files (`frontend/out/`), and a small Cloudflare Worker ([frontend/worker/index.ts](frontend/worker/index.ts)) serves them and forwards `/api/...` to the API on Render. So the login cookie is first-party. During `npm run dev`, Next.js does that forwarding instead.

Both deploy on their own when you push to GitHub:

- **Website:** Cloudflare builds and deploys it on every push. The API's address is `BACKEND_URL` in [frontend/wrangler.jsonc](frontend/wrangler.jsonc). `npm run preview` (from `frontend/`) runs the built site and Worker locally on http://localhost:8787.
- **API:** [render.yaml](render.yaml) describes the Render service: build with uv from `backend/`, database migrations then Uvicorn on start, health check on `/health`. Render redeploys on pushes that change `backend/`. Variables (set in Render): `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (the same values as in `backend/.env`); `COOKIE_SECURE=true` is set by the file. To see the requests coming in, open the service in Render → **Logs**. If Render turns out too slow, the fallback is Google Cloud Run.
- **Keeping it awake:** [.github/workflows/keep-awake.yml](.github/workflows/keep-awake.yml) calls the website's `/api/health` every 10 minutes. `/health` runs a query, so this keeps both the API's host (Render's free plan sleeps after 15 idle minutes) and the Supabase free-tier database (paused after a week without use) awake. It needs no secrets; to ping a different address, set an Actions variable `HEALTH_URL`. GitHub turns scheduled workflows off after 60 days without commits; re-enable it under **Actions**.
- **Backups:** [.github/workflows/backup.yml](.github/workflows/backup.yml) runs [backend/backup.py](backend/backup.py) every day at 03:17 UTC: a `pg_dump` of the database (kept 30 days) and a copy of every new photo and thumbnail, into a private Cloudflare R2 bucket. It needs repository secrets (Settings → Secrets and variables → Actions): `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (as in `backend/.env`), and `R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` (Cloudflare → R2 → create the bucket, then **Manage API tokens** → an Object Read & Write token for that bucket). Run it by hand under **Actions** → **Backup** → **Run workflow**. How to restore is at the top of `backup.py`.
- **Admin page:** don't host it. It has no login of its own. Run it on your own computer with `backend/.env` pointing at the production database.
- **Photos:** the website shrinks each photo to at most 2048 px (JPEG) before upload and makes a 320 px thumbnail, stored next to it in the bucket (`<name>.thumb.jpg`) and used in lists. Uploads go through the Worker to the API, up to 10 MB each (for photos the browser can't shrink, e.g. HEIC outside Safari; those get no thumbnail) and 512 KB per thumbnail.
