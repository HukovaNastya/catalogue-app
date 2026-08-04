import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { favouritesStore } from '../services/favourites.store.ts';

export function useFavourites() {
  const ids = useSyncExternalStore(
    favouritesStore.subscribe,
    favouritesStore.getSnapshot,
  );

  // The list renders a dozen cards per page — each one asks "am I favourited?".
  const idSet = useMemo(() => new Set(ids), [ids]);

  const isFavourite = useCallback((breedId: string) => idSet.has(breedId), [
    idSet,
  ]);

  return {
    ids,
    count: ids.length,
    isFavourite,
    toggle: favouritesStore.toggle,
    clear: favouritesStore.clear,
  };
}
