<template>
  <div class="space-y-6">

    <!-- HEADER UCAPAN WELCOME DI PC -->
    <div class="hidden md:flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div class="flex items-center gap-4">
        <div
          class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
          {{ getInitials(authStore.user?.full_name || 'Karyawan') }}
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900">Selamat Datang, {{ authStore.user?.full_name || 'Karyawan' }} 👋
          </h2>
          <p class="text-xs text-gray-500 mt-0.5">{{ authStore.user?.job_title || 'Employee' }} • NIP: {{
            authStore.user?.employee_id || '-' }}</p>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <!-- STATUS PRESENSI HARI INI (DINAMIS) -->
        <div class="text-right">
          <p class="text-xs font-semibold text-gray-400">STATUS HARI INI</p>
          <span v-if="isOffDay"
            class="inline-block px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full mt-1">
            Libur ({{ offDayReason }})
          </span>
          <span v-else-if="!todayAttendance?.clock_in"
            class="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full mt-1">
            Belum Absen Masuk
          </span>
          <span v-else-if="!todayAttendance?.clock_out"
            class="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full mt-1">
            Sudah Absen Masuk ({{ todayAttendance.clock_in }})
          </span>
          <span v-else class="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full mt-1">
            Selesai Kerja ({{ todayAttendance.clock_out }})
          </span>
        </div>

        <!-- 💡 TOMBOL LOGOUT BARU -->
        <!-- <button 
          @click="handleLogout" 
          class="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 transition active:scale-95 flex items-center gap-1.5 text-xs font-bold"
          title="Keluar dari Akun"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Logout
        </button> -->
      </div>
    </div>

    <!-- MAIN GRID RESPONSIVE -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- KOLOM KIRI -> WIDGET PRESENSI & CUTI -->
      <div class="lg:col-span-1 space-y-6">
        <div
          class="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-xs text-indigo-200 font-medium">Jam Kerja Hari Ini</p>
              <h3 class="text-xs font-bold text-white mt-0.5">Shift Normal (08:00 - 17:00)</h3>
            </div>
            <span
              class="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-semibold text-blue-200 border border-white/10">
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
          <button v-if="isOffDay" disabled
            class="w-full py-3.5 bg-rose-500/20 text-rose-200 border border-rose-500/30 font-bold rounded-2xl cursor-not-allowed text-center text-xs flex items-center justify-center gap-2">
            🚫 Presensi Ditutup ({{ offDayReason }})
          </button>

          <button v-else-if="!todayAttendance?.clock_in && !isClockInTimeValid" disabled
            class="w-full py-3.5 bg-amber-500/20 text-amber-200 border border-amber-500/30 font-bold rounded-2xl cursor-not-allowed text-center text-xs flex items-center justify-center gap-2">
            ⏰ Clock In Ditutup (06:00 - 12:00 WIB)
          </button>

          <button v-else-if="!todayAttendance?.clock_in" @click="router.push('/employee/attendances/create')"
            class="w-full py-3.5 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
            </svg>
            Presensi Masuk (Clock In)
          </button>

          <button v-else-if="!todayAttendance?.clock_out" @click="router.push('/employee/attendances/create')"
            class="w-full py-3.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Presensi Pulang (Clock Out)
          </button>

          <button v-else disabled
            class="w-full py-3.5 bg-white/20 text-indigo-100 font-bold rounded-2xl cursor-not-allowed text-center text-sm">
            ✅ Presensi Hari Ini Selesai
          </button>
        </div>

        <!-- STATISTIK RINGKASAN SISA CUTI -->
        <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p class="text-xs font-bold text-gray-400 uppercase">Sisa Cuti Tahunan</p>
          <div class="flex items-baseline gap-1 mt-1">
            <span class="text-3xl font-black text-gray-900">{{ leaveSummary.remaining }}</span>
            <span class="text-xs text-gray-500 font-semibold">/ {{ leaveSummary.total }} Hari</span>
          </div>
          <div class="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
            <div class="bg-amber-500 h-full rounded-full transition-all duration-500"
              :style="{ width: `${leavePercentage}%` }"></div>
          </div>
        </div>
      </div>

      <!-- KOLOM KANAN -> MENU CEPAT & AKTIVITAS -->
      <div class="lg:col-span-2 space-y-6">

        <!-- MENU CEPAT / SHORTCUT LAYANAN -->
        <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Layanan Mandiri Karyawan</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">

            <button @click="router.push('/employee/leaves')"
              class="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-amber-50/50 rounded-2xl border border-gray-100 hover:border-amber-200 transition active:scale-95">
              <div
                class="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold">
                🌴</div>
              <span class="text-xs font-bold text-gray-700">Pengajuan Cuti</span>
            </button>

            <button @click="router.push('/employee/permits')"
              class="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-purple-50/50 rounded-2xl border border-gray-100 hover:border-purple-200 transition active:scale-95">
              <div
                class="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl font-bold">
                📄</div>
              <span class="text-xs font-bold text-gray-700">Pengajuan Izin</span>
            </button>

            <button @click="router.push('/employee/overtimes')"
              class="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-blue-50/50 rounded-2xl border border-gray-100 hover:border-blue-200 transition active:scale-95">
              <div
                class="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">
                ⏱</div>
              <span class="text-xs font-bold text-gray-700">Lembur</span>
            </button>

            <button @click="router.push('/employee/payrolls')"
              class="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-emerald-50/50 rounded-2xl border border-gray-100 hover:border-emerald-200 transition active:scale-95">
              <div
                class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
                💵</div>
              <span class="text-xs font-bold text-gray-700">Slip Gaji</span>
            </button>

          </div>
        </div>

        <!-- RIWAYAT PRESENSI TERAKHIR -->
        <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div class="flex justify-between items-center pb-2 border-b border-gray-100">
            <h3 class="text-sm font-bold text-gray-900">Aktivitas Presensi Terakhir</h3>
            <button @click="router.push('/employee/attendances')"
              class="text-xs font-bold text-blue-600 hover:underline">Lihat Semua</button>
          </div>

          <div v-if="isLoading" class="text-center py-6 text-xs text-gray-400">
            Memuat aktivitas presensi...
          </div>

          <div v-else-if="recentAttendances.length === 0" class="text-center py-6 text-xs text-gray-400">
            Belum ada data presensi bulan ini.
          </div>

          <div v-else class="space-y-3">
            <div v-for="item in recentAttendances" :key="item.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg font-bold flex items-center justify-center text-sm"
                  :class="item.status === 'Cuti' || item.status === 'Izin' ? 'bg-purple-100 text-purple-700' : (item.clock_out ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700')">
                  {{ item.status === 'Cuti' ? '🌴' : (item.status === 'Izin' ? '📄' : (item.clock_out ? 'Out' : 'In')) }}
                </div>
                <div>
                  <p class="font-bold text-gray-900 text-sm">
                    {{ item.clock_in || item.clock_out ? (item.clock_out ? `Clock Out — ${item.clock_out}` : `Clock In — ${item.clock_in}`) : item.notes }}
                  </p>
                  <p class="text-xs text-gray-400">{{ item.date_formatted }} • {{ item.notes }}</p>
                </div>
              </div>
              <span class="px-3 py-1 text-xs font-bold rounded-lg" :class="getStatusBadgeClass(item.status)">
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
import api from '../../lib/axios'
import Swal from 'sweetalert2' // 💡 IMPORT SWEETALERT2

const router = useRouter()
const authStore = useAuthStore()

// State Data Dashboard
const isLoading = ref(false)
const currentTime = ref('')
const currentDateFormatted = ref('')
let timerInterval = null

// 💡 FUNGSI HANDLER LOGOUT LENGKAP
const handleLogout = async () => {
  const result = await Swal.fire({
    title: 'Konfirmasi Keluar',
    text: 'Apakah Anda yakin ingin keluar dari akun ini?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya, Logout',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      // 1. Panggil Action Pinia Logout
      await authStore.logout()

      // 2. Alert Berhasil
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil Logout',
        text: 'Anda telah keluar dari sistem.',
        timer: 1500,
        showConfirmButton: false
      })

      // 3. Paksa Pengalihan Halaman ke /login
      router.replace('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      window.location.href = '/login'
    }
  }
}

// State Hari Libur
const holidaysList = ref([
  '2026-01-01',
  '2026-03-19',
  '2026-05-01',
  '2026-08-17',
  '2026-12-25'
])

// Computed Evaluasi Hari Libur
const todayObj = computed(() => new Date())
const isSunday = computed(() => todayObj.value.getDay() === 0)

const todayFormatted = computed(() => {
  const t = todayObj.value
  const year = t.getFullYear()
  const month = String(t.getMonth() + 1).padStart(2, '0')
  const date = String(t.getDate()).padStart(2, '0')
  return `${year}-${month}-${date}`
})

const isHoliday = computed(() => holidaysList.value.includes(todayFormatted.value))
const isOffDay = computed(() => isSunday.value || isHoliday.value)

const offDayReason = computed(() => {
  if (isSunday.value) return 'Hari Minggu (Libur Pekan)'
  if (isHoliday.value) return 'Tanggal Merah (Libur Nasional)'
  return ''
})

// 🕒 CEK KELAYAKAN JAM CLOCK IN (FRONTEND)
const isClockInTimeValid = computed(() => {
  const hour = new Date().getHours()
  return hour >= 6 && hour < 12
})

// Real State Presensi Hari Ini
const todayAttendance = ref(null)

// Real State Cuti
const leaveSummary = ref({
  remaining: 0,
  total: 12
})

// Real State Riwayat Presensi
const recentAttendances = ref([])

const leavePercentage = computed(() => {
  if (!leaveSummary.value.total) return 0
  return (leaveSummary.value.remaining / leaveSummary.value.total) * 100
})

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

const fetchPublicHolidays = async () => {
  try {
    const res = await fetch('https://dayoffapi.vercel.app/api')
    const data = await res.json()
    if (Array.isArray(data)) {
      holidaysList.value = data.map(item => item.tanggal)
    }
  } catch (err) {
    console.warn('Menggunakan fallback daftar libur nasional bawaan.')
  }
}

const fetchDashboardData = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/employee/dashboard-summary')

    if (response.data?.success) {
      const data = response.data.data
      todayAttendance.value = data.today_attendance
      leaveSummary.value = data.leave_summary
      recentAttendances.value = data.recent_attendances
    }
  } catch (error) {
    console.error('Gagal mengambil data dashboard:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  updateClock()
  timerInterval = setInterval(updateClock, 1000)
  fetchPublicHolidays()
  fetchDashboardData()
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>