# Guardiões do Leça

A field guide for recognising and reporting invasive plants along the Rio Leça in Porto.

- **Species guide:** nine invasive plants with photos, key characteristics, local names and legal status.
- **Native look-alikes:** how to tell each invasive plant apart from the native plants it resembles, so nothing is removed by mistake.
- **Removal procedures:** step-by-step guidance and warnings for each species.
- **Sighting reports:** log an occurrence with a photo, date, abundance, growth stage and flowering or fruiting. Search, filter, edit and delete reports.

Reports are stored in a database. Editing and deleting reports will come with user accounts.

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

Then open http://localhost:3000. The API runs on http://localhost:8000.
