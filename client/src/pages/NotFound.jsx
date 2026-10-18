import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home as HomeIcon } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 border border-amber-200">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Page Not Found
        </h1>
        <p className="mt-3 text-slate-600 text-sm leading-relaxed">
          The page you are looking for doesn't exist or has been moved. Check the URL or return to the home page.
        </p>
        <div className="mt-8">
          <Link to="/">
            <Button size="md" className="gap-2">
              <HomeIcon className="w-4 h-4" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
