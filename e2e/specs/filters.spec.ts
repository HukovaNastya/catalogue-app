import { expect, test } from '../fixtures/test.ts'
import { BreedsListPage } from '../pages/BreedsListPage.ts'
import { NAMES_ASC, TOTAL_BREEDS } from '../fixtures/breeds.ts'

/** Commas survive as %2C in the address bar; assert against the readable form. */
function search(url: string): string {
  return decodeURIComponent(new URL(url).search)
}

test.describe('filters', () => {
  test('kids narrows the list, and pressing it again clears it', async ({ page }) => {
    const list = new BreedsListPage(page)
    await list.goto()
    await expect(list.resultCount).toHaveText(`${TOTAL_BREEDS} of ${TOTAL_BREEDS} breeds`)

    await list.kidsOption('4+').click()

    await expect(page).toHaveURL(/kids=4/)
    await expect(list.kidsOption('4+')).toHaveAttribute('aria-pressed', 'true')
    await expect(list.resultCount).toHaveText(`19 of ${TOTAL_BREEDS} breeds`)
    await expect(list.chipRemove('kids 4+')).toBeVisible()

    // The active option is the only way back to "any" without touching a chip.
    await list.kidsOption('4+').click()

    await expect(page).not.toHaveURL(/kids=/)
    await expect(list.resultCount).toHaveText(`${TOTAL_BREEDS} of ${TOTAL_BREEDS} breeds`)
  })

  test('a grooming bucket writes the levels it stands for', async ({ page }) => {
    const list = new BreedsListPage(page)
    await list.goto()

    await list.groomingOption('Low').check()

    expect(search(page.url())).toContain('grooming=1,2')
    await expect(list.resultCount).toHaveText(`17 of ${TOTAL_BREEDS} breeds`)
    await expect(list.chipRemove('grooming ≤2')).toBeVisible()

    await list.groomingOption('High').check()

    // Levels of one attribute, so the buckets add up rather than intersect.
    expect(search(page.url())).toContain('grooming=1,2,4,5')
    await expect(list.resultCount).toHaveText(`20 of ${TOTAL_BREEDS} breeds`)
  })

  test('traits stack as AND, not OR', async ({ page }) => {
    const list = new BreedsListPage(page)
    await list.goto()

    await list.traitOption('Hypoallergenic').check()
    await expect(list.resultCount).toHaveText(`5 of ${TOTAL_BREEDS} breeds`)

    await list.traitOption('Rare').check()

    expect(search(page.url())).toContain('traits=hypoallergenic,rare')
    // No fixture breed is both, so the pair has to come back empty.
    await expect(list.resultCount).toHaveText(`0 of ${TOTAL_BREEDS} breeds`)
  })

  test('origin filters down to one breed', async ({ page }) => {
    const list = new BreedsListPage(page)
    await list.goto()

    await list.originSelect.selectOption('Greece')

    await expect(page).toHaveURL(/origin=Greece/)
    await expect(list.visibleNames()).resolves.toEqual(['Aegean'])
  })

  test('sort flips the order without changing the result set', async ({ page }) => {
    const list = new BreedsListPage(page)
    await list.goto()
    await expect(list.cardTitles.first()).toHaveText(NAMES_ASC[0])

    await list.sortSelect.selectOption('name-desc')

    await expect(page).toHaveURL(/sort=name-desc/)
    await expect(list.cardTitles.first()).toHaveText(NAMES_ASC[NAMES_ASC.length - 1])
    await expect(list.resultCount).toHaveText(`${TOTAL_BREEDS} of ${TOTAL_BREEDS} breeds`)
  })

  test('a chip removes only its own filter', async ({ page }) => {
    const list = new BreedsListPage(page)
    await list.goto('?kids=4&traits=rare')
    await expect(list.resultCount).toHaveText(`2 of ${TOTAL_BREEDS} breeds`)

    await list.chipRemove('kids 4+').click()

    await expect(page).not.toHaveURL(/kids=/)
    await expect(page).toHaveURL(/traits=rare/)
    await expect(list.resultCount).toHaveText(`5 of ${TOTAL_BREEDS} breeds`)
  })

  test('changing a filter drops you back to page 1', async ({ page }) => {
    const list = new BreedsListPage(page)
    await list.goto('?page=3')
    await expect(list.cardTitles.first()).toHaveText(NAMES_ASC[18])

    await list.kidsOption('4+').click()

    await expect(page).not.toHaveURL(/page=/)
    await expect(list.cardTitles.first()).toHaveText(NAMES_ASC[0])
  })

  test('search matches name or origin, and clears again', async ({ page }) => {
    const list = new BreedsListPage(page)
    await list.goto()

    await list.searchInput.fill('burm')

    await expect(page).toHaveURL(/q=burm/)
    // Bombay is in on origin (Burma) alone.
    await expect(list.visibleNames()).resolves.toEqual([
      'Bombay',
      'Burmese',
      'European Burmese',
    ])

    await list.clearSearchButton.click()

    await expect(page).not.toHaveURL(/q=/)
    await expect(list.resultCount).toHaveText(`${TOTAL_BREEDS} of ${TOTAL_BREEDS} breeds`)
  })

  test('a hand-edited URL degrades to "no filter"', async ({ page }) => {
    const list = new BreedsListPage(page)
    await list.goto('?kids=99&grooming=9,foo,2,2&traits=bogus&sort=weird')

    // Only the one valid grooming level survives; everything else is dropped.
    await expect(list.resultCount).toHaveText(`10 of ${TOTAL_BREEDS} breeds`)
    await expect(list.kidsOption('5')).toHaveAttribute('aria-pressed', 'false')
    await expect(list.traitOption('Rare')).not.toBeChecked()
    await expect(list.sortSelect).toHaveValue('name')
  })

  test.describe('empty results explain themselves', () => {
    test('names the filters to blame and clears one of them', async ({ page }) => {
      const list = new BreedsListPage(page)
      await list.goto('?kids=5&traits=rare')

      await expect(page.getByText('No breeds match kids 5+ or rare.')).toBeVisible()

      await list.emptyStateButton('Clear rare').click()

      await expect(list.resultCount).toHaveText(`6 of ${TOTAL_BREEDS} breeds`)
      await expect(list.cards).toHaveCount(6)
    })

    test('blames the search term when nothing matches it', async ({ page }) => {
      const list = new BreedsListPage(page)
      await list.goto('?q=zzz')

      await expect(page.getByText('No breeds match “zzz”.')).toBeVisible()

      await list.emptyStateButton('Clear search').click()

      await expect(list.resultCount).toHaveText(`${TOTAL_BREEDS} of ${TOTAL_BREEDS} breeds`)
    })

    test('separates "does not exist" from "filtered out"', async ({ page }) => {
      const list = new BreedsListPage(page)
      await list.goto('?q=Bengal&kids=5')

      await expect(
        page.getByText('“Bengal” exists, but it is filtered out by kids 5+.'),
      ).toBeVisible()

      await list.emptyStateButton('Clear kids 5+').click()

      await expect(list.visibleNames()).resolves.toEqual(['Bengal'])
    })
  })
})
