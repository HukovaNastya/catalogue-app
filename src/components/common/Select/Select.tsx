import type { ComponentPropsWithRef } from 'react';
import { clsx } from 'clsx';
import styles from './Select.module.css';

interface SelectProps extends ComponentPropsWithRef<'select'> {
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
      className={clsx(styles.select, className)}
      onChange={(event) => {
        onChange?.(event);
        onValueChange?.(event.target.value);
      }}
      {...rest}
    />
  );
}
