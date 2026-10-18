import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Clock,
  PlusCircle,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Check,
  X,
  MessageSquare,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getMyVolunteerHours,
  logVolunteerHours,
  deleteVolunteerHours,
  getOrganizationHoursQueue,
  reviewVolunteerHours,
  getMyApplications,
  getOpportunities
} from '../services/api';
import PageContainer from '../components/common/PageContainer';
import PageHeading from '../components/common/PageHeading';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';
import TextField from '../components/common/TextField';
import TextArea from '../components/common/TextArea';
import SelectField from '../components/common/SelectField';

export default function VolunteerHours() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const isOrg = user?.role === 'organization';

  // Active tab for dual role/view support: 'my' or 'organization'
  const activeTab = isOrg ? 'organization' : (searchParams.get('tab') || 'my');

  // Volunteer state
  const [volunteerLoading, setVolunteerLoading] = useState(true);
  const [volunteerHoursData, setVolunteerHoursData] = useState({ summary: {}, hours: [] });
  const [statusFilter, setStatusFilter] = useState('all');

  // Org review state
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgHoursQueue, setOrgHoursQueue] = useState([]);
  const [orgStatusFilter, setOrgStatusFilter] = useState('all');

  // Modal: Log hours
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [availableOpps, setAvailableOpps] = useState([]);
  const [oppLoading, setOppLoading] = useState(false);
  const [formOpportunityId, setFormOpportunityId] = useState('');
  const [formActivityDate, setFormActivityDate] = useState(new Date().toISOString().split('T')[0]);
  const [formHours, setFormHours] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Modal: Org review
  const [selectedReviewHour, setSelectedReviewHour] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('approved');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Alerts
  const [bannerAlert, setBannerAlert] = useState(null);

  // Fetch volunteer hours
  const fetchVolunteerHours = async () => {
    try {
      setVolunteerLoading(true);
      const res = await getMyVolunteerHours({ status: statusFilter });
      if (res?.success || res?.data?.success) {
        setVolunteerHoursData(res?.data?.data || res?.data);
      }
    } catch (err) {
      console.error('Failed to load volunteer hours:', err);
    } finally {
      setVolunteerLoading(false);
    }
  };

  // Fetch org hours queue
  const fetchOrgHoursQueue = async () => {
    try {
      setOrgLoading(true);
      const res = await getOrganizationHoursQueue({ status: orgStatusFilter });
      if (res?.success || res?.data?.success) {
        setOrgHoursQueue(res?.data?.data || res?.data);
      }
    } catch (err) {
      console.error('Failed to load organization hours review queue:', err);
    } finally {
      setOrgLoading(false);
    }
  };

  useEffect(() => {
    if (!isOrg) {
      fetchVolunteerHours();
    } else {
      fetchOrgHoursQueue();
    }
  }, [statusFilter, orgStatusFilter, isOrg]);

  // Load opportunities when opening log modal
  const handleOpenLogModal = async () => {
    setLogModalOpen(true);
    setFormError(null);
    try {
      setOppLoading(true);
      // First try to load volunteer's accepted applications
      const appsRes = await getMyApplications({ status: 'accepted' });
      const appsList = appsRes?.data?.applications || appsRes?.data?.data?.applications || appsRes?.applications || [];
      if (appsList.length > 0) {
        setAvailableOpps(
          appsList.map((a) => ({
            value: a.opportunity_id,
            label: `${a.opportunity_title} (${a.organization_name})`
          }))
        );
        setFormOpportunityId(appsList[0].opportunity_id);
      } else {
        // Fallback to active opportunities
        const oppsRes = await getOpportunities({ limit: 20 });
        const oppsList = Array.isArray(oppsRes?.data) ? oppsRes.data : (oppsRes?.data?.opportunities || oppsRes?.opportunities || []);
        if (oppsList.length > 0) {
          setAvailableOpps(
            oppsList.map((o) => ({
              value: o.id,
              label: `${o.title} (${o.organization_name})`
            }))
          );
          setFormOpportunityId(oppsList[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load opportunities for hours logging:', err);
    } finally {
      setOppLoading(false);
    }
  };

  // Handle logging hours submission
  const handleSubmitHours = async (e) => {
    e.preventDefault();
    if (!formOpportunityId) {
      setFormError('Please select an opportunity.');
      return;
    }
    const parsed = parseFloat(formHours);
    if (isNaN(parsed) || parsed <= 0 || parsed > 24) {
      setFormError('Hours must be between 0.25 and 24.');
      return;
    }
    if (!formActivityDate) {
      setFormError('Please select the activity date.');
      return;
    }
    if (!formDescription || formDescription.trim().length < 5) {
      setFormError('Please provide a brief description of the activities completed.');
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError(null);
      await logVolunteerHours({
        opportunity_id: formOpportunityId,
        activity_date: formActivityDate,
        hours: parsed,
        description: formDescription.trim()
      });

      setLogModalOpen(false);
      setFormHours('');
      setFormDescription('');
      setBannerAlert({
        type: 'success',
        text: 'Volunteer service hours logged successfully! Submitted to the organization coordinator for approval.'
      });
      await fetchVolunteerHours();
    } catch (err) {
      console.error('Failed to log hours:', err);
      setFormError(err.response?.data?.message || 'Failed to submit volunteer hours. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete pending hour entry
  const handleDeletePendingHour = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pending hours submission?')) return;
    try {
      await deleteVolunteerHours(id);
      setBannerAlert({
        type: 'info',
        text: 'Hours submission removed.'
      });
      await fetchVolunteerHours();
    } catch (err) {
      console.error('Failed to delete hours submission:', err);
      alert('Error deleting hours submission.');
    }
  };

  // Submit org review
  const handleOpenReviewModal = (hour, decision) => {
    setSelectedReviewHour(hour);
    setReviewDecision(decision);
    setReviewFeedback(decision === 'approved' ? 'Thank you for your dedicated service!' : '');
  };

  const handleSubmitReviewDecision = async () => {
    if (!selectedReviewHour) return;
    try {
      setReviewSubmitting(true);
      await reviewVolunteerHours(selectedReviewHour.id, {
        status: reviewDecision,
        feedback: reviewFeedback
      });
      setBannerAlert({
        type: 'success',
        text: `Volunteer hours record ${reviewDecision} successfully.`
      });
      setSelectedReviewHour(null);
      await fetchOrgHoursQueue();
    } catch (err) {
      console.error('Failed to review hours:', err);
      alert('Error submitting review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const { summary = {}, hours = [] } = volunteerHoursData;

  return (
    <PageContainer>
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <PageHeading
            title={isOrg ? 'Volunteer Hours Review' : 'Volunteer Service Hours'}
            description={
              isOrg
                ? 'Review and verify volunteer service hours submitted for your organization listings.'
                : 'Track, log, and view verified volunteer hours across all community initiatives.'
            }
          />
        </div>
        {!isOrg && (
          <Button
            variant="accent"
            onClick={handleOpenLogModal}
            className="inline-flex items-center gap-2 self-start sm:self-auto shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Log Volunteer Hours
          </Button>
        )}
      </div>

      {bannerAlert && (
        <div className="mb-6">
          <Alert variant={bannerAlert.type} onClose={() => setBannerAlert(null)}>
            {bannerAlert.text}
          </Alert>
        </div>
      )}

      {/* Volunteer Mode UI */}
      {!isOrg && (
        <div>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <Card className="border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Approved Hours
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {(summary.approved_hours || 0).toFixed(1)}
                </span>
                <span className="text-xs font-medium text-slate-500">accredited hours</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Verified community service credit
              </p>
            </Card>

            <Card className="border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Pending Review
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {(summary.pending_hours || 0).toFixed(1)}
                </span>
                <span className="text-xs font-medium text-slate-500">hours awaiting</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Awaiting coordinator sign-off
              </p>
            </Card>

            <Card className="border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Submissions
                </span>
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {summary.total_submissions || 0}
                </span>
                <span className="text-xs font-medium text-slate-500">logged shifts</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Across all registered initiatives
              </p>
            </Card>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6">
            {['all', 'approved', 'pending', 'rejected'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                  statusFilter === tab
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Hours List */}
          {volunteerLoading ? (
            <div className="space-y-4">
              <LoadingSkeleton height="70px" />
              <LoadingSkeleton height="70px" />
              <LoadingSkeleton height="70px" />
            </div>
          ) : hours.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No volunteer hours logged</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {statusFilter === 'all'
                  ? 'You have not logged any service hours yet. Click "Log Volunteer Hours" above to record completed volunteer shifts.'
                  : `No hours found with status "${statusFilter}".`}
              </p>
              {statusFilter === 'all' && (
                <Button variant="accent" size="sm" onClick={handleOpenLogModal} className="mt-4">
                  Log Hours Now
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {hours.map((log) => (
                <Card key={log.id} className="border border-slate-200 hover:border-slate-300 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 flex flex-col items-center justify-center shrink-0">
                        <span className="text-base font-extrabold leading-none">
                          {parseFloat(log.hours).toFixed(1)}
                        </span>
                        <span className="text-[10px] font-semibold text-brand-700 uppercase">hrs</span>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={`/opportunities/${log.opportunity_slug || log.opportunity_id}`}
                            className="font-bold text-slate-900 hover:text-brand-600 text-base transition-colors"
                          >
                            {log.opportunity_title}
                          </Link>
                          <StatusBadge status={log.status} />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          <span className="font-semibold text-slate-700">{log.organization_name}</span>
                          {' • '}
                          <span>Activity Date: {new Date(log.activity_date).toLocaleDateString()}</span>
                          {log.category_name && (
                            <>
                              {' • '}
                              <span className="text-slate-400">{log.category_name}</span>
                            </>
                          )}
                        </p>
                        {log.description && (
                          <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            {log.description}
                          </p>
                        )}
                        {log.feedback && (
                          <div className="mt-2 text-xs bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-2.5">
                            <span className="font-semibold">
                              Coordinator Note ({log.reviewer_first_name} {log.reviewer_last_name}):{' '}
                            </span>
                            {log.feedback}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {log.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 py-1"
                          onClick={() => handleDeletePendingHour(log.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Organization Review Queue UI */}
      {isOrg && (
        <div>
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6">
            {['all', 'pending', 'approved', 'rejected'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setOrgStatusFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                  orgStatusFilter === tab
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {orgLoading ? (
            <div className="space-y-4">
              <LoadingSkeleton height="80px" />
              <LoadingSkeleton height="80px" />
            </div>
          ) : orgHoursQueue.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">All volunteer hours reviewed</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No volunteer service hours currently matching status "{orgStatusFilter}".
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orgHoursQueue.map((item) => (
                <Card key={item.id} className="border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0">
                        {item.volunteer_first_name?.[0]}{item.volunteer_last_name?.[0]}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 text-base">
                            {item.volunteer_first_name} {item.volunteer_last_name}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">({item.volunteer_email})</span>
                          <StatusBadge status={item.status} />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          <span className="font-semibold text-slate-700">{item.opportunity_title}</span>
                          {' • '}
                          <span className="font-bold text-brand-600">{parseFloat(item.hours).toFixed(1)} hrs</span>
                          {' • '}
                          <span>Activity: {new Date(item.activity_date).toLocaleDateString()}</span>
                        </p>
                        {item.description && (
                          <p className="mt-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <span className="font-semibold block mb-0.5 text-slate-500">Volunteer Note:</span>
                            {item.description}
                          </p>
                        )}
                        {item.feedback && (
                          <div className="mt-2 text-xs bg-emerald-50 text-emerald-800 p-2 rounded-lg border border-emerald-100">
                            <span className="font-semibold">Review Feedback:</span> {item.feedback}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                        onClick={() => handleOpenReviewModal(item, 'rejected')}
                      >
                        <X className="w-3.5 h-3.5 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="accent"
                        className="text-xs"
                        onClick={() => handleOpenReviewModal(item, 'approved')}
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Approve Hours
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Log Volunteer Hours */}
      <Modal
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        title="Log Volunteer Service Hours"
      >
        <form onSubmit={handleSubmitHours} className="space-y-4">
          {formError && (
            <Alert variant="error" onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}

          <div>
            <SelectField
              label="Opportunity *"
              options={availableOpps}
              value={formOpportunityId}
              onChange={(e) => setFormOpportunityId(e.target.value)}
              helperText="Select the volunteer initiative you participated in."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Activity Date *"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              value={formActivityDate}
              onChange={(e) => setFormActivityDate(e.target.value)}
              required
            />

            <div>
              <TextField
                label="Hours Spent *"
                type="number"
                step="0.25"
                min="0.25"
                max="24"
                placeholder="e.g. 4.0"
                value={formHours}
                onChange={(e) => setFormHours(e.target.value)}
                required
              />
              <div className="flex gap-1.5 mt-1.5">
                {[1, 2, 4, 8].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFormHours(preset.toString())}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    {preset}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          <TextArea
            label="Activity Description *"
            placeholder="Describe the tasks, duties, or assistance you provided during this shift..."
            rows={3}
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            helperText="Provides context for the organization coordinator reviewing your hours."
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLogModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              loading={formSubmitting}
            >
              Submit for Verification
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Org Hours Review */}
      {selectedReviewHour && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedReviewHour(null)}
          title={`${reviewDecision === 'approved' ? 'Approve' : 'Reject'} Volunteer Hours`}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Reviewing <span className="font-bold text-slate-900">{parseFloat(selectedReviewHour.hours).toFixed(1)} service hours</span> logged by{' '}
              <span className="font-semibold text-slate-900">
                {selectedReviewHour.volunteer_first_name} {selectedReviewHour.volunteer_last_name}
              </span>{' '}
              for <span className="font-semibold text-slate-900">{selectedReviewHour.opportunity_title}</span>.
            </p>

            <TextArea
              label="Reviewer Feedback Note"
              placeholder="Add optional note or appreciation..."
              rows={3}
              value={reviewFeedback}
              onChange={(e) => setReviewFeedback(e.target.value)}
              helperText="This feedback will be visible to the volunteer on their service log."
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedReviewHour(null)}>
                Cancel
              </Button>
              <Button
                variant={reviewDecision === 'approved' ? 'accent' : 'danger'}
                onClick={handleSubmitReviewDecision}
                loading={reviewSubmitting}
              >
                Confirm {reviewDecision === 'approved' ? 'Approval' : 'Rejection'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}
