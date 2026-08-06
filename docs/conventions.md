# Conventions

The rules a change should follow to look like it belongs. Most exist because of a specific
failure they prevent.

## CSS modules

Every component has a `.module.css` beside it. Class names are local, so they stay short and
descriptive (`.card`, `.chip`, `.count`) — never BEM-style prefixes.

### Zero-specificity variants

`Button`, `Input` and `Select` define their variants inside `:where()`:

```css
:where(.primary, .secondary) { … }
```

`:where()` contributes **nothing** to specificity, so a caller's own class always wins without
`!important` and without escalation. That is what lets `FavouriteButton` build a pill on top of
`bare`, and `SearchInput` reshape the clear button on top of `ghost`.

### Scoping to beat another module

When two CSS modules style the same element, equal specificity is decided by **bundle order**,
which is not guaranteed. Never rely on it. Add a parent class to win outright:

```css
/* Scoped to `.head` so it outranks Typography's `section` margin whatever
   order the two CSS modules land in. */
.head .heading { margin: 0; }
```

The codebase does this in five places, each with a comment saying which rule it is beating:
`SimilarBreeds` `.head .heading`, `ThumbStrip` `.thumb .thumbFallback`, `SimilarBreeds`
`.chip .thumbFallback`, `FavouriteButton` `.button .icon`, and `Header` `.brand .brandWord`.

The trap to watch for: `:where()` zeroes out only what is inside it. `:where(.ghost):hover:not(:disabled)`
still scores (0,2,0) from the `:hover` and `:not()` outside — a bare caller class at (0,1,0)
loses to it. Scope those too.

### Design tokens

All colour and geometry comes from the token block at the top of `src/index.css`:

- **Ramps** — `--brand-*` (slate indigo), `--n-*` (warm neutrals).
- **Roles** — `--page`, `--surface`, `--border`, `--border-hover`, `--text`, `--text-muted`,
  `--text-subtle`, `--rating-filled`, `--rating-empty`, `--focus-ring`.
- **Geometry** — `--radius-xs` … `--radius-lg`.

**Read the role layer, not the ramp, whenever a role fits.** The ramp is used directly only for
image wells and skeletons (`--n-100`, `--n-50`) and for text on solid brand (`--n-0`), which have
no role of their own. A raw hex in a component is what turns a future dark theme from a value
swap into a refactor.

Two rules the palette encodes, both worth preserving:

- **`--brand` means interaction or state** — buttons, the current page, active controls. Ratings
  use `--rating-filled`, a lighter indigo, so data never reads as clickable. Keeping the two one
  step apart is what leaves `--warning` free to mean an actual warning.
- **Cards sit on `--surface` against `--page`.** That two-step separation is what makes the grid
  read as cards without shadows.

Focus is one shared treatment: a global `*:focus-visible` box-shadow using `--focus-ring`. Do not
add per-component focus outlines — they double up with it. The two exceptions both document why:
`BreedCard` moves the ring onto its stretched `::after`, and `Lightbox` goes white because the
tinted ring vanishes against a black backdrop.

## Components

- **Never render a bare `<p>` or `<span>` for text.** Use `Typography` — it owns the size, weight
  and colour scale. Raw tags drift.
- **Never render a bare `<button>`, `<input>` or `<select>`.** Use the wrappers; they carry
  `type="button"`, the appearance reset and the `onValueChange` convention.
- **Prefer `onValueChange` over `onChange`** in call sites — it hands you the string instead of
  an event.
- **Keep pure logic in `utils/`.** Anything that decides *what matches* or *what order* belongs
  there, not in a component. It is where the tests can reach it and where the empty state can
  re-run it.
- **Emit partial updates** from filter controls (`onChange({ kids: 4 })`), letting the hook merge.

## Accessibility

Not decoration — the e2e suite navigates entirely by accessible names, so breaking one breaks
tests.

- Every interactive element has an accessible name. Where a glyph carries the meaning (♡, ×, →),
  the glyph is `aria-hidden` and the name comes from `aria-label`.
- Names are **unambiguous across the page**: "Remove Bengal from favourites", not "Remove".
- Toggles use `aria-pressed`; the current page uses `aria-current="page"`.
- Filter groups are `<fieldset>` + `<legend>`, which gives them a `group` role with a name.
- Live counts carry `aria-live="polite"`, so filtering announces the new total.
- Visually hidden text uses `<Typography srOnly>` rather than a local class — the favourites
  badge reads "3 saved" instead of a bare "3".

## Testing

Playwright only; there is no unit-test layer. See [`e2e/README.md`](../e2e/README.md) for the
fixture contract.

- **Locate by role and accessible name**, never by CSS-module class — those are hashed at build
  time and say nothing about behaviour.
- **Add locators to the page object**, not inline in a spec.
- **Assert outcomes, never timing.** Search is debounced and loaders do not await, so
  `toHaveURL`/`toHaveText` retry where a `waitForTimeout` would just be slow and flaky.
- **Watch for name collisions.** Two buttons can legitimately say "Clear search" — one in the
  header, one in the empty state — so scope the locator or filter by visible text. This is why
  the filter-bar reset says "Clear all" rather than "Clear filters", which the empty state
  already uses.

## Adding a filter

The full checklist, in dependency order:

1. `utils/filterBreeds.ts` — add the key to `BreedFilters` and `FilterKey`, a predicate to
   `PREDICATES`, an off-value to `EMPTY_FILTERS`, and a case to `filterLabel`.
2. `routeSearch.ts` — add the param to `AppSearch`, `DEFAULT_SEARCH`, and a normalisation branch
   in `validateSearch`.
3. `useBreedFilters.ts` — parse it in the `filters` memo, and serialise it if it is an array.
4. `BreedFilters.tsx` — add the control.
5. `e2e/` — add a locator to `BreedsListPage` and a spec.

Chips, "Clear all", the blocking-filter explanation and the active-filter count all derive from
`activeFilterKeys`, so they pick the new filter up with no further work.
