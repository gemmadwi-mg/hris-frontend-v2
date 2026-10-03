import axios from 'axios'

// Buat instance khusus untuk HRIS API
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Sesuaikan dengan port Laravel Anda
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

// REQUEST INTERCEPTOR: Otomatis sisipkan token Sanctum ke setiap request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// RESPONSE INTERCEPTOR: Tangkap error global (misal token kadaluarsa / 401 Unauthorized)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Jika ditolak backend, hapus token lokal dan tendang ke halaman login
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api