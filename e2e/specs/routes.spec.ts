import { expect, failBreedsRequest, test } from '../fixtures/test.ts'
import { BreedsListPage } from '../pages/BreedsListPage.ts'
import { BreedDetailPage } from '../pages/BreedDetailPage.ts'
import { TOTAL_BREEDS } from '../fixtures/breeds.ts'

test.describe('routes', () => {
  test('/ redirects to the breed list', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveURL('/breeds')
    await expect(page.getByText(`${TOTAL_BREEDS} of ${TOTAL_BREEDS} breeds`)).toBeVisible()
  })

  test('a card opens the breed it names', async ({ page }) => {
    const list = new BreedsListPage(page)
    const detail = new BreedDetailPage(page)
    await list.goto()

    await list.cardTitles.filter({ hasText: 'Bengal' }).click()

    await expect(page).toHaveURL('/breeds/beng')
    await expect(detail.heading).toHaveText('Bengal')
    await expect(detail.description).toBeVisible()
  })

  test('"Back to results" returns to the same filtered page', async ({ page }) => {
    const list = new BreedsListPage(page)
    const detail = new BreedDetailPage(page)
    await list.goto('?kids=4&page=2')

    // Cyprus is the first card of page 2 once kids 4+ narrows the list to 19.
    await list.cardTitles.filter({ hasText: 'Cyprus' }).click()
    await expect(page).toHaveURL(/\/breeds\/cypr/)

    await detail.backLink.click()

    await expect(page).toHaveURL(/kids=4/)
    await expect(page).toHaveURL(/page=2/)
    await expect(list.kidsOption('4+')).toHaveAttribute('aria-pressed', 'true')
  })

  test('a shared link restores every filter control', async ({ page }) => {
    const list = new BreedsListPage(page)
    await list.goto('?kids=4&grooming=1,2&traits=rare&origin=Greece&sort=name-desc')

    await expect(list.kidsOption('4+')).toHaveAttribute('aria-pressed', 'true')
    await expect(list.groomingOption('Low')).toBeChecked()
    await expect(list.traitOption('Rare')).toBeChecked()
    await expect(list.originSelect).toHaveValue('Greece')
    await expect(list.sortSelect).toHaveValue('name-desc')

    // Aegean is the only rare, Greek, low-grooming, kid-friendly breed.
    await expect(list.visibleNames()).resolves.toEqual(['Aegean'])
  })

  test('searching from a breed page lands back on the list', async ({ page }) => {
    const list = new BreedsListPage(page)
    await new BreedDetailPage(page).goto('beng')

    await list.searchInput.fill('korat')

    await expect(page).toHaveURL(/\/breeds\?/)
    await expect(page).toHaveURL(/q=korat/)
    await expect(list.visibleNames()).resolves.toEqual(['Korat'])
  })

  test('an unknown path renders the not-found page', async ({ page }) => {
    await page.goto('/no-such-page')

    await expect(page.getByRole('heading', { name: 'Not found' })).toBeVisible()
    await page.getByRole('link', { name: /Back to all breeds/ }).click()
    await expect(page).toHaveURL('/breeds')
  })

  test('an unknown breed id explains itself instead of blanking', async ({ page }) => {
    const detail = new BreedDetailPage(page)
    await detail.goto('nope')

    // React Query retries a failed fetch three times before giving up.
    await expect(page.getByText(/Could not load this breed/)).toBeVisible({ timeout: 20_000 })
    await expect(detail.backLink).toBeVisible()
  })

  test('a failing breed list shows an error, not an empty grid', async ({ page }) => {
    await failBreedsRequest(page)
    await page.goto('/breeds')

    await expect(page.getByText(/Something went wrong while loading breeds/)).toBeVisible({
      timeout: 20_000,
    })
  })
})
