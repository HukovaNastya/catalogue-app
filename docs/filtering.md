# Filtering, search and the empty state

Everything here lives in `src/utils/filterBreeds.ts` (pure functions), `src/routeSearch.ts` (the
URL contract) and `src/hooks/useBreedFilters.ts` (the read/write bridge). No component decides
what matches.

## The filter shape

```ts
interface BreedFilters {
  q: string;         // free text, matched against name and origin
  kids: number;      // minimum child_friendly rating; 0 means "any"
  grooming: number[]; // grooming levels that qualify, e.g. [1, 2]
  traits: Trait[];   // 'hypoallergenic' | 'rare'
  origin: string;    // exact country match
  sort: SortKey;     // 'name' | 'name-desc'
}
```

`sort` sits in the same object for convenience but is **not** a filter — `FilterKey` covers only
the five that narrow results. That distinction is load-bearing: it is why "Clear all" leaves the
ordering alone, and why `activeFilterKeys` never reports sort as active.

## Predicates

Each filter key owns one predicate in a `PREDICATES` record, and `applyBreedFilters` requires
**every** one to pass — filters stack as AND, never OR:

```ts
const matches = breeds.filter((breed) =>
  FILTER_KEYS.every((key) => PREDICATES[key](breed, filters)),
);
return sortBreeds(matches, filters.sort);
```

Each predicate short-circuits to `true` when its filter is inactive, so an empty filter set
matches everything without a special case.

**Keeping them as separate functions instead of one fused `.filter()` chain is deliberate.** It
is what makes it possible to subtract exactly one filter and re-run the rest — the trick the
empty state depends on.

Note the trait predicate uses `.every()`, so selecting both Hypoallergenic and Rare asks for
breeds that are both, not either. In the test fixture no breed satisfies both, which is exactly
what the "traits stack as AND, not OR" spec pins.

## Active vs. empty

`EMPTY_FILTERS` is the canonical "off" value for every key, and `isFilterActive` compares
against it — arrays by length, scalars by inequality. Everything else derives from that one
definition:

- `activeFilterKeys(filters)` — which filters are on. Drives the chips, the "Clear all" button's
  visibility, and the blocking-filter search.
- `clearFilter(key)` in the hook writes `EMPTY_FILTERS[key]` back.
- `clearFilters()` writes the empty value for all five, leaving `sort` untouched.

Add a filter and you touch `PREDICATES`, `EMPTY_FILTERS`, `filterLabel` and the URL schema —
the rest follows automatically.

## Grooming buckets

The sidebar offers Low / Medium / High, but the URL carries raw levels:

| Bucket | Levels | URL |
|---|---|---|
| Low | 1, 2 | `grooming=1,2` |
| Medium | 3 | `grooming=3` |
| High | 4, 5 | `grooming=4,5` |

Checking several buckets **unions** their levels rather than intersecting them — Low + High is
`grooming=1,2,4,5`, because they are levels of one attribute and a breed has exactly one. The
URL is the source of truth, so a hand-written `?grooming=3,4` works even though no single bucket
produces it. `groomingLabel` converts back for display, with `≤2` and `4+` as friendly names for
the two bucket ranges and a `·`-joined list for anything else.

## Why an empty result can explain itself

A bare "no results" is useless when three filters are active. Two helpers turn it into a
diagnosis:

**`findBlockingFilters(breeds, filters)`** — for each active filter except `q`, re-runs the whole
pipeline with *that one* filter cleared. If results come back, that filter is a blocker. It
returns every such filter, so the UI can offer "remove this one" for each.

**`matchesQueryOnly(breeds, filters)`** — runs the search term against an otherwise empty filter
set. This separates *"no breed is called that"* from *"that breed exists but your filters hide
it"*.

`Explanation.tsx` picks one of three messages from those two signals:

| Condition | Message | Offered action |
|---|---|---|
| Blockers exist, and either no query or the query matches | "No breeds match kids 5+ or rare." / "'Bengal' exists, but it is filtered out by kids 5+." | Clear each blocker individually |
| A query that matches nothing | "No breeds match 'zzz'." | Clear search |
| Neither — no single filter unblocks it | "No breeds match these filters." | Clear filters |

The third branch is the honest fallback: when no *single* filter is responsible, the app says so
rather than guessing.

## The URL contract

`routeSearch.ts` is the boundary where untrusted strings become typed filters. `validateSearch`
**normalises rather than throws** — every param has a default, and anything unrecognised falls
back to it:

| Param | Normalisation |
|---|---|
| `q` | Trimmed; non-strings become `''` |
| `page` | Finite integers ≥ 1, else `1` |
| `kids` | Must be one of `KIDS_OPTIONS` (3, 4, 5), else `0` |
| `grooming` | Split on commas, integers 1–5 only, deduped, sorted |
| `traits` | Split on commas, known trait ids only, deduped |
| `origin` | Trimmed string |
| `sort` | `name-desc` or `name` |

So `?kids=99&grooming=9,foo,2,2&traits=bogus&sort=weird` becomes `?grooming=2` — the one
salvageable value — and renders a normal filtered page. There is an e2e test pinning exactly
this.

`useBreedFilters` then parses the flat string params into the typed `BreedFilters` object,
memoised on the **primitive** params rather than the object, so a re-render does not produce a
fresh object and invalidate every downstream memo.

## Similar breeds

`findSimilarBreeds` (`utils/similarBreeds.ts`) is unrelated to the filter pipeline but works on
the same in-memory array. It compares comma-separated `temperament` strings and ranks candidates
by, in order:

1. Number of shared traits (descending)
2. Jaccard ratio — `shared / union` — which breaks ties in favour of breeds that are *mostly*
   similar rather than merely long-winded
3. Name, alphabetically, so the result is deterministic

Without step 2, a breed listing fifteen temperament words would outrank a genuinely close match
simply by overlapping more.
