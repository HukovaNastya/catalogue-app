import type { ComponentPropsWithoutRef, ElementType, Ref } from 'react';
import styles from './Typography.module.css';

// Text-level tags only: they share one attribute surface, so the component can
// stay non-generic. For a link, nest one — as BreedCard already does.
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
  | 'li';

type TypographyVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'section'
  | 'cardTitle'
  | 'body'
  | 'small';

// `as` overrides this when the semantics and the looks need to differ — a
// hidden page heading, or a card title that is an h2 but reads much smaller.
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
      className={[
        styles[variant],
        tone && styles[tone],
        srOnly && styles.srOnly,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    />
  );
}
