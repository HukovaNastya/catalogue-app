export function getTotalPages(totalCount: number, perPage: number): number {
  if (totalCount <= 0 || perPage <= 0) return 0;
  return Math.ceil(totalCount / perPage);
}

export function clampPage(page: number, totalPages: number): number {
  if (!Number.isFinite(page) || totalPages <= 0) return 1;
  return Math.min(Math.max(1, Math.trunc(page)), totalPages);
}

export function getPageWindow(
  currentPage: number,
  totalPages: number,
  maxButtons: number,
): number[] {
  if (totalPages <= 0 || maxButtons <= 0) return [];

  const size = Math.min(maxButtons, totalPages);
  const start = Math.min(
    Math.max(1, currentPage - Math.floor(size / 2)),
    totalPages - size + 1,
  );

  return Array.from({ length: size }, (_, index) => start + index);
}

export function paginate<T>(items: T[], page: number, perPage: number): T[] {
  const start = (page - 1) * perPage;
  return items.slice(start, start + perPage);
}
