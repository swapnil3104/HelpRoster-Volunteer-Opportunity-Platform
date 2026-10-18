import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  Calendar,
  MapPin,
  Clock,
  Building2,
  ArrowRight,
  Search,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Undo2,
  Filter,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { getMyApplications, withdrawApplication } from '../services/api';
import PageContainer from '../components/common/PageContainer';
import PageHeading from '../components/common/PageHeading';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    withdrawn: 0
  });
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Withdrawal state
  const [applicationToWithdraw, setApplicationToWithdraw] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  async function fetchApplications(statusFilter = selectedStatus) {
    setLoading(true);
    setError(null);
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const res = await getMyApplications(params);
      setApplications(res.data.applications || []);
      setSummary(res.data.summary || {
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        withdrawn: 0
      });
    } catch (err) {
      console.error('Failed to load applications:', err);
      setError(err.message || 'Unable to load your applications. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApplications(selectedStatus);
  }, [selectedStatus]);

  const handleWithdrawConfirm = async () => {
    if (!applicationToWithdraw) return;
    setWithdrawing(true);
    setWithdrawError(null);
    try {
      await withdrawApplication(applicationToWithdraw.id);
      setActionSuccess('Application withdrawn successfully.');
      setApplicationToWithdraw(null);
      await fetchApplications(selectedStatus);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setWithdrawError(err.message || 'Failed to withdraw application.');
    } finally {
      setWithdrawing(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Local search filter
  const filteredApplications = applications.filter((app) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const matchTitle = app.opportunity_title?.toLowerCase().includes(term);
    const matchOrg = app.organization_name?.toLowerCase().includes(term);
    const matchLocation = app.location?.toLowerCase().includes(term);
    return matchTitle || matchOrg || matchLocation;
  });

  const tabs = [
    { id: 'all', label: 'All', count: summary.total },
    { id: 'pending', label: 'Pending Review', count: summary.pending },
    { id: 'accepted', label: 'Accepted', count: summary.accepted },
    { id: 'rejected', label: 'Declined', count: summary.rejected },
    { id: 'withdrawn', label: 'Withdrawn', count: summary.withdrawn }
  ];

  return (
    <PageContainer>
      <div className="space-y-8 pb-16">
        {/* Header with Title and Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageHeading
            title="My Applications"
            description="Track your volunteer application statuses, coordinate with non-profit organizers, and review decision notes."
          />
          <div className="shrink-0">
            <Link to="/opportunities">
              <Button variant="primary" className="gap-2">
                <Search className="w-4 h-4" />
                Browse Opportunities
              </Button>
            </Link>
          </div>
        </div>

        {actionSuccess && (
          <Alert variant="success" title="Success">
            {actionSuccess}
          </Alert>
        )}

        {/* Status Filter Tabs & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Horizontal Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 focus-ring ${
                    selectedStatus === tab.id
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                      selectedStatus === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Keyword Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by role or org..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Error Loading Applications</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
            <Button variant="outline" size="sm" onClick={() => fetchApplications(selectedStatus)}>
              Retry
            </Button>
          </div>
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            icon={FileCheck2}
            title={
              searchTerm
                ? 'No matching applications found'
                : selectedStatus === 'all'
                ? 'You have not submitted any applications yet'
                : `No ${selectedStatus} applications found`
            }
            description={
              searchTerm
                ? 'Try adjusting your search keywords or clear the filter.'
                : 'Connect with reputable non-profits and discover meaningful ways to give back in your community.'
            }
            action={
              <Link to="/opportunities">
                <Button variant="primary" className="gap-2">
                  Browse Volunteer Opportunities
                </Button>
              </Link>
            }
          />
        ) : (
          /* Application Cards List */
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Header Row: Org + Status */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                      {app.organization_logo_url ? (
                        <img
                          src={app.organization_logo_url}
                          alt={app.organization_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <Link
                        to={`/organizations/${app.organization_id}`}
                        className="text-xs font-semibold text-slate-600 hover:text-brand-600 flex items-center gap-1"
                      >
                        <span>{app.organization_name}</span>
                      </Link>
                      <Link
                        to={`/opportunities/${app.opportunity_slug || app.opportunity_id}`}
                        className="text-base sm:text-lg font-bold text-slate-900 hover:text-brand-600 transition-colors block leading-tight"
                      >
                        {app.opportunity_title}
                      </Link>
                    </div>
                  </div>

                  <StatusBadge status={app.status} size="sm" />
                </div>

                {/* Logistics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{app.location || 'Flexible Location'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Starts {formatDate(app.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {app.commitment_hours ? `${app.commitment_hours} hrs/wk` : 'Flexible Hours'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Applied:</span>
                    <span className="font-medium text-slate-700">{formatDate(app.created_at)}</span>
                  </div>
                </div>

                {/* Volunteer Cover Note (if provided) */}
                {app.message && (
                  <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-600 space-y-1">
                    <span className="font-semibold text-slate-700 block">Your Application Note:</span>
                    <p className="italic leading-relaxed">{app.message}</p>
                  </div>
                )}

                {/* Organization Decision / Feedback Box */}
                {app.status === 'accepted' && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Congratulations! Your application has been accepted.
                    </div>
                    {app.review_notes ? (
                      <p className="text-emerald-700 pl-5 leading-relaxed">
                        <span className="font-semibold">Organizer Note:</span> {app.review_notes}
                      </p>
                    ) : (
                      <p className="text-emerald-700 pl-5 leading-relaxed">
                        The organization coordinator will contact you via your registered email with orientation details.
                      </p>
                    )}
                  </div>
                )}

                {app.status === 'rejected' && (
                  <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <XCircle className="w-4 h-4 text-slate-500 shrink-0" />
                      Application Decision: Position Filled or Declined
                    </div>
                    {app.review_notes && (
                      <p className="text-slate-600 pl-5 leading-relaxed">
                        <span className="font-semibold">Organizer Note:</span> {app.review_notes}
                      </p>
                    )}
                  </div>
                )}

                {app.status === 'withdrawn' && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs">
                    You withdrew this application on {formatDate(app.updated_at)}.
                  </div>
                )}

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between pt-1">
                  <Link
                    to={`/opportunities/${app.opportunity_slug || app.opportunity_id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    <span>View Listing Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {app.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setApplicationToWithdraw(app)}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                    >
                      Withdraw Application
                    </Button>
                  )}

                  {app.status === 'withdrawn' && (
                    <Link to={`/opportunities/${app.opportunity_slug || app.opportunity_id}`}>
                      <Button variant="secondary" size="sm" className="text-xs gap-1.5">
                        <Undo2 className="w-3.5 h-3.5" />
                        Re-apply
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdraw Confirmation Modal */}
      <Modal
        isOpen={!!applicationToWithdraw}
        onClose={() => !withdrawing && setApplicationToWithdraw(null)}
        title="Withdraw Application"
        description="Are you sure you want to withdraw your application?"
        size="md"
      >
        <div className="space-y-4">
          {withdrawError && (
            <Alert variant="danger" title="Error">
              {withdrawError}
            </Alert>
          )}

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Withdrawing your application for{' '}
            <span className="font-semibold text-slate-900">
              "{applicationToWithdraw?.opportunity_title}"
            </span>{' '}
            will remove you from the active review queue. You can submit a new application later if the listing remains open.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setApplicationToWithdraw(null)}
              disabled={withdrawing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleWithdrawConfirm}
              disabled={withdrawing}
            >
              {withdrawing ? 'Withdrawing...' : 'Confirm Withdrawal'}
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
