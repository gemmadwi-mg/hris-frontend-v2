import { defineStore } from 'pinia'
import api from '../lib/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('auth_token') || null,
    user: null, // Menyimpan data Karyawan + Role + Permissions
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    
    // Ambil nama role user saat ini
    userRole: (state) => state.user?.role?.role_name || '',

    hasRole: (state) => {
      return (roleName) => state.user?.role?.role_name === roleName
    },

    // Cek apakah user memiliki SALAH SATU role dari daftar array
    hasAnyRole: (state) => {
      return (roleArray = []) => {
        const currentRole = state.user?.role?.role_name
        return roleArray.includes(currentRole)
      }
    },
    
    hasPermission: (state) => {
      return (permissionName) => {
        const permissions = state.user?.role?.permissions || []
        return permissions.some(p => p.name === permissionName)
      }
    },

    hasAnyPermission: (state) => {
      return (permissionArray = []) => {
        const permissions = state.user?.role?.permissions || []
        return permissionArray.some(pName => permissions.some(p => p.name === pName))
      }
    }
  },
  
  actions: {
    async login(credentials) {
      // 1. Panggil API Login
      const response = await api.post('/login', credentials)
      const { token } = response.data.data
      
      // 2. Simpan token saja
      this.token = token
      localStorage.setItem('auth_token', token)

      // 3. Ambil data profil LENGKAP (termasuk role.permissions) dari /me
      // Hapus baris 'this.user = employee' agar tidak menimpa dengan data parsial
      await this.fetchUser()
      
      return response
    },

    async fetchUser() {
      if (!this.token) return
      
      try {
        const response = await api.get('/me')
        this.user = response.data.data // Data karyawan + relasi role.permissions & company
      } catch (error) {
        this.logout()
      }
    },

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