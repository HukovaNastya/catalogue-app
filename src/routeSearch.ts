import { retainSearchParams, stripSearchParams } from '@tanstack/react-router';
import type {
  SearchMiddleware,
  SearchSchemaInput,
} from '@tanstack/react-router';

export interface AppSearch {
  q: string;
  page: number;
}

export const DEFAULT_SEARCH: AppSearch = { q: '', page: 1 };

export function validateSearch(
  search: { q?: string; page?: number } & SearchSchemaInput,
): AppSearch {
  const rawPage = Number(search.page);

  return {
    q: typeof search.q === 'string' ? search.q.trim() : '',
    page: Number.isFinite(rawPage) && rawPage >= 1 ? Math.trunc(rawPage) : 1,
  };
}

export const searchMiddlewares: SearchMiddleware<AppSearch>[] = [
  stripSearchParams(DEFAULT_SEARCH),
  retainSearchParams(['q', 'page']),
];
