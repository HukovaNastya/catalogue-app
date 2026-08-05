import { getPageWindow, getTotalPages } from '../../utils/pagination';
import { Button } from '../Button/Button.tsx';
import styles from './Pagination.module.css';

interface PaginationProps {
  totalCount: number;
  currentPage: number;
  onChange: (page: number) => void;
  perPage?: number;
  maxButtons?: number;
  showRange?: boolean;
  className?: string;
}

export function Pagination({
  totalCount,
  currentPage,
  onChange,
  perPage = 12,
  maxButtons = 10,
  showRange = false,
  className,
}: PaginationProps) {
  const totalPages = getTotalPages(totalCount, perPage);

  if (totalPages <= 1) return null;

  const pageNumbers = getPageWindow(currentPage, totalPages, maxButtons);
  const firstItem = (currentPage - 1) * perPage + 1;
  const lastItem = Math.min(currentPage * perPage, totalCount);

  return (
    <nav
      className={[styles.pagination, className].filter(Boolean).join(' ')}
      aria-label="Pagination"
    >
      <ul className={styles.list}>
        <li>
          <Button
            className={styles.button}
            onClick={() => onChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Prev
          </Button>
        </li>

        {pageNumbers.map((number) => (
          <li key={number}>
            <Button
              className={styles.button}
              aria-current={number === currentPage ? 'page' : undefined}
              aria-label={`Page ${number}`}
              onClick={() => onChange(number)}
            >
              {number}
            </Button>
          </li>
        ))}

        <li>
          <Button
            className={styles.button}
            onClick={() => onChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next →
          </Button>
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
