import { Link } from '@tanstack/react-router';
import { CatalogueIcon } from '../../../assets/icons/CatalogueIcon.tsx';
import { SearchInput } from '../SearchInput/SearchInput.tsx';
import { Typography } from '../Typography/Typography.tsx';
import { useBreedsParams } from '../../../hooks/useBreedsParams.ts';
import { useFavourites } from '../../../hooks/useFavourites.ts';
import styles from './Header.module.css';

export function Header() {
  const { q, setQuery, clearQuery } = useBreedsParams();
  const { count } = useFavourites();

  return (
    <header className={styles.header}>
      <Link className={styles.brand} to="/breeds" search={{ q: '', page: 1 }}>
        <CatalogueIcon className={styles.brandMark} />
        Catalogue
      </Link>

      <SearchInput value={q} onChange={setQuery} onClear={clearQuery} />

      <Link
        className={styles.favourites}
        to="/favourites"
        search={(prev) => ({ ...prev, page: 1 })}
      >
        <span aria-hidden="true">♡</span> Favourites
        {count > 0 && (
          <div className={styles.count}>
            {count}
            {/* Without this the badge reads as a bare "3". */}
            <Typography as="span" srOnly>
              {' '}
              saved
            </Typography>
          </div>
        )}
      </Link>
    </header>
  );
}
