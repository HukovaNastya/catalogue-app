import { Link, type ErrorComponentProps } from '@tanstack/react-router'

export function ErrorPage({ error }: ErrorComponentProps) {
  return (
    <div style={{ padding: 24, textAlign: 'left' }}>
      <h1>Oops</h1>
      <p>Something went wrong while loading this page.</p>
      <p>{error.message}</p>
      <p>
        <Link to="/breeds" search={{ q: '', page: 1 }}>
          ← Back to all breeds
        </Link>
      </p>
    </div>
  )
}

export function NotFoundPage() {
  return (
    <div style={{ padding: 24, textAlign: 'left' }}>
      <h1>Not found</h1>
      <p>We could not find that page.</p>
      <p>
        <Link to="/breeds" search={{ q: '', page: 1 }}>
          ← Back to all breeds
        </Link>
      </p>
    </div>
  )
}
