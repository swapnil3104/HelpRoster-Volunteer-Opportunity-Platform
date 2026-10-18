import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  FileCheck2,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getOrganizationDashboard,
  reviewApplication,
  reviewVolunteerHours
} from '../services/api';
import PageContainer from '../components/common/PageContainer';
import PageHeading from '../components/common/PageHeading';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';
import TextArea from '../components/common/TextArea';

export default function OrganizationDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Applicant review modal state
  const [selectedApp, setSelectedApp] = useState(null);
  const [appDecisionStatus, setAppDecisionStatus] = useState(null); // 'accepted' | 'rejected'
  const [appNotes, setAppNotes] = useState('');
  const [submittingAppDecision, setSubmittingAppDecision] = useState(false);

  // Hours review modal state
  const [selectedHours, setSelectedHours] = useState(null);
  const [hoursDecisionStatus, setHoursDecisionStatus] = useState(null); // 'approved' | 'rejected'
  const [hoursFeedback, setHoursFeedback] = useState('');
  const [submittingHoursDecision, setSubmittingHoursDecision] = useState(false);

  // Notification message
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getOrganizationDashboard();
      if (res?.success || res?.data?.success) {
        setData(res?.data?.data || res?.data);
      }
    } catch (err) {
      console.error('Failed to load organization dashboard:', err);
      setError('Failed to load organization metrics. Please refresh or try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenAppReview = (app, status) => {
    setSelectedApp(app);
    setAppDecisionStatus(status);
    setAppNotes('');
  };

  const handleSubmitAppReview = async () => {
    if (!selectedApp || !appDecisionStatus) return;
    try {
      setSubmittingAppDecision(true);
      await reviewApplication(selectedApp.id, {
        status: appDecisionStatus,
        review_notes: appNotes
      });
      setActionSuccess(`Application for ${selectedApp.first_name} ${selectedApp.last_name} has been ${appDecisionStatus}.`);
      setSelectedApp(null);
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to submit application decision:', err);
      alert('Error updating application. Please try again.');
    } finally {
      setSubmittingAppDecision(false);
    }
  };

  const handleOpenHoursReview = (hoursRecord, status) => {
    setSelectedHours(hoursRecord);
    setHoursDecisionStatus(status);
    setHoursFeedback(status === 'approved' ? 'Thank you for your service and contribution!' : '');
  };

  const handleSubmitHoursReview = async () => {
    if (!selectedHours || !hoursDecisionStatus) return;
    try {
      setSubmittingHoursDecision(true);
      await reviewVolunteerHours(selectedHours.id, {
        status: hoursDecisionStatus,
        feedback: hoursFeedback
      });
      setActionSuccess(`Volunteer hours for ${selectedHours.first_name} ${selectedHours.last_name} have been ${hoursDecisionStatus}.`);
      setSelectedHours(null);
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to review volunteer hours:', err);
      alert('Error reviewing hours. Please try again.');
    } finally {
      setSubmittingHoursDecision(false);
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
          {error || 'Unable to retrieve organization dashboard.'}
        </Alert>
        <div className="mt-4">
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </PageContainer>
    );
  }

  const { organization, opportunity_stats, application_stats, hours_stats, pending_applicants, pending_hours, recent_listings } = data;
  const isVerified = organization?.verification_status === 'verified';

  return (
    <PageContainer>
      {/* Organization Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0 text-brand-600 font-bold text-xl">
              {organization?.name?.[0] || 'O'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {organization?.name || 'Organization Workspace'}
                </h1>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Partner
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Pending Verification
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-500 max-w-2xl line-clamp-2">
                {organization?.description || 'Manage your active volunteer opportunities, coordinate applicant reviews, and approve verified service hours.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/manage/opportunities">
              <Button variant="primary" className="inline-flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                Manage Opportunities
              </Button>
            </Link>
            <Link to="/applicants">
              <Button variant="outline">
                Review Applicants
              </Button>
            </Link>
            <Link to="/hours">
              <Button variant="outline">
                Review Hours
              </Button>
            </Link>
            {organization?.id && (
              <Link to={`/organizations/${organization.id}`} target="_blank">
                <Button variant="ghost" className="p-2" title="View Public Profile">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Verification Warning Notice if unverified */}
        {!isVerified && (
          <div className="mt-6">
            <Alert
              variant="warning"
              title="Organization Verification Gate Active"
            >
              Your organization account is currently undergoing administrator verification. You may create, edit, and preview draft opportunities; however, opportunities cannot be published to the public directory until administrative verification is complete.
            </Alert>
          </div>
        )}
      </div>

      {actionSuccess && (
        <div className="mb-6">
          <Alert variant="success" onClose={() => setActionSuccess(null)}>
            {actionSuccess}
          </Alert>
        </div>
      )}

      {/* 4 Core Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Active Listings */}
        <Card className="border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Published Listings
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {opportunity_stats.published}
            </span>
            <span className="text-xs font-medium text-slate-500">active</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>{opportunity_stats.draft} drafts</span>
            <span>•</span>
            <span>{opportunity_stats.closed} closed</span>
          </div>
        </Card>

        {/* Applicants Awaiting Review */}
        <Card className="border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Applicant Review Queue
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {application_stats.pending}
            </span>
            <span className="text-xs font-medium text-slate-500">pending</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {application_stats.accepted} accepted • {application_stats.rejected} rejected
          </div>
        </Card>

        {/* Pending Volunteer Hours Reviews */}
        <Card className="border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Hours Awaiting Approval
            </span>
            <div className="w-9 h-9 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {hours_stats.pending_reviews_count}
            </span>
            <span className="text-xs font-medium text-slate-500">submissions</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {hours_stats.pending_reviews_count > 0 ? (
              <span className="text-amber-600 font-semibold">Requires coordinator review</span>
            ) : (
              <span>All volunteer hours cleared</span>
            )}
          </div>
        </Card>

        {/* Verified Impact Hours */}
        <Card className="border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Verified Impact
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {hours_stats.total_approved_hours.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-slate-500">hours</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Accredited volunteer service hours
          </div>
        </Card>
      </div>

      {/* Action Queues Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Pending Applicants Queue */}
        <Card className="border border-slate-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-600" />
                Applicants Awaiting Review ({pending_applicants?.length || 0})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Volunteers requesting to join your listings</p>
            </div>
            <Link
              to="/applicants"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Full Queue
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pending_applicants?.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">All applicant reviews are up to date!</p>
              <p className="text-xs text-slate-400 mt-1">New volunteer applications will appear here automatically.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pending_applicants.map((app) => (
                <div key={app.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
                        {app.first_name?.[0]}{app.last_name?.[0]}
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-slate-900">
                          {app.first_name} {app.last_name}
                        </span>
                        <p className="text-xs text-slate-500 font-medium">
                          for <span className="text-slate-800">{app.opportunity_title}</span>
                        </p>
                        {app.message && (
                          <p className="mt-1 text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                            "{app.message}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                      onClick={() => handleOpenAppReview(app, 'rejected')}
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      className="text-xs"
                      onClick={() => handleOpenAppReview(app, 'accepted')}
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Accept Volunteer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pending Hours Review Queue */}
        <Card className="border border-slate-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent-600" />
                Volunteer Hours Awaiting Approval ({pending_hours?.length || 0})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Submitted shifts needing verification</p>
            </div>
            <Link
              to="/hours"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              All Hours
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pending_hours?.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No hours awaiting review!</p>
              <p className="text-xs text-slate-400 mt-1">Submitted volunteer service logs will appear here for verification.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pending_hours.map((h) => (
                <div key={h.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">
                          {h.first_name} {h.last_name}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-accent-50 text-accent-700">
                          {parseFloat(h.hours).toFixed(1)} hrs
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {h.opportunity_title} • {new Date(h.activity_date).toLocaleDateString()}
                      </p>
                      {h.description && (
                        <p className="mt-1 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {h.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                      onClick={() => handleOpenHoursReview(h, 'rejected')}
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="accent"
                      className="text-xs"
                      onClick={() => handleOpenHoursReview(h, 'approved')}
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Approve Hours
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Listings Overview */}
      <Card className="border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-brand-600" />
              Recent Opportunity Listings
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Overview of active and draft opportunities</p>
          </div>
          <Link
            to="/manage/opportunities"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            Manage all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent_listings?.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">No opportunities created yet</p>
            <p className="text-xs text-slate-400 mt-1">Post your first volunteer opportunity to start engaging community volunteers.</p>
            <Link to="/manage/opportunities" className="inline-block mt-3">
              <Button size="sm">Create Opportunity</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-500">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Applicants</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent_listings.map((opp) => (
                  <tr key={opp.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-semibold text-slate-900 max-w-xs truncate">
                      {opp.title}
                    </td>
                    <td className="py-3 text-xs text-slate-500">
                      {opp.category_name || 'General'}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={opp.status} />
                    </td>
                    <td className="py-3 text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">{opp.applicants_count}</span> volunteers
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex gap-2">
                        <Link to={`/applicants?opportunity_id=${opp.id}`}>
                          <Button size="sm" variant="ghost" className="text-xs py-1">
                            Applicants
                          </Button>
                        </Link>
                        <Link to="/manage/opportunities">
                          <Button size="sm" variant="outline" className="text-xs py-1">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Applicant Decision Modal */}
      {selectedApp && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedApp(null)}
          title={`${appDecisionStatus === 'accepted' ? 'Accept' : 'Decline'} Application`}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              You are {appDecisionStatus === 'accepted' ? 'accepting' : 'declining'}{' '}
              <span className="font-semibold text-slate-900">
                {selectedApp.first_name} {selectedApp.last_name}
              </span>{' '}
              for <span className="font-semibold text-slate-900">{selectedApp.opportunity_title}</span>.
            </p>

            <TextArea
              label="Review Note / Feedback"
              placeholder={
                appDecisionStatus === 'accepted'
                  ? 'Add welcome instructions, reporting time, or coordinator contact information...'
                  : 'Add brief constructive feedback or future opportunity suggestions...'
              }
              value={appNotes}
              onChange={(e) => setAppNotes(e.target.value)}
              rows={3}
              helperText="This note will be visible to the volunteer on their application dashboard."
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedApp(null)}>
                Cancel
              </Button>
              <Button
                variant={appDecisionStatus === 'accepted' ? 'primary' : 'danger'}
                onClick={handleSubmitAppReview}
                loading={submittingAppDecision}
              >
                Confirm {appDecisionStatus === 'accepted' ? 'Acceptance' : 'Rejection'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Hours Review Modal */}
      {selectedHours && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedHours(null)}
          title={`${hoursDecisionStatus === 'approved' ? 'Approve' : 'Reject'} Volunteer Hours`}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Reviewing <span className="font-bold text-slate-900">{parseFloat(selectedHours.hours).toFixed(1)} service hours</span> logged by{' '}
              <span className="font-semibold text-slate-900">
                {selectedHours.first_name} {selectedHours.last_name}
              </span>{' '}
              for <span className="font-semibold text-slate-900">{selectedHours.opportunity_title}</span>.
            </p>

            {selectedHours.description && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700">
                <span className="font-semibold block mb-1">Volunteer Activity Description:</span>
                {selectedHours.description}
              </div>
            )}

            <TextArea
              label="Coordinator Feedback Note"
              placeholder="e.g. Great enthusiasm and punctuality. Thank you for your service!"
              value={hoursFeedback}
              onChange={(e) => setHoursFeedback(e.target.value)}
              rows={3}
              helperText="Feedback note attached to the approved/rejected service hour record."
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedHours(null)}>
                Cancel
              </Button>
              <Button
                variant={hoursDecisionStatus === 'approved' ? 'accent' : 'danger'}
                onClick={handleSubmitHoursReview}
                loading={submittingHoursDecision}
              >
                Confirm {hoursDecisionStatus === 'approved' ? 'Approval' : 'Rejection'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}
