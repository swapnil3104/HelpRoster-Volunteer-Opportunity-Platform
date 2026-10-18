import React, { useState, useEffect } from 'react';
import PageContainer from '../components/common/PageContainer';
import AdminNav from '../components/admin/AdminNav';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import TextField from '../components/common/TextField';
import SelectField from '../components/common/SelectField';
import TextArea from '../components/common/TextArea';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';
import EmptyState from '../components/common/EmptyState';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { getAdminOpportunities, moderateAdminOpportunity } from '../services/api';
import {
  Compass,
  Search,
  Building2,
  Calendar,
  Users,
  MapPin,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

export default function AdminOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Moderation Modal State
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [newStatus, setNewStatus] = useState('published');
  const [moderationReason, setModerationReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchOpportunities = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 15,
        search: search.trim() || undefined,
        status: statusFilter || undefined
      };
      const res = await getAdminOpportunities(params);
      if (res.data.success) {
        setOpportunities(res.data.data.opportunities);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to retrieve opportunities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOpportunities(1);
  };

  const handleOpenModerationModal = (opp) => {
    setSelectedOpp(opp);
    setNewStatus(opp.status);
    setModerationReason('');
  };

  const handleSaveModeration = async (e) => {
    e.preventDefault();
    if (!selectedOpp) return;
    try {
      setSubmitting(true);
      setError(null);
      const res = await moderateAdminOpportunity(selectedOpp.id, {
        status: newStatus,
        reason: moderationReason
      });
      if (res.data.success) {
        setFeedback(`Opportunity "${selectedOpp.title}" status changed to ${newStatus}.`);
        setSelectedOpp(null);
        fetchOpportunities(pagination.page);
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to moderate opportunity.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer className="py-8">
      <AdminNav
        title="Opportunity Moderation"
        subtitle="Platform-wide listing oversight. Audit content quality, safety standards, and manage published, closed, or draft states."
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

      {/* Filter and Search Bar */}
      <Card className="p-4 mb-6 border-slate-200">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-7">
            <TextField
              label="Search Opportunities"
              placeholder="Search by title, location, or organization name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="md:col-span-3">
            <SelectField
              label="Listing Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'published', label: 'Published (Public)' },
                { value: 'draft', label: 'Draft' },
                { value: 'closed', label: 'Closed' },
                { value: 'archived', label: 'Archived' }
              ]}
            />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button type="submit" variant="primary" className="w-full">
              Filter
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                fetchOpportunities(1);
              }}
              title="Reset"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </Card>

      {/* Opportunities Data Table */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton count={6} />
          </div>
        ) : opportunities.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No opportunities found"
              description="No listings matched the specified search and filter criteria."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearch('');
                setStatusFilter('');
                fetchOpportunities(1);
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Opportunity</th>
                  <th className="px-4 py-4">Organization</th>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4">Deadline</th>
                  <th className="px-4 py-4">Applicants</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 line-clamp-1">{opp.title}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{opp.location}</span>
                        <span className="capitalize text-slate-400">({opp.location_type?.replace('_', ' ')})</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-800 text-xs">{opp.organization_name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        Org Status: {opp.organization_verification_status}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600">
                      {opp.category_name || 'General'}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(opp.application_deadline).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">{opp.applicant_count || 0}</span>
                      <span className="text-slate-400"> / {opp.capacity}</span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={opp.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenModerationModal(opp)}
                      >
                        Moderate
                      </Button>
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
                onClick={() => fetchOpportunities(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchOpportunities(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Moderation Modal */}
      {selectedOpp && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedOpp(null)}
          title={`Moderate Opportunity: ${selectedOpp.title}`}
        >
          <form onSubmit={handleSaveModeration} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="font-semibold text-slate-800">Organization: {selectedOpp.organization_name}</div>
              <div className="text-slate-500">Current Status: <span className="uppercase font-semibold">{selectedOpp.status}</span></div>
            </div>

            <SelectField
              label="Select New Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              options={[
                { value: 'published', label: 'Published — Active and searchable in public catalog' },
                { value: 'draft', label: 'Draft — Hidden from public catalog' },
                { value: 'closed', label: 'Closed — Applications halted, preserved in history' },
                { value: 'archived', label: 'Archived — Inactive and retired from active view' }
              ]}
              required
            />

            <TextArea
              label="Moderation Reason / Note"
              placeholder="e.g. Safety inspection verified, non-compliant description edited, emergency event cancellation..."
              value={moderationReason}
              onChange={(e) => setModerationReason(e.target.value)}
              rows={3}
              required
            />

            <p className="text-[11px] text-slate-500">
              * This administrative change will be recorded in the security audit trail.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelectedOpp(null)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
              >
                Save Moderation Action
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </PageContainer>
  );
}
