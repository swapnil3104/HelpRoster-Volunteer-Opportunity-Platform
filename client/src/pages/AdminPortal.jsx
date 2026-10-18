import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import AdminNav from '../components/admin/AdminNav';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import Alert from '../components/common/Alert';
import { getAdminStats } from '../services/api';
import {
  Users,
  Building2,
  Compass,
  Clock,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
  RefreshCw
} from 'lucide-react';

export default function AdminPortal() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await getAdminStats();
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load administrator statistics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <PageContainer className="py-8">
        <AdminNav title="Platform Administration" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <LoadingSkeleton count={3} />
            </Card>
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8">
      <AdminNav
        title="Admin Control Center"
        subtitle="Live platform oversight, verification queues, content moderation, and operational statistics."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Metrics</span>
          </Button>
        }
      />

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Verification Gate Attention Banner */}
      {stats?.organizations?.pending_orgs > 0 && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                {stats.organizations.pending_orgs} Organization{stats.organizations.pending_orgs > 1 ? 's' : ''} Awaiting Verification
              </h3>
              <p className="text-xs text-amber-700">
                Organizations cannot publish public listings until verified by platform administration.
              </p>
            </div>
          </div>
          <Link to="/admin/organizations">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
              Review Queue
            </Button>
          </Link>
        </div>
      )}

      {/* Platform Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Total Users */}
        <Card className="p-5 border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Accounts</span>
            <div className="p-2 rounded-xl bg-blue-50 text-brand-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-2">
            {stats?.users?.total_users || 0}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{stats?.users?.total_volunteers || 0}</span> volunteers &bull;{' '}
            <span className="font-semibold text-slate-700">{stats?.users?.total_organizations || 0}</span> orgs
          </div>
        </Card>

        {/* Organizations */}
        <Card className="p-5 border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Organizations</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-2">
            {stats?.organizations?.total_orgs || 0}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-emerald-600">{stats?.organizations?.verified_orgs || 0} verified</span> &bull;{' '}
            <span className="font-semibold text-amber-600">{stats?.organizations?.pending_orgs || 0} pending</span>
          </div>
        </Card>

        {/* Opportunities */}
        <Card className="p-5 border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Opportunities</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Compass className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-2">
            {stats?.opportunities?.total_opps || 0}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-emerald-600">{stats?.opportunities?.published_opps || 0} active</span> &bull;{' '}
            <span className="font-semibold text-slate-600">{stats?.opportunities?.draft_opps || 0} draft</span>
          </div>
        </Card>

        {/* Community Impact Hours */}
        <Card className="p-5 border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Verified Impact</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-2">
            {stats?.hours?.total_approved || 0} <span className="text-sm font-medium text-slate-500">hrs</span>
          </div>
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-brand-600">{stats?.applications?.accepted_apps || 0}</span> accepted placements
          </div>
        </Card>
      </div>

      {/* Two-column administrative control hubs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Management Hubs */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-600" />
            <span>Administrative Operations</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Organizations Hub */}
            <Link to="/admin/organizations" className="group">
              <Card className="p-5 h-full border-slate-200 group-hover:border-brand-300 group-hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    Organization Verification
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Review non-profit credentials, mission statements, and grant or revoke publishing authorization.
                  </p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-brand-600">
                  <span>{stats?.organizations?.pending_orgs || 0} pending review</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>

            {/* Users Hub */}
            <Link to="/admin/users" className="group">
              <Card className="p-5 h-full border-slate-200 group-hover:border-brand-300 group-hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    User Accounts & Status
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Search volunteers and organizations, investigate accounts, suspend bad actors, or reinstate users.
                  </p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-brand-600">
                  <span>{stats?.users?.suspended_users || 0} suspended</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>

            {/* Opportunities Hub */}
            <Link to="/admin/opportunities" className="group">
              <Card className="p-5 h-full border-slate-200 group-hover:border-brand-300 group-hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    Content Moderation
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Oversee opportunities across all organizations, audit compliance, and close or archive listings.
                  </p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-brand-600">
                  <span>{stats?.opportunities?.total_opps || 0} total listings</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>

            {/* Support Inquiries Hub */}
            <Link to="/admin/support" className="group">
              <Card className="p-5 h-full border-slate-200 group-hover:border-brand-300 group-hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    Support Inquiries
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Respond to contact form submissions, record staff resolution notes, and track ticket status.
                  </p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-brand-600">
                  <span>{stats?.support?.new_inquiries || 0} new inquiries</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Right Column: Recent Audits & Quick Actions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-600" />
              <span>Recent Privileged Actions</span>
            </h2>
            <Link to="/admin/audit-logs" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              View All
            </Link>
          </div>

          <Card className="p-4 border-slate-200 divide-y divide-slate-100">
            {stats?.recent_audits?.length > 0 ? (
              stats.recent_audits.map((item) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                      {item.action}
                    </span>
                    <span className="text-slate-400">
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 truncate">
                    Target: <span className="font-medium text-slate-900">{item.target_type} #{item.target_id}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                    By: {item.actor_email || 'System'}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No recent audit events recorded.
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
