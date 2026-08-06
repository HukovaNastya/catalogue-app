import type { SVGProps } from 'react';

export function CatalogueIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="5.5 3.5 52 52"
      width="1em"
      height="1em"
      fill="currentColor"
      stroke="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M20.97 25.38 L20.0 11.5 Q21.4 7.2 24.4 10.3 L29.57 20.21 Z"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M43.03 25.38 L44.0 11.5 Q42.6 7.2 39.6 10.3 L34.43 20.21 Z"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M41.9 43.9 A14 14 0 1 1 45.16 29.21"
        fill="none"
        strokeWidth="6.5"
        strokeLinecap="butt"
      />
    </svg>
  );
}
