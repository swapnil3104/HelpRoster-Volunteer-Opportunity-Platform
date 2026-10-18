import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Tag,
  Users,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { getCategories, createOpportunity, updateOpportunity } from '../services/api';
import Button from '../components/common/Button';
import TextField from '../components/common/TextField';
import TextArea from '../components/common/TextArea';
import SelectField from '../components/common/SelectField';
import Alert from '../components/common/Alert';

export default function OpportunityEditorModal({
  isOpen,
  onClose,
  opportunity = null, // null for create, object for edit
  onSaved,
  orgVerificationStatus = 'verified'
}) {
  const isEditing = Boolean(opportunity && opportunity.id);
  const isOrgVerified = orgVerificationStatus === 'verified';

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    description: '',
    requirements: '',
    responsibilities: '',
    location_type: 'on_site',
    location: '',
    start_date: '',
    end_date: '',
    application_deadline: '',
    commitment_hours: '',
    capacity: 1,
    status: isOrgVerified ? 'published' : 'draft',
    skills: []
  });

  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load categories
  useEffect(() => {
    async function loadCats() {
      try {
        const res = await getCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCats();
  }, []);

  // Populate form if editing
  useEffect(() => {
    if (opportunity) {
      setFormData({
        title: opportunity.title || '',
        category_id: opportunity.category_id || (opportunity.category?.id ? String(opportunity.category.id) : ''),
        description: opportunity.description || '',
        requirements: opportunity.requirements || '',
        responsibilities: opportunity.responsibilities || '',
        location_type: opportunity.location_type || 'on_site',
        location: opportunity.location || '',
        start_date: opportunity.start_date ? opportunity.start_date.split('T')[0] : '',
        end_date: opportunity.end_date ? opportunity.end_date.split('T')[0] : '',
        application_deadline: opportunity.application_deadline
          ? opportunity.application_deadline.split('T')[0]
          : '',
        commitment_hours: opportunity.commitment_hours || '',
        capacity: opportunity.capacity || 1,
        status: opportunity.status || (isOrgVerified ? 'published' : 'draft'),
        skills: Array.isArray(opportunity.skills) ? [...opportunity.skills] : []
      });
    } else {
      setFormData({
        title: '',
        category_id: '',
        description: '',
        requirements: '',
        responsibilities: '',
        location_type: 'on_site',
        location: '',
        start_date: '',
        end_date: '',
        application_deadline: '',
        commitment_hours: '',
        capacity: 1,
        status: isOrgVerified ? 'published' : 'draft',
        skills: []
      });
    }
    setError(null);
  }, [opportunity, isOrgVerified, isOpen]);

  if (!isOpen) return null;

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (!formData.skills.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.title || formData.title.trim().length < 3) {
      setError('Title must be at least 3 characters.');
      setLoading(false);
      return;
    }

    if (!formData.description || formData.description.trim().length < 10) {
      setError('Description must be at least 10 characters.');
      setLoading(false);
      return;
    }

    if (!formData.location || formData.location.trim().length < 2) {
      setError('Please provide a specific location or region.');
      setLoading(false);
      return;
    }

    if (!formData.start_date) {
      setError('Please specify an activity start date.');
      setLoading(false);
      return;
    }

    if (!formData.application_deadline) {
      setError('Please specify an application deadline.');
      setLoading(false);
      return;
    }

    // DEC-001 Check
    if (formData.status === 'published' && !isOrgVerified) {
      setError('Your organization must be verified by an administrator before publishing listings. Please save as draft.');
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      category_id: formData.category_id ? parseInt(formData.category_id, 10) : null,
      commitment_hours: formData.commitment_hours ? parseInt(formData.commitment_hours, 10) : null,
      capacity: parseInt(formData.capacity, 10) || 1,
      // Format application_deadline as full ISO / MySQL datetime
      application_deadline: formData.application_deadline.includes(':')
        ? formData.application_deadline
        : `${formData.application_deadline} 23:59:59`
    };

    try {
      if (isEditing) {
        await updateOpportunity(opportunity.id, payload);
      } else {
        await createOpportunity(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save opportunity', err);
      setError(err.message || 'Unable to save opportunity. Please review input fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isEditing ? 'Edit Opportunity Listing' : 'Create New Volunteer Opportunity'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in the required information to recruit volunteers for your initiative.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <Alert variant="error" title="Action Required">
              {error}
            </Alert>
          )}

          {!isOrgVerified && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Verification Notice</span>
                Your organization is pending administrator verification. You may create and save this listing as a draft, but it cannot be published publicly until verification is complete.
              </div>
            </div>
          )}

          {/* Title and Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <TextField
                label="Opportunity Title"
                placeholder="e.g. Weekend Food Distribution Coordinator"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <SelectField
                label="Cause Category"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                options={[
                  { value: '', label: 'Select a category...' },
                  ...categories.map((c) => ({ value: String(c.id), label: c.name }))
                ]}
              />
            </div>
          </div>

          {/* Description */}
          <TextArea
            label="Overview & Description"
            placeholder="Explain the background, why this opportunity matters, and what volunteers will achieve..."
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          {/* Key Responsibilities */}
          <TextArea
            label="Key Responsibilities (What volunteers will do)"
            placeholder="List specific daily or project duties (e.g. Greeting visitors, sorting inventory, distributing food boxes)..."
            rows={3}
            value={formData.responsibilities}
            onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
          />

          {/* Requirements & Eligibility */}
          <TextArea
            label="Requirements & Eligibility"
            placeholder="Age limits, physical lifting, certifications, dress code, background checks, or schedule commitments..."
            rows={3}
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
          />

          {/* Logistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <SelectField
                label="Location Type"
                value={formData.location_type}
                onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
                options={[
                  { value: 'on_site', label: 'On-Site' },
                  { value: 'remote', label: 'Remote' },
                  { value: 'hybrid', label: 'Hybrid' }
                ]}
              />
            </div>
            <div className="md:col-span-2">
              <TextField
                label="Specific Location or Meeting Link"
                placeholder="e.g. 1420 Pine St, Seattle, WA or Zoom Hub"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Dates and Deadlines */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextField
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
            <TextField
              label="End Date (Optional)"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
            <TextField
              label="Application Deadline"
              type="date"
              value={formData.application_deadline}
              onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
              required
            />
          </div>

          {/* Hours and Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextField
              label="Weekly Commitment (Hours)"
              type="number"
              placeholder="e.g. 4"
              value={formData.commitment_hours}
              onChange={(e) => setFormData({ ...formData, commitment_hours: e.target.value })}
            />
            <TextField
              label="Volunteer Capacity"
              type="number"
              placeholder="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              required
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Initial Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="draft">Draft (Private)</option>
                <option value="published" disabled={!isOrgVerified}>
                  Published {isOrgVerified ? '(Live)' : '(Requires Verified Org)'}
                </option>
                {isEditing && <option value="closed">Closed</option>}
                {isEditing && <option value="archived">Archived</option>}
              </select>
            </div>
          </div>

          {/* Skills Multi-Tag Input */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Relevant Skills & Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g. CPR Certified, Event Setup, Gardening, Mentoring"
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(e);
                  }
                }}
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddSkill} className="gap-1">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-50 border border-brand-100 text-brand-700 text-xs font-medium"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading} className="gap-2">
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Opportunity'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
