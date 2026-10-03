<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-10">
    <div class="max-w-4xl mx-auto">
      
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <button @click="router.push('/permit-requests')" class="p-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl transition shadow-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Detail Pengajuan Izin</h1>
            <p class="text-sm text-gray-500">ID: {{ route.params.id }}</p>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-center py-20"><span class="text-blue-600 font-medium animate-pulse">Memuat data...</span></div>

      <div v-else-if="permit" class="space-y-6">
        
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div :class="['absolute top-0 right-0 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-sm', getStatusColor(permit.status)]">
            {{ permit.status }}
          </div>

          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold shrink-0 border-4 border-white shadow-sm">
              {{ getInitials(permit.employee?.full_name) }}
            </div>
            <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Pemohon</p>
              <h2 class="text-xl font-bold text-gray-900">{{ permit.employee?.full_name || 'Tidak Diketahui' }}</h2>
              <p class="text-sm text-gray-500">{{ permit.employee?.job_title || '-' }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
            <div>
              <p class="text-xs text-gray-500 mb-1">Tipe Izin</p>
              <p class="font-semibold text-gray-900">{{ permit.permit_type }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">Durasi</p>
              <p class="font-semibold text-gray-900">{{ formatDate(permit.start_date) }} <span class="text-gray-400 font-normal mx-1">s/d</span> {{ formatDate(permit.end_date) }}</p>
            </div>
            <div class="md:col-span-2 mt-2">
              <p class="text-xs text-gray-500 mb-1">Keterangan / Alasan</p>
              <p class="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100">{{ permit.description }}</p>
            </div>

            <!-- Tombol Dokumen -->
            <div v-if="permit.attachment" class="md:col-span-2 mt-4 pt-4 border-t border-gray-50">
              <p class="text-xs text-gray-500 mb-2">Dokumen Pendukung</p>
              <a :href="`http://localhost:8000/storage/${permit.attachment}`" target="_blank" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-semibold border border-blue-200 w-max">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                Lihat Lampiran File
              </a>
            </div>
          </div>
        </div>

        <div v-if="permit.status !== 'Pending'" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 class="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-100 pb-2">Informasi Keputusan</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-500 mb-1">Diproses Oleh</p>
              <p class="font-semibold text-gray-900">{{ permit.approver?.full_name || 'Sistem' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">Tanggal Diproses</p>
              <p class="font-semibold text-gray-900">{{ formatDateTime(permit.processed_at) }}</p>
            </div>
            <div v-if="permit.status === 'Rejected'" class="md:col-span-2 mt-2">
              <p class="text-xs text-red-500 mb-1 font-bold">Alasan Penolakan</p>
              <p class="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-100">{{ permit.rejection_reason }}</p>
            </div>
          </div>
        </div>

        <div v-if="permit.status === 'Pending'" class="flex gap-4 pt-4">
          <button @click="processPermit('Approved')" class="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition shadow-md shadow-green-200">
            Setujui Izin
          </button>
          <button @click="processPermit('Rejected')" class="flex-1 py-3 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl font-bold transition">
            Tolak Izin
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth' 
import api from '../lib/axios'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const permit = ref(null)
const isLoading = ref(true)

const fetchDetail = async () => {
  try {
    const res = await api.get(`/permit-requests/${route.params.id}`)
    permit.value = res.data.data
  } catch (error) {
    Swal.fire('Error', 'Data tidak ditemukan', 'error')
    router.push('/permit-requests')
  } finally {
    isLoading.value = false
  }
}

const processPermit = async (status) => {
  let rejectionReason = null

  if (status === 'Rejected') {
    const { value: text, isDismissed } = await Swal.fire({
      title: 'Tolak Pengajuan',
      input: 'textarea',
      inputLabel: 'Berikan alasan penolakan',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      inputValidator: (value) => {
        if (!value) { return 'Alasan penolakan wajib diisi!' }
      }
    })
    if (isDismissed) return; 
    rejectionReason = text
  } else {
    const confirm = await Swal.fire({
      title: 'Setujui Pengajuan?', text: 'Izin akan disetujui.', icon: 'question',
      showCancelButton: true, confirmButtonColor: '#16a34a', confirmButtonText: 'Ya, Setujui'
    })
    if (!confirm.isConfirmed) return;
  }

  const now = new Date()
  const processedAt = now.toISOString().slice(0, 19).replace('T', ' ')

  try {
    await api.put(`/permit-requests/${permit.value.permit_request_id}`, {
      status: status,
      approver_id: authStore.user?.employee_id,
      processed_at: processedAt,
      rejection_reason: rejectionReason
    })
    Swal.fire({ icon: 'success', title: 'Berhasil Diproses!', showConfirmButton: false, timer: 1500 })
    fetchDetail()
  } catch (error) {
    Swal.fire('Gagal', 'Terjadi kesalahan sistem saat memproses.', 'error')
  }
}

const getInitials = (name) => name ? name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : '?'
const formatDate = (date) => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date))
const formatDateTime = (date) => date ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' }).format(new Date(date)) : '-'
const getStatusColor = (status) => {
  const colors = { 'Pending': 'bg-yellow-500', 'Approved': 'bg-green-600', 'Rejected': 'bg-red-600' }
  return colors[status] || 'bg-gray-600'
}

onMounted(() => fetchDetail())
</script>