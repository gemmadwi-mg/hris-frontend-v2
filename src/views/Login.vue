<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
      
      <!-- Header Area -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">HRIS Enterprise</h1>
        <p class="text-gray-500 mt-2">Silakan login ke akun Anda</p>
      </div>

      <!-- Alert Error -->
      <div v-if="errorMessage" class="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
        {{ errorMessage }}
      </div>

      <!-- Form Area -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email Karyawan</label>
          <input 
            v-model="form.email" 
            type="email" 
            required 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="admin@example.com"
          >
        </div>

        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="block text-sm font-medium text-gray-700">Password</label>
            <a href="#" class="text-sm text-blue-600 hover:underline">Lupa Password?</a>
          </div>
          <input 
            v-model="form.password" 
            type="password" 
            required 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="••••••••"
          >
        </div>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center"
        >
          <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isLoading ? 'Memproses...' : 'Masuk' }}
        </button>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Swal from 'sweetalert2' 

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: ''
})

const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    await authStore.login(form)
    
    // Notifikasi Sukses SweetAlert
    await Swal.fire({
      icon: 'success',
      title: 'Login Berhasil',
      text: 'Selamat datang di HRIS Enterprise!',
      showConfirmButton: false,
      timer: 1500,
      backdrop: `rgba(0,0,123,0.1)` 
    })
    
    // Redirect Otomatis Berdasarkan Role
    if (authStore.user?.role === 'Employee') {
      router.push('/employee/dashboard')
    } else {
      router.push('/admin/dashboard')
    }
  } catch (error) {
    let errorText = 'Terjadi kesalahan pada server.'
    if (error.response && error.response.data.message) {
      errorText = error.response.data.message
    }
    
    errorMessage.value = errorText // Opsional: tetap memunculkan alert merah di atas form
    
    // Notifikasi Error SweetAlert
    Swal.fire({
      icon: 'error',
      title: 'Akses Ditolak',
      text: errorText,
      confirmButtonColor: '#ef4444',
    })
  } finally {
    isLoading.value = false
  }
}
</script>