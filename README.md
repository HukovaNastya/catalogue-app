# Getting Started with Catalogue App

A cat breed catalogue built with React 19, TypeScript and Vite. Breed data comes from
[TheCatAPI](https://thecatapi.com/), is fetched with TanStack Query and browsed through a
searchable, filterable, paginated grid. Every filter lives in the URL, so any view can be
shared or bookmarked. Breeds can be saved to a favourites list held in `localStorage`.

### Create .env file at the project root folder with environment variables as in the table.

| Environmental variable | Value                                                                                              |
|------------------------|----------------------------------------------------------------------------------------------------|
| CAT_API_KEY            | TheCatAPI key — request a free one at [thecatapi.com](https://thecatapi.com/signup). Omit it and the API answers with stricter rate limits. |

Note the name has **no `VITE_` prefix**, and that is the point: anything prefixed `VITE_` is
inlined into the JavaScript bundle at build time and readable by anyone. The key is instead read
server-side and attached to outgoing requests — by the Vite dev proxy locally, by
`api/proxy.js` on Vercel. The browser only ever calls this app's own `/api` path, and nothing
under `src/` reads an environment variable at all.

> `.env` is ignored by git — never commit your API key. Share new variables through this table instead.

## Available Scripts

In the project directory:

### `npm install` - installs node modules

### `npm run dev` - runs the application in the development mode.

Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

The page will reload when you make changes.

### `npm run build` - type-checks the project (`tsc -b`) and builds it for production into the `dist` folder.

### `npm run preview` - serves the production build locally.

Checks the built assets, **not** the running app: only the dev server proxies `/api`, so breed
requests 404 here and the app renders its error state. To exercise the real thing locally, run
`vercel dev`, which serves the build *and* `api/proxy.js`.

### `npm run lint` - runs ESLint across the project.

### `npm run test:e2e` - runs the Playwright end-to-end suite.

Builds the app, serves it on port 4173 and drives it against a mocked TheCatAPI —
no API key or network needed. `npm run test:e2e:ui` opens the watch-mode
debugger. See [`e2e/README.md`](./e2e/README.md) for the fixture data the
assertions are built on.

## Routes

| Route               | Description                                                        |
|---------------------|--------------------------------------------------------------------|
| `/`                 | Redirects to `/breeds`                                              |
| `/breeds`           | Breed grid, with the filter sidebar. Accepts every parameter below   |
| `/breeds/:breedId`  | Details of a single breed — gallery, ratings, similar breeds         |
| `/favourites`       | The saved breeds, most recently saved first. Accepts `?page=`        |

### Search parameters

Defined and validated in `src/routeSearch.ts`, shared by every route.

| Parameter  | Value                                                        | Default |
|------------|--------------------------------------------------------------|---------|
| `q`        | Search text, matched against breed name and origin            | `''`    |
| `page`     | 1-based page number                                           | `1`     |
| `kids`     | Minimum "good with kids" rating — `3`, `4` or `5`             | `0` (any) |
| `grooming` | Comma-separated grooming levels, e.g. `grooming=1,2`          | `''`    |
| `traits`   | Comma-separated, from `hypoallergenic` and `rare`             | `''`    |
| `origin`   | Exact origin country                                          | `''`    |
| `sort`     | `name` or `name-desc`                                         | `name`  |

A parameter at its default is stripped from the address bar, so a clean URL means no filters.
Anything unrecognised is normalised away rather than throwing — `?kids=99&traits=bogus` degrades
to "no filter" instead of an error page.

## Project structure

```
api/
└── proxy.js        Serverless function: forwards /api/* upstream with the key attached
vercel.json         Rewrites — /api/* to the proxy, everything else to index.html
vite.config.ts      Build config, plus the dev-server stand-in for api/proxy.js

src/
├── assets/icons/   Inline SVG components (CatalogueIcon, SearchIcon, CloseIcon)
├── components/
│   ├── breed/      BreedCard, BreedList, BreedFilters, BreedGallery, EmptyState, SimilarBreeds
│   └── common/     Button, Header, Input, Select, Pagination, SearchInput, Typography, Lightbox
├── hooks/          useBreeds, useBreed, useBreedImages, useBreedsParams, useBreedFilters,
│                   useFavourites, useDebouncedCallback
├── pages/          BreedsPage, BreedPage, FavouritesPage, ErrorPage
├── services/       TheCatAPI client and models, favourites store, localStorage helpers
├── utils/          Breed filtering, pagination maths, similar breeds, thumbnail slots
├── index.css       Design tokens and base styles
├── routeSearch.ts  Search-parameter schema, validation and defaults
└── router.tsx      Route definitions
```

CSS modules sit alongside the component they style.

## How it works

- **Search** filters the loaded breed list by name or origin, debounced 250 ms while typing.
- **Filters** stack as AND — a breed has to satisfy every active one. Each shows as a chip you can
  remove individually, or "Clear all" resets them in one go.
- **Sort survives a clear.** It is a view preference rather than a filter, so "Clear all" empties
  the search box and every filter but leaves the ordering alone.
- **Pagination** is client-side — 9 breeds per page on the grid, 10 on favourites — with a sliding
  window of up to 10 page buttons.
- **URL is the state** — `useBreedsParams` owns `q` and `page`, `useBreedFilters` owns the rest.
  Changing any of them resets the page back to 1, so a narrowed result set never lands on an
  empty page.
- **Empty results explain themselves** rather than showing a bare "no results": the state names
  which filter is to blame and offers to clear just that one, and it distinguishes "no such breed"
  from "filtered out".
- **Favourites** live in `localStorage` under `catalogue:favourites`, newest first. They are not
  in the URL — they belong to the browser, not the view.
- **Caching** is handled by TanStack Query; breeds are fetched once and reused across pages.
- **The API key never reaches the browser.** The client only ever calls `/api` on its own origin;
  a server-side proxy attaches the key. See below.

## Deployment

Hosted on Vercel, which auto-detects Vite — build `npm run build`, output `dist`, install
`npm install`. No overrides needed.

**Set `CAT_API_KEY`** in Project Settings → Environment Variables, ticked for Production, Preview
and Development. Two things bite here:

- Adding a variable does **not** apply it to deployments that already exist. Redeploy afterwards.
- A missing key fails *quietly*. `/breeds` is served anonymously, so the grid still loads while
  detail lookups fail — it looks like a routing bug, not a credentials one.

`vercel.json` carries two rewrites, and the order matters:

```json
{ "source": "/api/(.*)",       "destination": "/api/proxy?path=$1" }
{ "source": "/((?!api/).*)",   "destination": "/index.html" }
```

The first hands every API call to the proxy, passing the upstream path as a query parameter
rather than relying on a `[...catch-all]` filename. The second is the SPA fallback: without it
a hard refresh on `/breeds/abys` returns 404, because that path only exists inside the bundle.
Its negative lookahead is what stops the fallback swallowing `/api` and answering fetches with
HTML.

### The proxy exists twice

One contract, two implementations, and neither runs in the other's environment:

| Environment | Serves `/api/*` | Reads the key from |
|---|---|---|
| `npm run dev` | Vite's `server.proxy` (`vite.config.ts`) | `.env` via `loadEnv` |
| Vercel | `api/proxy.js` | `process.env` |
| `npm run preview` | nothing — `/api` 404s | — |
| `npm run test:e2e` | Playwright route mocks | — |

Change how one forwards a request and the other needs the same change.

## Design tokens

All colour and geometry lives in one block at the top of `src/index.css`, in three layers —
ramps (`--brand-*`, `--n-*`), roles (`--page`, `--surface`, `--text-muted`, `--rating-filled`, …)
and geometry (`--radius-*`). Components read the **role** layer.

Light mode only, deliberately. A dark theme is a value swap in the role layer, not a refactor.
The full grammar is in [`docs/conventions.md`](./docs/conventions.md).

## Documentation

| Document | Covers |
|----------|--------|
| [`docs/architecture.md`](./docs/architecture.md) | Data flow, routing, server state, URL-as-state, favourites |
| [`docs/filtering.md`](./docs/filtering.md) | Predicates, grooming buckets, the self-explaining empty state, similar breeds |
| [`docs/components.md`](./docs/components.md) | Props reference for every component |
| [`docs/conventions.md`](./docs/conventions.md) | CSS modules, design tokens, accessibility, testing, adding a filter |
| [`e2e/README.md`](./e2e/README.md) | The Playwright suite and its fixture contract |
