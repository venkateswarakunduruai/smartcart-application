import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div className="container text-center mt-5">
      <h1 className="display-1">404</h1>
      <p>Page not found.</p>
      <Link to="/" className="btn btn-primary-sc">Go Home</Link>
    </div>
  )
}
