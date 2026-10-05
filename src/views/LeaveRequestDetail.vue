<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-10">
    <div class="max-w-4xl mx-auto">

      <!-- HEADER & TOMBOL KEMBALI -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <button @click="router.push('/leave-requests')" class="p-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl transition shadow-sm" title="Kembali">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Detail Pengajuan Cuti</h1>
            <p class="text-sm text-gray-500 font-mono">ID: {{ route.params.id }}</p>
          </div>
        </div>

        <!-- BADGE STATUS -->
        <div v-if="leave">
          <span :class="['px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-sm', getStatusColor(leave.status)]">
            {{ leave.status }}
          </span>
        </div>
      </div>

      <!-- LOADING STATE -->
      <div v-if="isLoading" class="flex justify-center py-20">
        <span class="text-blue-600 font-medium animate-pulse">Memuat data cuti...</span>
      </div>

      <div v-else-if="leave" class="space-y-6">

        <!-- CARD 1: INFORMASI PEMOHON & DETAIL CUTI -->
        <div class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
          <div class="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold shrink-0 border-2 border-blue-200 shadow-sm">
              {{ getInitials(leave.employee?.full_name) }}
            </div>
            <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Pemohon</p>
              <h2 class="text-xl font-bold text-gray-900">{{ leave.employee?.full_name || 'Tidak Diketahui' }}</h2>
              <p class="text-sm text-gray-500">{{ leave.employee?.job_title || '-' }} • <span class="font-semibold text-gray-700">{{ leave.employee?.employee_id }}</span></p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p class="text-xs text-gray-400 font-semibold mb-1">Tipe Cuti</p>
              <p class="font-bold text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-sm">{{ leave.leave_type }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 font-semibold mb-1">Periode Tanggal</p>
              <p class="font-semibold text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-sm">
                {{ formatDate(leave.start_date) }} <span class="text-gray-400 font-normal mx-1">s/d</span> {{ formatDate(leave.end_date) }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-400 font-semibold mb-1">Total Durasi</p>
              <p class="font-bold text-blue-700 bg-blue-50 p-2.5 rounded-lg border border-blue-100 text-sm">
                {{ calculateDays(leave.start_date, leave.end_date) }} Hari Kerja
              </p>
            </div>

            <div class="md:col-span-3">
              <p class="text-xs text-gray-400 font-semibold mb-1">Alasan / Keterangan</p>
              <p class="text-sm text-gray-800 bg-gray-50 p-3.5 rounded-lg border border-gray-200 leading-relaxed whitespace-pre-line">
                {{ leave.reason || 'Tidak ada keterangan khusus.' }}
              </p>
            </div>

            <!-- DOKUMEN PENDUKUNG -->
            <div v-if="leave.attachment" class="md:col-span-3 pt-4 border-t border-gray-100">
              <p class="text-xs text-gray-400 font-semibold mb-2">Dokumen Pendukung / Surat Keterangan</p>
              <a :href="`http://localhost:8000/storage/${leave.attachment}`" target="_blank" class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition text-sm font-semibold border border-blue-200 shadow-sm w-max">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                </svg>
                Lihat / Unduh Berkas Lampiran
              </a>
            </div>
          </div>
        </div>

        <!-- CARD 2: HASIL KEPUTUSAN (JIKA SUDAH DIPROSES) -->
        <div v-if="leave.status !== 'Pending'" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Informasi Keputusan</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-400 mb-1">Diproses Oleh</p>
              <p class="font-bold text-gray-900 text-sm">{{ leave.approver?.full_name || 'Sistem / Administrator' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 mb-1">Tanggal Diproses</p>
              <p class="font-bold text-gray-900 text-sm">{{ formatDateTime(leave.processed_at || leave.updated_at) }}</p>
            </div>
            <div v-if="leave.status === 'Rejected'" class="md:col-span-2 mt-2">
              <p class="text-xs text-red-500 mb-1 font-bold">Alasan Penolakan</p>
              <p class="text-sm text-red-800 bg-red-50 p-3 rounded-lg border border-red-200 leading-relaxed">{{ leave.rejection_reason }}</p>
            </div>
          </div>
        </div>

        <!-- CARD 3: TOMBOL AKSI APPROVAL (HANYA MUNCUL JIKA PENDING & ROLE ADMIN/HR MANAGER) -->
        <div v-if="canApprove" class="bg-white p-6 rounded-2xl shadow-md border-2 border-indigo-100 flex flex-col md:flex-row gap-4">
          <button @click="processLeave('Approved')" class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-sm flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            Terima Cuti
          </button>
          <button @click="processLeave('Rejected')" class="flex-1 py-3 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl font-bold transition flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            Tolak Cuti
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../lib/axios'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const leave = ref(null)
const isLoading = ref(true)

// KONTROL AKSES ROLE: Hanya System Administrator & HR Manager yang bisa Approve/Reject
const canApprove = computed(() => {
  return leave.value?.status === 'Pending' && 
         authStore.hasAnyRole(['System Administrator', 'HR Manager'])
})

const fetchDetail = async () => {
  isLoading.value = true
  try {
    const res = await api.get(`/leave-requests/${route.params.id}`)
    leave.value = res.data.data?.data || res.data.data || res.data
  } catch (error) {
    console.error('Gagal memuat detail cuti:', error)
    Swal.fire('Error', 'Data pengajuan cuti tidak ditemukan', 'error')
    router.push('/leave-requests')
  } finally {
    isLoading.value = false
  }
}

const processLeave = async (status) => {
  let rejectionReason = null

  if (status === 'Rejected') {
    const { value: text, isDismissed } = await Swal.fire({
      title: 'Tolak Pengajuan Cuti',
      input: 'textarea',
      inputLabel: 'Berikan alasan penolakan (wajib)',
      inputPlaceholder: 'Misal: Kuota cuti tahunan sudah habis...',
      showCancelButton: true,
      confirmButtonText: 'Tolak Cuti',
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Batal',
      inputValidator: (value) => {
        if (!value) { return 'Alasan penolakan tidak boleh kosong!' }
      }
    })

    if (isDismissed) return;
    rejectionReason = text
  } else {
    const confirm = await Swal.fire({
      title: 'Setujui Pengajuan Cuti?', 
      text: 'Pengajuan cuti karyawan ini akan disetujui.', 
      icon: 'question',
      showCancelButton: true, 
      confirmButtonColor: '#059669', 
      confirmButtonText: 'Ya, Setujui',
      cancelButtonText: 'Batal'
    })
    if (!confirm.isConfirmed) return;
  }

  const now = new Date()
  const processedAt = now.toISOString().slice(0, 19).replace('T', ' ')

  try {
    const leaveId = leave.value.leave_request_id || route.params.id
    await api.put(`/leave-requests/${leaveId}`, {
      status: status,
      approver_id: authStore.user?.employee_id,
      processed_at: processedAt,
      rejection_reason: rejectionReason
    })

    Swal.fire({ icon: 'success', title: 'Berhasil Diproses!', showConfirmButton: false, timer: 1500 })
    fetchDetail()
  } catch (error) {
    Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan sistem saat memproses.', 'error')
  }
}

// Helpers
const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?'
const formatDate = (date) => date ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date)) : '-'
const formatDateTime = (date) => date ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date)) : '-'

const calculateDays = (start, end) => {
  if (!start || !end) return 0
  return Math.ceil(Math.abs(new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1
}

const getStatusColor = (status) => {
  const colors = { 'Pending': 'bg-yellow-500', 'Approved': 'bg-emerald-600', 'Rejected': 'bg-red-600' }
  return colors[status] || 'bg-gray-600'
}

onMounted(() => fetchDetail())
</script>