import { getPageWindow, getTotalPages } from '../../utils/pagination';
import styles from './Pagination.module.css';

interface PaginationProps {
  totalCount: number;
  currentPage: number;
  onChange: (page: number) => void;
  perPage?: number;
  maxButtons?: number;
  showRange?: boolean;
}

export function Pagination({
  totalCount,
  currentPage,
  onChange,
  perPage = 12,
  maxButtons = 10,
  showRange = false,
}: PaginationProps) {
  const totalPages = getTotalPages(totalCount, perPage);

  if (totalPages <= 1) return null;

  const pageNumbers = getPageWindow(currentPage, totalPages, maxButtons);
  const firstItem = (currentPage - 1) * perPage + 1;
  const lastItem = Math.min(currentPage * perPage, totalCount);

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <ul className={styles.list}>
        <li>
          <button
            type="button"
            className={styles.button}
            onClick={() => onChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Prev
          </button>
        </li>

        {pageNumbers.map((number) => (
          <li key={number}>
            <button
              type="button"
              className={styles.button}
              aria-current={number === currentPage ? 'page' : undefined}
              aria-label={`Page ${number}`}
              onClick={() => onChange(number)}
            >
              {number}
            </button>
          </li>
        ))}

        <li>
          <button
            type="button"
            className={styles.button}
            onClick={() => onChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </li>
      </ul>

      {showRange && (
        <p className={styles.range}>
          Showing {firstItem}–{lastItem} of {totalCount}
        </p>
      )}
    </nav>
  );
}
