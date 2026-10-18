import React, { useState } from 'react';
import {
  Mail,
  MessageSquare,
  HelpCircle,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Send,
  Building2,
  User,
  AlertCircle
} from 'lucide-react';
import PageContainer from '../components/common/PageContainer';
import PageHeading from '../components/common/PageHeading';
import TextField from '../components/common/TextField';
import TextArea from '../components/common/TextArea';
import SelectField from '../components/common/SelectField';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import { submitContactForm } from '../services/api';

export default function Contact() {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'General Inquiry',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const faqItems = [
    {
      category: 'Volunteers',
      question: 'How do I apply for a volunteer opportunity?',
      answer:
        'Once you create a free Volunteer account, browse the Opportunity directory. Click on any active opportunity to review its requirements and click "Apply". You can submit a brief note on your availability and motivation. Duplicate defense ensures you will never submit duplicate active applications to the same listing.'
    },
    {
      category: 'Volunteers',
      question: 'How are my volunteer service hours verified?',
      answer:
        'After serving at an event or completing tasks, navigate to "Volunteer Hours" in your dashboard to submit your date and hours. The supervising organization representative reviews and approves your submission with one click, officially crediting your verified hours and milestone achievement badges.'
    },
    {
      category: 'Organizations',
      question: 'Why does my organization show "Pending Verification"?',
      answer:
        'To protect our volunteer community from unauthorized or fraudulent postings, every non-profit organization requires administrative vetting before publishing opportunities to the public directory. Our admin team typically reviews organization credentials within 24-48 business hours.'
    },
    {
      category: 'Organizations',
      question: 'Can our organization reject or withdraw volunteer applications?',
      answer:
        'Yes. Organization coordinators have access to an applicant review queue. You can inspect applicant profiles, download or view statement details, and mark applications as "Accepted" or "Rejected" with automatic status updates visible to the volunteer.'
    },
    {
      category: 'Accounts & Security',
      question: 'Is my personal contact information shared publicly?',
      answer:
        'No. HelpRoster strictly enforces privacy by design. Public opportunity and organization profiles display only approved public fields. Your phone number and personal email are only accessible to the coordinator of an opportunity after your application has been formally accepted.'
    },
    {
      category: 'Accounts & Security',
      question: 'How does authentication work on HelpRoster?',
      answer:
        'Authentication uses secure, httpOnly, SameSite=Lax JWT cookies alongside CSRF protections and Argon2id/bcrypt password hashing. Sessions are protected against cross-site scripting (XSS) and token theft.'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please provide your full name (at least 2 characters).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }
    if (!formData.subject.trim() || formData.subject.trim().length < 3) {
      newErrors.subject = 'Please provide a subject line (at least 3 characters).';
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = 'Please provide a message of at least 10 characters.';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const fullSubject = formData.category
        ? `[${formData.category}] ${formData.subject.trim()}`
        : formData.subject.trim();

      const response = await submitContactForm({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: fullSubject,
        message: formData.message.trim()
      });

      setSuccessMessage(
        response?.message ||
          'Your message has been sent successfully! Our community support team will respond shortly.'
      );
      setFormData({
        name: '',
        email: '',
        category: 'General Inquiry',
        subject: '',
        message: ''
      });
      setErrors({});
    } catch (err) {
      setErrorMessage(
        err?.message ||
          'Unable to send message right now. Please check your network connection or try again later.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer size="xl" className="py-12 space-y-16">
      {/* Page Heading */}
      <PageHeading
        title="Contact & Community Support"
        description="Have questions about organization verification, logging volunteer hours, or platform features? Our dedicated team is here to assist you."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Contact' }
        ]}
      />

      {/* Main Grid: Form on Left, Contact info & Help on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Contact Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Send Us a Message</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Fill out the form below and our coordinators will reply via email within 24 business hours.
            </p>
          </div>

          {successMessage && (
            <Alert variant="success" onClose={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          )}

          {errorMessage && (
            <Alert variant="danger" onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                label="Your Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Jane Doe"
                required
                error={errors.name}
              />

              <TextField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="e.g. jane@example.org"
                required
                error={errors.email}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="Topic Category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                options={[
                  { value: 'General Inquiry', label: 'General Inquiry' },
                  { value: 'Organization Verification', label: 'Organization Verification' },
                  { value: 'Volunteer Hours Issue', label: 'Volunteer Hours Issue' },
                  { value: 'Technical Support', label: 'Technical Support' },
                  { value: 'Feedback & Ideas', label: 'Feedback & Ideas' }
                ]}
              />

              <TextField
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Brief summary of inquiry"
                required
                error={errors.subject}
              />
            </div>

            <TextArea
              label="Message"
              name="message"
              rows={5}
              maxLength={3000}
              showCount
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Please provide details regarding your inquiry..."
              required
              error={errors.message}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={submitting}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Submit Message
            </Button>
          </form>
        </div>

        {/* Right Column: Direct Channels & Operational Promises */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Response Guarantee */}
          <div className="p-6 rounded-2xl bg-brand-50/70 border border-brand-200/80 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Response Time Guarantee</h3>
                <p className="text-xs text-brand-700 font-medium">Within 24 business hours</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Inquiries regarding organization verification and urgent volunteer account support
              are prioritized by our administrators.
            </p>
          </div>

          {/* Card 2: Support Channels */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Official Help Channels</h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800 block">Support Email</span>
                  <span className="text-brand-600">support@helproster.org</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800 block">Organization Verification</span>
                  <span>verification@helproster.org</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800 block">Security & Privacy</span>
                  <span>security@helproster.org</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ) Section */}
      <section id="faq" className="space-y-8 pt-8 border-t border-slate-200">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" /> Got Questions?
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Quick answers to common questions about volunteer signups, organization verification,
            and hours certification.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-3">
          {faqItems.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 focus-ring"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {item.category}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-slate-900">
                      {item.question}
                    </span>
                  </div>
                  <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </PageContainer>
  );
}
