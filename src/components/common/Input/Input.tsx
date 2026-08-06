import type { ComponentPropsWithRef } from 'react';
import { clsx } from 'clsx';
import styles from './Input.module.css';

type InputVariant = 'field' | 'bare';

interface InputProps extends ComponentPropsWithRef<'input'> {
  variant?: InputVariant;
  onValueChange?: (value: string) => void;
}

export function Input({
  variant = 'field',
  className,
  type = 'text',
  onChange,
  onValueChange,
  ...rest
}: InputProps) {
  return (
    <input
      type={type}
      className={clsx(styles.input, styles[variant], className)}
      onChange={(event) => {
        onChange?.(event);
        onValueChange?.(event.target.value);
      }}
      {...rest}
    />
  );
}
