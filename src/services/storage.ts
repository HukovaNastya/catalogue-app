const Local_Storage_Keys = {
  Favourites: 'catalogue:favourites',
} as const;

function getItem<T>(key: string): T | null {
  if (!key || typeof key !== 'string') {
    console.warn(`The ${key} is not a valid storage key!`);
    return null;
  }

  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function setItem({ key, value }: { key: string; value: unknown }) {
  if (!key || typeof key !== 'string') {
    console.warn(`The ${key} is not a valid storage key!`);
    return;
  }

  if (value === undefined || value === null) {
    console.warn(`Refusing to store ${value} under "${key}"`);
    return;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn(`Could not write "${key}: ${value}" — storage rejected it.`);
    return false;
  }
}

function removeItem(key: string) {
  if (!key || typeof key !== 'string') {
    console.warn(`The ${key} is not a valid storage key!`);
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch {
    console.warn(`Could not remove "${key}" — storage rejected it.`);
    return;
  }
}

export default { Local_Storage_Keys, getItem, setItem, removeItem };
