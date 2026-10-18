import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Clock,
  Building2,
  Tag,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getOpportunities, getCategories } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

export default function Opportunities() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedLocationType, setSelectedLocationType] = useState(searchParams.get('location_type') || '');
  const [locationQuery, setLocationQuery] = useState(searchParams.get('location') || '');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sort') || 'deadline_asc');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

  // Data state
  const [categories, setCategories] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await getCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setCategoriesLoading(false);
      }
    }
    loadCategories();
  }, []);

  // Sync state with URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedLocationType) params.set('location_type', selectedLocationType);
    if (locationQuery) params.set('location', locationQuery);
    if (sortOrder && sortOrder !== 'deadline_asc') params.set('sort', sortOrder);
    if (currentPage > 1) params.set('page', currentPage.toString());

    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, selectedLocationType, locationQuery, sortOrder, currentPage, setSearchParams]);

  // Fetch opportunities whenever query params change
  useEffect(() => {
    async function fetchOpportunities() {
      setLoading(true);
      setError(null);
      try {
        const res = await getOpportunities({
          search: searchQuery || undefined,
          category: selectedCategory || undefined,
          location_type: selectedLocationType || undefined,
          location: locationQuery || undefined,
          sort: sortOrder,
          page: currentPage,
          limit: 9
        });

        setOpportunities(res.data || []);
        if (res.meta?.pagination) {
          setPagination(res.meta.pagination);
        }
      } catch (err) {
        console.error('Failed to fetch opportunities', err);
        setError(err.message || 'Unable to retrieve opportunities. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchOpportunities();
  }, [searchQuery, selectedCategory, selectedLocationType, locationQuery, sortOrder, currentPage]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLocationType('');
    setLocationQuery('');
    setSortOrder('deadline_asc');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    searchQuery || selectedCategory || selectedLocationType || locationQuery || sortOrder !== 'deadline_asc'
  );

  const formatDeadline = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isDeadlineUrgent = (dateStr) => {
    if (!dateStr) return false;
    const diffDays = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 7;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold uppercase tracking-wider border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Verified Non-Profit Postings
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Discover Volunteer Opportunities
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Connect directly with verified organizations tackling environmental preservation, education, health equity, and community resilience.
          </p>
        </div>
      </div>

      {/* Search and Filters Control Center */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Main Keyword Search */}
          <div className="md:col-span-5 relative">
            <label htmlFor="search-input" className="sr-only">
              Search by title, organization, or skill
            </label>
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by keywords, skill, or cause..."
              className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Location Query */}
          <div className="md:col-span-3 relative">
            <label htmlFor="location-input" className="sr-only">
              City or state
            </label>
            <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              id="location-input"
              type="text"
              value={locationQuery}
              onChange={(e) => {
                setLocationQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="City, State, or Region..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Location Type Selector */}
          <div className="md:col-span-2">
            <select
              value={selectedLocationType}
              onChange={(e) => {
                setSelectedLocationType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-slate-700"
            >
              <option value="">All Locations</option>
              <option value="on_site">On-Site Only</option>
              <option value="remote">Remote Only</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {/* Sort Order Selector */}
          <div className="md:col-span-2">
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-slate-700"
            >
              <option value="deadline_asc">Upcoming Deadline</option>
              <option value="created_desc">Newest Listings</option>
              <option value="start_date_asc">Earliest Start</option>
            </select>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Cause:
            </span>
            <button
              onClick={() => {
                setSelectedCategory('');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCategory === ''
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Causes
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(selectedCategory === cat.slug ? '' : cat.slug);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat.slug
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium inline-flex items-center gap-1 hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Meta Status Bar */}
      <div className="flex items-center justify-between text-sm text-slate-600">
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-900">
            {opportunities.length > 0 ? opportunities.length : 0}
          </span>{' '}
          of <span className="font-semibold text-slate-900">{pagination.totalItems || 0}</span> published opportunities
        </div>
        {hasActiveFilters && (
          <span className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-medium border border-brand-200">
            Filtered view
          </span>
        )}
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <LoadingSkeleton className="h-6 w-3/4 rounded-md" />
              <LoadingSkeleton className="h-4 w-1/2 rounded-md" />
              <LoadingSkeleton className="h-16 w-full rounded-md" />
              <div className="pt-4 border-t border-slate-100 flex justify-between">
                <LoadingSkeleton className="h-4 w-20 rounded-md" />
                <LoadingSkeleton className="h-8 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
          <p className="text-rose-700 font-medium">{error}</p>
          <Button variant="outline" onClick={handleClearFilters}>
            Reset search and try again
          </Button>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center">
          <EmptyState
            title="No matching opportunities found"
            description="Try loosening your search terms, selecting 'All Causes', or resetting filters to browse all verified listings."
            actionLabel={hasActiveFilters ? 'Clear All Filters' : undefined}
            onAction={hasActiveFilters ? handleClearFilters : undefined}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6 space-y-4">
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100/60">
                    {opp.category?.name || 'General Community'}
                  </span>
                  <StatusBadge status={opp.status} size="xs" />
                </div>

                {/* Title */}
                <div>
                  <Link
                    to={`/opportunities/${opp.slug || opp.id}`}
                    className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2"
                  >
                    {opp.title}
                  </Link>
                  <Link
                    to={`/organizations/${opp.organization.id}`}
                    className="text-xs text-slate-500 hover:text-slate-700 mt-1 inline-flex items-center gap-1.5 font-medium"
                  >
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{opp.organization.name}</span>
                  </Link>
                </div>

                {/* Description snippet */}
                <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
                  {opp.description}
                </p>

                {/* Logistics Badges */}
                <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{opp.location}</span>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                      {opp.location_type?.replace('_', ' ')}
                    </span>
                  </div>

                  {opp.commitment_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{opp.commitment_hours} hrs/week commitment</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Deadline:{' '}
                      <strong className={isDeadlineUrgent(opp.application_deadline) ? 'text-amber-600' : 'text-slate-700'}>
                        {formatDeadline(opp.application_deadline)}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Skills Chips */}
                {opp.skills && opp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {opp.skills.slice(0, 3).map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {opp.skills.length > 3 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-400">
                        +{opp.skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer CTA */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{opp.capacity} volunteer spots</span>
                </div>
                <Link to={`/opportunities/${opp.slug || opp.id}`}>
                  <Button variant="primary" size="sm" className="gap-1.5 group-hover:translate-x-0.5 transition-transform">
                    View Details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-200">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>

          <span className="text-sm font-medium text-slate-600">
            Page {currentPage} of {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= pagination.totalPages}
            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
            className="gap-1"
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
