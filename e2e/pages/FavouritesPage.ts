import type { Locator, Page } from '@playwright/test'
import { BreedsListPage } from './BreedsListPage.ts'

export class FavouritesPage extends BreedsListPage {
  readonly savedCount: Locator
  readonly clearAllButton: Locator
  readonly emptyMessage: Locator
  readonly browseLink: Locator

  constructor(page: Page) {
    super(page)

    this.savedCount = page.getByText(/^\d+ saved breeds?$/)
    this.clearAllButton = page.getByRole('button', { name: 'Clear all' })
    this.emptyMessage = page.getByText('No favourites yet.')
    this.browseLink = page.getByRole('link', { name: 'Browse breeds' })
  }

  async goto(search = '') {
    await this.page.goto(`/favourites${search}`)
    await this.savedCount.waitFor()
  }
}
