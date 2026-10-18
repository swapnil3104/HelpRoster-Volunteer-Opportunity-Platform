import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MessageSquare,
  Building2,
  AlertCircle,
  FileCheck2,
  ChevronRight,
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  getOrganizationApplicantsQueue,
  getManageOpportunities,
  reviewApplication
} from '../services/api';
import PageContainer from '../components/common/PageContainer';
import PageHeading from '../components/common/PageHeading';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import Modal from '../components/common/Modal';
import TextArea from '../components/common/TextArea';
import Alert from '../components/common/Alert';

export default function OrganizationApplicants() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOppId = searchParams.get('opportunity_id') || '';

  const [applications, setApplications] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    withdrawn: 0
  });
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState(initialOppId);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review modal state
  const [activeApplication, setActiveApplication] = useState(null);
  const [decisionStatus, setDecisionStatus] = useState('accepted');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Fetch organization opportunities for the filter dropdown
  useEffect(() => {
    async function fetchOpportunities() {
      try {
        const res = await getManageOpportunities();
        setOpportunities(res.data || []);
      } catch (err) {
        console.error('Failed to load opportunities for filter:', err);
      }
    }
    fetchOpportunities();
  }, []);

  // Fetch applicant queue based on filters
  async function fetchQueue(oppId = selectedOpportunityId, status = selectedStatus, search = searchTerm) {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (oppId) params.opportunity_id = oppId;
      if (status && status !== 'all') params.status = status;
      if (search && search.trim()) params.search = search.trim();

      const res = await getOrganizationApplicantsQueue(params);
      setApplications(res.data.applications || []);
      setSummary(res.data.summary || {
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        withdrawn: 0
      });
    } catch (err) {
      console.error('Failed to load applicants queue:', err);
      setError(err.message || 'Unable to load applicant queue.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQueue(selectedOpportunityId, selectedStatus, searchTerm);
  }, [selectedOpportunityId, selectedStatus]);

  const handleOpportunityFilterChange = (e) => {
    const newId = e.target.value;
    setSelectedOpportunityId(newId);
    if (newId) {
      setSearchParams({ opportunity_id: newId });
    } else {
      setSearchParams({});
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQueue(selectedOpportunityId, selectedStatus, searchTerm);
  };

  const openReviewModal = (app, presetStatus = 'accepted') => {
    setActiveApplication(app);
    setDecisionStatus(presetStatus);
    setReviewNotes(app.review_notes || '');
    setReviewError(null);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!activeApplication) return;
    setSubmittingReview(true);
    setReviewError(null);

    try {
      await reviewApplication(activeApplication.id, {
        status: decisionStatus,
        review_notes: reviewNotes
      });
      setActionSuccess(
        `Application for ${activeApplication.first_name} ${activeApplication.last_name} was marked as ${decisionStatus}.`
      );
      setActiveApplication(null);
      await fetchQueue(selectedOpportunityId, selectedStatus, searchTerm);
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      console.error('Failed to submit review:', err);
      setReviewError(err.message || 'Failed to update application status.');
    } finally {
      setSubmittingReview(false);
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

  const tabs = [
    { id: 'all', label: 'All Applicants', count: summary.total },
    { id: 'pending', label: 'Pending Review', count: summary.pending },
    { id: 'accepted', label: 'Accepted', count: summary.accepted },
    { id: 'rejected', label: 'Declined', count: summary.rejected },
    { id: 'withdrawn', label: 'Withdrawn', count: summary.withdrawn }
  ];

  return (
    <PageContainer>
      <div className="space-y-8 pb-16">
        {/* Page Heading & Links */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageHeading
            title="Volunteer Applicants"
            description="Review volunteer applications, assess candidate qualifications, and record accept/decline decisions."
          />
          <div className="shrink-0">
            <Link to="/manage/opportunities">
              <Button variant="outline" className="gap-2">
                <FileCheck2 className="w-4 h-4" />
                Manage Opportunities
              </Button>
            </Link>
          </div>
        </div>

        {actionSuccess && (
          <Alert variant="success" title="Decision Recorded">
            {actionSuccess}
          </Alert>
        )}

        {/* Filter Toolbar: Opportunity Selector + Status Tabs + Search */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Opportunity Selector Dropdown */}
            <div className="md:col-span-5">
              <label htmlFor="oppFilter" className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Filter by Opportunity
              </label>
              <select
                id="oppFilter"
                value={selectedOpportunityId}
                onChange={handleOpportunityFilterChange}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Opportunities ({opportunities.length} total)</option>
                {opportunities.map((opp) => (
                  <option key={opp.id} value={opp.id}>
                    {opp.title} ({opp.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Keyword Search */}
            <form onSubmit={handleSearchSubmit} className="md:col-span-7">
              <label htmlFor="searchQueue" className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Search Volunteers
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    id="searchQueue"
                    type="text"
                    placeholder="Search by volunteer name, email, or skill..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <Button type="submit" variant="secondary" size="sm" className="px-4">
                  Search
                </Button>
              </div>
            </form>
          </div>

          {/* Status Tabs */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 focus-ring ${
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
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={i} className="h-56 rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Error Loading Applicants</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
            <Button variant="outline" size="sm" onClick={() => fetchQueue()}>
              Retry
            </Button>
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            icon={Users}
            title={
              selectedOpportunityId
                ? 'No applications for this opportunity yet'
                : selectedStatus === 'all'
                ? 'No volunteer applications in queue'
                : `No ${selectedStatus} applications found`
            }
            description={
              selectedOpportunityId
                ? 'Ensure your opportunity is published to receive volunteer interest.'
                : 'Applications submitted by volunteers will appear here for review and status decisions.'
            }
            action={
              <Link to="/manage/opportunities">
                <Button variant="primary" className="gap-2">
                  View Published Opportunities
                </Button>
              </Link>
            }
          />
        ) : (
          /* Applicants Cards */
          <div className="space-y-4">
            {applications.map((app) => {
              const initials = `${app.first_name?.[0] || ''}${app.last_name?.[0] || ''}`.toUpperCase() || 'V';
              const parsedSkills = app.volunteer_skills
                ? app.volunteer_skills.split(',').map((s) => s.trim())
                : [];

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-4"
                >
                  {/* Top Row: Applicant Profile + Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-bold flex items-center justify-center text-base shrink-0 overflow-hidden shadow-xs">
                        {app.volunteer_avatar_url ? (
                          <img
                            src={app.volunteer_avatar_url}
                            alt={`${app.first_name} ${app.last_name}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                            {app.first_name} {app.last_name}
                          </h3>
                        </div>

                        {/* Contact details */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {app.email}
                          </span>
                          {app.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {app.phone}
                            </span>
                          )}
                          {app.volunteer_location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {app.volunteer_location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={app.status} size="sm" />
                    </div>
                  </div>

                  {/* Associated Opportunity Link Strip */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <span className="text-slate-400 font-medium">Applied for:</span>
                      <Link
                        to={`/opportunities/${app.opportunity_slug || app.opportunity_id}`}
                        className="font-bold text-slate-900 hover:text-brand-600 flex items-center gap-1"
                      >
                        <span>{app.opportunity_title}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                    </div>
                    <span className="text-slate-400">
                      Submitted on <span className="font-medium text-slate-600">{formatDate(app.created_at)}</span>
                    </span>
                  </div>

                  {/* Volunteer Message */}
                  {app.message && (
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 space-y-1">
                      <span className="font-semibold text-brand-700 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Applicant Statement of Interest:
                      </span>
                      <p className="italic leading-relaxed pl-5">{app.message}</p>
                    </div>
                  )}

                  {/* Volunteer Profile Highlights (Bio & Skills) */}
                  {(app.volunteer_bio || parsedSkills.length > 0) && (
                    <div className="space-y-2 text-xs text-slate-600 pt-1">
                      {app.volunteer_bio && (
                        <p className="leading-relaxed line-clamp-2">
                          <span className="font-semibold text-slate-800">Bio: </span>
                          {app.volunteer_bio}
                        </p>
                      )}

                      {parsedSkills.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-slate-400 text-[11px] font-semibold mr-1">Skills:</span>
                          {parsedSkills.map((sk, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Existing Review Notes (if reviewed) */}
                  {app.reviewed_at && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">
                          Reviewed Decision: <span className="capitalize">{app.status}</span>
                        </span>
                        <span className="text-slate-400">{formatDate(app.reviewed_at)}</span>
                      </div>
                      {app.review_notes && <p className="italic pl-1">{app.review_notes}</p>}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-slate-400">
                      ID: #{app.id} • Volunteer ID: #{app.volunteer_id}
                    </span>

                    <div className="flex items-center gap-2">
                      {app.status === 'withdrawn' ? (
                        <span className="text-xs text-slate-400 italic">
                          Volunteer withdrew application
                        </span>
                      ) : app.status === 'pending' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReviewModal(app, 'rejected')}
                            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1 text-rose-500" />
                            Decline
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => openReviewModal(app, 'accepted')}
                            className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Accept Application
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openReviewModal(app, app.status)}
                          className="text-xs text-slate-600"
                        >
                          Update Decision
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review & Decision Modal */}
      <Modal
        isOpen={!!activeApplication}
        onClose={() => !submittingReview && setActiveApplication(null)}
        title="Review Volunteer Application"
        description={`Applicant: ${activeApplication?.first_name} ${activeApplication?.last_name} for "${activeApplication?.opportunity_title}".`}
        size="md"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          {reviewError && (
            <Alert variant="danger" title="Review Error">
              {reviewError}
            </Alert>
          )}

          {/* Decision Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Decision Action
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecisionStatus('accepted')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all focus-ring ${
                  decisionStatus === 'accepted'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Accept Applicant
              </button>

              <button
                type="button"
                onClick={() => setDecisionStatus('rejected')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all focus-ring ${
                  decisionStatus === 'rejected'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                Decline Applicant
              </button>
            </div>
          </div>

          <TextArea
            id="reviewNotes"
            label={decisionStatus === 'accepted' ? 'Orientation Notes / Instructions (Optional)' : 'Feedback / Reason (Optional)'}
            helperText={
              decisionStatus === 'accepted'
                ? 'These notes will be displayed to the volunteer in their portal.'
                : 'Provide helpful context or encouragement for future opportunities.'
            }
            placeholder={
              decisionStatus === 'accepted'
                ? 'Welcome to the team! Our volunteer coordinator will reach out with the meeting link.'
                : 'Thank you for your interest. All positions for this session have been filled.'
            }
            rows={4}
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            disabled={submittingReview}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveApplication(null)}
              disabled={submittingReview}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={decisionStatus === 'accepted' ? 'primary' : 'danger'}
              className="gap-2"
              disabled={submittingReview}
            >
              {submittingReview ? 'Saving...' : `Confirm ${decisionStatus === 'accepted' ? 'Acceptance' : 'Decline'}`}
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
