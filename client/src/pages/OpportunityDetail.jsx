import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Building2,
  Tag,
  ArrowLeft,
  Share2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Check,
  HandHeart,
  ChevronRight,
  FileCheck2,
  Send
} from 'lucide-react';
import { getOpportunity, checkApplicationStatus, submitApplication } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import Modal from '../components/common/Modal';
import TextArea from '../components/common/TextArea';
import Alert from '../components/common/Alert';

export default function OpportunityDetail() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Application workflow state
  const [userApplication, setUserApplication] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);
  const [applyError, setApplyError] = useState(null);
  const [applySuccess, setApplySuccess] = useState(null);

  useEffect(() => {
    async function fetchOpportunityAndApplication() {
      setLoading(true);
      setError(null);
      try {
        const res = await getOpportunity(idOrSlug);
        setOpportunity(res.data);

        // If user is a volunteer, check existing application status
        if (isAuthenticated && user?.role === 'volunteer' && res.data?.id) {
          try {
            const appRes = await checkApplicationStatus(res.data.id);
            if (appRes?.data?.applied) {
              setUserApplication(appRes.data.application);
            }
          } catch (appErr) {
            console.error('Failed to check application status', appErr);
          }
        }
      } catch (err) {
        console.error('Failed to load opportunity', err);
        setError(err.message || 'Opportunity not found or no longer available.');
      } finally {
        setLoading(false);
      }
    }
    fetchOpportunityAndApplication();
  }, [idOrSlug, isAuthenticated, user]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Flexible';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isDeadlinePassed = (deadlineStr) => {
    if (!deadlineStr) return false;
    return new Date(deadlineStr) < new Date();
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setSubmittingApp(true);
    setApplyError(null);
    setApplySuccess(null);

    try {
      const res = await submitApplication({
        opportunity_id: opportunity.id,
        message: applyMessage
      });
      setUserApplication(res.data);
      setApplySuccess('Your application was submitted successfully!');
      setTimeout(() => {
        setIsApplyModalOpen(false);
        setApplySuccess(null);
        setApplyMessage('');
      }, 1800);
    } catch (err) {
      console.error('Application submission error:', err);
      setApplyError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmittingApp(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <LoadingSkeleton className="h-6 w-48 rounded-md" />
        <LoadingSkeleton className="h-10 w-3/4 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <LoadingSkeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <LoadingSkeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Opportunity Not Available</h1>
        <p className="text-slate-600">{error || 'This listing may have been closed or archived.'}</p>
        <div className="pt-4">
          <Link to="/opportunities">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to All Opportunities
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const deadlinePassed = isDeadlinePassed(opportunity.application_deadline);
  const locationTypeBadge = {
    on_site: { label: 'On-Site', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    remote: { label: 'Virtual / Remote', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    hybrid: { label: 'Hybrid', color: 'bg-amber-50 text-amber-700 border-amber-200' }
  }[opportunity.location_type] || { label: opportunity.location_type, color: 'bg-slate-100 text-slate-700' };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Banner / Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link
            to="/opportunities"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Opportunities</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-1.5 text-xs h-8 px-3"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied' : 'Share'}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${locationTypeBadge.color}`}>
                {locationTypeBadge.label}
              </span>
              {opportunity.category_name && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                  {opportunity.category_name}
                </span>
              )}
            </div>

            <StatusBadge status={opportunity.status} size="sm" />
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {opportunity.title}
            </h1>

            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <Building2 className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Organized by</span>
              <Link
                to={`/organizations/${opportunity.organization.id}`}
                className="font-bold text-slate-900 hover:text-brand-600 underline underline-offset-4 decoration-slate-300"
              >
                {opportunity.organization.name}
              </Link>
              {opportunity.organization.verification_status === 'verified' && (
                <ShieldCheck className="w-4 h-4 text-brand-600" title="Verified Non-Profit" />
              )}
            </div>
          </div>

          {/* Quick Logistics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Location
                </span>
                <p className="text-sm font-semibold text-slate-800 truncate" title={opportunity.location}>
                  {opportunity.location}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Service Dates
                </span>
                <p className="text-sm font-semibold text-slate-800">
                  {formatDate(opportunity.start_date)}
                  {opportunity.end_date && ` - ${formatDate(opportunity.end_date)}`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Commitment
                </span>
                <p className="text-sm font-semibold text-slate-800">
                  {opportunity.commitment_hours ? `${opportunity.commitment_hours} hrs/week` : 'Flexible Hours'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Capacity
                </span>
                <p className="text-sm font-semibold text-slate-800">
                  {opportunity.capacity} volunteer{opportunity.capacity > 1 ? 's' : ''} needed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Full Specifications */}
          <div className="lg:col-span-8 space-y-8">
            {/* Description */}
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
              <h2 className="text-xl font-bold text-slate-900">About This Opportunity</h2>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {opportunity.description}
              </div>
            </section>

            {/* Responsibilities */}
            {opportunity.responsibilities && (
              <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
                <h2 className="text-xl font-bold text-slate-900">What You'll Do</h2>
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                  {opportunity.responsibilities}
                </div>
              </section>
            )}

            {/* Requirements & Qualifications */}
            {opportunity.requirements && (
              <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Requirements & Qualifications</h2>
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                  {opportunity.requirements}
                </div>
              </section>
            )}

            {/* Required Skills */}
            {opportunity.skills && opportunity.skills.length > 0 && (
              <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Relevant Skills & Traits</h2>
                <div className="flex flex-wrap gap-2">
                  {opportunity.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Host Org Card & Dynamic Application Action */}
          <div className="lg:col-span-4 space-y-6">
            {/* Dynamic Application Action Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5 sticky top-28">
              <h3 className="text-lg font-bold text-slate-900">Ready to Make an Impact?</h3>

              {deadlinePassed ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Application Deadline Has Passed
                  </div>
                  <p>This opportunity is no longer accepting new volunteer applications.</p>
                </div>
              ) : !isAuthenticated ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Join our volunteer community to apply in one click, log your hours, and track your achievements.
                  </p>
                  <Link to="/login" state={{ from: location.pathname }}>
                    <Button variant="primary" className="w-full gap-2">
                      Sign In to Apply
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="outline" className="w-full">
                      Create Volunteer Account
                    </Button>
                  </Link>
                </div>
              ) : user?.role === 'volunteer' ? (
                userApplication && userApplication.status !== 'withdrawn' ? (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Your Application
                      </span>
                      <StatusBadge status={userApplication.status} size="sm" />
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <p>
                        Submitted on{' '}
                        <span className="font-medium text-slate-900">
                          {formatDate(userApplication.created_at)}
                        </span>
                      </p>
                      {userApplication.reviewed_at && (
                        <p>
                          Reviewed on{' '}
                          <span className="font-medium text-slate-900">
                            {formatDate(userApplication.reviewed_at)}
                          </span>
                        </p>
                      )}
                    </div>

                    {userApplication.review_notes && (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                        <span className="font-semibold text-brand-700 block">Organization Note:</span>
                        <p className="italic leading-relaxed">{userApplication.review_notes}</p>
                      </div>
                    )}

                    <Link to="/applications">
                      <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                        <FileCheck2 className="w-4 h-4" />
                        View in My Applications
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Submit your volunteer application directly to {opportunity.organization.name}.
                    </p>
                    <Button
                      variant="primary"
                      className="w-full gap-2 py-3 text-base shadow-md shadow-brand-500/20"
                      onClick={() => setIsApplyModalOpen(true)}
                    >
                      <HandHeart className="w-5 h-5" />
                      Apply for Opportunity
                    </Button>
                    <span className="text-[11px] text-slate-400 block text-center">
                      Free application • Response within 3-5 days
                    </span>
                  </div>
                )
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs leading-relaxed">
                  <p className="font-semibold text-slate-800 mb-1">Organization Account Active</p>
                  You are currently signed in as an organization representative. Volunteer applications must be submitted by volunteer accounts.
                </div>
              )}

              {/* Organization Snapshot */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                  About the Host
                </span>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold overflow-hidden shrink-0">
                    {opportunity.organization.logo_url ? (
                      <img
                        src={opportunity.organization.logo_url}
                        alt={opportunity.organization.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {opportunity.organization.name}
                    </h4>
                    <span className="text-xs text-slate-500">
                      {opportunity.organization.city}, {opportunity.organization.state}
                    </span>
                  </div>
                </div>

                {opportunity.organization.mission && (
                  <p className="text-xs text-slate-600 italic leading-relaxed border-l-2 border-brand-200 pl-3">
                    "{opportunity.organization.mission}"
                  </p>
                )}

                <div className="pt-2 flex flex-col gap-2">
                  <Link to={`/organizations/${opportunity.organization.id}`}>
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                      View Organization Profile
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>

                  {opportunity.organization.website && (
                    <a
                      href={opportunity.organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1 justify-center py-1"
                    >
                      <span>Visit Official Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Submission Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => !submittingApp && setIsApplyModalOpen(false)}
        title="Apply for Volunteer Opportunity"
        description={`Submit your application to ${opportunity.organization.name} for "${opportunity.title}".`}
        size="lg"
      >
        <form onSubmit={handleApplySubmit} className="space-y-5">
          {applyError && (
            <Alert variant="danger" title="Application Error">
              {applyError}
            </Alert>
          )}

          {applySuccess && (
            <Alert variant="success" title="Success!">
              {applySuccess}
            </Alert>
          )}

          {/* Volunteer Contact Preview Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Applicant Profile Information
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              <div>
                <span className="text-slate-400 block">Full Name</span>
                <span className="font-semibold">{user?.first_name} {user?.last_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Email Address</span>
                <span className="font-semibold">{user?.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Location</span>
                <span className="font-semibold">{user?.profile?.location || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Phone</span>
                <span className="font-semibold">{user?.profile?.phone || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <TextArea
            id="applyMessage"
            label="Statement of Interest or Message (Optional)"
            helperText="Share why you are excited about this cause or any relevant skills you would like the coordinator to know."
            placeholder="Hi there! I am interested in contributing to this effort because..."
            rows={4}
            value={applyMessage}
            onChange={(e) => setApplyMessage(e.target.value)}
            disabled={submittingApp || !!applySuccess}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsApplyModalOpen(false)}
              disabled={submittingApp || !!applySuccess}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="gap-2"
              disabled={submittingApp || !!applySuccess}
            >
              <Send className="w-4 h-4" />
              {submittingApp ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
