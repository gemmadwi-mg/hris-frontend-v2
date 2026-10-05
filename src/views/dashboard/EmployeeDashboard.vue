<template>
  <div class="min-h-screen bg-slate-100 flex justify-center py-0 md:py-6">
    
    <!-- CONTAINER SIMULASI PHONE APPS (Max Width 480px) -->
    <div class="w-full max-w-md bg-gray-50 min-h-screen md:min-h-[820px] md:rounded-3xl md:shadow-2xl md:border border-gray-200 overflow-hidden flex flex-col justify-between relative">
      
      <!-- CONTENT AREA -->
      <div class="p-5 space-y-6 pb-24">
        
        <!-- HEADER PROFILE -->
        <div class="flex items-center justify-between pt-2">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-200">
              {{ getInitials(authStore.user?.full_name || authStore.user?.name || 'Karyawan') }}
            </div>
            <div>
              <p class="text-xs text-gray-400 font-medium">Selamat Datang 👋</p>
              <h2 class="text-base font-bold text-gray-900 leading-tight">{{ authStore.user?.full_name || authStore.user?.name || 'Karyawan' }}</h2>
              <span class="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md border border-blue-100 mt-0.5">
                {{ authStore.user?.role || 'Employee' }}
              </span>
            </div>
          </div>
        </div>

        <!-- WIDGET CLOCK IN / CLOCK OUT -->
        <div class="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-xs text-indigo-200 font-medium">Jam Kerja Hari Ini</p>
              <h3 class="text-xs font-bold text-white mt-0.5">Shift Regular (08:00 - 17:00)</h3>
            </div>
            <span class="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-semibold text-blue-200 border border-white/10">
              {{ currentDateFormatted }}
            </span>
          </div>

          <!-- JAM DIGITAL -->
          <div class="text-center my-4">
            <div class="text-4xl font-black tracking-wider font-mono text-white drop-shadow-md">
              {{ currentTime }}
            </div>
            <p class="text-[11px] text-indigo-200 mt-1 flex items-center justify-center gap-1">
              📍 Surabaya Head Office
            </p>
          </div>

          <!-- TOMBOL PRESENSI -->
          <button 
            @click="router.push('/attendances/create')"
            class="w-full py-3.5 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/30 transition flex items-center justify-center gap-2 text-sm mt-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Presensi Masuk (Clock In)
          </button>
        </div>

        <!-- MENU CEPAT LAYANAN -->
        <div>
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Layanan Mandiri Karyawan</h3>
          <div class="grid grid-cols-4 gap-3">
            
            <button @click="router.push('/leave-requests')" class="flex flex-col items-center gap-1.5 p-3 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition active:scale-95">
              <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 text-lg">
                🌴
              </div>
              <span class="text-[11px] font-bold text-gray-700">Cuti</span>
            </button>

            <button @click="router.push('/permit-requests')" class="flex flex-col items-center gap-1.5 p-3 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition active:scale-95">
              <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 text-lg">
                📄
              </div>
              <span class="text-[11px] font-bold text-gray-700">Izin</span>
            </button>

            <button @click="router.push('/overtimes')" class="flex flex-col items-center gap-1.5 p-3 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition active:scale-95">
              <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 text-lg">
                ⏱
              </div>
              <span class="text-[11px] font-bold text-gray-700">Lembur</span>
            </button>

            <button @click="router.push('/payrolls')" class="flex flex-col items-center gap-1.5 p-3 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition active:scale-95">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 text-lg">
                💵
              </div>
              <span class="text-[11px] font-bold text-gray-700">Slip Gaji</span>
            </button>

          </div>
        </div>

        <!-- METRIK SISA CUTI -->
        <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <p class="text-[10px] font-bold text-gray-400 uppercase">Sisa Cuti Tahunan</p>
          <div class="flex items-baseline gap-1 mt-1">
            <span class="text-2xl font-black text-gray-900">12</span>
            <span class="text-xs text-gray-500 font-semibold">Hari</span>
          </div>
          <div class="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div class="bg-amber-500 h-full rounded-full" style="width: 75%"></div>
          </div>
        </div>

      </div>

      <!-- BOTTOM BAR MOBILE -->
      <div class="sticky bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-2 flex justify-around items-center md:rounded-b-3xl">
        <button class="flex flex-col items-center gap-0.5 text-blue-600 font-bold p-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l1.293 1.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
          <span class="text-[10px]">Beranda</span>
        </button>

        <button @click="router.push('/attendances')" class="flex flex-col items-center gap-0.5 text-gray-400 hover:text-gray-700 font-medium p-2 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span class="text-[10px]">Riwayat</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const currentTime = ref('')
const currentDateFormatted = ref('')
let timerInterval = null

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

onMounted(() => {
  updateClock()
  timerInterval = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>