<template>
  <!-- 1. h-screen dan overflow-hidden mengunci layar utama agar tidak bisa discroll secara keseluruhan -->
  <div class="h-screen flex overflow-hidden bg-gray-100">

    <!-- 2. SIDEBAR KIRI -->
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col z-20 hidden md:flex">
      <div class="h-16 flex items-center px-6 border-b border-gray-200 shrink-0">
        <h1 class="text-xl font-bold text-blue-700 tracking-tight">
          HRIS<span class="text-gray-800">App</span>
        </h1>
      </div>

      <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <!-- Menu Global (Semua role terautentikasi bisa mengakses) -->
        <router-link 
          to="/"
          class="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50"
          exact-active-class="bg-blue-50 text-blue-700 !text-blue-700"
        >
          Dashboard
        </router-link>

        <!-- KATEGORI: MANAJEMEN (Khusus Admin, HR Manager, HR Staff, & Finance) -->
        <div v-if="authStore.hasAnyRole(['System Administrator', 'HR Manager', 'HR Staff', 'Finance'])">
          <p class="px-3 pt-5 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Manajemen</p>

          <!-- Data Karyawan (Hanya Admin & HR) -->
          <router-link 
            v-if="authStore.hasAnyRole(['System Administrator', 'HR Manager', 'HR Staff'])"
            to="/employees"
            class="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50"
            active-class="bg-blue-50 text-blue-700 !text-blue-700"
          >
            Data Karyawan
          </router-link>

          <!-- Penggajian (Admin, HR, & Finance) -->
          <router-link 
            v-if="authStore.hasAnyRole(['System Administrator', 'HR Manager', 'HR Staff', 'Finance'])"
            to="/payrolls"
            class="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50"
            active-class="bg-blue-50 text-blue-700 !text-blue-700"
          >
            Penggajian
          </router-link>
        </div>

        <!-- KATEGORI: KEHADIRAN & OPERASIONAL (Dapat diakses seluruh pengguna) -->
        <div>
          <p class="px-3 pt-5 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Kehadiran</p>

          <router-link 
            to="/attendances"
            class="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50"
            active-class="bg-blue-50 text-blue-700 !text-blue-700"
          >
            Data Absensi
          </router-link>

          <router-link 
            to="/leave-requests"
            class="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50"
            active-class="bg-blue-50 text-blue-700 !text-blue-700"
          >
            Data Cuti
          </router-link>

          <router-link 
            to="/permit-requests"
            class="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50"
            active-class="bg-blue-50 text-blue-700 !text-blue-700"
          >
            Data Izin
          </router-link>

          <router-link 
            to="/overtimes"
            class="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50"
            active-class="bg-blue-50 text-blue-700 !text-blue-700"
          >
            Data Lembur
          </router-link>
        </div>

        <!-- KATEGORI: PERSONAL (Khusus Role Employee) -->
        <div v-if="authStore.hasRole('Employee')">
          <p class="px-3 pt-5 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Personal</p>
          <router-link 
            to="/attendances"
            class="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Absensi Saya
          </router-link>
          <router-link 
            to="/payrolls"
            class="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Slip Gaji Saya
          </router-link>
        </div>
      </nav>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">

      <!-- Mobile Header (Tampil jika di layar kecil) -->
      <header class="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-10">
        <h1 class="text-xl font-bold text-blue-700">HRIS</h1>
        <button @click="handleLogout" class="text-sm font-medium text-red-600">Keluar</button>
      </header>

      <!-- Desktop Header / Topbar (Tampil jika di layar besar) -->
      <header class="hidden md:flex h-16 bg-white border-b border-gray-200 items-center justify-end px-8 shrink-0 z-10">
        <div class="relative">

          <!-- Tombol Bundar (Avatar) -->
          <button @click="isDropdownOpen = !isDropdownOpen" class="flex items-center gap-3 focus:outline-none">
            <div class="text-right">
              <!-- Mengambil nama asli dan jabatan/role dari Pinia authStore -->
              <p class="text-sm font-bold text-gray-900">{{ authStore.user?.full_name || 'Memuat...' }}</p>
              <p class="text-xs text-gray-500">{{ authStore.user?.role?.role_name || authStore.user?.job_title || 'Karyawan' }}</p>
            </div>
            
            <!-- Lingkaran Logo dengan Inisial Otomatis -->
            <div class="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shadow-md border-2 border-blue-50 hover:ring-2 hover:ring-blue-300 transition-all">
              {{ getInitials(authStore.user?.full_name) }}
            </div>
          </button>

          <!-- Layar Transparan untuk klik di luar dropdown -->
          <div v-if="isDropdownOpen" @click="isDropdownOpen = false" class="fixed inset-0 z-40"></div>

          <!-- Menu Dropdown -->
          <div 
            v-if="isDropdownOpen"
            class="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2"
          >
            <div class="px-4 py-2 border-b border-gray-100 mb-1">
              <p class="text-xs font-semibold text-gray-400 uppercase">Akun Saya</p>
            </div>
            <button 
              @click="handleLogout"
              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 font-medium flex items-center gap-2 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Keluar Sistem
            </button>
          </div>

        </div>
      </header>

      <!-- 3. KONTEN KANAN (Area Router View) -->
      <main class="flex-1 overflow-y-auto bg-gray-50 relative">
        <router-view />
      </main>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Swal from 'sweetalert2'

const router = useRouter()
const authStore = useAuthStore()

// State untuk dropdown
const isDropdownOpen = ref(false)

// Fungsi untuk mengambil inisial nama (Misal: "Gemma Dwi" jadi "GD")
const getInitials = (name) => {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

onMounted(async () => {
  if (!authStore.user) {
    try {
      await authStore.fetchUser()
    } catch (error) {
      authStore.logout()
      router.push('/login')
    }
  }
})

const handleLogout = async () => {
  isDropdownOpen.value = false

  const result = await Swal.fire({
    title: 'Keluar Aplikasi?',
    text: 'Sesi Anda akan diakhiri dan harus login kembali.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#9ca3af',
    confirmButtonText: 'Ya, Logout',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    await authStore.logout()

    Swal.fire({
      icon: 'success',
      title: 'Berhasil Logout',
      showConfirmButton: false,
      timer: 1500
    })

    router.push('/login')
  }
}
</script>