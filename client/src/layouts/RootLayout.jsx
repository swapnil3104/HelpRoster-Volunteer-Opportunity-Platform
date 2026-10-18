import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import SiteHeader from '../components/layout/SiteHeader';
import SiteFooter from '../components/layout/SiteFooter';

export default function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-page text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Top Banner / Announcement */}
      <div className="bg-gradient-to-r from-brand-600 to-accent-600 text-white text-xs py-1.5 px-4 text-center shadow-xs">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          HelpRoster Platform — Connecting Passion with Verified Community Impact
        </span>
      </div>

      {/* Global Responsive Header */}
      <SiteHeader />

      {/* Main Content Area */}
      <main className="flex-1 w-full" id="main-content">
        <Outlet />
      </main>

      {/* Global Responsive Footer */}
      <SiteFooter />
    </div>
  );
}
