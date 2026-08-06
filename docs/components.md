# Component reference

Two folders: `common/` is generic and knows nothing about cats; `breed/` works with the `Breed`
model. Each component sits in its own directory with its CSS module alongside.

Anything extending `ComponentPropsWithRef<'element'>` also accepts every native prop and a
`ref`, so only the additions are listed below.

---

## common/

### `Button`

Wraps `<button>` with `type="button"` by default — a stray submit inside the search form would
reload the page.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'bare'` | `'secondary'` | |

- **primary** — solid `--brand`. Reserved for the main action; see the colour grammar in
  [conventions.md](./conventions.md).
- **secondary** — bordered on `--surface`. The default because most buttons here are secondary.
- **ghost** — borderless, no padding, text-coloured. For link-like actions.
- **bare** — resets padding, border and background but keeps `color: inherit`. The base for
  controls that bring their own skin (`FavouriteButton`, `Lightbox` controls, chip removers).

Variants use `:where()`, so their specificity is zero and a caller's own class wins without a
fight — with one exception noted under CSS conventions.

### `Typography`

The only sanctioned way to render text. Maps a semantic variant to a default tag and a size.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `'display' \| 'title' \| 'heading' \| 'section' \| 'cardTitle' \| 'body' \| 'small'` | `'body'` | |
| `as` | `h1`–`h6`, `p`, `span`, `div`, `dt`, `dd`, `li`, `legend` | per variant | Overrides the tag without changing the look |
| `tone` | `'muted' \| 'strong'` | — | `--text-muted` / `--text` |
| `srOnly` | `boolean` | `false` | Visually hidden, still announced |

Default tags: `display`/`title`/`heading` → `h1`, `section`/`cardTitle` → `h2`, `body`/`small`
→ `p`. Use `as` when the heading level and the visual weight need to differ — a visually small
label that is structurally an `h2`, for example.

Restricted to text-level tags on purpose: they share one attribute surface, which keeps the
component non-generic. For a link, nest one inside an `<a>` as `BreedCard` does.

### `Input`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `'field' \| 'bare'` | `'field'` | `bare` drops padding, border and background |
| `onValueChange` | `(value: string) => void` | — | Fires alongside `onChange`, with the string |

`onValueChange` saves every call site from `event.target.value`. Both fire when both are given.

### `Select`

| Prop | Type | Notes |
|---|---|---|
| `onValueChange` | `(value: string) => void` | Same convention as `Input` |

Native appearance is stripped and a CSS caret drawn in its place, so the control does not read
as a read-only field.

### `SearchInput`

Debounced search box with a clear button, rendered inside a `role="search"` form.

| Prop | Type | Default |
|---|---|---|
| `value` | `string` | required |
| `onChange` | `(value: string) => void` | required |
| `onClear` | `() => void` | — |
| `placeholder` | `string` | `'Search breeds…'` |
| `delay` | `number` | `250` |

Keeps a local `draft` so typing stays responsive while `onChange` is debounced, and re-syncs
when `value` changes underneath it (the back button, or "Clear search" in the empty state).
Submitting the form or clearing cancels the pending debounce and commits immediately — without
that cancel, a stale keystroke would land after the clear.

`onClear` exists separately from `onChange('')` because clearing the box on a *detail* page must
not navigate you off the breed you are reading.

### `Pagination`

Renders nothing when there is one page or fewer.

| Prop | Type | Default |
|---|---|---|
| `totalCount` | `number` | required |
| `currentPage` | `number` | required |
| `onChange` | `(page: number) => void` | required |
| `perPage` | `number` | `12` |
| `maxButtons` | `number` | `10` |
| `showRange` | `boolean` | `false` |

Both call sites override `perPage` — 9 on the grid, 10 on favourites — so the default is
effectively unused. The window slides to keep the current page centred, clamped at both ends by
`getPageWindow`.

### `FilterChips`

One removable chip per active filter.

| Prop | Type |
|---|---|
| `filters` | `BreedFilters` |
| `onClear` | `(key: FilterKey) => void` |

Deliberately **excludes `q`**: the search box carries its own clear button, so a chip for it
would be a second control for one thing. Returns `null` when nothing is active.

### `FavouriteButton`

Self-contained — reads and writes the favourites store itself, so it needs no wiring.

| Prop | Type | Default |
|---|---|---|
| `breedId` | `string` | required |
| `breedName` | `string` | required |
| `withLabel` | `boolean` | `false` |

Carries `aria-pressed` and an accessible name that flips with state ("Add X to favourites" /
"Remove X from favourites"). The heart glyph is `aria-hidden`; `breedName` is what makes the
label unambiguous when several buttons share a page.

### `PhotoFallback`

Placeholder for a missing image. With a `label` it is announced; without one it is
`aria-hidden`, because an unlabelled decorative placeholder has nothing to say. Sized by
`font-size` — the icon is `1em` — so callers resize it with one property.

### `Lightbox`

Full-screen photo viewer on a native `<dialog>` with `showModal()`, which gives focus trapping
and Escape handling for free.

| Prop | Type |
|---|---|
| `images` | `CatImage[]` |
| `index` | `number` |
| `breedName` | `string` |
| `onClose` | `() => void` |
| `onIndexChange` | `(index: number) => void` |

Arrow keys navigate, a backdrop click closes, and the index wraps via `wrapIndex`. Neighbouring
images are preloaded on every index change so stepping through is instant. Navigation controls
are hidden entirely for a single image.

### `Header`

App bar on every route: the Catalogue wordmark, the shared `SearchInput`, and a favourites link
with a count badge. Searching from anywhere lands on `/breeds`.

---

## breed/

### `BreedList` / `BreedCard`

`BreedList` takes `breeds: Breed[]` and renders the responsive grid. `BreedCard` takes a single
`breed` and renders image, name, origin and two rating pills.

The whole card is clickable via a stretched `::after` on the link rather than by wrapping
everything in an `<a>` — that keeps the favourite button independently clickable instead of
nested inside a link. The focus ring is drawn on that pseudo-element, since a ring around the
inline title alone would not describe the target.

### `BreedFilters`

The sidebar panel.

| Prop | Type |
|---|---|
| `value` | `BreedFilters` |
| `onChange` | `(next: Partial<BreedFilters>) => void` |
| `origins` | `string[]` |

Emits **partial** updates — a control sends only what it changed. Each group is a `<fieldset>`
with a `<legend>`, which is what gives the e2e locators an unambiguous scope ("5" is both a kids
option and a page number).

### `BreedGallery` / `ThumbStrip`

Main photo plus up to four thumbnails, opening the `Lightbox` on click.
`buildThumbSlots` (`utils/thumbSlots.ts`) handles the overflow case: with more than four images
the last slot becomes a "+N" affordance, and once you are past the fourth photo that slot shows
the current one instead. Every slot carries its own accessible label describing exactly what it
does.

### `EmptyState` / `Explanation`

Renders *why* nothing matched and offers the narrowest fix. Props are in
`EmptyState/types.ts`: `breeds`, `filters`, and three handlers — `onClearFilter`,
`onClearFilters`, `onClearQuery`. The logic behind the three branches is in
[filtering.md](./filtering.md).

### `SimilarBreeds`

Given a breed and the full list, shows the closest matches by shared temperament with the count
of shared traits. Ranking is in [filtering.md](./filtering.md).
