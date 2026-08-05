import { expect, readFavourites, test } from '../fixtures/test.ts'
import { BreedsListPage } from '../pages/BreedsListPage.ts'
import { BreedDetailPage } from '../pages/BreedDetailPage.ts'
import { FavouritesPage } from '../pages/FavouritesPage.ts'

test.describe('favourites', () => {
  test('the heart saves a breed and counts it in the header', async ({ page }) => {
    const list = new BreedsListPage(page)
    await list.goto()
    await expect(list.favouritesLink).not.toContainText('saved')

    await list.favouriteToggle('Bengal').click()

    await expect(list.favouriteToggle('Bengal')).toHaveAttribute('aria-pressed', 'true')
    await expect(list.favouritesLink).toContainText('1 saved')
    await expect(readFavourites(page)).resolves.toEqual(['beng'])
  })

  test('a saved breed survives a reload', async ({ page }) => {
    const list = new BreedsListPage(page)
    await list.goto()
    await list.favouriteToggle('Bengal').click()
    await expect(list.favouritesLink).toContainText('1 saved')

    await page.reload()

    await expect(list.favouriteToggle('Bengal')).toHaveAttribute('aria-pressed', 'true')
    await expect(list.favouritesLink).toContainText('1 saved')
  })

  test.describe('with one breed already saved', () => {
    test.use({ favourites: ['abys'] })

    test('the newest save goes to the top of the list', async ({ page }) => {
      const list = new BreedsListPage(page)
      const favourites = new FavouritesPage(page)
      await list.goto()

      await list.favouriteToggle('Bengal').click()
      await favourites.goto()

      await expect(favourites.savedCount).toHaveText('2 saved breeds')
      await expect(favourites.visibleNames()).resolves.toEqual(['Bengal', 'Abyssinian'])
    })

    test('unsaving from the favourites page drops the card immediately', async ({ page }) => {
      const favourites = new FavouritesPage(page)
      await favourites.goto()
      await expect(favourites.cards).toHaveCount(1)

      await favourites.favouriteToggle('Abyssinian').click()

      await expect(favourites.cards).toHaveCount(0)
      await expect(favourites.emptyMessage).toBeVisible()
      await expect(readFavourites(page)).resolves.toEqual([])
    })

    test('"Clear all" empties the page and offers a way back', async ({ page }) => {
      const favourites = new FavouritesPage(page)
      await favourites.goto()

      await favourites.clearAllButton.click()

      await expect(favourites.savedCount).toHaveText('0 saved breeds')
      await expect(favourites.emptyMessage).toBeVisible()
      await expect(favourites.clearAllButton).toBeHidden()

      await favourites.browseLink.click()
      await expect(page).toHaveURL(/\/breeds/)
    })
  })

  test('the detail page and the card share one saved state', async ({ page }) => {
    const list = new BreedsListPage(page)
    const detail = new BreedDetailPage(page)
    await detail.goto('beng')

    await detail.favouriteButton.click()

    await expect(detail.favouriteButton).toHaveAttribute('aria-pressed', 'true')
    await expect(detail.favouriteButton).toContainText('Saved')

    await list.goto()

    await expect(list.favouriteToggle('Bengal')).toHaveAttribute('aria-pressed', 'true')
  })

  test('an empty favourites page explains itself', async ({ page }) => {
    const favourites = new FavouritesPage(page)
    await favourites.goto()

    await expect(favourites.emptyMessage).toBeVisible()
    await expect(favourites.cards).toHaveCount(0)
    await expect(favourites.pagination).toBeHidden()
  })

  test('a second tab picks up the change', async ({ context, page }) => {
    const list = new BreedsListPage(page)
    const other = await context.newPage()
    const favourites = new FavouritesPage(other)
    await favourites.goto()
    await expect(favourites.emptyMessage).toBeVisible()

    await list.goto()
    await list.favouriteToggle('Bengal').click()

    // favourites.store.ts listens for the storage event, which only fires in
    // the *other* tabs.
    await expect(favourites.savedCount).toHaveText('1 saved breed')
    await expect(favourites.visibleNames()).resolves.toEqual(['Bengal'])
  })
})
