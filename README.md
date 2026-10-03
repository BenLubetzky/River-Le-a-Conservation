# Guardiões do Leça

A field guide for recognising and reporting invasive plants along the Rio Leça in Porto.

- **Species guide:** nine invasive plants with photos, key characteristics, local names and legal status.
- **Native look-alikes:** how to tell each invasive plant apart from the native plants it resembles, so nothing is removed by mistake.
- **Removal procedures:** step-by-step guidance and warnings for each species.
- **Sighting reports:** log an occurrence with a photo, date, abundance, growth stage and flowering or fruiting. Search, filter, edit and delete reports.

Reports are demo data for now and reset when the page reloads.

## Project structure

| Folder | What's in it |
| --- | --- |
| [`frontend/`](frontend) | The website: a [Next.js](https://nextjs.org) app (React, TypeScript). |
| [`backend/`](backend) | The server. Not built yet. |
| [`design/`](design) | The original design files and the "Organic" design system the frontend is based on. |

## Running it

You need [Node.js](https://nodejs.org) 20.9 or newer.

The first time, install the frontend's dependencies:

```bash
npm run install:frontend
```

Then start the development server:

```bash
npm run dev
```

and open http://localhost:3000.

These root scripts are shortcuts for running the same commands inside `frontend/` (`cd frontend`, then `npm install` / `npm run dev`).
