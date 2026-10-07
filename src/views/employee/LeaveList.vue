<template>
  <div class="max-w-4xl mx-auto space-y-6">
    
    <!-- HEADER & TOMBOL TAMBAH CUTI -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
      <div class="flex items-center gap-3">
        <button 
          @click="router.push('/employee/dashboard')" 
          class="p-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100 transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </button>
        <div>
          <h1 class="text-xl font-bold text-gray-900">Riwayat & Status Cuti</h1>
          <p class="text-xs text-gray-500">Pantau proses persetujuan dan riwayat pengajuan cuti Anda.</p>
        </div>
      </div>

      <button 
        @click="router.push('/employee/leaves/create')" 
        class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2"
      >
        <span>➕</span> Ajukan Cuti Baru
      </button>
    </div>

    <!-- STATISTIK RINGKASAN -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-center">
        <p class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Total Pengajuan</p>
        <p class="text-2xl font-black text-blue-900 mt-1">{{ stats.total }}</p>
      </div>
      <div class="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-center">
        <p class="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Menunggu (Pending)</p>
        <p class="text-2xl font-black text-amber-900 mt-1">{{ stats.pending }}</p>
      </div>
      <div class="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center">
        <p class="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Disetujui</p>
        <p class="text-2xl font-black text-emerald-900 mt-1">{{ stats.approved }}</p>
      </div>
      <div class="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-center">
        <p class="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Ditolak</p>
        <p class="text-2xl font-black text-rose-900 mt-1">{{ stats.rejected }}</p>
      </div>
    </div>

    <!-- FILTER STATUS -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1">
      <button 
        v-for="status in statusOptions" 
        :key="status.value"
        @click="filterStatus(status.value)"
        :class="[
          'px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border',
          selectedStatus === status.value 
            ? 'bg-gray-900 text-white border-gray-900 shadow-sm' 
            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
        ]"
      >
        {{ status.label }}
      </button>
    </div>

    <!-- LOADING STATE -->
    <div v-if="isLoading" class="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3">
      <div class="animate-spin border-4 border-blue-600 border-t-transparent rounded-full w-8 h-8 mx-auto"></div>
      <p class="text-xs font-semibold text-gray-500">Memuat data pengajuan cuti...</p>
    </div>

    <!-- EMPTY STATE -->
    <div v-else-if="leaveRequests.length === 0" class="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3">
      <div class="text-4xl">🏝️</div>
      <h3 class="text-sm font-bold text-gray-800">Tidak Ada Data Cuti</h3>
      <p class="text-xs text-gray-400">Belum ada riwayat permohonan cuti yang sesuai dengan filter.</p>
    </div>

    <!-- DAFTAR PENGAJUAN CUTI -->
    <div v-else class="space-y-4">
      
      <!-- DESKTOP TABLE VIEW -->
      <div class="hidden md:block bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <th class="p-4">Jenis Cuti</th>
              <th class="p-4">Rentang Tanggal</th>
              <th class="p-4">Durasi</th>
              <th class="p-4">Status</th>
              <th class="p-4 text-center">Aksi / Detail</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-xs">
            <tr v-for="item in leaveRequests" :key="item.leave_request_id" class="hover:bg-slate-50/80 transition">
              <td class="p-4 font-bold text-gray-900">
                {{ item.leave_type }}
                <span class="block text-[10px] text-gray-400 font-mono font-normal">#{{ item.leave_request_id }}</span>
              </td>
              <td class="p-4 text-gray-700 font-semibold">
                {{ formatDateRange(item.start_date, item.end_date) }}
              </td>
              <td class="p-4">
                <span class="px-2.5 py-1 bg-slate-100 text-slate-800 font-bold rounded-lg text-[11px]">
                  {{ item.total_days ?? getCalculatedDays(item.start_date, item.end_date) }} Hari
                </span>
              </td>
              <td class="p-4">
                <span :class="getStatusBadgeClass(item.status)">
                  {{ getStatusLabel(item.status) }}
                </span>
              </td>
              <td class="p-4 text-center">
                <div class="flex justify-center items-center gap-2">
                  <button 
                    @click="openDetailModal(item)"
                    class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[11px] rounded-xl transition"
                  >
                    Detail
                  </button>
                  <button 
                    v-if="item.status === 'Pending'"
                    @click="confirmCancel(item.leave_request_id)"
                    class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[11px] rounded-xl border border-red-200 transition"
                  >
                    Batalkan
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MOBILE CARD VIEW -->
      <div class="md:hidden space-y-3">
        <div 
          v-for="item in leaveRequests" 
          :key="item.leave_request_id"
          class="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3"
        >
          <div class="flex justify-between items-start pb-2 border-b border-gray-100">
            <div>
              <span class="text-xs font-bold text-gray-900 block">{{ item.leave_type }}</span>
              <span class="text-[10px] text-gray-400 font-mono">#{{ item.leave_request_id }}</span>
            </div>
            <span :class="getStatusBadgeClass(item.status)">
              {{ getStatusLabel(item.status) }}
            </span>
          </div>

          <div class="space-y-1.5 text-xs text-gray-600">
            <div class="flex justify-between">
              <span class="text-gray-400">Tanggal:</span>
              <span class="font-semibold text-gray-800">{{ formatDateRange(item.start_date, item.end_date) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Durasi:</span>
              <span class="font-bold text-blue-600">{{ item.total_days ?? getCalculatedDays(item.start_date, item.end_date) }} Hari Kerja</span>
            </div>
            <div class="pt-1">
              <p class="text-gray-400 text-[11px]">Alasan:</p>
              <p class="text-gray-800 font-medium line-clamp-2">{{ item.reason }}</p>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-gray-100">
            <button 
              @click="openDetailModal(item)"
              class="text-xs text-blue-600 font-bold hover:underline"
            >
              Lihat Detail & Lampiran →
            </button>
            <button 
              v-if="item.status === 'Pending'"
              @click="confirmCancel(item.leave_request_id)"
              class="px-2.5 py-1 bg-red-50 text-red-600 font-bold text-[10px] rounded-lg border border-red-200"
            >
              Batalkan
            </button>
          </div>
        </div>
      </div>

      <!-- PAGINASI -->
      <div v-if="pagination.last_page > 1" class="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200">
        <button 
          @click="fetchLeaveRequests(pagination.current_page - 1)" 
          :disabled="pagination.current_page === 1"
          class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-xs font-bold rounded-xl transition"
        >
          ← Sebelumnya
        </button>
        <span class="text-xs text-gray-500 font-semibold">
          Halaman {{ pagination.current_page }} dari {{ pagination.last_page }}
        </span>
        <button 
          @click="fetchLeaveRequests(pagination.current_page + 1)" 
          :disabled="pagination.current_page === pagination.last_page"
          class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-xs font-bold rounded-xl transition"
        >
          Selanjutnya →
        </button>
      </div>

    </div>

    <!-- MODAL DETAIL PENGAJUAN -->
    <div v-if="isModalOpen && selectedItem" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div class="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 animate-fade-in border border-gray-100">
        
        <div class="flex justify-between items-center pb-2 border-b border-gray-100">
          <div>
            <h3 class="text-sm font-bold text-gray-900">Detail Pengajuan Cuti</h3>
            <p class="text-[10px] text-gray-400 font-mono">#{{ selectedItem.leave_request_id }}</p>
          </div>
          <button @click="isModalOpen = false" class="p-1 rounded-full text-gray-400 hover:text-gray-600 text-sm">
            ✖
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div class="flex justify-between items-center">
            <span class="text-gray-400">Jenis Cuti:</span>
            <span class="font-bold text-gray-900">{{ selectedItem.leave_type }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-400">Status Pengajuan:</span>
            <span :class="getStatusBadgeClass(selectedItem.status)">
              {{ getStatusLabel(selectedItem.status) }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-400">Rentang Tanggal:</span>
            <span class="font-semibold text-gray-800">{{ formatDateRange(selectedItem.start_date, selectedItem.end_date) }}</span>
          </div>

          <!-- KETERANGAN / ALASAN -->
          <div class="bg-gray-50 p-3 rounded-2xl space-y-1 border border-gray-100">
            <span class="text-[10px] text-gray-400 font-bold block uppercase">Alasan Cuti</span>
            <p class="text-gray-800 leading-relaxed">{{ selectedItem.reason }}</p>
          </div>

          <!-- REASON REJECTION IF ANY -->
          <div v-if="selectedItem.status === 'Rejected' && selectedItem.rejection_reason" class="bg-rose-50 p-3 rounded-2xl space-y-1 border border-rose-100 text-rose-900">
            <span class="text-[10px] text-rose-500 font-bold block uppercase">Alasan Penolakan HRD</span>
            <p class="leading-relaxed">{{ selectedItem.rejection_reason }}</p>
          </div>

          <!-- LAMPIRAN BERKAS -->
          <div v-if="selectedItem.attachment" class="pt-1">
            <a 
              :href="getAttachmentUrl(selectedItem.attachment)" 
              target="_blank" 
              class="w-full p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-2xl transition flex items-center justify-between border border-blue-100"
            >
              <span class="flex items-center gap-2">📄 Lihat Lampiran Dokumen</span>
              <span>↗</span>
            </a>
          </div>
        </div>

        <button @click="isModalOpen = false" class="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-2xl transition">
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
import Swal from 'sweetalert2'

const router = useRouter()

const leaveRequests = ref([])
const isLoading = ref(false)
const selectedStatus = ref('')
const pagination = ref({ current_page: 1, last_page: 1 })

// Modal Detail
const isModalOpen = ref(false)
const selectedItem = ref(null)

const statusOptions = [
  { label: 'Semua Status', value: '' },
  { label: '⏳ Pending', value: 'Pending' },
  { label: '✅ Disetujui', value: 'Approved' },
  { label: '❌ Ditolak', value: 'Rejected' }
]

// Ringkasan Statistik
const stats = computed(() => {
  let total = leaveRequests.value.length
  let pending = 0
  let approved = 0
  let rejected = 0

  leaveRequests.value.forEach(item => {
    if (item.status === 'Pending') pending++
    if (item.status === 'Approved') approved++
    if (item.status === 'Rejected') rejected++
  })

  return { total, pending, approved, rejected }
})

// FETCH DATA CUTI
const fetchLeaveRequests = async (page = 1) => {
  isLoading.value = true
  try {
    const response = await api.get('/leave-requests', {
      params: {
        status: selectedStatus.value || undefined,
        page: page
      }
    })

    const result = response.data?.data
    leaveRequests.value = result?.data || result || []
    pagination.value = {
      current_page: result?.current_page || 1,
      last_page: result?.last_page || 1
    }
  } catch (error) {
    console.error('Fetch Leave Requests Error:', error)
  } finally {
    isLoading.value = false
  }
}

const filterStatus = (val) => {
  selectedStatus.value = val
  fetchLeaveRequests(1)
}

// BATALKAN PENGAJUAN
const confirmCancel = (id) => {
  Swal.fire({
    title: 'Batalkan Pengajuan?',
    text: 'Apakah Anda yakin ingin membatalkan pengajuan cuti ini?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya, Batalkan!',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await api.delete(`/leave-requests/${id}`)
        Swal.fire('Dibatalkan!', 'Pengajuan cuti Anda telah dibatalkan.', 'success')
        fetchLeaveRequests(pagination.value.current_page)
      } catch (err) {
        Swal.fire('Gagal', err.response?.data?.message || 'Gagal membatalkan pengajuan.', 'error')
      }
    }
  })
}

const openDetailModal = (item) => {
  selectedItem.value = item
  isModalOpen.value = true
}

// HELPERS & FORMATTERS
const formatDateRange = (startStr, endStr) => {
  if (!startStr || !endStr) return '-'
  const start = new Date(startStr)
  const end = new Date(endStr)

  const options = { day: '2-digit', month: 'short', year: 'numeric' }
  const startFormatted = new Intl.DateTimeFormat('id-ID', options).format(start)
  const endFormatted = new Intl.DateTimeFormat('id-ID', options).format(end)

  return startStr === endStr ? startFormatted : `${startFormatted} - ${endFormatted}`
}

const getCalculatedDays = (startStr, endStr) => {
  if (!startStr || !endStr) return 0
  const start = new Date(startStr)
  const end = new Date(endStr)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Approved': return 'px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200'
    case 'Pending': return 'px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
    case 'Rejected': return 'px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200'
    default: return 'px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'Approved': return 'Disetujui'
    case 'Pending': return 'Menunggu HRD'
    case 'Rejected': return 'Ditolak'
    default: return status
  }
}

const getAttachmentUrl = (path) => {
  if (!path) return '#'
  const baseUrl = import.meta.env.VITE_STORAGE_BASE_URL || 'http://localhost:8000/storage/'
  return path.startsWith('http') ? path : `${baseUrl}${path}`
}

onMounted(() => {
  fetchLeaveRequests()
})
</script>