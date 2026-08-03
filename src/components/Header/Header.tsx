import { useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SearchInput } from '../SearchInput/SearchInput.tsx';
import { useBreedsParams } from '../../hooks/useBreedsParams.ts';
import styles from './Header.module.css';

export function Header() {
  const { q, setQuery } = useBreedsParams();
  const location = useLocation();
  const navigate = useNavigate();

  const onList = location.pathname === '/breeds';

  const handleChange = useCallback(
    (value: string) => {
      if (onList) {
        setQuery(value);
        return;
      }

      // Searching from a detail page takes you back to the list.
      const params = new URLSearchParams();
      if (value.trim()) params.set('q', value.trim());
      navigate({ pathname: '/breeds', search: params.toString() });
    },
    [onList, setQuery, navigate],
  );

  return (
    <header className={styles.header}>
      <Link className={styles.brand} to="/breeds">
        Breeds
      </Link>

      <SearchInput value={onList ? q : ''} onChange={handleChange} />

      <button type="button" className={styles.favourites} disabled>
        ♡ Favourites
      </button>
    </header>
  );
}
