import { Link } from 'react-router-dom';
import { HandHeart } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-14 text-center">
      <HandHeart className="h-14 w-14 text-primary-300" />
      <h1 className="mt-5 text-3xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-gray-600">
        The page you're looking for doesn't exist. Let's get you back to
        sharing good food.
      </p>
      <Link to="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
