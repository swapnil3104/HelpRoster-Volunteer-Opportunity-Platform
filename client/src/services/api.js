import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor for standardized API responses and errors
api.interceptors.response.use(
  (response) => {
    const payload = response.data;
    if (payload && typeof payload === 'object') {
      // Support callers using Axios convention (res.data.success / res.data.data)
      // alongside callers using direct payload (res.success / res.data)
      if ('success' in payload && payload.data && typeof payload.data === 'object') {
        try {
          if (!('success' in payload.data)) {
            Object.defineProperty(payload.data, 'success', {
              get() { return payload.success; },
              enumerable: false,
              configurable: true
            });
          }
          if (!('data' in payload.data)) {
            Object.defineProperty(payload.data, 'data', {
              get() { return payload.data; },
              enumerable: false,
              configurable: true
            });
          }
          if (!('message' in payload.data)) {
            Object.defineProperty(payload.data, 'message', {
              get() { return payload.message; },
              enumerable: false,
              configurable: true
            });
          }
        } catch (e) {
          // In case array or object is frozen
        }
      }
    }
    return payload;
  },
  (error) => {
    const errorData = error.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: error.response?.data?.message || error.message || 'Unable to connect to HelpRoster services'
    };
    return Promise.reject(errorData);
  }
);

export async function checkServerHealth() {
  return api.get('/health');
}

export async function getPublicStats() {
  return api.get('/public/stats');
}

export async function getFeaturedOpportunities() {
  return api.get('/public/featured-opportunities');
}

export async function submitContactForm(data) {
  return api.post('/contact', data);
}

// ----------------------------------------------------------------------------
// Categories
// ----------------------------------------------------------------------------
export async function getCategories() {
  return api.get('/categories');
}

// ----------------------------------------------------------------------------
// Public Discovery: Opportunities
// ----------------------------------------------------------------------------
export async function getOpportunities(params = {}) {
  return api.get('/opportunities', { params });
}

export async function getOpportunity(idOrSlug) {
  return api.get(`/opportunities/${idOrSlug}`);
}

// ----------------------------------------------------------------------------
// Public Discovery: Organizations
// ----------------------------------------------------------------------------
export async function getOrganizations(params = {}) {
  return api.get('/organizations', { params });
}

export async function getOrganization(id) {
  return api.get(`/organizations/${id}`);
}

// ----------------------------------------------------------------------------
// Management: Opportunities (Role: Organization / Admin)
// ----------------------------------------------------------------------------
export async function getManageOpportunities(params = {}) {
  return api.get('/opportunities/manage', { params });
}

export async function createOpportunity(data) {
  return api.post('/opportunities', data);
}

export async function updateOpportunity(id, data) {
  return api.put(`/opportunities/${id}`, data);
}

export async function updateOpportunityStatus(id, status) {
  return api.patch(`/opportunities/${id}/status`, { status });
}

export async function deleteOpportunity(id) {
  return api.delete(`/opportunities/${id}`);
}

// ----------------------------------------------------------------------------
// Applications Workflow (Volunteers & Organizations)
// ----------------------------------------------------------------------------
export async function submitApplication(data) {
  return api.post('/applications', data);
}

export async function getMyApplications(params = {}) {
  return api.get('/applications/my', { params });
}

export async function checkApplicationStatus(opportunityId) {
  return api.get(`/applications/check/${opportunityId}`);
}

export async function withdrawApplication(id) {
  return api.patch(`/applications/${id}/withdraw`);
}

export async function getOrganizationApplicantsQueue(params = {}) {
  return api.get('/applications/organization/queue', { params });
}

export async function getOpportunityApplicants(opportunityId) {
  return api.get(`/applications/opportunity/${opportunityId}`);
}

export async function reviewApplication(id, data) {
  return api.patch(`/applications/${id}/review`, data);
}

// ==========================================
// Phase 6: Dashboards, Hours & Achievements
// ==========================================

export async function getVolunteerDashboard() {
  return api.get('/dashboard/volunteer');
}

export async function getOrganizationDashboard() {
  return api.get('/dashboard/organization');
}

export async function logVolunteerHours(data) {
  return api.post('/hours', data);
}

export async function getMyVolunteerHours(params = {}) {
  return api.get('/hours/my', { params });
}

export async function deleteVolunteerHours(id) {
  return api.delete(`/hours/${id}`);
}

export async function getOrganizationHoursQueue(params = {}) {
  return api.get('/hours/organization', { params });
}

export async function reviewVolunteerHours(id, data) {
  return api.patch(`/hours/${id}/review`, data);
}

export async function getAchievementsCatalog() {
  return api.get('/achievements');
}

export async function getMyAchievements() {
  return api.get('/achievements/my');
}

export async function evaluateMyAchievements() {
  return api.post('/achievements/evaluate');
}

// ==========================================
// Phase 7: Administration, Support & Recovery
// ==========================================

export async function getAdminStats() {
  return api.get('/admin/stats');
}

export async function getAdminUsers(params = {}) {
  return api.get('/admin/users', { params });
}

export async function updateUserStatus(id, data) {
  return api.patch(`/admin/users/${id}/status`, data);
}

export async function getAdminOrganizations(params = {}) {
  return api.get('/admin/organizations', { params });
}

export async function verifyAdminOrganization(id, data) {
  return api.patch(`/admin/organizations/${id}/verify`, data);
}

export async function getAdminOpportunities(params = {}) {
  return api.get('/admin/opportunities', { params });
}

export async function moderateAdminOpportunity(id, data) {
  return api.patch(`/admin/opportunities/${id}/status`, data);
}

export async function getAdminContactSubmissions(params = {}) {
  return api.get('/admin/contact-submissions', { params });
}

export async function updateAdminContactSubmission(id, data) {
  return api.patch(`/admin/contact-submissions/${id}`, data);
}

export async function getAdminAuditLogs(params = {}) {
  return api.get('/admin/audit-logs', { params });
}

export async function forgotPassword(data) {
  return api.post('/auth/forgot-password', data);
}

export async function resetPassword(data) {
  return api.post('/auth/reset-password', data);
}

export default api;
