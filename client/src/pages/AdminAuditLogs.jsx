import React, { useState, useEffect } from 'react';
import PageContainer from '../components/common/PageContainer';
import AdminNav from '../components/admin/AdminNav';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import TextField from '../components/common/TextField';
import SelectField from '../components/common/SelectField';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';
import EmptyState from '../components/common/EmptyState';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { getAdminAuditLogs } from '../services/api';
import {
  ScrollText,
  Search,
  Shield,
  Eye,
  RefreshCw,
  Terminal,
  Activity
} from 'lucide-react';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [actionSearch, setActionSearch] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [error, setError] = useState(null);

  // Inspector modal state
  const [inspectedLog, setInspectedLog] = useState(null);

  const fetchAuditLogs = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 20,
        action: actionSearch.trim() || undefined,
        target_type: targetTypeFilter || undefined
      };
      const res = await getAdminAuditLogs(params);
      if (res.data.success) {
        setLogs(res.data.data.logs);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to retrieve audit trail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs(1);
  }, [targetTypeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAuditLogs(1);
  };

  return (
    <PageContainer className="py-8">
      <AdminNav
        title="Security & System Audit Logs"
        subtitle="Immutable audit record of all privileged administrative updates, user status toggles, verification decisions, and moderation actions."
      />

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Filter and Search Bar */}
      <Card className="p-4 mb-6 border-slate-200">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-6">
            <TextField
              label="Action Filter"
              placeholder="Filter by action keyword (e.g. status_change, verified, moderation)..."
              value={actionSearch}
              onChange={(e) => setActionSearch(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="md:col-span-4">
            <SelectField
              label="Resource Target Type"
              value={targetTypeFilter}
              onChange={(e) => setTargetTypeFilter(e.target.value)}
              options={[
                { value: '', label: 'All Resources' },
                { value: 'user', label: 'User Accounts' },
                { value: 'organization', label: 'Organizations' },
                { value: 'opportunity', label: 'Opportunities' },
                { value: 'contact_submission', label: 'Support Inquiries' },
                { value: 'auth', label: 'Authentication Events' }
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
                setActionSearch('');
                setTargetTypeFilter('');
                fetchAuditLogs(1);
              }}
              title="Reset"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </Card>

      {/* Audit Log Data Table */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton count={8} />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No audit entries found"
              description="No security or moderation records matched your current criteria."
              actionLabel="Clear Filters"
              onAction={() => {
                setActionSearch('');
                setTargetTypeFilter('');
                fetchAuditLogs(1);
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-4 py-4">Actor</th>
                  <th className="px-4 py-4">Action</th>
                  <th className="px-4 py-4">Target Resource</th>
                  <th className="px-4 py-4">IP Address</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-slate-600 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900 text-xs">
                        {log.actor_name || 'System / Automated'}
                      </div>
                      <div className="text-[11px] text-slate-400">{log.actor_email || '—'}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-700">
                      <span className="font-semibold capitalize">{log.target_type}</span>
                      {log.target_id && <span className="text-slate-400"> #{log.target_id}</span>}
                    </td>
                    <td className="px-4 py-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                      {log.ip_address || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setInspectedLog(log)}
                        className="flex items-center gap-1 ml-auto text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
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
                onClick={() => fetchAuditLogs(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchAuditLogs(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Inspector Modal */}
      {inspectedLog && (
        <Modal
          isOpen={true}
          onClose={() => setInspectedLog(null)}
          title={`Audit Event #${inspectedLog.id}: ${inspectedLog.action}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block">Actor:</span>
                <span className="font-semibold text-slate-900">{inspectedLog.actor_name || 'System'}</span> (
                {inspectedLog.actor_email || 'n/a'})
              </div>
              <div>
                <span className="text-slate-400 block">Timestamp:</span>
                <span className="font-mono text-slate-800">{new Date(inspectedLog.created_at).toISOString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Target:</span>
                <span className="font-semibold capitalize text-slate-900">
                  {inspectedLog.target_type} #{inspectedLog.target_id || 'n/a'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Client IP:</span>
                <span className="font-mono text-slate-800">{inspectedLog.ip_address || '—'}</span>
              </div>
            </div>

            {inspectedLog.user_agent && (
              <div className="text-xs text-slate-500 break-all p-2 bg-slate-50 rounded-lg">
                <span className="font-semibold text-slate-600">User Agent:</span> {inspectedLog.user_agent}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Terminal className="w-4 h-4 text-brand-600" />
                <span>Event Payload (Details)</span>
              </div>
              <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-64">
                {JSON.stringify(inspectedLog.details || {}, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <Button variant="outline" onClick={() => setInspectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}
