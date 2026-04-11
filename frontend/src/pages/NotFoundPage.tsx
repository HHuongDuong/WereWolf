import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="not-found-page">
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/" className="btn-primary">Go home</Link>
    </main>
  );
}
