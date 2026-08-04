import { Link } from '@tanstack/react-router';
import { SearchInput } from '../SearchInput/SearchInput.tsx';
import { useBreedsParams } from '../../hooks/useBreedsParams.ts';
import styles from './Header.module.css';

export function Header() {
  const { q, setQuery } = useBreedsParams();

  return (
    <header className={styles.header}>
      <Link className={styles.brand} to="/breeds" search={{ q: '', page: 1 }}>
        Breeds
      </Link>

      <SearchInput value={q} onChange={setQuery} />

      <button type="button" className={styles.favourites} disabled>
        ♡ Favourites
      </button>
    </header>
  );
}
