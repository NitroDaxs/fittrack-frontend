# FitTrack Frontend

FitTrack is a fitness tracking web app with an exercise library, training routines,
a workout builder and live logger, progress charts, body measurements, fitness
calculators, an assistant chat and an admin console.

This repository is the React single-page app. Its data and business logic come from
the [FitTrack API](https://github.com/NitroDaxs/fittrack-be-cs), built with ASP.NET
Core.

## Contents

- [Tech stack](#tech-stack)
- [Features](#features)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [How data flows](#how-data-flows)
- [Client state](#client-state)
- [Forms and validation](#forms-and-validation)
- [Routes](#routes)
- [Authentication and roles](#authentication-and-roles)
- [Calculators](#calculators)
- [Units](#units)
- [Languages](#languages)
- [Notifications](#notifications)
- [Styling and components](#styling-and-components)
- [Testing](#testing)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)

## Tech stack

| Area | Choice |
| --- | --- |
| UI | React 18, strict TypeScript |
| Server data | TanStack Query 5, Axios |
| Client state | Zustand 5 |
| Forms | React Hook Form, Zod 4 |
| Routing | React Router 6 |
| Build | Vite 8 |
| Styling | Tailwind CSS 3 |
| Charts | Recharts |
| Icons | Lucide |
| Languages | i18next, react-i18next |
| Notifications | Sonner |
| Tests | Vitest 5, Testing Library, jsdom |
| Hosting config | Vercel |

## Features

**Everyone**

- Exercise library with search, multi-select filters and a clickable body map, plus detail pages
  with video and step-by-step instructions
- Search and filters on the library, routines and articles listings are kept in the URL,
  so a filtered view survives a reload and can be shared
- Routines catalog with day-by-day programmes
- Articles on nutrition, recovery and mindset
- Calculators for one-rep max, TDEE, BMI, macros and body fat
- Workout builder and live workout logger with a rest timer; the workout in progress
  survives a page reload
- Sign up, log in and reset a forgotten password

**Members**

- Dashboard with strength progression, body-weight trend and a consistency heatmap
- Workout history and body measurements
- Saved exercises and routines
- Assistant chat that replies in the current language and links matching exercises,
  routines and articles
- Profile settings: picture, name, email, password, and metric or imperial units

**Admins**

- Overview dashboard with stats and recent activity
- Sortable, searchable tables for exercises, routines, articles and users, with add,
  edit and delete

## Getting started

You need Node.js 20.19 or newer, and the API running locally. See the
[API's README](https://github.com/NitroDaxs/fittrack-be-cs#getting-started) to set it
up.

```bash
npm install
cp .env.example .env
npm run dev
```

The app runs at http://localhost:5173. To explore it, log in with the sample accounts
the API's seed creates:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@test.com` | `password123` |
| Member | `member@test.com` | `password123` |

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run typecheck` | Check types without building |
| `npm run build` | Type-check, then build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the tests in watch mode |
| `npm run test:run` | Run the tests once |
| `npm run test:run -- --coverage` | Run the tests once with a V8 coverage report |

### Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_API_URL` | Base URL of the API, including `/api` | `http://localhost:8000/api` |

Vite includes this value in the build, so changing it requires a rebuild, and it's
visible to anyone using the app. Never put secrets in a `VITE_` variable.

If the browser reports a CORS error, add your frontend's address to the API's
`Cors:AllowedOrigins` setting.

## Project structure

```
src/
  router/       Page routes and the RequireRole and RequireGuest guards
  layouts/      Public and admin page shells, navigation, footer
  pages/        One file per screen; admin screens are in pages/admin
  components/   UI primitives, charts, chat, library filters, profile forms,
                the admin routine builder, calculator form parts
  hooks/        TanStack Query hooks, plus small shared hooks (URL params, debounce)
  services/     API calls and mappers, per domain
  types/        TypeScript types, per domain
  schemas/      Zod schemas for every form
  store/        Zustand stores: workout session, unit preference, chat history
  context/      Auth session
  i18n/         i18next setup and the English and Bulgarian translations
  data/         Calculator list for the hub page
  utils/        Unit conversion for displaying stored values
  test/         Test setup, render helpers and fixtures
```

Tests sit next to the code they cover, as `*.test.ts` or `*.test.tsx`.

## How data flows

```
pages -> hooks -> services -> http -> API
```

Pages never call a service or Axios directly.

| File | Role |
| --- | --- |
| `services/endpoints.ts` | Every API path |
| `services/http.ts` | The Axios instance, bearer token, `ApiError` and 401 handling |
| `services/queryClient.ts` | Cache and retry defaults |
| `services/exercises.ts` | That domain's API calls, plus mappers between API JSON and UI models |
| `types/exercises.ts` | That domain's types for API JSON, UI models, forms and queries |
| `hooks/useExercises.ts` | That domain's queries and mutations |

The API sends snake_case JSON, and mappers in `services/` convert it to the models
the UI uses. Filtering, sorting and pagination are sent as query parameters and
handled by the server.

### Caching and errors

- Query results stay fresh for 30 seconds, and aren't refetched when the window
  regains focus.
- Failed reads are retried up to twice, unless the response is a 4xx.
- Failed calls throw `ApiError`. Use `errorMessage()` for the message to display and
  `fieldErrorsOf()` for the first error per field of a 422 response.

### Adding an API call

1. Add the path to `services/endpoints.ts`.
2. Add its types to `types/<domain>.ts`.
3. Add the function to `services/<domain>.ts`, with a mapper if the UI needs a
   different shape.
4. Wrap it in `useQuery` or `useMutation` in `hooks/use<Domain>.ts`, and invalidate
   whatever a mutation changes.
5. Call that hook from the page.

Admin tables can use `hooks/useCrud.ts`, which handles paging, search, sorting, the
add and edit modal, and delete confirmation.

### Listing filters

The library, routines and articles pages keep their search, filters and page number in
the URL, through `hooks/useQueryParams.ts`. Lists are comma-separated (`?goals=a,b`),
empty values are left out, and a change replaces the current history entry instead of
adding one for every keystroke.

## Client state

Data that belongs to the browser rather than the server lives in Zustand stores in
`src/store/`:

| Store | Holds | Kept in |
| --- | --- | --- |
| `workout.store.ts` | The builder's draft, the live session and its rest timer | `localStorage` |
| `unit.store.ts` | Metric or imperial | `localStorage` |
| `chat.store.ts` | The assistant chat history and whose it is | `sessionStorage` |

The stores are versioned. When the saved shape of the workout changes, raise
`STORAGE_VERSION` and add a step to `migrate`, so saved workouts still load.

The auth session is the only state kept in React context (`context/AuthContext.tsx`),
because it ties the token, the profile query and the stores together.

## Forms and validation

Every form uses React Hook Form with a Zod schema from `src/schemas/`, connected through
`zodResolver`. `schemas/shared.ts` has the building blocks: required text, email,
http(s) URLs, the new-password rule (8 or more characters, with a number and an
uppercase letter), and helpers that turn input text into numbers within a range.

Messages are i18n keys, looked up at validation time so they follow the current
language. The API enforces the same rules. Anything it still rejects, such as an email
that's already taken, is shown as a toast or a field error.

## Routes

Defined in `src/router/index.tsx`.

| Path | Screen | Access |
| --- | --- | --- |
| `/` | Home | Public |
| `/library`, `/library/:slug` | Exercise library and detail | Public |
| `/routines`, `/routines/:slug` | Routines catalog and detail | Public |
| `/articles`, `/articles/:slug` | Articles and detail | Public |
| `/calculators` | Calculator hub | Public |
| `/calculators/1rm`, `tdee`, `bmi`, `macros`, `bodyfat` | Calculators | Public |
| `/login`, `/signup` | Account access | Public |
| `/forgot-password`, `/reset-password` | Password reset | Public |
| `/about`, `/contact`, `/legal`, `/privacy` | Static pages | Public |
| `/builder`, `/workout/active` | Workout builder and logger | Public |
| `/dashboard`, `/history`, `/measurements`, `/profile` | Member screens | Member |
| `/admin`, `/admin/exercises`, `routines`, `articles`, `users` | Admin console | Admin |

## Authentication and roles

Logging in returns a JWT, which is kept in `localStorage` and sent with every request.
A 401 on a signed-in request ends the session, with one toast however many requests
failed. Logging out clears the query cache, the workout in progress and the chat
history.

`RequireRole` sends guests to `/login` and remembers where they were going, and sends
signed-in users without the role to `/dashboard`. `RequireGuest` sends signed-in users
away from login, sign-up and forgot password. These only keep people away from screens
that would fail; the API enforces permissions on every request.

The stored session stays in step with the account, and logging in or out in one tab
applies to the others.

To reset a password, the visitor requests a link at `/forgot-password`, and the API
emails a link to `/reset-password`.

## Calculators

All calculator logic lives in the API. The pages open with empty forms, send what was
entered to `POST /api/calculators/*`, and display the result or the API's validation
messages. Results appear when you press **Calculate**, and switching units clears
the form. `components/calculators/shared.tsx` holds the shared form parts.

## Units

Stored weights and measurements are in pounds and inches, and are converted for
display, so switching between metric and imperial never changes saved data.

- `store/unit.store.ts` holds the current choice. It's kept in `localStorage`, so the
  first paint uses the right units and guests keep their choice.
- `hooks/useUnits.ts` has `useUnitFormat()` for labels and conversions, and
  `useSetUnit()`, which also saves the choice to the profile when signed in.
- On login the account's setting wins, so the choice follows the user between devices.
- `utils/units.ts` does the display conversion.

## Languages

The app is available in English and Bulgarian. Text lives in `src/i18n/locales/en.json`
and `bg.json`, and the first visit follows the browser's language. The language dropdown in
the header remembers the choice in this browser.

Use `t('key')` from `useTranslation()` in components, and add every new key to both
files. `tLabel()` translates fixed values the API sends in English, such as muscle
groups and difficulty levels.

Exercise, routine and article content comes from the database, and API messages come
from the backend, so both stay in English. The assistant chat sends the current language
and replies in it. Changing the language refetches cached queries, because they include
dates formatted for the old language.

## Notifications

Toasts use Sonner. `services/queryClient.ts` shows a toast for every failed write,
except field errors, which the form shows. Hooks show the success toasts, such as
`toast.success(i18n.t('toast.deleted'))`.

## Styling and components

- **Tailwind:** design tokens such as colours and text styles are in
  `tailwind.config.js`.
- **UI primitives:** reusable parts such as `DataTable`, `Modal`, `Pagination` and
  `Field` are in `components/ui/`.
- **Icons:** `components/ui/Icon.tsx` lists the Lucide icons the app uses. Import and
  list a new one there, then use it as `<Icon name="dumbbell" />`.
- **Images:** `<Img>` falls back to a tinted icon tile if a URL stops resolving.
- **Profile pictures:** `ProfilePicture` uploads JPEG, PNG or WebP images of up to 2 MB
  to the API.
- **Charts:** `MeasurementChart` uses a `ComposedChart` rather than an `AreaChart`,
  because `AreaChart` silently discards `Line` children. The consistency heatmap is
  built by hand from divs.

## Testing

The tests use Vitest in jsdom with Testing Library. They cover schemas, services and
mappers, hooks, stores, route guards, translations, UI components and the main pages.
API calls are mocked, so no backend is needed.

- `src/test/setup.ts` runs every test in English and resets the stores and browser
  storage before each one.
- `src/test/utils.tsx` has `renderWithProviders()` and `createWrapper()`, which give
  each test a fresh query client and a `MemoryRouter`.
- `src/test/fixtures.ts` has sample API data.

GitHub Actions (`.github/workflows/ci.yml`) runs `npm run typecheck` and
`npm run test:run` on every push to `main` and on every pull request.

## Deployment

`vercel.json` sends all paths to `index.html`, so deep links work on Vercel. On any
other host, set up the same fallback.

1. Set `VITE_API_URL` to the production API, including `/api`.
2. Build with `npm run build` and serve `dist/`.
3. In the API's configuration, add this site's address to `Cors:AllowedOrigins` and
   set `Email:FrontendUrl` to it, so that password reset links point here.

Deploy API changes before frontend changes that depend on them.

## Known limitations

- There are no end-to-end tests against a running API.
- The main JavaScript bundle is over 500 kB, because routes aren't code-split.
- Progress-photo upload and social sign-in aren't implemented.
