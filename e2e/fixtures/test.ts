import { test as base, expect } from '@playwright/test'
import type { BrowserContext, Page } from '@playwright/test'
import { BREEDS, breedById, breedImages } from './breeds.ts'

export const FAVOURITES_KEY = 'catalogue:favourites'

const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
)

interface CatalogueOptions {
  favourites: string[]
}

async function mockCatApi(context: BrowserContext) {
  await context.route(/api\.thecatapi\.com/, async (route) => {
    const url = new URL(route.request().url())
    const { pathname } = url

    if (pathname.endsWith('/breeds')) {
      return route.fulfill({ json: BREEDS })
    }

    if (pathname.includes('/images/search')) {
      const breedId = url.searchParams.get('breed_ids') ?? ''
      return route.fulfill({ json: breedImages(breedId) })
    }

    const breedId = pathname.split('/').pop() ?? ''
    const breed = breedById(breedId)

    return breed
      ? route.fulfill({ json: breed })
      : route.fulfill({ status: 404, json: { message: 'NOT_FOUND' } })
  })

  await context.route(/cdn2\.thecatapi\.com/, (route) =>
    route.fulfill({ contentType: 'image/png', body: PIXEL }),
  )
}

export const test = base.extend<CatalogueOptions>({
  favourites: [[], { option: true }],

  context: async ({ context, favourites }, use) => {
    await mockCatApi(context)
    await context.addInitScript(
      ([key, ids]) => {
        if (window.localStorage.getItem(key as string) === null) {
          window.localStorage.setItem(key as string, JSON.stringify(ids))
        }
      },
      [FAVOURITES_KEY, favourites] as const,
    )

    await use(context)
  },
})

export { expect }

export async function failBreedsRequest(page: Page) {
  await page.route(/api\.thecatapi\.com\/v1\/breeds$/, (route) =>
    route.fulfill({ status: 500, json: { message: 'BOOM' } }),
  )
}

export async function readFavourites(page: Page): Promise<string[]> {
  return page.evaluate(
    (key) => JSON.parse(window.localStorage.getItem(key) ?? '[]'),
    FAVOURITES_KEY,
  )
}
