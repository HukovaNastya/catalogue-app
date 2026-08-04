import { Link } from '@tanstack/react-router';
import { SearchInput } from '../SearchInput/SearchInput.tsx';
import { useBreedsParams } from '../../hooks/useBreedsParams.ts';
import { useFavourites } from '../../hooks/useFavourites.ts';
import styles from './Header.module.css';

export function Header() {
  const { q, setQuery } = useBreedsParams();
  const { count } = useFavourites();

  return (
    <header className={styles.header}>
      <Link className={styles.brand} to="/breeds" search={{ q: '', page: 1 }}>
        Breeds
      </Link>

      <SearchInput value={q} onChange={setQuery} />

      <Link className={styles.favourites} to="/favourites">
        <span aria-hidden="true">♡</span> Favourites
        {count > 0 && (
          <span className={styles.count}>
            {count}
            {/* Without this the badge reads as a bare "3". */}
            <span className={styles.srOnly}> saved</span>
          </span>
        )}
      </Link>
    </header>
  );
}
