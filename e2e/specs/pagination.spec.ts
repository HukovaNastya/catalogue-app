import { expect, test } from '../fixtures/test.ts'
import { BreedsListPage } from '../pages/BreedsListPage.ts'
import { FavouritesPage } from '../pages/FavouritesPage.ts'
import { NAMES_ASC, TWELVE_FAVOURITE_IDS } from '../fixtures/breeds.ts'

const LAST_PAGE = 3
const LAST_PAGE_SIZE = 7

test.describe('pagination', () => {
  test('splits the catalogue 9 to a page', async ({ page }) => {
    const list = new BreedsListPage(page)
    await list.goto()

    await expect(list.cards).toHaveCount(9)
    await expect(list.pageButtons).toHaveCount(LAST_PAGE)
    await expect(list.visibleNames()).resolves.toEqual(NAMES_ASC.slice(0, 9))
  })

  test('the ends of the range disable their arrow', async ({ page }) => {
    const list = new BreedsListPage(page)
    await list.goto()

    await expect(list.prevButton).toBeDisabled()
    await expect(list.nextButton).toBeEnabled()

    await list.pageButton(LAST_PAGE).click()

    await expect(list.nextButton).toBeDisabled()
    await expect(list.prevButton).toBeEnabled()
    await expect(list.cards).toHaveCount(LAST_PAGE_SIZE)
  })

  test('a page button marks itself current and swaps the cards', async ({ page }) => {
    const list = new BreedsListPage(page)
    await list.goto()

    await list.pageButton(2).click()

    await expect(page).toHaveURL(/page=2/)
    await expect(list.pageButton(2)).toHaveAttribute('aria-current', 'page')
    await expect(list.pageButton(1)).not.toHaveAttribute('aria-current', 'page')
    await expect(list.visibleNames()).resolves.toEqual(NAMES_ASC.slice(9, 18))
  })

  test('the arrows walk one page at a time', async ({ page }) => {
    const list = new BreedsListPage(page)
    await list.goto('?page=2')

    await list.nextButton.click()
    await expect(page).toHaveURL(/page=3/)
    await expect(list.visibleNames()).resolves.toEqual(NAMES_ASC.slice(18))

    await list.prevButton.click()
    await expect(page).toHaveURL(/page=2/)

    await list.prevButton.click()
    await expect(page).not.toHaveURL(/page=/)
  })

  test('a page number past the end clamps to the last page', async ({ page }) => {
    const list = new BreedsListPage(page)
    await list.goto('?page=999')

    await expect(list.cards).toHaveCount(LAST_PAGE_SIZE)
    await expect(list.pageButton(LAST_PAGE)).toHaveAttribute('aria-current', 'page')
  })

  test('a filter that leaves one page hides the control entirely', async ({ page }) => {
    const list = new BreedsListPage(page)
    await list.goto()
    await expect(list.pagination).toBeVisible()

    await list.originSelect.selectOption('Greece')

    await expect(list.cards).toHaveCount(1)
    await expect(list.pagination).toBeHidden()
  })

  test.describe('on the favourites page', () => {
    test.use({ favourites: TWELVE_FAVOURITE_IDS })

    test('pages at 10 rather than 9', async ({ page }) => {
      const favourites = new FavouritesPage(page)
      await favourites.goto()

      await expect(favourites.savedCount).toHaveText('12 saved breeds')
      await expect(favourites.cards).toHaveCount(10)
      await expect(favourites.pageButtons).toHaveCount(2)

      await favourites.pageButton(2).click()

      await expect(favourites.cards).toHaveCount(2)
    })
  })
})
