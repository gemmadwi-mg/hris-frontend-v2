import { defineStore } from 'pinia'
import api from '../lib/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('auth_token') || null,
    user: null, // Menyimpan data Karyawan (Employee)
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    
    // Cek Role berdasarkan nama jabatannya
    hasRole: (state) => {
      return (roleName) => state.user?.role?.role_name === roleName
    },
    
    // (Opsional) Cek Permission spesifik jika Anda me-load relasi permissions di backend
    hasPermission: (state) => {
      return (permissionName) => {
        const permissions = state.user?.role?.permissions || []
        return permissions.some(p => p.name === permissionName)
      }
    }
  },
  
  actions: {
    // Fungsi Login
    async login(credentials) {
      // Panggil endpoint login yang sudah kita buat di AuthController
      const response = await api.post('/login', credentials)
      
      // Ambil token dan data dari response backend
      const { token, employee } = response.data.data
      
      // Simpan ke state Pinia dan LocalStorage
      this.token = token
      this.user = employee
      localStorage.setItem('auth_token', token)
      
      return response
    },

    // Fungsi Ambil Data User (Dipanggil saat halam di-refresh)
    async fetchUser() {
      if (!this.token) return
      
      try {
        const response = await api.get('/me')
        this.user = response.data.data // Data karyawan + relasi role & company
      } catch (error) {
        // Jika gagal (token tidak valid), bersihkan data
        this.token = null
        this.user = null
        localStorage.removeItem('auth_token')
      }
    },

    // Fungsi Logout
    async logout() {
      try {
        await api.post('/logout')
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.token = null
        this.user = null
        localStorage.removeItem('auth_token')
      }
    }
  }
})