import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  MapPin,
  Globe,
  Mail,
  Phone,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { getOrganization } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

export default function OrganizationDetail() {
  const { id } = useParams();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadOrg() {
      setLoading(true);
      setError(null);
      try {
        const res = await getOrganization(id);
        setOrganization(res.data);
      } catch (err) {
        console.error('Failed to load organization', err);
        setError('Organization not found or unavailable.');
      } finally {
        setLoading(false);
      }
    }
    loadOrg();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <LoadingSkeleton className="h-6 w-36 rounded-md" />
        <LoadingSkeleton className="h-40 rounded-3xl" />
        <LoadingSkeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Organization Not Found</h1>
        <p className="text-slate-600">{error || 'Unable to locate this organization profile.'}</p>
        <div className="pt-4">
          <Link to="/organizations">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Organizations Directory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const opportunities = organization.opportunities || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/" className="hover:text-brand-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/organizations" className="hover:text-brand-600 transition-colors">
          Partner Organizations
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 truncate">{organization.name}</span>
      </nav>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center font-bold text-2xl overflow-hidden shrink-0 shadow-inner">
              {organization.logo_url ? (
                <img src={organization.logo_url} alt={organization.name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-10 h-10" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{organization.name}</h1>
                <StatusBadge status={organization.verification_status} size="sm" />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {organization.city ? `${organization.city}, ${organization.state}, ${organization.country}` : 'National / Remote'}
                </span>
                {organization.website && (
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-medium hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Active Opportunities
            </span>
            <span className="text-2xl font-extrabold text-brand-600">
              {organization.active_opportunities_count || opportunities.length}
            </span>
          </div>
        </div>

        {/* Mission Quote */}
        {organization.mission && (
          <div className="bg-teal-50/60 border border-teal-100 rounded-2xl p-5 space-y-1">
            <span className="text-xs uppercase tracking-wider text-teal-700 font-bold block">
              Our Mission
            </span>
            <p className="text-sm text-teal-900 italic font-medium leading-relaxed">
              "{organization.mission}"
            </p>
          </div>
        )}

        {/* Full Overview Description */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">About the Organization</h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {organization.description || 'No detailed description provided yet.'}
          </p>
        </div>
      </div>

      {/* Active Listings from this Organization */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Current Opportunities ({opportunities.length})
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Volunteer projects currently coordinated by {organization.name}.
          </p>
        </div>

        {opportunities.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
            <p className="text-slate-600 text-sm">
              This organization does not currently have any published opportunities open for applications.
            </p>
            <Link to="/opportunities">
              <Button variant="outline" size="sm">
                Browse other volunteer opportunities
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-100">
                      {opp.category_name || 'Community'}
                    </span>
                    <span className="text-[11px] font-medium uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {opp.location_type?.replace('_', ' ')}
                    </span>
                  </div>

                  <Link
                    to={`/opportunities/${opp.slug || opp.id}`}
                    className="text-lg font-bold text-slate-900 hover:text-brand-600 transition-colors line-clamp-2"
                  >
                    {opp.title}
                  </Link>

                  <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                    {opp.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{opp.location}</span>
                    </div>
                    {opp.commitment_hours && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{opp.commitment_hours} hrs/week</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link to={`/opportunities/${opp.slug || opp.id}`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                      View Opportunity
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
