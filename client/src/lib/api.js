import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
})

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password })
export const logout = () => api.post('/auth/logout')
export const getMe = () => api.get('/auth/me')

// Dashboard - Finance
export const getFinanceLatest = () => api.get('/dashboard/finance/latest')
export const getFinanceTrend = (days = 30) => api.get(`/dashboard/finance/trend?days=${days}`)

// Dashboard - Enrollment
export const getEnrollmentSummary = (campus = 'All') => api.get(`/dashboard/enrollment/summary?campus=${campus}`)
export const getEnrollmentTrend = (campus = 'All', days = 30) => api.get(`/dashboard/enrollment/trend?campus=${campus}&days=${days}`)
export const getEnrollmentEntries = (campus = 'All', limit = 50) => api.get(`/dashboard/enrollment/entries?campus=${campus}&limit=${limit}`)

// Dashboard - Outcomes
export const getOutcomesSummary = (campus = 'All') => api.get(`/dashboard/outcomes/summary?campus=${campus}`)
export const getOutcomesStudents = (limit = 100) => api.get(`/dashboard/outcomes/students?limit=${limit}`)

// Dashboard - Marketing
export const getMarketingLatest = () => api.get('/dashboard/marketing/latest')
export const getMarketingTrend = (days = 30) => api.get(`/dashboard/marketing/trend?days=${days}`)

// Dashboard - Staff
export const getStaffSummary = (campus = 'All') => api.get(`/dashboard/staff/summary?campus=${campus}`)
export const getStaffTrend = (campus = 'All') => api.get(`/dashboard/staff/trend?campus=${campus}`)

// Dashboard - Alerts
export const getAlerts = (includeDismissed = false) => api.get(`/dashboard/alerts?dismissed=${includeDismissed}`)
export const dismissAlert = (id, data) => api.post(`/dashboard/alerts/${id}/dismiss`, data)

// Entry - Enrollment
export const postEnrollmentEntry = (data) => api.post('/entry/enrollment', data)

// Entry - Outcomes
export const postOutcomeEntry = (data) => api.post('/entry/outcomes', data)
export const uploadOutcomesCSV = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/entry/outcomes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// Entry - Staff
export const postStaffEntry = (data) => api.post('/entry/staff', data)

export default api
