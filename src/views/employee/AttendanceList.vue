<template>
  <div class="max-w-4xl mx-auto space-y-6">
    
    <!-- HEADER & FILTER -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
      <div class="flex items-center gap-3">
        <button @click="router.push('/employee/dashboard')" class="p-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </button>
        <div>
          <h1 class="text-xl font-bold text-gray-900">Riwayat Presensi</h1>
          <p class="text-xs text-gray-500">Daftar catatan jam masuk & pulang Anda.</p>
        </div>
      </div>

      <!-- FILTER BULAN & TAHUN -->
      <div class="flex items-center gap-2">
        <input 
          type="month" 
          v-model="selectedMonth" 
          @change="fetchAttendances(1)"
          class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          @click="fetchAttendances(1)" 
          class="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          title="Refresh Data"
        >
          🔄
        </button>
      </div>
    </div>

    <!-- STATISTIK RINGKASAN BULANAN -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center">
        <p class="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Hadir</p>
        <p class="text-2xl font-black text-emerald-900 mt-1">{{ stats.present }}</p>
      </div>
      <div class="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-center">
        <p class="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Terlambat</p>
        <p class="text-2xl font-black text-amber-900 mt-1">{{ stats.late }}</p>
      </div>
      <div class="bg-purple-50 border border-purple-100 p-4 rounded-2xl text-center">
        <p class="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Izin / Cuti</p>
        <p class="text-2xl font-black text-purple-900 mt-1">{{ stats.permit }}</p>
      </div>
      <div class="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-center">
        <p class="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Alfa / Absen</p>
        <p class="text-2xl font-black text-rose-900 mt-1">{{ stats.absent }}</p>
      </div>
    </div>

    <!-- LOADING STATE -->
    <div v-if="isLoading" class="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3">
      <div class="animate-spin border-4 border-blue-600 border-t-transparent rounded-full w-8 h-8 mx-auto"></div>
      <p class="text-xs font-semibold text-gray-500">Memuat riwayat presensi...</p>
    </div>

    <!-- EMPTY STATE -->
    <div v-else-if="attendances.length === 0" class="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3">
      <div class="text-4xl">📅</div>
      <h3 class="text-sm font-bold text-gray-800">Tidak Ada Data Presensi</h3>
      <p class="text-xs text-gray-400">Belum ada riwayat kehadiran terdaftar pada periode bulan ini.</p>
    </div>

    <!-- DAFTAR PRESENSI (RESPONSIVE: CARDS DI HP, TABLE DI PC) -->
    <div v-else class="space-y-4">
      
      <!-- VIEW TABLE (DESKTOP) -->
      <div class="hidden md:block bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <th class="p-4">Tanggal</th>
              <th class="p-4">Clock In</th>
              <th class="p-4">Clock Out</th>
              <th class="p-4">Status</th>
              <th class="p-4 text-center">Foto Selfie</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-xs">
            <tr v-for="item in attendances" :key="item.attendance_id" class="hover:bg-slate-50/80 transition">
              <td class="p-4 font-bold text-gray-900">
                {{ formatDate(item.date) }}
              </td>
              <td class="p-4">
                <div class="font-mono font-bold text-gray-800">{{ formatTime(item.clock_in_time) }}</div>
                <span v-if="item.clock_in_status" :class="getStatusBadgeClass(item.clock_in_status)">
                  {{ item.clock_in_status }}
                </span>
              </td>
              <td class="p-4">
                <div class="font-mono font-bold text-gray-800">{{ formatTime(item.clock_out_time) }}</div>
                <span v-if="item.clock_out_status" :class="getStatusBadgeClass(item.clock_out_status)">
                  {{ item.clock_out_status }}
                </span>
              </td>
              <td class="p-4">
                <span :class="getAttendanceStatusClass(item.attendance_status)">
                  {{ item.attendance_status }}
                </span>
              </td>
              <td class="p-4 text-center">
                <div class="flex justify-center gap-2">
                  <button 
                    v-if="item.clock_in_photo" 
                    @click="openPhotoModal(item.clock_in_photo, 'Selfie Clock In')"
                    class="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-bold text-[10px] transition"
                  >
                    📷 Masuk
                  </button>
                  <button 
                    v-if="item.clock_out_photo" 
                    @click="openPhotoModal(item.clock_out_photo, 'Selfie Clock Out')"
                    class="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg font-bold text-[10px] transition"
                  >
                    📷 Pulang
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- VIEW CARDS (MOBILE) -->
      <div class="md:hidden space-y-3">
        <div 
          v-for="item in attendances" 
          :key="item.attendance_id"
          class="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3"
        >
          <div class="flex justify-between items-center pb-2 border-b border-gray-100">
            <span class="text-xs font-bold text-gray-900">{{ formatDate(item.date) }}</span>
            <span :class="getAttendanceStatusClass(item.attendance_status)">
              {{ item.attendance_status }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-3 text-xs">
            <!-- Clock In Info -->
            <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
              <span class="text-[10px] text-gray-400 font-semibold block">CLOCK IN</span>
              <p class="font-mono font-bold text-gray-900">{{ formatTime(item.clock_in_time) }}</p>
              <div class="flex justify-between items-center mt-1">
                <span v-if="item.clock_in_status" :class="getStatusBadgeClass(item.clock_in_status)">
                  {{ item.clock_in_status }}
                </span>
                <button 
                  v-if="item.clock_in_photo" 
                  @click="openPhotoModal(item.clock_in_photo, 'Selfie Clock In')"
                  class="text-[10px] text-blue-600 font-bold hover:underline"
                >
                  Foto
                </button>
              </div>
            </div>

            <!-- Clock Out Info -->
            <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
              <span class="text-[10px] text-gray-400 font-semibold block">CLOCK OUT</span>
              <p class="font-mono font-bold text-gray-900">{{ formatTime(item.clock_out_time) }}</p>
              <div class="flex justify-between items-center mt-1">
                <span v-if="item.clock_out_status" :class="getStatusBadgeClass(item.clock_out_status)">
                  {{ item.clock_out_status }}
                </span>
                <button 
                  v-if="item.clock_out_photo" 
                  @click="openPhotoModal(item.clock_out_photo, 'Selfie Clock Out')"
                  class="text-[10px] text-blue-600 font-bold hover:underline"
                >
                  Foto
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PAGINASI -->
      <div v-if="pagination.last_page > 1" class="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200">
        <button 
          @click="fetchAttendances(pagination.current_page - 1)" 
          :disabled="pagination.current_page === 1"
          class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-xs font-bold rounded-xl transition"
        >
          ← Sebelumnya
        </button>
        <span class="text-xs text-gray-500 font-semibold">
          Halaman {{ pagination.current_page }} dari {{ pagination.last_page }}
        </span>
        <button 
          @click="fetchAttendances(pagination.current_page + 1)" 
          :disabled="pagination.current_page === pagination.last_page"
          class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-xs font-bold rounded-xl transition"
        >
          Selanjutnya →
        </button>
      </div>

    </div>

    <!-- MODAL PREVIEW FOTO SELFIE -->
    <div v-if="previewModal.isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div class="bg-white rounded-3xl overflow-hidden max-w-sm w-full p-4 space-y-3 animate-fade-in">
        <div class="flex justify-between items-center">
          <h3 class="text-sm font-bold text-gray-900">{{ previewModal.title }}</h3>
          <button @click="previewModal.isOpen = false" class="p-1 rounded-full text-gray-400 hover:text-gray-600">
            ✖
          </button>
        </div>
        <div class="aspect-square bg-slate-100 rounded-2xl overflow-hidden">
          <img :src="previewModal.imageUrl" class="w-full h-full object-cover scale-x-[-1]" alt="Preview Presensi" />
        </div>
        <button @click="previewModal.isOpen = false" class="w-full py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl">
          Tutup
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../lib/axios'

const router = useRouter()

// Default Bulan Saat Ini (Format YYYY-MM)
const now = new Date()
const selectedMonth = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

const attendances = ref([])
const isLoading = ref(false)
const pagination = ref({ current_page: 1, last_page: 1 })

// Modal Photo Preview State
const previewModal = ref({
  isOpen: false,
  title: '',
  imageUrl: ''
})

// Ringkasan Statistik Bulanan
const stats = computed(() => {
  let present = 0
  let late = 0
  let permit = 0
  let absent = 0

  attendances.value.forEach(item => {
    if (item.attendance_status === 'Present') present++
    if (item.clock_in_status === 'Late') late++
    if (item.attendance_status === 'Permit' || item.attendance_status === 'Leave') permit++
    if (item.attendance_status === 'Absent' || item.attendance_status === 'Invalid') absent++
  })

  return { present, late, permit, absent }
})

// FETCH DATA DARI API
const fetchAttendances = async (page = 1) => {
  isLoading.value = true
  try {
    const response = await api.get('/attendances', {
      params: {
        month: selectedMonth.value,
        page: page
      }
    })

    const result = response.data?.data
    attendances.value = result?.data || result || []
    pagination.value = {
      current_page: result?.current_page || 1,
      last_page: result?.last_page || 1
    }
  } catch (error) {
    console.error('Error fetching attendances:', error)
  } finally {
    isLoading.value = false
  }
}

// FORMATTERS & HELPERS
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  }).format(date)
}

const formatTime = (dateTimeStr) => {
  if (!dateTimeStr) return '--:--'
  const date = new Date(dateTimeStr)
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit', minute: '2-digit', hour12: false
  }).format(date) + ' WIB'
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'On Time': return 'px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800'
    case 'Late': return 'px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800'
    case 'Early Depart': return 'px-2 py-0.5 rounded text-[9px] font-bold bg-orange-100 text-orange-800'
    default: return 'px-2 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-700'
  }
}

const getAttendanceStatusClass = (status) => {
  switch (status) {
    case 'Present': return 'px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800'
    case 'Permit':
    case 'Leave': return 'px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800'
    case 'Absent': return 'px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800'
    default: return 'px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700'
  }
}

const openPhotoModal = (photoPath, title) => {
  // Bangun URL Storage Laravel (Sesuai Konstruksi Public Laravel)
  const baseUrl = import.meta.env.VITE_STORAGE_BASE_URL || 'http://localhost:8000/storage/'
  previewModal.value = {
    isOpen: true,
    title: title,
    imageUrl: photoPath.startsWith('http') ? photoPath : `${baseUrl}${photoPath}`
  }
}

onMounted(() => {
  fetchAttendances()
})
</script>