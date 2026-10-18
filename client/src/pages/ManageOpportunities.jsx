import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Building2,
  Calendar,
  MapPin,
  Clock,
  Users,
  Eye,
  Edit3,
  Archive,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getManageOpportunities,
  updateOpportunityStatus,
  deleteOpportunity
} from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';
import OpportunityEditorModal from './OpportunityEditorModal';

export default function ManageOpportunities() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Tabs & Search
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);

  // Delete confirm modal
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const orgVerificationStatus =
    user?.profile?.verification_status || (user?.role === 'admin' ? 'verified' : 'pending');
  const isOrgVerified = orgVerificationStatus === 'verified';

  async function loadOpportunities() {
    setLoading(true);
    setError(null);
    try {
      const res = await getManageOpportunities({
        status: activeTab !== 'all' ? activeTab : undefined,
        search: searchQuery || undefined
      });
      setOpportunities(res.data || []);
    } catch (err) {
      console.error('Failed to load organization opportunities', err);
      setError(err.message || 'Unable to retrieve opportunities.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOpportunities();
  }, [activeTab, searchQuery]);

  const handleOpenCreate = () => {
    setEditingOpportunity(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (opp) => {
    setEditingOpportunity(opp);
    setIsEditorOpen(true);
  };

  const handleStatusChange = async (oppId, newStatus) => {
    try {
      await updateOpportunityStatus(oppId, newStatus);
      setActionSuccess(`Opportunity status updated to ${newStatus}.`);
      setTimeout(() => setActionSuccess(null), 3500);
      loadOpportunities();
    } catch (err) {
      console.error('Failed to update status', err);
      setError(err.message || `Unable to update opportunity to ${newStatus}.`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await deleteOpportunity(deleteCandidate.id);
      setActionSuccess('Opportunity removed or archived successfully.');
      setTimeout(() => setActionSuccess(null), 3500);
      setDeleteCandidate(null);
      loadOpportunities();
    } catch (err) {
      console.error('Failed to delete opportunity', err);
      setError(err.message || 'Unable to delete opportunity.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Metrics summary
  const totalCount = opportunities.length;
  const publishedCount = opportunities.filter((o) => o.status === 'published').length;
  const draftCount = opportunities.filter((o) => o.status === 'draft').length;
  const closedCount = opportunities.filter((o) => o.status === 'closed' || o.status === 'archived').length;
  const totalApplicants = opportunities.reduce((acc, cur) => acc + (parseInt(cur.applications_count, 10) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5" />
            Organization Portal
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Manage Opportunities</h1>
          <p className="text-slate-600 text-sm mt-1">
            Create, publish, and oversee your non-profit’s volunteer listings and recruitments.
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenCreate} className="gap-2 shrink-0 shadow-sm">
          <Plus className="w-4 h-4" />
          Create New Opportunity
        </Button>
      </div>

      {/* Verification Status Alert (DEC-001) */}
      {!isOrgVerified && (
        <Alert variant="warning" title="Organization Verification Pending">
          Your organization is currently under review by administrators. While pending verification, you can create and draft opportunities, but they cannot be published to the public directory until an administrator verifies your organization credentials.
        </Alert>
      )}

      {actionSuccess && (
        <Alert variant="success" title="Success">
          {actionSuccess}
        </Alert>
      )}

      {error && (
        <Alert variant="error" title="Notice">
          {error}
        </Alert>
      )}

      {/* Metric Counters Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Total Listings
          </span>
          <div className="text-2xl font-extrabold text-slate-900">{totalCount}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">
            Published (Live)
          </span>
          <div className="text-2xl font-extrabold text-emerald-700">{publishedCount}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Drafts
          </span>
          <div className="text-2xl font-extrabold text-slate-700">{draftCount}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-brand-600 font-semibold uppercase tracking-wider">
            Applicants Received
          </span>
          <div className="text-2xl font-extrabold text-brand-700">{totalApplicants}</div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: 'All Listings' },
              { id: 'published', label: 'Published' },
              { id: 'draft', label: 'Drafts' },
              { id: 'closed', label: 'Closed' },
              { id: 'archived', label: 'Archived' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Query */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Listings Table / Cards */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <LoadingSkeleton className="h-6 w-1/3 rounded-md" />
              <LoadingSkeleton className="h-4 w-1/2 rounded-md" />
            </div>
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center">
          <EmptyState
            title="No opportunities found"
            description={
              activeTab === 'all'
                ? 'Your organization has not created any volunteer opportunities yet. Click below to start recruiting!'
                : `No opportunities found in the "${activeTab}" status category.`
            }
            actionLabel={activeTab === 'all' ? 'Create Opportunity' : 'View All'}
            onAction={activeTab === 'all' ? handleOpenCreate : () => setActiveTab('all')}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2.5 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <StatusBadge status={opp.status} size="xs" />
                  {opp.category_name && (
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {opp.category_name}
                    </span>
                  )}
                  <span className="text-[11px] font-medium uppercase text-slate-400">
                    {opp.location_type?.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {opp.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {opp.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Deadline: {new Date(opp.application_deadline).toLocaleDateString()}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    Capacity: {opp.capacity} volunteers
                  </span>
                  <span className="font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">
                    {opp.applications_count || 0} Applicant(s)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap border-t md:border-t-0 pt-3 md:pt-0">
                {/* Applicants Review Button */}
                <Link
                  to={`/applicants?opportunity_id=${opp.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
                  title="View applicants for this listing"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Applicants ({opp.applicant_count || 0})</span>
                </Link>

                {/* Public View Button */}
                {opp.status === 'published' && (
                  <Link
                    to={`/opportunities/${opp.slug || opp.id}`}
                    target="_blank"
                    className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                    title="View Public Listing"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}

                {/* Edit Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(opp)}
                  className="gap-1.5 text-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </Button>

                {/* Status Toggle Actions */}
                {opp.status === 'draft' && (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!isOrgVerified}
                    onClick={() => handleStatusChange(opp.id, 'published')}
                    className="gap-1 text-xs"
                    title={!isOrgVerified ? 'Organization must be verified before publishing' : 'Publish listing'}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Publish
                  </Button>
                )}

                {opp.status === 'published' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(opp.id, 'closed')}
                    className="gap-1 text-xs text-amber-700 hover:bg-amber-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Close
                  </Button>
                )}

                {opp.status === 'closed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!isOrgVerified}
                    onClick={() => handleStatusChange(opp.id, 'published')}
                    className="gap-1 text-xs text-emerald-700 hover:bg-emerald-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reopen
                  </Button>
                )}

                {opp.status !== 'archived' && (
                  <button
                    onClick={() => handleStatusChange(opp.id, 'archived')}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors text-xs"
                    title="Archive listing"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                )}

                {/* Delete / Archive candidate */}
                <button
                  onClick={() => setDeleteCandidate(opp)}
                  className="p-2 text-rose-500 hover:text-rose-700 rounded-xl hover:bg-rose-50 transition-colors text-xs"
                  title="Delete opportunity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Opportunity Create/Edit Modal */}
      <OpportunityEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        opportunity={editingOpportunity}
        onSaved={loadOpportunities}
        orgVerificationStatus={orgVerificationStatus}
      />

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <Modal
          isOpen={Boolean(deleteCandidate)}
          onClose={() => setDeleteCandidate(null)}
          title="Delete Opportunity Listing"
        >
          <div className="space-y-4">
            <p className="text-slate-600 text-sm">
              Are you sure you want to remove <strong>"{deleteCandidate.title}"</strong>?
            </p>
            {deleteCandidate.applications_count > 0 ? (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs">
                This opportunity has {deleteCandidate.applications_count} applicant(s). To preserve volunteer audit history, it will be safely archived rather than permanently deleted.
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                This opportunity has no active applicants and will be permanently removed.
              </p>
            )}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setDeleteCandidate(null)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-700"
              >
                {isDeleting ? 'Removing...' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
