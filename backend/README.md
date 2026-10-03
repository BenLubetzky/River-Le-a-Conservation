# Backend

A [FastAPI](https://fastapi.tiangolo.com) app that stores sighting reports in [Supabase](https://supabase.com): its Postgres database through SQLAlchemy, and report photos in Supabase Storage. The schema is managed with Alembic.

```
app/
  main.py         creates the FastAPI app
  core/           settings, read from .env
  database/       SQLAlchemy base class and connection/session
  models/         database tables (species, reports) and enums
  schemas/        API request/response shapes (Pydantic)
  api/routes/     endpoints: health, species, reports
  services/       Supabase Storage (report photos)
alembic/          migrations
```

## Setup

Needs Python 3.12+ and [uv](https://docs.astral.sh/uv/).

1. `uv sync` to install dependencies.
2. Copy `.env.example` to `.env` and fill it in. It needs the database connection string (Supabase → **Connect** → **Session pooler**), the project URL and the secret key.
3. `uv run python -m alembic upgrade head` to create the tables.
4. `uv run python -m uvicorn app.main:app --reload --port 8000` to start the API on http://localhost:8000. Interactive docs are at http://localhost:8000/docs.

From the project root, `npm run install:backend`, `npm run db:migrate` and `npm run dev:backend` do the same.

On Windows, call Alembic and Uvicorn through `python -m` as above. Smart App Control blocks their `.exe` launchers.

## API

| Method | Path | |
| --- | --- | --- |
| GET | `/reports` | All reports, newest first |
| POST | `/reports` | Submit a report (multipart form, optional `photo` file) |
| GET | `/species` | The invasive species reports can refer to |
| GET | `/health` | Liveness check |

## Access

The API connects as the database owner. Supabase's own public Data API is locked out of these tables: row-level security is on with no policies, and the `anon`/`authenticated` grants are revoked. The only way in is this API. There's no editing or deleting of reports yet; that comes with logins.

## Changing the schema

Edit the models in `app/models/`, then:

```
uv run python -m alembic revision --autogenerate -m "describe the change"
uv run python -m alembic upgrade head
```

Review the generated file in `alembic/versions/` before running it.
