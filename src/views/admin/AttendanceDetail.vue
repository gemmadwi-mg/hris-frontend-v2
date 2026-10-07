<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-10">
    <div class="max-w-5xl mx-auto">
      
      <!-- HEADER & TOMBOL AKSI -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <button @click="router.push('/attendances')" class="p-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl transition shadow-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Rincian Absensi</h1>
            <p class="text-sm text-gray-500">ID: {{ route.params.id }}</p>
          </div>
        </div>

        <div v-if="attendance && !isLoading" class="flex items-center gap-3">
          <router-link :to="`/attendances/${attendance.attendance_id}/edit`" class="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium flex items-center gap-2 transition shadow-sm">
            Edit Data
          </router-link>
          <button @click="handleDelete" class="px-4 py-2 bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium flex items-center gap-2 transition shadow-sm">
            Hapus
          </button>
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-center py-20"><span class="text-blue-600 font-medium animate-pulse">Memuat data...</span></div>

      <div v-else-if="attendance" class="space-y-6">
        
        <!-- CARD 1: INFORMASI KARYAWAN -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center md:items-start relative overflow-hidden">
          <div :class="['absolute top-0 right-0 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-sm', getStatusColor(attendance.attendance_status)]">
            {{ attendance.attendance_status }}
          </div>
          
          <div class="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold shrink-0 border-4 border-white shadow-sm">
            {{ getInitials(attendance.employee?.full_name) }}
          </div>
          <div class="flex-1 text-center md:text-left">
            <h2 class="text-2xl font-bold text-gray-900">{{ attendance.employee?.full_name || 'Karyawan Dihapus' }}</h2>
            <p class="text-gray-500 text-sm mt-1">{{ attendance.employee?.job_title || '-' }} • {{ attendance.branch?.branch_name || 'Tanpa Cabang' }}</p>
            <div class="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {{ formatDateLong(attendance.date) }}
            </div>
          </div>
        </div>

        <!-- CARD 2 & 3: WAKTU MASUK DAN PULANG -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- CLOCK IN -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
            <h3 class="text-sm font-bold text-gray-400 uppercase mb-4 border-b border-gray-100 pb-2">Datang (Clock In)</h3>
            <div v-if="attendance.clock_in_time">
              <p class="text-3xl font-extrabold text-gray-900 font-mono">{{ formatTime(attendance.clock_in_time) }}</p>
              <div class="mt-2 flex items-center gap-2">
                <span :class="attendance.clock_in_status === 'Late' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'" class="px-2.5 py-0.5 border rounded text-xs font-bold">
                  {{ attendance.clock_in_status }}
                </span>
                <span v-if="attendance.late_duration" class="text-xs text-red-500 font-medium">Terlambat: {{ attendance.late_duration }}</span>
              </div>
              <div class="mt-4 pt-4 border-t border-gray-50">
                <p class="text-xs text-gray-500 mb-1">Koordinat Lokasi</p>
                <p class="text-sm font-medium text-gray-800">{{ attendance.clock_in_coordinates || '-' }}</p>
              </div>
            </div>
            <div v-else class="py-6 text-center text-gray-400 font-medium">Tidak ada data</div>
          </div>

          <!-- CLOCK OUT -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
            <h3 class="text-sm font-bold text-gray-400 uppercase mb-4 border-b border-gray-100 pb-2">Pulang (Clock Out)</h3>
            <div v-if="attendance.clock_out_time">
              <p class="text-3xl font-extrabold text-gray-900 font-mono">{{ formatTime(attendance.clock_out_time) }}</p>
              <div class="mt-2 flex items-center gap-2">
                <span v-if="attendance.clock_out_status === 'Early Depart'" class="px-2.5 py-0.5 border bg-yellow-50 text-yellow-700 border-yellow-200 rounded text-xs font-bold">Pulang Cepat</span>
                <span v-else class="px-2.5 py-0.5 border bg-green-50 text-green-600 border-green-200 rounded text-xs font-bold">Normal / Tepat Waktu</span>
                
                <span v-if="attendance.early_leave_duration" class="text-xs text-yellow-600 font-medium">Lebih awal: {{ attendance.early_leave_duration }}</span>
              </div>
              <div class="mt-4 pt-4 border-t border-gray-50">
                <p class="text-xs text-gray-500 mb-1">Koordinat Lokasi</p>
                <p class="text-sm font-medium text-gray-800">{{ attendance.clock_out_coordinates || '-' }}</p>
              </div>
            </div>
            <div v-else class="py-6 text-center text-gray-400 font-medium">Belum Clock Out</div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../lib/axios'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const attendance = ref(null)
const isLoading = ref(true)

const fetchDetail = async () => {
  try {
    const res = await api.get(`/attendances/${route.params.id}`)
    attendance.value = res.data.data
  } catch (error) {
    Swal.fire('Error', 'Data tidak ditemukan', 'error')
    router.push('/attendances')
  } finally {
    isLoading.value = false
  }
}

const handleDelete = async () => {
  const result = await Swal.fire({
    title: 'Hapus Absensi?', text: 'Data akan dihapus permanen!', icon: 'warning',
    showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Ya, Hapus'
  })
  if (result.isConfirmed) {
    try {
      await api.delete(`/attendances/${attendance.value.attendance_id}`)
      await Swal.fire({ icon: 'success', title: 'Terhapus!', showConfirmButton: false, timer: 1500 })
      router.push('/attendances')
    } catch (e) {
      Swal.fire('Gagal', 'Terjadi kesalahan sistem', 'error')
    }
  }
}

// Helpers
const getInitials = (name) => name ? name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : '?'
const formatDateLong = (date) => new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date))
const formatTime = (datetime) => new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(datetime))
const getStatusColor = (status) => {
  const colors = { 'Present': 'bg-green-600', 'Absent': 'bg-red-600', 'Leave': 'bg-blue-600', 'Permit': 'bg-purple-600', 'Invalid': 'bg-gray-600' }
  return colors[status] || 'bg-gray-600'
}

onMounted(() => fetchDetail())
</script>