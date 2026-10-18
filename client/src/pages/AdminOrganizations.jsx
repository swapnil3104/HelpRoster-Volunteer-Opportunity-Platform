import React, { useState, useEffect } from 'react';
import PageContainer from '../components/common/PageContainer';
import AdminNav from '../components/admin/AdminNav';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import TextField from '../components/common/TextField';
import TextArea from '../components/common/TextArea';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';
import EmptyState from '../components/common/EmptyState';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { getAdminOrganizations, verifyAdminOrganization } from '../services/api';
import {
  Building2,
  Search,
  ExternalLink,
  ShieldCheck,
  ShieldX,
  Clock,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function AdminOrganizations() {
  const [organizations, setOrganizations] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'verified' | 'rejected' | ''
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Verification modal state
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [newVerificationStatus, setNewVerificationStatus] = useState('verified');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchOrganizations = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 15,
        search: search.trim() || undefined,
        verification_status: activeTab || undefined
      };
      const res = await getAdminOrganizations(params);
      if (res.data.success) {
        setOrganizations(res.data.data.organizations);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to retrieve organizations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations(1);
  }, [activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrganizations(1);
  };

  const handleOpenReviewModal = (org, defaultDecision = 'verified') => {
    setSelectedOrg(org);
    setNewVerificationStatus(defaultDecision);
    setReviewNotes('');
  };

  const handleSaveDecision = async (e) => {
    e.preventDefault();
    if (!selectedOrg) return;
    try {
      setSubmitting(true);
      setError(null);
      const res = await verifyAdminOrganization(selectedOrg.id, {
        verification_status: newVerificationStatus,
        notes: reviewNotes
      });
      if (res.data.success) {
        setFeedback(
          `Organization "${selectedOrg.name}" has been marked as ${newVerificationStatus}. Notification email dispatched.`
        );
        setSelectedOrg(null);
        fetchOrganizations(pagination.page);
        setTimeout(() => setFeedback(null), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update verification status.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer className="py-8">
      <AdminNav
        title="Organization Verification Gate"
        subtitle="Review community partners, verify non-profit documentation, and grant or revoke opportunity publishing authorization."
      />

      {feedback && (
        <Alert variant="success" className="mb-6">
          {feedback}
        </Alert>
      )}

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Tabs and Search Controls */}
      <Card className="p-4 mb-6 border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Sub-status filter tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            {[
              { id: 'pending', label: 'Pending Review' },
              { id: 'verified', label: 'Verified Partners' },
              { id: 'rejected', label: 'Rejected' },
              { id: '', label: 'All Organizations' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <TextField
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
              className="w-64"
            />
            <Button type="submit" variant="primary" size="sm">
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setActiveTab('pending');
                fetchOrganizations(1);
              }}
              title="Reset"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>

      {/* Organizations Directory Grid/Table */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton count={6} />
          </div>
        ) : organizations.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No organizations in this view"
              description={
                activeTab === 'pending'
                  ? 'All organizations have been reviewed! There are no pending verification requests at this time.'
                  : 'No organizations matched the selected filters.'
              }
              actionLabel={activeTab ? 'View All Organizations' : undefined}
              onAction={activeTab ? () => setActiveTab('') : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Organization</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Representative</th>
                  <th className="px-4 py-4">Location</th>
                  <th className="px-4 py-4">Listings</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{org.name}</div>
                      <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{org.description}</div>
                      {org.website && (
                        <a
                          href={org.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-brand-600 hover:text-brand-700 mt-1"
                        >
                          <span>{org.website.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={org.verification_status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs font-medium text-slate-800">{org.rep_name}</div>
                      <div className="text-[11px] text-slate-500">{org.email}</div>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600 whitespace-nowrap">
                      {org.city ? `${org.city}, ${org.state || ''}` : org.country || '—'}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">{org.total_opportunities || 0}</span>
                      <span className="text-slate-400"> ({org.published_opportunities || 0} active)</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {org.verification_status === 'pending' ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                              onClick={() => handleOpenReviewModal(org, 'verified')}
                            >
                              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => handleOpenReviewModal(org, 'rejected')}
                            >
                              <ShieldX className="w-3.5 h-3.5 mr-1" />
                              Reject
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenReviewModal(org, org.verification_status)}
                          >
                            Edit Status
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing page <span className="font-semibold text-slate-900">{pagination.page}</span> of{' '}
              <span className="font-semibold text-slate-900">{pagination.totalPages}</span> ({pagination.total} total)
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => fetchOrganizations(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchOrganizations(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Organization Verification Review Modal */}
      {selectedOrg && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedOrg(null)}
          title={`Review Organization: ${selectedOrg.name}`}
        >
          <form onSubmit={handleSaveDecision} className="space-y-4">
            {/* Organization Profile Summary Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Mission & Purpose:</span>
                <p className="text-slate-800 italic mt-0.5">{selectedOrg.mission || selectedOrg.description || 'Not provided'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                <div>
                  <span className="text-slate-500 font-medium">Contact Email:</span>
                  <p className="text-slate-800">{selectedOrg.email}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Representative:</span>
                  <p className="text-slate-800">{selectedOrg.rep_name} ({selectedOrg.rep_email})</p>
                </div>
              </div>

              {selectedOrg.website && (
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-slate-500 font-medium">Official Website:</span>
                  <p>
                    <a
                      href={selectedOrg.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-600 hover:underline flex items-center gap-1"
                    >
                      <span>{selectedOrg.website}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>
              )}
            </div>

            {/* Decision Radio Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Verification Decision
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewVerificationStatus('verified')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    newVerificationStatus === 'verified'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <CheckCircle2 className={`w-5 h-5 shrink-0 ${newVerificationStatus === 'verified' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div>
                    <div className="text-xs font-bold">Approve & Verify</div>
                    <div className="text-[11px] text-slate-500">Unlocks public opportunity publishing</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setNewVerificationStatus('rejected')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    newVerificationStatus === 'rejected'
                      ? 'border-red-500 bg-red-50 text-red-900 ring-2 ring-red-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <XCircle className={`w-5 h-5 shrink-0 ${newVerificationStatus === 'rejected' ? 'text-red-600' : 'text-slate-400'}`} />
                  <div>
                    <div className="text-xs font-bold">Reject Verification</div>
                    <div className="text-[11px] text-slate-500">Blocks public listing publishing</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Review Notes */}
            <TextArea
              label="Administrative Feedback & Notes"
              placeholder="e.g. Verified 501(c)(3) determination letter or reason for rejection..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
            />

            <p className="text-[11px] text-slate-500">
              * Updating this decision will record an audit trail event and send an email notification to <strong>{selectedOrg.email}</strong>.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelectedOrg(null)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={newVerificationStatus === 'verified' ? 'primary' : 'danger'}
                loading={submitting}
              >
                Confirm Verification Decision
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </PageContainer>
  );
}
