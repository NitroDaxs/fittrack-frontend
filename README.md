# FitTrack — front end

FitTrack is a fitness tracking web app: an exercise library, ready-made training
routines, a workout builder and live logger, progress charts, body measurements,
fitness calculators, and an admin console for managing the content.

This repository is the React single-page app. The API it talks to lives in
the `fitness-backend-csharp` repository (ASP.NET Core).

## Stack

React 18 · TypeScript · TanStack Query · Axios · React Router 6 · Vite · Tailwind CSS 3 · Recharts

## Features

**Guest**

- Exercise library with search, filters by muscle group, equipment and
  difficulty, and a detail page with video and step-by-step instructions
- Routines catalog with day-by-day programme breakdowns
- Articles on nutrition, recovery and mindset
- Calculators: one-rep max, TDEE, BMI, macros and body fat
- Sign up, log in and reset a forgotten password

**Member**

- Dashboard with strength progression, body-weight trend and a consistency
  heatmap
- Workout builder with drag-to-reorder and a live exercise picker
- Active workout logger with weight and rep steppers and an automatic rest
  countdown
- Workout history and body measurements
- Saved exercises and routines
- Profile settings, including metric or imperial units

**Admin**

- Overview dashboard with stats and recent activity
- Sortable tables for exercises, routines, articles and users, with add, edit
  and delete

## Getting started

Requires Node.js 20 or newer.

```bash
npm install
cp .env.example .env
npm run dev
```

The app runs at http://localhost:5173.

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run typecheck` | Check types without building |
| `npm run build` | Type-check, then build for production into `dist/` |
| `npm run preview` | Serve the production build locally |

## Connecting to the API

`VITE_API_URL` in `.env` is the base URL of the API, for example
`http://localhost:8000/api`. Start the back end first (see its README) and log
in with one of its seeded accounts.


## Project structure

```
src/
  router/       Page routes and the RequireRole guard
  layouts/      Public and admin page shells, navigation, footer
  pages/        One file per screen; admin screens in pages/admin
  components/   UI primitives, charts, admin tables, calculator form parts
  hooks/        TanStack Query hooks; what pages use to read and write data
  services/     API calls, per domain
  types/        TypeScript types, per domain
  context/      Auth, units and active-workout state
  data/         Calculator list for the hub page
  utils/        Unit conversion for displaying stored values
```

Data flows `pages -> hooks -> services -> http`. Pages never call a service or
Axios directly.

Each domain has two files:

| File | Role |
| --- | --- |
| `services/exercises.ts` | The endpoint functions, plus mappers between the API's JSON and UI models |
| `types/exercises.ts` | Types for the API's JSON (mirroring the backend DTOs), UI models, forms and queries |

`endpoints.ts` lists every API path, and services use it instead of hardcoded
URLs. `http.ts` holds the Axios instance, bearer token, `ApiError` and 401 handling, and
`queryClient.ts` the cache and retry defaults. Filtering, sorting and pagination
are sent as query parameters and handled by the server.

## Calculators

All calculator logic lives in the API. The pages open with empty forms, send what
was entered to `POST /api/calculators/*`, and display the result or the API's
validation messages. Switching units clears the form.

## Authentication and roles

Logging in returns a JWT bearer token, which is kept in `localStorage` and sent
with every request. A 401 ends the session, and logging out clears the query
cache. The session holds the user and their role (`member` or
`admin`), and `RequireRole` guards the member and admin routes.

## Implementation notes

- **Charts** use Recharts. `MeasurementChart` is a `ComposedChart` rather than
  an `AreaChart`, because the latter silently discards `Line` children.
- **Consistency heatmap** is hand-built from divs.
- **Images** go through `<Img>`, which falls back to a tinted icon tile if a
  URL stops resolving.
- **Units** are always stored in pounds and inches and converted for display, so switching between
  metric and imperial never changes saved data.

## Known gaps

Progress-photo upload, social sign-in, and changing your email or password from
the profile page are not implemented. The API already supports the last two
through `PUT /me`.
