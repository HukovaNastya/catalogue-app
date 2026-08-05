# Getting Started with Catalogue App

A cat breed catalogue built with React 19, TypeScript and Vite. Breed data comes from
[TheCatAPI](https://thecatapi.com/), is fetched with TanStack Query and browsed through a
searchable, paginated grid. Search text and page number live in the URL, so any view can be
shared or bookmarked.

### Create .env file at the project root folder with environment variables as in the table.

| Environmental variable | Value                                                                                              |
|------------------------|----------------------------------------------------------------------------------------------------|
| VITE_BASE_URL          | https://api.thecatapi.com/v1                                                                        |
| VITE_API_KEY           | TheCatAPI key — request a free one at [thecatapi.com](https://thecatapi.com/signup). Sent as the `x-api-key` header; omit it and the API answers with stricter rate limits. |

> `.env` is ignored by git — never commit your API key. Share new variables through this table instead.

## Available Scripts

In the project directory:

### `npm install` - installs node modules

### `npm run dev` - runs the application in the development mode.

Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

The page will reload when you make changes.

### `npm run build` - type-checks the project (`tsc -b`) and builds it for production into the `dist` folder.

### `npm run preview` - serves the production build locally so it can be checked before deploy.

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
| `/breeds`           | Breed grid. Accepts `?q=` (search) and `?page=` (1-based) params     |
| `/breeds/:breedId`  | Details of a single breed                                           |

## Project structure

```
src/
├── components/   BreedCard, Header, Pagination, SearchInput (CSS modules alongside)
├── hooks/        useBreeds, useBreed, useBreedsParams, useDebouncedCallback
├── pages/        BreedsPage, BreedPage, ErrorPage
├── services/     TheCatAPI client and models
└── utils/        breed filtering, pagination maths, helpers
```

## How it works

- **Search** filters the loaded breed list by name or origin, debounced while typing.
- **Pagination** is client-side, 12 breeds per page, with a sliding window of up to 10 page buttons.
- **URL is the state** — `useBreedsParams` owns `q` and `page`; changing the query resets the page
  back to 1 so a narrowed result set never lands on an empty page.
- **Caching** is handled by TanStack Query; breeds are fetched once and reused across pages.
