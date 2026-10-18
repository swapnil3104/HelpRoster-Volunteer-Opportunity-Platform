import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  MapPin,
  Search,
  ExternalLink,
  ArrowRight,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { getOrganizations } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

export default function Organizations() {
  const [organizations, setOrganizations] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadOrgs() {
      setLoading(true);
      setError(null);
      try {
        const res = await getOrganizations({ search: search || undefined });
        setOrganizations(res.data || []);
      } catch (err) {
        console.error('Failed to load organizations', err);
        setError('Unable to load organizations directory. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(loadOrgs, 200);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold uppercase tracking-wider border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Vetted Partner Network
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Partner Organizations
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Discover verified charities, civic institutions, and non-profit coalitions orchestrating vital volunteer initiatives in your area.
          </p>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organizations by name, cause, or city..."
            className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-slate-400"
          />
        </div>
        {search && (
          <Button variant="ghost" size="sm" onClick={() => setSearch('')} className="gap-1.5 text-xs text-slate-500">
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Grid of Organizations */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <LoadingSkeleton className="h-6 w-1/2 rounded-md" />
              <LoadingSkeleton className="h-16 w-full rounded-md" />
              <LoadingSkeleton className="h-8 w-28 rounded-lg" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl">
          <p className="text-rose-700 font-medium">{error}</p>
        </div>
      ) : organizations.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center">
          <EmptyState
            title="No organizations found"
            description="No partner organizations matched your search. Try different keywords or clear your search."
            actionLabel={search ? 'Clear Search' : undefined}
            onAction={search ? () => setSearch('') : undefined}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-4">
                {/* Org header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                      {org.logo_url ? (
                        <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                        {org.name}
                      </h2>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {org.city ? `${org.city}, ${org.state}` : 'National / Remote Network'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <StatusBadge status={org.verification_status} size="xs" />
                </div>

                {/* Description */}
                <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                  {org.description || org.mission || 'Dedicated non-profit working with community volunteers.'}
                </p>

                {/* Mission statement quote if present */}
                {org.mission && (
                  <p className="text-xs text-slate-500 italic border-l-2 border-brand-200 pl-3 line-clamp-2">
                    "{org.mission}"
                  </p>
                )}
              </div>

              {/* Bottom footer with active counts and link */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100/60">
                  {org.active_opportunities_count || 0} Active Opportunity Listing(s)
                </span>

                <Link to={`/organizations/${org.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    View Profile
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
