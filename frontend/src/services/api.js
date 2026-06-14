import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const code = error.response?.data?.code
      if (code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
}

// ── Chat ──────────────────────────────────
export const chatAPI = {
  sendMessage: (data) => api.post('/chat', data),
  getHistory: (params) => api.get('/chat/history', { params }),
  deleteChat: (id) => api.delete(`/chat/history/${id}`),
}

// ── Quiz ──────────────────────────────────
export const quizAPI = {
  generate: (data) => api.post('/quiz/generate', data),
  submit: (data) => api.post('/quiz/submit', data),
  getHistory: (params) => api.get('/quiz/history', { params }),
  getQuiz: (id) => api.get(`/quiz/${id}`),
}

// ── Summary ───────────────────────────────
export const summaryAPI = {
  summarize: (data) => api.post('/summarize', data),
  exportPDF: (data) =>
    api.post('/summarize/export-pdf', data, { responseType: 'blob' }),
}

// ── Recommendations ───────────────────────
export const recommendationsAPI = {
  get: () => api.get('/recommendations'),
  refresh: () => api.post('/recommendations/refresh'),
  markRead: (id) => api.patch(`/recommendations/${id}/read`),
}

// ── Progress ──────────────────────────────
export const progressAPI = {
  get: () => api.get('/progress'),
}

// ── Admin ─────────────────────────────────
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getStats: () => api.get('/admin/stats'),
  getUserDetail: (id) => api.get(`/admin/users/${id}`),
  toggleUserActive: (id) => api.patch(`/admin/users/${id}/toggle-active`),
}

// ── Health ────────────────────────────────
export const healthAPI = {
  check: () => api.get('/health'),
}

export default api
