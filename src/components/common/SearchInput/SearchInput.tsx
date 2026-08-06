import { useId, useState } from 'react';
import { useDebouncedCallback } from '../../../hooks/useDebouncedCallback.ts';
import { SearchIcon } from '../../../assets/icons/SearchIcon.tsx';
import { Button } from '../Button/Button.tsx';
import { Input } from '../Input/Input.tsx';
import styles from './SearchInput.module.css';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  // Lets the host treat the clear button differently from an empty search —
  // defaults to an ordinary `onChange('')`.
  onClear?: () => void;
  placeholder?: string;
  delay?: number;
}

export function SearchInput({
  value,
  onChange,
  onClear,
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

  const clear = () => {
    if (!onClear) {
      commit('');
      return;
    }

    cancel();
    setDraft('');
    onClear();
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
      <SearchIcon className={styles.icon} />
      <Input
        id={inputId}
        className={styles.input}
        type="search"
        value={draft}
        placeholder={placeholder}
        autoComplete="off"
        onValueChange={(next) => {
          setDraft(next);
          debouncedChange(next);
        }}
      />
      {draft && (
        <Button
          variant="ghost"
          className={styles.clear}
          aria-label="Clear search"
          onClick={clear}
        >
          ×
        </Button>
      )}
    </form>
  );
}
