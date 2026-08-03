import { useId, useState } from 'react';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback.ts';
import styles from './SearchInput.module.css';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  delay?: number;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search breeds…',
  delay = 250,
}: SearchInputProps) {
  const inputId = useId();
  const [draft, setDraft] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);
  const { run: debouncedChange, cancel } = useDebouncedCallback(
    onChange,
    delay,
  );

  // Re-sync when the URL changes from outside — back button, brand link,
  // or a shared link opened directly.
  if (syncedValue !== value) {
    setSyncedValue(value);
    setDraft(value);
  }

  const commit = (next: string) => {
    cancel();
    setDraft(next);
    onChange(next);
  };

  return (
    <form
      className={styles.form}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        commit(draft);
      }}
    >
      <label className={styles.label} htmlFor={inputId}>
        Search breeds
      </label>
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="16.65" y1="16.65" x2="21" y2="21" />
      </svg>
      <input
        id={inputId}
        className={styles.input}
        type="search"
        value={draft}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(event) => {
          setDraft(event.target.value);
          debouncedChange(event.target.value);
        }}
      />
      {draft && (
        <button
          type="button"
          className={styles.clear}
          aria-label="Clear search"
          onClick={() => commit('')}
        >
          ×
        </button>
      )}
    </form>
  );
}
