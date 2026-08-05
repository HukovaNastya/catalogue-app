import type { Locator, Page } from '@playwright/test'

/** A single breed's page: /breeds/$breedId. */
export class BreedDetailPage {
  readonly page: Page

  readonly heading: Locator
  readonly backLink: Locator
  readonly favouriteButton: Locator
  readonly description: Locator
  readonly similarBreeds: Locator
  readonly galleryPhoto: Locator

  constructor(page: Page) {
    this.page = page

    this.heading = page.getByRole('heading', { level: 1 })
    this.backLink = page.getByRole('link', { name: /Back to results/ })
    this.favouriteButton = page.getByRole('button', { name: /favourites$/ })
    this.description = page.getByText(/fixture breed used by the end-to-end tests/)
    this.similarBreeds = page.getByRole('heading', { name: 'Similar breeds' })
    this.galleryPhoto = page.getByRole('button', { name: /Open photo .* full size/ })
  }

  async goto(breedId: string, search = '') {
    await this.page.goto(`/breeds/${breedId}${search}`)
  }

  /** The 1–5 bar for a label such as "Good with kids". */
  rating(label: string): Locator {
    return this.page
      .getByRole('term')
      .filter({ hasText: label })
      .locator('xpath=following-sibling::dd[1]')
  }

  similarBreedLink(breedName: string): Locator {
    return this.page.getByRole('link', { name: new RegExp(`^${breedName}`) })
  }
}
