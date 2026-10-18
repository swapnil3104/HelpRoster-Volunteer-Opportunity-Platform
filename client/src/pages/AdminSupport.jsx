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
import { getAdminContactSubmissions, updateAdminContactSubmission } from '../services/api';
import {
  MessageSquare,
  Search,
  Mail,
  User,
  Clock,
  CheckCircle2,
  RefreshCw,
  FileText
} from 'lucide-react';

export default function AdminSupport() {
  const [submissions, setSubmissions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('new');
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Resolution Modal State
  const [selectedSub, setSelectedSub] = useState(null);
  const [newStatus, setNewStatus] = useState('resolved');
  const [responseNotes, setResponseNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSubmissions = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 15,
        search: search.trim() || undefined,
        status: statusFilter || undefined
      };
      const res = await getAdminContactSubmissions(params);
      if (res.data.success) {
        setSubmissions(res.data.data.submissions);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to retrieve support inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSubmissions(1);
  };

  const handleOpenModal = (sub) => {
    setSelectedSub(sub);
    setNewStatus(sub.status === 'new' ? 'in_progress' : sub.status);
    setResponseNotes(sub.response_notes || '');
  };

  const handleSaveResolution = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    try {
      setSubmitting(true);
      setError(null);
      const res = await updateAdminContactSubmission(selectedSub.id, {
        status: newStatus,
        response_notes: responseNotes
      });
      if (res.data.success) {
        setFeedback(`Ticket #${selectedSub.id} from ${selectedSub.email} updated to ${newStatus}.`);
        setSelectedSub(null);
        fetchSubmissions(pagination.page);
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update support inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer className="py-8">
      <AdminNav
        title="Support Inquiries Queue"
        subtitle="Review community messages, address inquiries, log staff response notes, and maintain support SLA standards."
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            {[
              { id: 'new', label: 'New / Unopened' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'resolved', label: 'Resolved' },
              { id: 'closed', label: 'Closed' },
              { id: '', label: 'All Inquiries' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  statusFilter === tab.id
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
              placeholder="Search by name, email, subject..."
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
                setStatusFilter('new');
                fetchSubmissions(1);
              }}
              title="Reset"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>

      {/* Inquiries Table */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton count={6} />
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No inquiries found"
              description={
                statusFilter === 'new'
                  ? 'All inquiries have been addressed! The new tickets inbox is clean.'
                  : 'No tickets matched your current search filters.'
              }
              actionLabel={statusFilter ? 'View All Inquiries' : undefined}
              onAction={statusFilter ? () => setStatusFilter('') : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Inquiry</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">From</th>
                  <th className="px-4 py-4">Staff Handling</th>
                  <th className="px-4 py-4">Received</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 max-w-sm">
                      <div className="font-bold text-slate-900">{sub.subject}</div>
                      <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">{sub.message}</div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs font-medium text-slate-800">{sub.name}</div>
                      <a
                        href={`mailto:${sub.email}`}
                        className="text-[11px] text-brand-600 hover:underline flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" />
                        <span>{sub.email}</span>
                      </a>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600">
                      {sub.responder_name ? (
                        <div>
                          <div className="font-medium text-slate-800">{sub.responder_name}</div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(sub.responded_at).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant={sub.status === 'new' ? 'primary' : 'outline'}
                        onClick={() => handleOpenModal(sub)}
                      >
                        {sub.status === 'new' ? 'Review & Reply' : 'View Details'}
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
                onClick={() => fetchSubmissions(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchSubmissions(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Inquiry Resolution Modal */}
      {selectedSub && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSub(null)}
          title={`Ticket #${selectedSub.id}: ${selectedSub.subject}`}
        >
          <form onSubmit={handleSaveResolution} className="space-y-4">
            {/* Inquiry Content Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-500">From: </span>
                  <strong className="text-slate-900">{selectedSub.name}</strong> ({selectedSub.email})
                </div>
                <div className="text-slate-400">
                  {new Date(selectedSub.created_at).toLocaleString()}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">
                {selectedSub.message}
              </div>
            </div>

            {/* Status Field */}
            <SelectField
              label="Ticket Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              options={[
                { value: 'new', label: 'New / Awaiting Review' },
                { value: 'in_progress', label: 'In Progress (Follow-up underway)' },
                { value: 'resolved', label: 'Resolved (Inquiry satisfied)' },
                { value: 'closed', label: 'Closed (No further action)' }
              ]}
              required
            />

            {/* Response Notes Field */}
            <TextArea
              label="Internal Staff Response Notes"
              placeholder="Summarize the email or phone reply sent to the visitor, resolution details, or relevant ticket references..."
              value={responseNotes}
              onChange={(e) => setResponseNotes(e.target.value)}
              rows={4}
            />

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <a
                href={`mailto:${selectedSub.email}?subject=${encodeURIComponent(`Re: ${selectedSub.subject}`)}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                <Mail className="w-4 h-4" />
                <span>Open in Mail Client</span>
              </a>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedSub(null)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                >
                  Update Ticket
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </PageContainer>
  );
}
