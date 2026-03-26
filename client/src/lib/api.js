import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
})

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password })
export const logout = () => api.post('/auth/logout')
export const getMe = () => api.get('/auth/me')

// Finance
export const getFinanceLatest = () => api.get('/finance/latest')
export const getFinanceTrend = (days = 30) => api.get(`/finance/trend?days=${days}`)
export const postFinanceEntry = (data) => api.post('/finance/entry', data)

// Enrollment
export const getEnrollmentSummary = (campus = 'All') => api.get(`/enrollment/summary?campus=${campus}`)
export const getEnrollmentTrend = (campus = 'All', days = 30) => api.get(`/enrollment/trend?campus=${campus}&days=${days}`)
export const getEnrollmentEntries = (campus = 'All', limit = 50) => api.get(`/enrollment/entries?campus=${campus}&limit=${limit}`)
export const postEnrollmentEntry = (data) => api.post('/enrollment/entry', data)

// Outcomes
export const getOutcomesSummary = (campus = 'All') => api.get(`/outcomes/summary?campus=${campus}`)
export const getOutcomesStudents = (limit = 100) => api.get(`/outcomes/students?limit=${limit}`)
export const uploadOutcomesCSV = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/outcomes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
export const postOutcomeEntry = (data) => api.post('/outcomes/entry', data)

// Marketing
export const getMarketingLatest = () => api.get('/marketing/latest')
export const getMarketingTrend = (days = 30) => api.get(`/marketing/trend?days=${days}`)
export const postMarketingEntry = (data) => api.post('/marketing/entry', data)

export default api
