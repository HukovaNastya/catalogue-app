import type { Locator, Page } from '@playwright/test'

export class BreedsListPage {
  readonly page: Page
  readonly searchInput: Locator
  readonly clearSearchButton: Locator
  readonly favouritesLink: Locator
  readonly brandLink: Locator
  readonly kidsGroup: Locator
  readonly groomingGroup: Locator
  readonly traitsGroup: Locator
  readonly originSelect: Locator
  readonly sortSelect: Locator
  readonly clearFiltersButton: Locator
  readonly resultCount: Locator
  readonly cards: Locator
  readonly cardTitles: Locator
  readonly pagination: Locator
  readonly pageButtons: Locator
  readonly prevButton: Locator
  readonly nextButton: Locator

  constructor(page: Page) {
    this.page = page

    const searchForm = page.getByRole('search')
    this.searchInput = searchForm.getByLabel('Search breeds')
    this.clearSearchButton = searchForm.getByRole('button', { name: 'Clear search' })
    this.favouritesLink = page.getByRole('link', { name: /favourites/i })
    this.brandLink = page.getByRole('link', { name: 'Catalogue', exact: true })

    this.kidsGroup = page.getByRole('group', { name: 'Good with kids' })
    this.groomingGroup = page.getByRole('group', { name: 'Grooming' })
    this.traitsGroup = page.getByRole('group', { name: 'Traits' })
    this.originSelect = page.getByRole('combobox', { name: 'Origin', exact: true })

    this.sortSelect = page.getByRole('combobox', { name: 'Sort', exact: true })
    this.clearFiltersButton = page.getByRole('button', { name: 'Clear all', exact: true })
    this.resultCount = page.getByText(/^\d+ of \d+ breeds$/)
    this.cards = page.getByRole('article')
    this.cardTitles = this.cards.getByRole('link')

    this.pagination = page.getByRole('navigation', { name: 'Pagination' })
    this.pageButtons = this.pagination.getByRole('button', { name: /^Page \d+$/ })
    this.prevButton = this.pagination.getByRole('button', { name: 'Prev' })
    this.nextButton = this.pagination.getByRole('button', { name: 'Next' })
  }

  async goto(search = '') {
    await this.page.goto(`/breeds${search}`)
    await this.resultCount.waitFor()
  }

  kidsOption(label: string): Locator {
    return this.kidsGroup.getByRole('button', { name: label, exact: true })
  }

  groomingOption(label: string): Locator {
    return this.groomingGroup.getByRole('checkbox', { name: label, exact: true })
  }

  traitOption(label: string): Locator {
    return this.traitsGroup.getByRole('checkbox', { name: label, exact: true })
  }

  chipRemove(label: string): Locator {
    return this.page.getByRole('button', { name: `Remove ${label} filter` })
  }

  emptyStateButton(label: string): Locator {
    return this.page.getByRole('button', { name: label }).filter({ hasText: label })
  }

  pageButton(number: number): Locator {
    return this.pagination.getByRole('button', { name: `Page ${number}`, exact: true })
  }

  card(breedName: string): Locator {
    return this.cards.filter({ has: this.page.getByRole('link', { name: breedName, exact: true }) })
  }

  favouriteToggle(breedName: string): Locator {
    return this.page.getByRole('button', {
      name: new RegExp(`(Add|Remove) ${breedName} (to|from) favourites`),
    })
  }

  visibleNames(): Promise<string[]> {
    return this.cardTitles.allInnerTexts()
  }
}
