import type { ComponentPropsWithRef } from 'react';
import styles from './Select.module.css';

interface SelectProps extends ComponentPropsWithRef<'select'> {
  // Same convenience as Input: most callers only want the value.
  onValueChange?: (value: string) => void;
}

export function Select({
  className,
  onChange,
  onValueChange,
  ...rest
}: SelectProps) {
  return (
    <select
      className={[styles.select, className].filter(Boolean).join(' ')}
      onChange={(event) => {
        onChange?.(event);
        onValueChange?.(event.target.value);
      }}
      {...rest}
    />
  );
}
