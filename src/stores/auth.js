import { defineStore } from 'pinia'
import api from '../lib/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('auth_token') || null,
    user: null, // Menyimpan data Karyawan + Role + Permissions
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    
    // Helper fleksibel untuk mengambil string nama role (Object/String)
    userRole: (state) => {
      if (!state.user) return ''
      if (typeof state.user.role === 'object' && state.user.role !== null) {
        return state.user.role.role_name || state.user.role.name || ''
      }
      return state.user.role || state.user.role_name || ''
    },

    hasRole: (state) => {
      return (roleName) => {
        const currentRole = state.userRole
        return String(currentRole).toLowerCase() === String(roleName).toLowerCase()
      }
    },

    // Cek apakah user memiliki SALAH SATU role dari daftar array (Case-Insensitive & Fleksibel)
    hasAnyRole: (state) => {
      return (roleArray = []) => {
        if (!state.user) return false
        
        let currentRole = ''
        if (typeof state.user.role === 'object' && state.user.role !== null) {
          currentRole = state.user.role.role_name || state.user.role.name || ''
        } else if (typeof state.user.role === 'string') {
          currentRole = state.user.role
        } else {
          currentRole = state.user.role_name || ''
        }

        if (!currentRole) return false

        // Bandingkan tanpa memedulikan kapitalisasi huruf ('Employee' vs 'employee')
        const normalizedCurrent = String(currentRole).toLowerCase()
        return roleArray.some(r => String(r).toLowerCase() === normalizedCurrent)
      }
    },
    
    hasPermission: (state) => {
      return (permissionName) => {
        const permissions = state.user?.role?.permissions || state.user?.permissions || []
        return permissions.some(p => (p.name || p) === permissionName)
      }
    },

    hasAnyPermission: (state) => {
      return (permissionArray = []) => {
        const permissions = state.user?.role?.permissions || state.user?.permissions || []
        return permissionArray.some(pName => 
          permissions.some(p => (p.name || p) === pName)
        )
      }
    }
  },
  
  actions: {
    async login(credentials) {
      // 1. Panggil API Login
      const response = await api.post('/login', credentials)
      
      // Ambil token dari respon (fleksibel mendukung beberapa struktur penulisan API)
      const token = response.data?.data?.token || response.data?.token || response.data?.access_token
      
      if (!token) {
        throw new Error('Token tidak ditemukan dalam respon server.')
      }

      // 2. Simpan token ke State & LocalStorage
      this.token = token
      localStorage.setItem('auth_token', token)

      // PENTING: Pasang Header Authorization ke Axios seketika agar request /me tidak 401
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      // 3. Ambil data profil LENGKAP dari /me
      await this.fetchUser()
      
      return response
    },

    async fetchUser() {
      if (!this.token) return
      
      // Pastikan Header Authorization selalu terpasang
      api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      
      try {
        const response = await api.get('/me')
        this.user = response.data?.data || response.data
      } catch (error) {
        console.error('Gagal mengambil profil /me:', error)
        this.logout()
      }
    },

    async logout() {
      try {
        if (this.token) {
          await api.post('/logout')
        }
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.token = null
        this.user = null
        localStorage.removeItem('auth_token')
        delete api.defaults.headers.common['Authorization']
      }
    }
  }
})