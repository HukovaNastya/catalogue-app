import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'

export function ErrorPage() {
  const error = useRouteError()

  const message = isRouteErrorResponse(error)
    ? error.status === 404
      ? 'We could not find that page.'
      : 'The page failed to load.'
    : 'Something went wrong while loading this page.'

  return (
    <div style={{ padding: 24, textAlign: 'left' }}>
      <h1>Oops</h1>
      <p>{message}</p>
      <p>
        <Link to="/breeds">← Back to all breeds</Link>
      </p>
    </div>
  )
}
