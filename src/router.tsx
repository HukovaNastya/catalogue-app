import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { searchMiddlewares, validateSearch } from './routeSearch.ts'
import {
  breedImagesQuery,
  breedQuery,
  breedsQuery,
} from './services/cat/cat.queries.ts'
import App from './App.tsx'
import { BreedsPage } from './pages/BreedsPage/BreedsPage.tsx'
import { BreedPage } from './pages/BreedPage/BreedPage.tsx'
import { FavouritesPage } from './pages/FavouritesPage/FavouritesPage.tsx'
import { ErrorPage, NotFoundPage } from './pages/ErrorPage/ErrorPage.tsx'

export interface RouterContext {
  queryClient: QueryClient
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: App,
  errorComponent: ErrorPage,
  notFoundComponent: NotFoundPage,
  validateSearch,
  search: { middlewares: searchMiddlewares },
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/breeds', replace: true })
  },
})

// Loaders below deliberately do not await. Awaiting would hold the navigation
// until the data landed — the user would sit on the previous screen with
// nothing happening. Kicking the requests off lets the page mount immediately
// and the existing skeletons cover the gap. prefetchQuery (rather than
// ensureQueryData) never throws, so a failed fetch cannot break navigation.
const breedsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/breeds',
  component: BreedsPage,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(breedsQuery())
  },
})

const breedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/breeds/$breedId',
  component: BreedPage,
  loader: ({ context, params }) => {
    // Images first: the breed itself is usually already cached from the list,
    // so the gallery is the only thing the user actually waits on.
    context.queryClient.prefetchQuery(breedImagesQuery(params.breedId))
    context.queryClient.prefetchQuery(breedQuery(params.breedId))
  },
})

const favouritesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/favourites',
  component: FavouritesPage,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(breedsQuery())
  },
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  breedsRoute,
  breedRoute,
  favouritesRoute,
])

export const router = createRouter({
  routeTree,
  context: { queryClient: undefined! },
  defaultPreload: 'intent',
  // Zero hands caching back to React Query. The router keeps its own 30s
  // preload cache by default, which would sit in front of the staleTimes
  // configured in cat.queries.ts and shadow them.
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
