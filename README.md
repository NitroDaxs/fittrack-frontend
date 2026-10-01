# FitTrack — front-end prototype

A clickable React implementation of the FitTrack design in
`stitch_fittrack_fitness_web_app/`. **There is no backend.** All data comes from an
in-memory mock that mimics a REST API; a Laravel API will replace that layer.

```bash
npm install
npm run dev
```

## Stack

React 18 · React Router 6 · Tailwind CSS 3 · Recharts · Vite

Design tokens (colours, type scale, spacing, radii) are mirrored from
`kinetic_performance_system/DESIGN.md` into `tailwind.config.js`, so markup lifted
from the design files renders unchanged.

## Swapping in the Laravel API

Everything network-shaped lives in `src/api/`, in four layers:

| File | Role | Fate after the swap |
| --- | --- | --- |
| `db.js` | Seed data | **Delete** |
| `mockServer.js` | Route table: filtering, sorting, pagination, CRUD | **Delete** |
| `client.js` | `request()` — the only place a request is issued | Keep; the mock branch drops out |
| `resources.js` | `exercisesApi.list()`, `meApi.dashboard()`, … | Keep unchanged |
| `hooks.js` | `useResource` / `useMutation` / `useDebounced` | Keep unchanged |

To point at a real API, set `VITE_API_URL` in `.env`. `client.js` already switches
to `fetch` when that variable is present, sends `Authorization: Bearer …`, and
delegates to `getToken()`/`setToken()` in the same file.

No component imports `client.js`, `mockServer.js`, or `db.js` — they only call the
functions in `resources.js`. Filtering, sorting and pagination are done
server-side in the mock and passed as query parameters, so those interactions
behave identically once real endpoints are behind them.

`mockServer.js` doubles as the API contract: each handler key is the
method + path the backend needs to expose, and its return value is the expected
response shape.

## Access levels

`src/context/AuthContext.jsx` holds a **demo-only** session. There is no
authentication: the login form validates fields client-side and the mock accepts
any well-formed credentials. `RequireRole` guards member and admin routes.

The floating **role switcher** (bottom-right) jumps between guest, member, and
admin without going through the form. Logging in with an email matching a seeded
Admin account (`alex@fittrack.example`) also lands you in the admin console.

## Screens

**Guest** — home, exercise library + detail, routines catalog + detail, articles
listing + detail, 1RM and TDEE calculators, calculators hub, login, signup.

**Member** — dashboard (strength progression, body-weight trend, consistency
heatmap), workout builder, active workout logger, workout history, body
measurements, profile settings.

**Admin** — overview dashboard plus managed tables for exercises, routines,
articles, and users, each with client-side sort and add/edit/delete modals that
mutate local state.

## Implementation notes

- **Workout builder** — drag the handle to reorder, with up/down buttons as a
  keyboard and touch fallback. Exercise picker queries the library live.
- **Active logger** — ±steppers (5 lbs / 1 rep), a rest countdown that starts
  automatically when a set is completed, and set/exercise advancement that ends
  in a summary screen.
- **Charts** — Recharts. `MeasurementChart` uses `ComposedChart`, not
  `AreaChart`: the latter silently discards `Line` children.
- **Consistency heatmap** — hand-built from divs; the mock data is generated
  from a fixed seed so it does not change between renders.
- **Images** — stock photography URLs from the design files, wrapped in `<Img>`,
  which falls back to a tinted icon tile if a URL stops resolving.

## Known gaps

Deliberately out of scope for a front-end prototype: real auth, progress-photo
upload, social sign-in, password/email changes, and the rich-text article body
editor (the admin modal covers listing metadata only). Those controls are
present but disabled, with a tooltip saying why.
