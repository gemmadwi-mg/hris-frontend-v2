<template>
  <div class="space-y-6">
    
    <!-- HEADER UCAPAN WELCOME DI PC -->
    <div class="hidden md:flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
          {{ getInitials(authStore.user?.full_name || 'Karyawan') }}
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900">Selamat Datang, {{ authStore.user?.full_name || 'Karyawan' }} 👋</h2>
          <p class="text-xs text-gray-500 mt-0.5">{{ authStore.user?.job_title || 'Employee' }} • NIP: {{ authStore.user?.employee_id || '-' }}</p>
        </div>
      </div>
      
      <!-- STATUS PRESENSI HARI INI (DINAMIS) -->
      <div class="text-right">
        <p class="text-xs font-semibold text-gray-400">STATUS HARI INI</p>
        <span 
          v-if="!todayAttendance?.clock_in" 
          class="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full mt-1"
        >
          Belum Absen Masuk
        </span>
        <span 
          v-else-if="!todayAttendance?.clock_out" 
          class="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full mt-1"
        >
          Sudah Absen Masuk ({{ todayAttendance.clock_in }})
        </span>
        <span 
          v-else 
          class="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full mt-1"
        >
          Selesai Kerja ({{ todayAttendance.clock_out }})
        </span>
      </div>
    </div>

    <!-- MAIN GRID RESPONSIVE -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- KOLOM KIRI -> WIDGET PRESENSI & CUTI -->
      <div class="lg:col-span-1 space-y-6">
        <div class="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-xs text-indigo-200 font-medium">Jam Kerja Hari Ini</p>
              <h3 class="text-xs font-bold text-white mt-0.5">Shift Normal (08:00 - 17:00)</h3>
            </div>
            <span class="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-semibold text-blue-200 border border-white/10">
              {{ currentDateFormatted }}
            </span>
          </div>

          <!-- JAM DIGITAL -->
          <div class="text-center my-6">
            <div class="text-4xl font-black tracking-wider font-mono text-white drop-shadow-md">
              {{ currentTime }}
            </div>
            <p class="text-[11px] text-indigo-200 mt-1">📍 Kantor Pusat (Surabaya)</p>
          </div>

          <!-- TOMBOL PRESENSI DINAMIS -->
          <!-- 1. Jika Belum Clock In -->
          <button 
            v-if="!todayAttendance?.clock_in"
            @click="router.push('/employee/attendances/create')"
            class="w-full py-3.5 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
            Presensi Masuk (Clock In)
          </button>

          <!-- 2. Jika Sudah Clock In tapi Belum Clock Out -->
          <button 
            v-else-if="!todayAttendance?.clock_out"
            @click="router.push('/employee/attendances/create')"
            class="w-full py-3.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Presensi Pulang (Clock Out)
          </button>

          <!-- 3. Jika Sudah Selesai Presensi Hari Ini -->
          <button 
            v-else
            disabled
            class="w-full py-3.5 bg-white/20 text-indigo-100 font-bold rounded-2xl cursor-not-allowed text-center text-sm"
          >
            ✅ Presensi Hari Ini Selesai
          </button>
        </div>

        <!-- STATISTIK RINGKASAN SISA CUTI (DINAMIS) -->
        <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p class="text-xs font-bold text-gray-400 uppercase">Sisa Cuti Tahunan</p>
          <div class="flex items-baseline gap-1 mt-1">
            <span class="text-3xl font-black text-gray-900">{{ leaveSummary.remaining }}</span>
            <span class="text-xs text-gray-500 font-semibold">/ {{ leaveSummary.total }} Hari</span>
          </div>
          <div class="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              class="bg-amber-500 h-full rounded-full transition-all duration-500" 
              :style="{ width: `${leavePercentage}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- KOLOM KANAN -> MENU CEPAT & AKTIVITAS -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- MENU CEPAT / SHORTCUT LAYANAN -->
        <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Layanan Mandiri Karyawan</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            <button @click="router.push('/employee/leaves')" class="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-amber-50/50 rounded-2xl border border-gray-100 hover:border-amber-200 transition active:scale-95">
              <div class="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold">🌴</div>
              <span class="text-xs font-bold text-gray-700">Pengajuan Cuti</span>
            </button>

            <button @click="router.push('/employee/permits')" class="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-purple-50/50 rounded-2xl border border-gray-100 hover:border-purple-200 transition active:scale-95">
              <div class="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl font-bold">📄</div>
              <span class="text-xs font-bold text-gray-700">Pengajuan Izin</span>
            </button>

            <button @click="router.push('/employee/overtimes')" class="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-blue-50/50 rounded-2xl border border-gray-100 hover:border-blue-200 transition active:scale-95">
              <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">⏱</div>
              <span class="text-xs font-bold text-gray-700">Lembur</span>
            </button>

            <button @click="router.push('/employee/payrolls')" class="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-emerald-50/50 rounded-2xl border border-gray-100 hover:border-emerald-200 transition active:scale-95">
              <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">💵</div>
              <span class="text-xs font-bold text-gray-700">Slip Gaji</span>
            </button>

          </div>
        </div>

        <!-- RIWAYAT PRESENSI TERAKHIR (DINAMIS V-FOR) -->
        <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div class="flex justify-between items-center pb-2 border-b border-gray-100">
            <h3 class="text-sm font-bold text-gray-900">Aktivitas Presensi Terakhir</h3>
            <button @click="router.push('/employee/attendances')" class="text-xs font-bold text-blue-600 hover:underline">Lihat Semua</button>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-6 text-xs text-gray-400">
            Memuat aktivitas presensi...
          </div>

          <!-- Empty State -->
          <div v-else-if="recentAttendances.length === 0" class="text-center py-6 text-xs text-gray-400">
            Belum ada data presensi bulan ini.
          </div>

          <!-- List Activity -->
          <div v-else class="space-y-3">
            <div 
              v-for="item in recentAttendances" 
              :key="item.id" 
              class="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
            >
              <div class="flex items-center gap-3">
                <div 
                  class="w-10 h-10 rounded-lg font-bold flex items-center justify-center text-sm"
                  :class="item.clock_out ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'"
                >
                  {{ item.clock_out ? 'Out' : 'In' }}
                </div>
                <div>
                  <p class="font-bold text-gray-900 text-sm">
                    {{ item.clock_out ? `Clock Out — ${item.clock_out}` : `Clock In — ${item.clock_in}` }}
                  </p>
                  <p class="text-xs text-gray-400">{{ item.date_formatted }} • {{ item.notes || 'Presensi Normal' }}</p>
                </div>
              </div>
              <span 
                class="px-3 py-1 text-xs font-bold rounded-lg"
                :class="getStatusBadgeClass(item.status)"
              >
                {{ item.status }}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
// import axios from '../../plugins/axios' // Uncomment jika menggunakan axios langsung/store

const router = useRouter()
const authStore = useAuthStore()

// State Data Dashboard
const isLoading = ref(false)
const currentTime = ref('')
const currentDateFormatted = ref('')
let timerInterval = null

// Real/Mock State Presensi Hari Ini
const todayAttendance = ref({
  clock_in: null,  // contoh: '07:55 WIB'
  clock_out: null  // contoh: '17:05 WIB'
})

// Real/Mock State Cuti
const leaveSummary = ref({
  remaining: 9,
  total: 12
})

// Real/Mock State Riwayat Presensi
const recentAttendances = ref([])

// Computed Percentage untuk Progress Bar Cuti
const leavePercentage = computed(() => {
  if (!leaveSummary.value.total) return 0
  return (leaveSummary.value.remaining / leaveSummary.value.total) * 100
})

// Function Update Jam Realtime
const updateClock = () => {
  const now = new Date()
  currentTime.value = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).format(now) + ' WIB'

  currentDateFormatted.value = new Intl.DateTimeFormat('id-ID', {
    weekday: 'short', day: '2-digit', month: 'short'
  }).format(now)
}

const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'EE'

const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'hadir':
    case 'tepat waktu':
      return 'bg-emerald-100 text-emerald-800'
    case 'terlambat':
      return 'bg-rose-100 text-rose-800'
    case 'izin':
    case 'cuti':
      return 'bg-amber-100 text-amber-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Fetch Data dari API Backend (Laravel)
const fetchDashboardData = async () => {
  isLoading.value = true
  try {
    // Jalankan request ke API backend Anda (contoh):
    // const response = await axios.get('/api/employee/dashboard-summary')
    // todayAttendance.value = response.data.today_attendance
    // leaveSummary.value = response.data.leave_summary
    // recentAttendances.value = response.data.recent_attendances

    // Mock Data Dummy (Hapus jika sudah terhubung API Backend):
    setTimeout(() => {
      todayAttendance.value = { clock_in: '07:55 WIB', clock_out: null }
      recentAttendances.value = [
        { id: 1, clock_in: '07:55 WIB', clock_out: null, date_formatted: 'Hari ini', status: 'Tepat Waktu', notes: 'Presensi Masuk' },
        { id: 2, clock_in: '08:00 WIB', clock_out: '17:05 WIB', date_formatted: 'Kemarin', status: 'Hadir', notes: 'Presensi Selesai' }
      ]
      isLoading.value = false
    }, 500)

  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    isLoading.value = false
  }
}

onMounted(() => {
  updateClock()
  timerInterval = setInterval(updateClock, 1000)
  fetchDashboardData()
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>