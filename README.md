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
| Website | Cloudflare Workers | https://guardioes-do-leca.benlubetzky.workers.dev |
| API | Railway (EU West) | https://api-production-9c06f.up.railway.app |
| Database and photos | Supabase | |

The browser only talks to the website. `npm run build` exports the site as static files (`frontend/out/`), and a small Cloudflare Worker ([frontend/worker/index.ts](frontend/worker/index.ts)) serves them and forwards `/api/...` to the API on Railway. So the login cookie is first-party. During `npm run dev`, Next.js does that forwarding instead.

Neither is deployed from GitHub; you deploy from your computer:

- **Website:** from `frontend/`, run `npm run deploy` (needs `npx wrangler login` once). The API's address is `BACKEND_URL` in [frontend/wrangler.jsonc](frontend/wrangler.jsonc). `npm run preview` runs the built site and Worker locally on http://localhost:8787.
- **API:** from `backend/`, run `railway up` (needs `railway login` once). The start command, which also applies database migrations, is in [backend/railpack.json](backend/railpack.json); the health check and restart policy in [backend/railway.json](backend/railway.json). Variables (set in Railway): `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `COOKIE_SECURE=true`.
- **Admin page:** don't host it. It has no login of its own. Run it on your own computer with `backend/.env` pointing at the production database.
- **Photos:** uploads go through the Worker to the API, up to 10 MB each.
