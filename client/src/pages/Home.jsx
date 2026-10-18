import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  Building2,
  Clock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  CheckCircle2,
  Leaf,
  GraduationCap,
  HeartHandshake,
  PawPrint,
  HeartPulse,
  Laptop,
  Flame,
  Palette,
  ExternalLink
} from 'lucide-react';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card';
import { SkeletonCard } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import { getPublicStats, getFeaturedOpportunities } from '../services/api';

export default function Home() {
  const navigate = useNavigate();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Data states
  const [stats, setStats] = useState({
    total_opportunities: 0,
    total_organizations: 0,
    total_volunteers: 0,
    verified_hours: 0
  });
  const [featuredOpps, setFeaturedOpps] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingOpps, setLoadingOpps] = useState(true);

  // Active "How It Works" Tab
  const [activeWorkflowTab, setActiveWorkflowTab] = useState('volunteers');

  useEffect(() => {
    async function loadData() {
      try {
        const statsRes = await getPublicStats();
        if (statsRes?.data) setStats(statsRes.data);
      } catch (err) {
        console.error('Failed to load platform stats', err);
      } finally {
        setLoadingStats(false);
      }

      try {
        const oppsRes = await getFeaturedOpportunities();
        if (oppsRes?.data) setFeaturedOpps(oppsRes.data);
      } catch (err) {
        console.error('Failed to load featured opportunities', err);
      } finally {
        setLoadingOpps(false);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('q', searchQuery.trim());
    if (selectedCategory) params.append('category', selectedCategory);
    navigate(`/opportunities?${params.toString()}`);
  };

  const categories = [
    { name: 'Environment & Climate', icon: Leaf, color: 'text-emerald-600 bg-emerald-50' },
    { name: 'Education & Mentorship', icon: GraduationCap, color: 'text-blue-600 bg-blue-50' },
    { name: 'Hunger & Food Security', icon: HeartHandshake, color: 'text-amber-600 bg-amber-50' },
    { name: 'Animal Welfare', icon: PawPrint, color: 'text-orange-600 bg-orange-50' },
    { name: 'Healthcare & Wellness', icon: HeartPulse, color: 'text-rose-600 bg-rose-50' },
    { name: 'Tech & Digital Support', icon: Laptop, color: 'text-indigo-600 bg-indigo-50' },
    { name: 'Disaster Relief & Aid', icon: Flame, color: 'text-red-600 bg-red-50' },
    { name: 'Arts & Culture', icon: Palette, color: 'text-purple-600 bg-purple-50' }
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section with Glow & Direct Action */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-page pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-slate-200/60">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-300/20 via-accent-300/20 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-brand-700 text-xs font-semibold shadow-xs border border-brand-200/80">
            <Sparkles className="w-4 h-4 text-accent-500" />
            <span>The Verified Volunteer Opportunity Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Connecting passionate volunteers with{' '}
            <span className="bg-gradient-to-r from-brand-600 via-brand-700 to-accent-600 bg-clip-text text-transparent">
              verified community impact
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover vetted opportunities with verified organizations. Apply in one click, log
            authenticated hours, and build a portfolio of certified community achievements.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/opportunities">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Explore Opportunities
              </Button>
            </Link>
            <Link to="/register?role=volunteer">
              <Button size="lg" variant="secondary" leftIcon={<Users className="w-5 h-5 text-brand-600" />}>
                Join as a Volunteer
              </Button>
            </Link>
            <Link to="/register?role=organization">
              <Button size="lg" variant="ghost" leftIcon={<Building2 className="w-5 h-5 text-slate-500" />}>
                Register Organization
              </Button>
            </Link>
          </div>

          {/* Quick Search Card */}
          <div className="max-w-3xl mx-auto pt-6">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-md flex flex-col sm:flex-row items-center gap-2.5"
            >
              <div className="flex items-center gap-2 flex-1 w-full px-3 py-1.5">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by keywords, cause, or location..."
                  className="w-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
                />
              </div>

              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-44 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* 2. Real-Time Verified Impact Metrics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Verified Platform Impact
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Live statistics queried directly from our relational MySQL database. Zero fabricated
              or simulated claims.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {/* Metric 1 */}
            <div className="p-5 rounded-2xl bg-brand-50/60 border border-brand-100/80 space-y-2">
              <div className="w-10 h-10 mx-auto rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">
                {loadingStats ? '—' : stats.verified_hours.toLocaleString()}
              </div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Verified Service Hours
              </div>
              <p className="text-[11px] text-slate-500">Formally approved by registered non-profits</p>
            </div>

            {/* Metric 2 */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100/80 space-y-2">
              <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">
                {loadingStats ? '—' : stats.total_opportunities.toLocaleString()}
              </div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Active Opportunities
              </div>
              <p className="text-[11px] text-slate-500">Published and actively welcoming applicants</p>
            </div>

            {/* Metric 3 */}
            <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-100/80 space-y-2">
              <div className="w-10 h-10 mx-auto rounded-xl bg-accent-500 text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">
                {loadingStats ? '—' : stats.total_organizations.toLocaleString()}
              </div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Verified Organizations
              </div>
              <p className="text-[11px] text-slate-500">Admin-vetted non-profits and charities</p>
            </div>

            {/* Metric 4 */}
            <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-100/80 space-y-2">
              <div className="w-10 h-10 mx-auto rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">
                {loadingStats ? '—' : stats.total_volunteers.toLocaleString()}
              </div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Registered Volunteers
              </div>
              <p className="text-[11px] text-slate-500">Engaged citizens dedicating their time</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Opportunities Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> High-Priority Causes
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Opportunities
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Verified community initiatives with immediate volunteer openings.
            </p>
          </div>

          <Link to="/opportunities">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All Opportunities
            </Button>
          </Link>
        </div>

        {loadingOpps ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : featuredOpps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredOpps.map((opp) => (
              <Card key={opp.id} interactive className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {opp.category_name || 'General Service'}
                    </span>
                    <StatusBadge status={opp.location_type === 'remote' ? 'active' : 'published'} label={opp.location_type === 'remote' ? 'Remote' : 'On-Site'} size="xs" />
                  </div>
                  <CardTitle className="line-clamp-2 hover:text-brand-600 transition-colors">
                    {opp.title}
                  </CardTitle>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{opp.organization_name}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-accent-500 shrink-0" title="Verified Organization" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {opp.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{opp.location || 'Local Community'}</span>
                    </div>
                    {opp.application_deadline && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Deadline: {new Date(opp.application_deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Capacity: {opp.capacity} {opp.capacity === 1 ? 'volunteer' : 'volunteers'}
                  </div>
                  <Link to={`/opportunities`}>
                    <Button variant="secondary" size="xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No featured opportunities right now"
            description="Our non-profit partners are continuously submitting new listings for administrator verification."
            action={
              <Link to="/opportunities">
                <Button variant="primary" size="sm">
                  Browse Opportunity Directory
                </Button>
              </Link>
            }
          />
        )}
      </section>

      {/* 4. Explore by Cause & Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Opportunities by Cause
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Find the volunteer niche that aligns with your passions, skills, and values.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/opportunities?category=${encodeURIComponent(cat.name)}`}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-300 hover:shadow-md transition-all duration-200 group flex flex-col items-center text-center space-y-3"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${cat.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-slate-400">Browse Listings &rarr;</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. How It Works Section (Tabbed: Volunteers vs Non-Profits) */}
      <section className="bg-slate-50 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How HelpRoster Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              A transparent, accountable platform ensuring integrity for both community volunteers
              and mission-driven organizations.
            </p>

            {/* Toggle Tabs */}
            <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 shadow-2xs mt-4">
              <button
                type="button"
                onClick={() => setActiveWorkflowTab('volunteers')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeWorkflowTab === 'volunteers'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                For Volunteers
              </button>
              <button
                type="button"
                onClick={() => setActiveWorkflowTab('organizations')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeWorkflowTab === 'organizations'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                For Non-Profit Organizations
              </button>
            </div>
          </div>

          {activeWorkflowTab === 'volunteers' ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
                <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 font-bold text-xs flex items-center justify-center">
                  01
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Discover Opportunities</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Search by cause, schedule, location, or remote preference among verified non-profit partners.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
                <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 font-bold text-xs flex items-center justify-center">
                  02
                </span>
                <h3 className="font-bold text-slate-900 text-sm">One-Click Applications</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Submit transparent statements of interest. Duplicate defense guarantees your submissions are cleanly tracked.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
                <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 font-bold text-xs flex items-center justify-center">
                  03
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Serve & Log Hours</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Participate on site or remotely, then log service time for official verification by the hosting organization.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
                <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 font-bold text-xs flex items-center justify-center">
                  04
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Earn Verified Badges</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Unlock milestone badges and export certified volunteer hours transcripts for work, school, or scholarship requirements.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
                <span className="w-8 h-8 rounded-full bg-accent-50 text-accent-600 font-bold text-xs flex items-center justify-center">
                  01
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Admin Verification Gate</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Register your organization with EIN and mission details. Platform admins verify legitimacy before publication.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
                <span className="w-8 h-8 rounded-full bg-accent-50 text-accent-600 font-bold text-xs flex items-center justify-center">
                  02
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Publish Listings</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Create rich listings with required skills, deadlines, and capacities with full draft and publish lifecycle controls.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
                <span className="w-8 h-8 rounded-full bg-accent-50 text-accent-600 font-bold text-xs flex items-center justify-center">
                  03
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Manage Applicants</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Review volunteer qualifications in a dedicated queue, communicate requirements, and accept or reject applications.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
                <span className="w-8 h-8 rounded-full bg-accent-50 text-accent-600 font-bold text-xs flex items-center justify-center">
                  04
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Authenticate Hours</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Approve logged hours in a single click, providing volunteers with verified records that build long-term community trust.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-accent-600 rounded-3xl p-8 sm:p-14 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to create positive change in your community?
            </h2>
            <p className="text-brand-100 text-sm sm:text-base leading-relaxed">
              Whether you are an individual wanting to donate your skills or a non-profit striving
              to mobilize volunteers, HelpRoster provides the verified foundation you need.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/register?role=volunteer">
                <Button size="lg" className="bg-white text-brand-700 hover:bg-slate-100 shadow-md">
                  Join as a Volunteer
                </Button>
              </Link>
              <Link to="/register?role=organization">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  Register an Organization
                </Button>
              </Link>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
            <HeartHandshake className="w-96 h-96 text-white" />
          </div>
        </div>
      </section>
    </div>
  );
}
