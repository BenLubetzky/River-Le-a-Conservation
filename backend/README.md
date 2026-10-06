# Backend

A [FastAPI](https://fastapi.tiangolo.com) app that stores sighting reports in [Supabase](https://supabase.com): its Postgres database through SQLAlchemy, and report photos in a private Supabase Storage bucket, served through signed URLs that expire after an hour. The schema is managed with Alembic.

```
app/
  main.py         creates the FastAPI app
  core/           settings, read from .env; password hashing and session tokens
  database/       SQLAlchemy base class and connection/session
  models/         database tables (species and their content, native plants, reports, users, sessions) and enums
  schemas/        API request/response shapes (Pydantic)
  api/routes/     endpoints: health, auth, species, reports
  services/       Supabase Storage (report photos)
alembic/          migrations
admin.py          the admin page (Streamlit): add and delete users, change passwords, delete reports
.streamlit/       the admin page's settings and theme
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
| POST | `/auth/login` | Log in with `{username, password}`; sets the session cookie |
| POST | `/auth/logout` | Ends the session and clears the cookie |
| GET | `/auth/me` | The logged-in user |
| GET | `/reports` | All reports, newest first |
| POST | `/reports` | Submit a report as the logged-in user (multipart form, optional `photo` file). `reporter_name` is always their username |
| PUT | `/reports/{id}` | Edit a report. Only its author can (403 otherwise). Same fields as POST, all replaced; the photo changes only if a new `photo` or `remove_photo=true` is sent |
| GET | `/species` | The invasive species with all their field-guide content (details, characteristics, removal steps, native look-alikes, photo URLs) |
| GET | `/health` | Liveness check |

Everything except `/health` and `/auth/login` needs a logged-in user, and answers 401 otherwise.

## Access

The API connects as the database owner. Supabase's own public Data API is locked out of these tables: row-level security is on with no policies, and the `anon`/`authenticated` grants are revoked. The only way in is this API. People can edit their own reports through the API, but not delete them. Reports are deleted only on the admin page, which also removes their photo from storage.

Users have only a username (case-sensitive) and a password hash (Argon2). Logging in creates a row in `sessions` and sets an httpOnly `session` cookie holding a random token; the table stores only the token's SHA-256. Sessions last `SESSION_TTL_DAYS` (30 by default). Set `COOKIE_SECURE=true` wherever the API is served over HTTPS. Each report can be linked to the user who made it through `reports.user_id`. If that user is deleted, the link is set to NULL and the report stays.

## Admin page

`uv run python -m streamlit run admin.py` (or `npm run admin` from the project root) opens a page on http://localhost:8502 for adding, listing and deleting users, changing their passwords, and deleting reports. Changing a password or deleting a user logs them out everywhere. After a delete, their reports stay, no longer linked to anyone. It uses the backend's models and `.env` to write to the database directly, so the API doesn't need to be running. It has no login of its own, so it only listens on localhost. Run it only on a computer you trust with the database password.

## Changing the schema

Edit the models in `app/models/`, then:

```
uv run python -m alembic revision --autogenerate -m "describe the change"
uv run python -m alembic upgrade head
```

Review the generated file in `alembic/versions/` before running it.
