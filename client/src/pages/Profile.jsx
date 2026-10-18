import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  ShieldCheck,
  Clock,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';

export default function Profile() {
  const { user, updateVolunteerProfile, updateOrganizationProfile } = useAuth();

  const isVolunteer = user?.role === 'volunteer';
  const isOrganization = user?.role === 'organization';
  const isAdmin = user?.role === 'admin';

  // Volunteer form state
  const [volData, setVolData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.profile?.phone || '',
    location: user?.profile?.location || '',
    availability: user?.profile?.availability || '',
    bio: user?.profile?.bio || '',
    skills: user?.profile?.skills || '',
    interests: user?.profile?.interests || '',
    is_public: user?.profile?.is_public !== undefined ? Boolean(user?.profile?.is_public) : true
  });

  // Organization form state
  const [orgData, setOrgData] = useState({
    name: user?.organization?.name || '',
    description: user?.organization?.description || '',
    mission: user?.organization?.mission || '',
    website: user?.organization?.website || '',
    phone: user?.organization?.phone || '',
    address: user?.organization?.address || '',
    city: user?.organization?.city || '',
    state: user?.organization?.state || '',
    country: user?.organization?.country || 'USA',
    postal_code: user?.organization?.postal_code || ''
  });

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    if (user) {
      if (isVolunteer) {
        setVolData({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          phone: user.profile?.phone || '',
          location: user.profile?.location || '',
          availability: user.profile?.availability || '',
          bio: user.profile?.bio || '',
          skills: user.profile?.skills || '',
          interests: user.profile?.interests || '',
          is_public: user.profile?.is_public !== undefined ? Boolean(user.profile?.is_public) : true
        });
      } else if (isOrganization) {
        setOrgData({
          name: user.organization?.name || '',
          description: user.organization?.description || '',
          mission: user.organization?.mission || '',
          website: user.organization?.website || '',
          phone: user.organization?.phone || '',
          address: user.organization?.address || '',
          city: user.organization?.city || '',
          state: user.organization?.state || '',
          country: user.organization?.country || 'USA',
          postal_code: user.organization?.postal_code || ''
        });
      }
    }
  }, [user, isVolunteer, isOrganization]);

  const handleVolChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVolData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOrgChange = (e) => {
    const { name, value } = e.target;
    setOrgData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveVolunteer = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: '', message: '' });

    const result = await updateVolunteerProfile(volData);
    setSaving(false);

    if (result.success) {
      setFeedback({ type: 'success', message: 'Profile updated successfully!' });
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } else {
      setFeedback({ type: 'error', message: result.error || 'Failed to update profile' });
    }
  };

  const handleSaveOrganization = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: '', message: '' });

    if (!user?.organization_id) {
      setFeedback({ type: 'error', message: 'Organization record ID missing' });
      setSaving(false);
      return;
    }

    const result = await updateOrganizationProfile(user.organization_id, orgData);
    setSaving(false);

    if (result.success) {
      setFeedback({ type: 'success', message: 'Organization profile updated successfully!' });
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } else {
      setFeedback({ type: 'error', message: result.error || 'Failed to update profile' });
    }
  };

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner / Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-brand-500/20">
            {initials}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">
                {isOrganization && user?.organization?.name
                  ? user.organization.name
                  : `${user?.first_name} ${user?.last_name}`}
              </h1>
              <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700">
                {user?.role}
              </span>
              {isOrganization && (
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    user?.organization?.verification_status === 'verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {user?.organization?.verification_status === 'verified' ? 'Verified Org' : 'Pending Verification'}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              <span>{user?.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status="active" />
          <span className="text-xs text-slate-400">Account Active</span>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback.message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium border transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Profile Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            {isOrganization ? <Building2 className="w-5 h-5 text-brand-600" /> : <User className="w-5 h-5 text-brand-600" />}
            <span>{isOrganization ? 'Organization Details & Public Info' : 'Volunteer Information & Preferences'}</span>
          </h2>
          <span className="text-xs text-slate-400">All changes persist directly</span>
        </div>

        <div className="p-6 md:p-8">
          {/* Volunteer Form */}
          {isVolunteer && (
            <form onSubmit={handleSaveVolunteer} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={volData.first_name}
                    onChange={handleVolChange}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={volData.last_name}
                    onChange={handleVolChange}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      name="phone"
                      value={volData.phone}
                      onChange={handleVolChange}
                      placeholder="+1-555-0100"
                      className="w-full pl-9 pr-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="location"
                      value={volData.location}
                      onChange={handleVolChange}
                      placeholder="Seattle, WA"
                      className="w-full pl-9 pr-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Availability</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="availability"
                      value={volData.availability}
                      onChange={handleVolChange}
                      placeholder="e.g. Weekends, Tue evenings"
                      className="w-full pl-9 pr-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Short Bio</label>
                <textarea
                  name="bio"
                  rows={3}
                  value={volData.bio}
                  onChange={handleVolChange}
                  placeholder="Share your passion for community service, background, or goals..."
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Skills & Qualifications</label>
                  <input
                    type="text"
                    name="skills"
                    value={volData.skills}
                    onChange={handleVolChange}
                    placeholder="Event Coordination, First Aid, Gardening, Coding"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Comma-separated skills list</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Causes & Interests</label>
                  <input
                    type="text"
                    name="interests"
                    value={volData.interests}
                    onChange={handleVolChange}
                    placeholder="Environment, Literacy, Youth, Animals"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Causes you're most excited to help</span>
                </div>
              </div>

              {/* Public Profile Visibility Toggle */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800">Public Profile Visibility</span>
                  <p className="text-xs text-slate-500">
                    Allow verified organizations to discover your profile and match with relevant opportunities.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_public"
                    checked={volData.is_public}
                    onChange={handleVolChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" disabled={saving} className="flex items-center gap-2 px-6">
                  {saving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Organization Form */}
          {isOrganization && (
            <form onSubmit={handleSaveOrganization} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Organization Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={orgData.name}
                    onChange={handleOrgChange}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Official Website</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="url"
                      name="website"
                      value={orgData.website}
                      onChange={handleOrgChange}
                      placeholder="https://example.org"
                      className="w-full pl-9 pr-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mission Statement</label>
                <input
                  type="text"
                  name="mission"
                  value={orgData.mission}
                  onChange={handleOrgChange}
                  placeholder="One sentence that captures your organization's core purpose"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">About the Organization *</label>
                <textarea
                  name="description"
                  rows={4}
                  required
                  value={orgData.description}
                  onChange={handleOrgChange}
                  placeholder="Comprehensive description of your initiatives, community impact, and volunteer programs..."
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contact Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={orgData.phone}
                    onChange={handleOrgChange}
                    placeholder="+1-555-0155"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    value={orgData.address}
                    onChange={handleOrgChange}
                    placeholder="123 Community Way"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">City</label>
                  <input
                    type="text"
                    name="city"
                    value={orgData.city}
                    onChange={handleOrgChange}
                    placeholder="Seattle"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">State / Province</label>
                  <input
                    type="text"
                    name="state"
                    value={orgData.state}
                    onChange={handleOrgChange}
                    placeholder="WA"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={orgData.country}
                    onChange={handleOrgChange}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Postal Code</label>
                  <input
                    type="text"
                    name="postal_code"
                    value={orgData.postal_code}
                    onChange={handleOrgChange}
                    placeholder="98101"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" disabled={saving} className="flex items-center gap-2 px-6">
                  {saving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Updating Organization...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Organization</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Admin Notice */}
          {isAdmin && (
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ShieldCheck className="w-5 h-5 text-brand-600" />
                <span>Platform Administrator Workspace</span>
              </div>
              <p className="text-xs text-slate-600">
                You are logged in with the Platform Admin role. Administrative controls for organization verification, user status management, listing moderation, and audit logs are managed in the Admin control center.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
