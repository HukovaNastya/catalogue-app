import type { SVGProps } from 'react';

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 6 18 18M18 6 6 18" />
    </svg>
  );
}
