import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Award,
  FileCheck2,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  PlusCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Trophy,
  Compass,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getVolunteerDashboard,
  evaluateMyAchievements
} from '../services/api';
import PageContainer from '../components/common/PageContainer';
import PageHeading from '../components/common/PageHeading';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import Alert from '../components/common/Alert';

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [syncingBadges, setSyncingBadges] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getVolunteerDashboard();
      if (res?.success || res?.data?.success) {
        setData(res?.data?.data || res?.data);
      }
    } catch (err) {
      console.error('Failed to load volunteer dashboard:', err);
      setError('Failed to load dashboard metrics. Please refresh or try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSyncAchievements = async () => {
    try {
      setSyncingBadges(true);
      setSyncMessage(null);
      const res = await evaluateMyAchievements();
      if (res.data?.success) {
        setSyncMessage({
          type: res.data.data?.count > 0 ? 'success' : 'info',
          text: res.data.message
        });
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to sync achievements:', err);
      setSyncMessage({
        type: 'error',
        text: 'Could not sync achievements. Please try again.'
      });
    } finally {
      setSyncingBadges(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <LoadingSkeleton height="80px" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <LoadingSkeleton height="110px" />
            <LoadingSkeleton height="110px" />
            <LoadingSkeleton height="110px" />
            <LoadingSkeleton height="110px" />
          </div>
          <LoadingSkeleton height="260px" />
        </div>
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer>
        <Alert variant="error" title="Dashboard Error">
          {error || 'Unable to retrieve dashboard information.'}
        </Alert>
        <div className="mt-4">
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </PageContainer>
    );
  }

  const { profile, application_stats, hours_stats, achievements, recent_applications, recent_hours, recommended_opportunities } = data;

  return (
    <PageContainer>
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-800 text-white p-6 sm:p-8 mb-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-sm mb-3">
              <Sparkles className="w-3.5 h-3.5 text-accent-400" />
              <span>Volunteer Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {profile?.first_name || user?.first_name}!
            </h1>
            <p className="mt-2 text-brand-100 max-w-xl text-sm sm:text-base leading-relaxed">
              Track your service hours, monitor your application progress, and unlock verified community impact badges.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/hours">
              <Button
                variant="accent"
                className="shadow-sm font-semibold inline-flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Log Service Hours
              </Button>
            </Link>
            <Link to="/opportunities">
              <Button
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
              >
                Browse Opportunities
              </Button>
            </Link>
          </div>
        </div>
        {/* Decorative circle */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {syncMessage && (
        <div className="mb-6">
          <Alert variant={syncMessage.type} onClose={() => setSyncMessage(null)}>
            {syncMessage.text}
          </Alert>
        </div>
      )}

      {/* 4 Core Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Approved Hours */}
        <Card className="border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Verified Hours
            </span>
            <div className="w-9 h-9 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {hours_stats.approved_hours.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-slate-500">hours</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            {hours_stats.pending_hours > 0 ? (
              <span className="text-amber-600 font-medium">
                +{hours_stats.pending_hours.toFixed(1)} hrs pending approval
              </span>
            ) : (
              <span>All submissions reviewed</span>
            )}
          </div>
        </Card>

        {/* Applications */}
        <Card className="border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Applications
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {application_stats.total}
            </span>
            <span className="text-xs font-medium text-slate-500">submitted</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-600 font-medium">{application_stats.accepted} accepted</span>
            <span>•</span>
            <span className="text-amber-600 font-medium">{application_stats.pending} pending</span>
          </div>
        </Card>

        {/* Opportunities Joined */}
        <Card className="border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Accepted Roles
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {application_stats.accepted}
            </span>
            <span className="text-xs font-medium text-slate-500">confirmed</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {application_stats.accepted > 0 ? 'Active team contributor' : 'Ready to join first cause'}
          </div>
        </Card>

        {/* Badges Unlocked */}
        <Card className="border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Badges Earned
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {achievements.earned_count}
            </span>
            <span className="text-xs font-medium text-slate-500">of {achievements.total_count} unlocked</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {achievements.earned_count === achievements.total_count
              ? 'All badges mastered!'
              : `${achievements.total_count - achievements.earned_count} more to achieve`}
          </div>
        </Card>
      </div>

      {/* Gamified Achievements Showcase */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Community Achievements & Badges
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Unlock badges as you apply, participate, and complete verified volunteer service hours.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncAchievements}
            loading={syncingBadges}
            className="text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Check Progress
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.all?.map((ach) => {
            const isEarned = ach.earned;
            return (
              <div
                key={ach.id}
                className={`relative rounded-xl p-4 border transition-all ${
                  isEarned
                    ? 'bg-gradient-to-br from-white via-amber-50/20 to-amber-100/30 border-amber-300 shadow-sm'
                    : 'bg-white border-slate-200 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      isEarned
                        ? 'bg-gradient-to-tr from-amber-500 to-amber-400 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-slate-900 text-sm truncate">
                        {ach.title}
                      </h3>
                      {isEarned && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {ach.description}
                    </p>

                    {/* Progress Bar for Locked */}
                    {!isEarned && (
                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
                          <span>Progress</span>
                          <span>
                            {ach.current_value} / {ach.criteria_threshold} ({ach.progress_percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-brand-600 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${ach.progress_percent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Recent Applications */}
        <Card className="border border-slate-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-brand-600" />
                Recent Applications
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Your latest opportunity submissions</p>
            </div>
            <Link
              to="/applications"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recent_applications?.length === 0 ? (
            <div className="text-center py-8">
              <HeartHandshake className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">No applications submitted yet</p>
              <p className="text-xs text-slate-400 mt-1">Browse available opportunities to apply and make an impact.</p>
              <Link to="/opportunities" className="inline-block mt-3">
                <Button size="sm">Explore Causes</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recent_applications.map((app) => (
                <div key={app.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        to={`/opportunities/${app.opportunity_slug || app.opportunity_id}`}
                        className="font-semibold text-sm text-slate-900 hover:text-brand-600 transition-colors line-clamp-1"
                      >
                        {app.opportunity_title}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <span>{app.organization_name}</span>
                        {app.category_name && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400">{app.category_name}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  {app.review_notes && (
                    <div className="mt-2 text-xs bg-slate-50 border border-slate-100 rounded-lg p-2 text-slate-600 italic">
                      "{app.review_notes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Service Hours */}
        <Card className="border border-slate-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent-600" />
                Recent Service Hours
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Logged shifts and approval decisions</p>
            </div>
            <Link
              to="/hours"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Manage hours
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recent_hours?.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">No volunteer hours logged yet</p>
              <p className="text-xs text-slate-400 mt-1">Log your completed volunteer hours to earn verified badges.</p>
              <Link to="/hours" className="inline-block mt-3">
                <Button size="sm" variant="accent">Log Hours</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recent_hours.map((log) => (
                <div key={log.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-semibold text-sm text-slate-900 line-clamp-1">
                        {log.opportunity_title}
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span className="font-medium text-slate-700">{parseFloat(log.hours).toFixed(1)} hrs</span>
                        <span>•</span>
                        <span>{new Date(log.activity_date).toLocaleDateString()}</span>
                      </p>
                    </div>
                    <StatusBadge status={log.status} />
                  </div>
                  {log.description && (
                    <p className="mt-1.5 text-xs text-slate-600 line-clamp-2">
                      {log.description}
                    </p>
                  )}
                  {log.feedback && (
                    <div className="mt-1.5 text-xs bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg p-2">
                      <span className="font-semibold">Coordinator Feedback: </span>
                      {log.feedback}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recommended Opportunities */}
      {recommended_opportunities?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-brand-600" />
                Recommended Opportunities For You
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                New initiatives matching verified community needs.
              </p>
            </div>
            <Link
              to="/opportunities"
              className="text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              See all listings
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recommended_opportunities.map((opp) => (
              <Card key={opp.id} className="border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
                      {opp.category_name || 'General'}
                    </span>
                    <span className="text-[11px] text-slate-500 capitalize">
                      {opp.location_type}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                    {opp.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {opp.organization_name}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {opp.location || 'Flexible'}
                  </span>
                  <Link to={`/opportunities/${opp.slug || opp.id}`}>
                    <Button size="sm" variant="outline" className="text-xs">
                      View Details
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
