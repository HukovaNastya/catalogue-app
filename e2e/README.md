# End-to-end tests

Playwright drives the built app against a mocked TheCatAPI. No API key, no
network, no rate limit — and because the fixture never changes, every count in
an assertion is exact.

```
npm run test:e2e          # headless run (builds + serves the app for you)
npm run test:e2e:ui       # watch mode, time-travel debugger
npm run test:e2e:headed   # watch it drive a real window
npm run test:e2e:report   # open the last HTML report
npm run test:e2e:types    # type-check the tests alone
```

`playwright.config.ts` starts `vite preview` on port 4173 — the production
build, not the dev server, so there is no HMR socket reconnecting mid-test. A
server already listening on that port is reused locally and never in CI.

## Layout

| Path | What it holds |
|------|---------------|
| `fixtures/breeds.ts` | The 25 fixture breeds and the counts derived from them |
| `fixtures/test.ts` | The extended `test` — API mocking, seeded favourites, helpers |
| `pages/` | Page objects: `BreedsListPage`, `FavouritesPage`, `BreedDetailPage` |
| `specs/` | The tests themselves, one file per feature area |

Locators go through roles and accessible names (`getByRole('group', { name:
'Good with kids' })`), never CSS-module classes — those are hashed at build
time and say nothing about behaviour. Where a name is ambiguous the locator is
scoped to its `<fieldset>` or `<nav>` rather than made positional: a bare "5" is
both a kids option and page 5.

## The fixture is the contract

`applyBreedFilters` runs client-side over one `/v1/breeds` response, so that
response decides every number the specs assert. The invariants the tests lean
on:

| Property | Value | Used by |
|----------|-------|---------|
| Total breeds | 25 → 3 pages at 9 | pagination, every count |
| kids ≥3 / ≥4 / ≥5 | 25 / 19 / 6 | filters, empty states |
| grooming Low `[1,2]` / Medium `[3]` / High `[4,5]` | 17 / 5 / 3 | filters |
| hypoallergenic / rare | 5 / 5, **no breed is both** | traits stack as AND |
| rare ∩ kids 5 | empty | "no breeds match kids 5+ or rare" |
| Greece | exactly 1 breed (Aegean) | origin filter, single-page pagination |
| Bengal | matches search, but kids 4 | "exists, but is filtered out" |

Change a row in `ROWS` and the counts move with it. The comment block above the
table lists the same invariants next to the data.

## Favourites

They are plain `localStorage` under `catalogue:favourites`. Seed them per test
or per describe block:

```ts
test.use({ favourites: ['beng', 'abys'] })  // index 0 = most recently saved
```

The seeding init script runs before every navigation, so it only writes when the
key is **absent** — otherwise a reload would undo whatever the test just saved.

## Adding a test

1. Reach for an existing page object; add a locator there rather than inline.
2. Assert on outcomes, never on timing. Search is debounced 250 ms and the route
   loaders deliberately do not await — `toHaveURL` and `toHaveText` retry, a
   `waitForTimeout` just makes the suite slow and flaky.
3. If the case needs data the fixture cannot express, add a row to `ROWS` and
   update the table above.

Two tests carry a 20-second timeout on purpose: React Query retries a failed
request three times with backoff, so the error branches take about seven seconds
to appear.
