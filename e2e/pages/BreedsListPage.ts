import type { Locator, Page } from '@playwright/test'

/**
 * The breed grid, its filter sidebar and the shared header controls.
 *
 * Every locator goes through a role or a label — the same handles a screen
 * reader uses — so a CSS-module class rename cannot break the suite. Where a
 * name would be ambiguous (a bare "5" also appears as "Page 5") the locator is
 * scoped to its fieldset or <nav> instead of leaning on `exact`.
 */
export class BreedsListPage {
  readonly page: Page

  // Header (present on every route)
  readonly searchInput: Locator
  readonly clearSearchButton: Locator
  readonly favouritesLink: Locator
  readonly brandLink: Locator

  // Sidebar
  readonly kidsGroup: Locator
  readonly groomingGroup: Locator
  readonly traitsGroup: Locator
  readonly originSelect: Locator

  // Results
  readonly sortSelect: Locator
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
    // Scoped: the empty state renders its own "Clear search" button.
    this.clearSearchButton = searchForm.getByRole('button', { name: 'Clear search' })
    this.favouritesLink = page.getByRole('link', { name: /favourites/i })
    this.brandLink = page.getByRole('link', { name: 'Catalogue', exact: true })

    this.kidsGroup = page.getByRole('group', { name: 'Good with kids' })
    this.groomingGroup = page.getByRole('group', { name: 'Grooming' })
    this.traitsGroup = page.getByRole('group', { name: 'Traits' })
    // By role, not getByLabel: both selects sit inside a wrapping <label>, so
    // the label's text content includes the option list ("SortA–ZZ–A"). The
    // accessible name is the clean one.
    this.originSelect = page.getByRole('combobox', { name: 'Origin', exact: true })

    this.sortSelect = page.getByRole('combobox', { name: 'Sort', exact: true })
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
    // The grid only renders once the breeds query resolves; without this every
    // caller would race the first assertion against the loading paragraph.
    await this.resultCount.waitFor()
  }

  /** "3+", "4+" or "5" — the segmented control, scoped to its fieldset. */
  kidsOption(label: string): Locator {
    return this.kidsGroup.getByRole('button', { name: label, exact: true })
  }

  /** "Low", "Medium" or "High". */
  groomingOption(label: string): Locator {
    return this.groomingGroup.getByRole('checkbox', { name: label, exact: true })
  }

  /** "Hypoallergenic" or "Rare". */
  traitOption(label: string): Locator {
    return this.traitsGroup.getByRole('checkbox', { name: label, exact: true })
  }

  /** The × on an active filter chip, e.g. chipRemove('kids 4+'). */
  chipRemove(label: string): Locator {
    return this.page.getByRole('button', { name: `Remove ${label} filter` })
  }

  /**
   * A button in the empty state, e.g. "Clear search" or "Clear kids 5+".
   *
   * The header's × carries the same accessible name as the empty state's
   * "Clear search", so the filter narrows it to the one whose *visible text*
   * says it — the × only has the aria-label.
   */
  emptyStateButton(label: string): Locator {
    return this.page.getByRole('button', { name: label }).filter({ hasText: label })
  }

  pageButton(number: number): Locator {
    return this.pagination.getByRole('button', { name: `Page ${number}`, exact: true })
  }

  card(breedName: string): Locator {
    return this.cards.filter({ has: this.page.getByRole('link', { name: breedName, exact: true }) })
  }

  /** The heart on a card or a detail page — label flips with the saved state. */
  favouriteToggle(breedName: string): Locator {
    return this.page.getByRole('button', {
      name: new RegExp(`(Add|Remove) ${breedName} (to|from) favourites`),
    })
  }

  visibleNames(): Promise<string[]> {
    return this.cardTitles.allInnerTexts()
  }
}
