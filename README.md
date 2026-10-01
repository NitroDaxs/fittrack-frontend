# FitTrack — front end

FitTrack is a fitness tracking web app: an exercise library, ready-made training
routines, a workout builder and live logger, progress charts, body measurements,
fitness calculators, and an admin console for managing the content.

This repository is the React single-page app. The API it talks to lives in
[fittrack-backend](https://github.com/NitroDaxs/fittrack-backend) (Laravel).

## Stack

React 18 · React Router 6 · Vite · Tailwind CSS 3 · Recharts · Axios

## Features

**Guest**

- Exercise library with search, filters by muscle group, equipment and
  difficulty, and a detail page with video and step-by-step instructions
- Routines catalog with day-by-day programme breakdowns
- Articles on nutrition, recovery and mindset
- Calculators: one-rep max, TDEE, BMI, macros and body fat
- A chat assistant that answers questions from the app's own data
- Sign up and log in

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
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Serve the production build locally |

## Connecting to the API

`VITE_API_URL` in `.env` is the base URL of the API, for example
`http://localhost:8000/api`. Start the back end first (see its README) and log
in with one of its seeded accounts.

If `VITE_API_URL` is not set, the app falls back to an in-memory mock of the
API. The mock predates the real back end, so it covers browsing the catalog
but not every newer feature.

## Project structure

```
src/
  api/          HTTP client, endpoint functions and data hooks
  components/   Layout, UI primitives, charts, chat widget, admin tables
  context/      Auth, units, taxonomy and active-workout state
  pages/        One file per screen; admin screens in pages/admin
  data/         Calculator definitions
  utils/        Unit conversion helpers
```

Everything network-shaped goes through `src/api/`:

| File | Role |
| --- | --- |
| `axios.js` | Axios instance; attaches the bearer token to every request |
| `client.js` | `request()`, the only place a request is issued |
| `resources.js` | Endpoint functions such as `exercisesApi.list()` and `meApi.dashboard()` |
| `hooks.js` | `useResource`, `useMutation` and `useDebounced` |
| `mockServer.js`, `db.js` | The in-memory mock and its seed data |

Components only call the functions in `resources.js`. Filtering, sorting and
pagination are sent as query parameters and handled by the server.

## Authentication and roles

Logging in returns a Sanctum bearer token, which is kept in `localStorage` and
sent with every request. The session holds the user and their role (`member` or
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

Progress-photo upload, social sign-in, and password or email changes are not
implemented. Those controls are present but disabled, with a tooltip saying why.
