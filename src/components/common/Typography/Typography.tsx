import type { ComponentPropsWithoutRef, ElementType, Ref } from 'react';
import { clsx } from 'clsx';
import styles from './Typography.module.css';

type TypographyTag =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'span'
  | 'div'
  | 'dt'
  | 'dd'
  | 'li'
  | 'legend';

type TypographyVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'section'
  | 'cardTitle'
  | 'body'
  | 'small';

const DEFAULT_TAG: Record<TypographyVariant, TypographyTag> = {
  display: 'h1',
  title: 'h1',
  heading: 'h1',
  section: 'h2',
  cardTitle: 'h2',
  body: 'p',
  small: 'p',
};

interface TypographyProps extends ComponentPropsWithoutRef<'p'> {
  ref?: Ref<HTMLElement>;
  as?: TypographyTag;
  variant?: TypographyVariant;
  tone?: 'muted' | 'strong';
  srOnly?: boolean;
}

export function Typography({
  as,
  variant = 'body',
  tone,
  srOnly = false,
  className,
  ...rest
}: TypographyProps) {
  const Tag = (as ?? DEFAULT_TAG[variant]) as ElementType<
    ComponentPropsWithoutRef<'p'> & { ref?: Ref<HTMLElement> }
  >;

  return (
    <Tag
      className={clsx(
        styles[variant],
        tone && styles[tone],
        srOnly && styles.srOnly,
        className,
      )}
      {...rest}
    />
  );
}
