import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { searchMiddlewares, validateSearch } from './routeSearch.ts'
import App from './App.tsx'
import { BreedsPage } from './pages/BreedsPage/BreedsPage.tsx'
import { BreedPage } from './pages/BreedPage/BreedPage.tsx'
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
})

const breedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/breeds/$breedId',
  component: BreedPage,
})

const routeTree = rootRoute.addChildren([indexRoute, breedsRoute, breedRoute])

export const router = createRouter({
  routeTree,
  context: { queryClient: undefined! },
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
