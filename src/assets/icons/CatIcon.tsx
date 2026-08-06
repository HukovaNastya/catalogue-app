import type { SVGProps } from 'react';

export function CatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* Ears: apex above the head, both feet landing on its circumference. */}
      <path d="M6.8 11 5.5 4.5 10.4 8.2" />
      <path d="M17.2 11 18.5 4.5 13.6 8.2" />
      <circle cx="12" cy="14" r="6" />
      <circle cx="9.8" cy="13.5" r="0.65" fill="currentColor" stroke="none" />
      <circle cx="14.2" cy="13.5" r="0.65" fill="currentColor" stroke="none" />
      <path d="M10.9 16.9h2.2" />
      <path d="M2.8 14.6h3.1M18.1 14.6h3.1" />
    </svg>
  );
}
