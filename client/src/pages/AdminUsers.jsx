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
import { getAdminUsers, updateUserStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Search,
  Filter,
  Shield,
  UserCheck,
  UserX,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Status Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [newStatus, setNewStatus] = useState('active');
  const [statusReason, setStatusReason] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 15,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined
      };
      const res = await getAdminUsers(params);
      if (res.data.success) {
        setUsers(res.data.data.users);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to retrieve users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleOpenStatusModal = (user) => {
    setSelectedUser(user);
    setNewStatus(user.status === 'suspended' ? 'active' : 'suspended');
    setStatusReason('');
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setUpdating(true);
      setError(null);
      const res = await updateUserStatus(selectedUser.id, {
        status: newStatus,
        reason: statusReason
      });
      if (res.data.success) {
        setFeedback(`User ${selectedUser.email} status updated to ${newStatus}.`);
        setSelectedUser(null);
        fetchUsers(pagination.page);
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update user status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <PageContainer className="py-8">
      <AdminNav
        title="User Accounts Management"
        subtitle="Search community volunteers, organization representatives, and manage active/suspended account privileges."
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
          <div className="md:col-span-5">
            <TextField
              label="Search User"
              placeholder="Filter by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="md:col-span-3">
            <SelectField
              label="Role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: '', label: 'All Roles' },
                { value: 'volunteer', label: 'Volunteer' },
                { value: 'organization', label: 'Organization Rep' },
                { value: 'admin', label: 'Platform Admin' }
              ]}
            />
          </div>
          <div className="md:col-span-2">
            <SelectField
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'suspended', label: 'Suspended' },
                { value: 'pending', label: 'Pending' }
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
                setRoleFilter('');
                setStatusFilter('');
                fetchUsers(1);
              }}
              title="Reset"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </Card>

      {/* Users Data Table */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton count={6} />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No users found"
              description="No user accounts matched your current search filters."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearch('');
                setRoleFilter('');
                setStatusFilter('');
                fetchUsers(1);
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-4 py-4">Role</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Associated Entity</th>
                  <th className="px-4 py-4">Registered</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {u.first_name} {u.last_name}
                          {isCurrent && (
                            <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            u.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : u.role === 'organization'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600">
                        {u.org_name ? (
                          <span className="font-medium text-slate-900">{u.org_name}</span>
                        ) : u.volunteer_location ? (
                          <span>{u.volunteer_location}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isCurrent && (
                          <Button
                            size="sm"
                            variant={u.status === 'suspended' ? 'outline' : 'ghost'}
                            className={u.status === 'suspended' ? 'text-emerald-600 border-emerald-300' : 'text-slate-600 hover:text-red-600'}
                            onClick={() => handleOpenStatusModal(u)}
                          >
                            {u.status === 'suspended' ? 'Reactivate' : 'Change Status'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
                onClick={() => fetchUsers(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchUsers(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Account Status Modal */}
      {selectedUser && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedUser(null)}
          title={`Update Account Status: ${selectedUser.first_name} ${selectedUser.last_name}`}
        >
          <form onSubmit={handleSaveStatus} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="font-semibold text-slate-800">{selectedUser.email}</div>
              <div className="text-slate-500 capitalize">Role: {selectedUser.role} &bull; Current Status: {selectedUser.status}</div>
            </div>

            <SelectField
              label="Select New Account Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              options={[
                { value: 'active', label: 'Active — User has full platform access' },
                { value: 'suspended', label: 'Suspended — User is blocked from signing in' },
                { value: 'pending', label: 'Pending — Awaiting administrative review' }
              ]}
              required
            />

            {newStatus === 'suspended' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <div>
                  <strong>Warning:</strong> Suspending this account will immediately revoke login access. An audit entry will be recorded.
                </div>
              </div>
            )}

            <TextArea
              label="Reason for Status Change"
              placeholder="e.g. Terms of service violation, appeal approved, etc."
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              rows={3}
              required
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelectedUser(null)}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={newStatus === 'suspended' ? 'danger' : 'primary'}
                loading={updating}
              >
                Confirm Status Change
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </PageContainer>
  );
}
