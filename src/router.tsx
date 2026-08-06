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
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
