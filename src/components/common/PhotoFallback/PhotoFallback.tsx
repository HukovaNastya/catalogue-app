import { clsx } from 'clsx';
import { CatIcon } from '../../../assets/icons/CatIcon.tsx';
import { Typography } from '../Typography/Typography.tsx';
import styles from './PhotoFallback.module.css';

interface PhotoFallbackProps {
  label?: string;
  className?: string;
}

export function PhotoFallback({ label, className }: PhotoFallbackProps) {
  return (
    <div
      className={clsx(styles.root, className)}
      aria-hidden={label ? undefined : true}
    >
      <CatIcon className={styles.icon} />
      {label && (
        <Typography as="span" variant="small">
          {label}
        </Typography>
      )}
    </div>
  );
}
