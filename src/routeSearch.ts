import { retainSearchParams, stripSearchParams } from '@tanstack/react-router';
import type {
  SearchMiddleware,
  SearchSchemaInput,
} from '@tanstack/react-router';
import { KIDS_OPTIONS, TRAIT_OPTIONS } from './utils/filterBreeds.ts';
import type { SortKey, Trait } from './utils/filterBreeds.ts';

export interface AppSearch {
  q: string;
  page: number;
  kids: number;
  grooming: string;
  traits: string;
  origin: string;
  sort: SortKey;
}

export const DEFAULT_SEARCH: AppSearch = {
  q: '',
  page: 1,
  kids: 0,
  grooming: '',
  traits: '',
  origin: '',
  sort: 'name',
};

const SEARCH_KEYS = Object.keys(DEFAULT_SEARCH) as (keyof AppSearch)[];

const TRAIT_IDS = TRAIT_OPTIONS.map((trait) => trait.id) as string[];

function parseList(raw: unknown): string[] {
  if (typeof raw !== 'string' || raw === '') return [];
  return raw.split(',').map((part) => part.trim());
}

function normaliseGrooming(raw: unknown): string {
  const levels = parseList(raw)
    .map(Number)
    .filter((level) => Number.isInteger(level) && level >= 1 && level <= 5);

  return [...new Set(levels)].sort((a, b) => a - b).join(',');
}

function normaliseTraits(raw: unknown): string {
  const traits = parseList(raw).filter((trait) => TRAIT_IDS.includes(trait));
  return [...new Set(traits)].join(',');
}

export function validateSearch(
  search: {
    q?: string;
    page?: number;
    kids?: number;
    grooming?: string;
    traits?: string;
    origin?: string;
    sort?: string;
  } & SearchSchemaInput,
): AppSearch {
  const rawPage = Number(search.page);
  const rawKids = Number(search.kids);

  return {
    q: typeof search.q === 'string' ? search.q.trim() : '',
    page: Number.isFinite(rawPage) && rawPage >= 1 ? Math.trunc(rawPage) : 1,
    kids: (KIDS_OPTIONS as readonly number[]).includes(rawKids) ? rawKids : 0,
    grooming: normaliseGrooming(search.grooming),
    traits: normaliseTraits(search.traits),
    origin: typeof search.origin === 'string' ? search.origin.trim() : '',
    sort: search.sort === 'name-desc' ? 'name-desc' : 'name',
  };
}

export const searchMiddlewares: SearchMiddleware<AppSearch>[] = [
  stripSearchParams(DEFAULT_SEARCH),
  retainSearchParams(SEARCH_KEYS),
];

export type { SortKey, Trait };
