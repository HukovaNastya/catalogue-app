import storage from './storage.ts';

const KEY = storage.Local_Storage_Keys.Favourites;

function readFromStorage(): string[] {
  const value = storage.getItem<unknown>(KEY);
  if (!Array.isArray(value)) return [];

  // A hand-edited or half-written entry must not reach the UI.
  return value.filter((id): id is string => typeof id === 'string');
}

// Module-level state: `getSnapshot` has to return a stable reference, so this
// variable is reassigned on change rather than rebuilt on every read.
let favourites: string[] = readFromStorage();

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function commit(next: string[]) {
  favourites = next;
  storage.setItem({ key: KEY, value: favourites });
  emit();
}

// Fires in the *other* tabs only, which is exactly what we want.
window.addEventListener('storage', (event) => {
  if (event.key !== KEY) return;
  favourites = readFromStorage();
  emit();
});

export const favouritesStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getSnapshot(): string[] {
    return favourites;
  },

  toggle(breedId: string) {
    commit(
      favourites.includes(breedId)
        ? favourites.filter((id) => id !== breedId)
        : [breedId, ...favourites],
    );
  },

  clear() {
    commit([]);
  },
};
