import React from 'react';
import { Search, Filter, Calendar, MapPin, Tag } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';

export default function Opportunities() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Volunteer Opportunities</h1>
        <p className="text-slate-600 mt-2">
          Browse and filter upcoming volunteer opportunities with verified non-profit partners.
        </p>
      </div>

      {/* Filter and Search Bar Placeholder */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search opportunities by keyword, skill, or cause..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            disabled
          />
        </div>
        <Button variant="secondary" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Preview Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">Community Outreach</span>
          <StatusBadge status="published" label="Open for Applications" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Weekend Food Distribution & Logistics Coordinator</h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          Help sort, pack, and distribute nutritious fresh food boxes to local families in need. Organized by City Harvest Alliance.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Metro Community Center</span>
          <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Starting Nov 1, 2026</span>
          <span className="inline-flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Food Security</span>
        </div>
      </div>
    </div>
  );
}
