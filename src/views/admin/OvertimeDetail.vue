<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-10">
    <div class="max-w-4xl mx-auto">
      
      <!-- HEADER -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <button @click="router.push('/overtimes')" class="p-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl transition shadow-sm" title="Kembali">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Detail Pengajuan Lembur</h1>
            <p class="text-sm text-gray-500 font-mono">ID: {{ route.params.id }}</p>
          </div>
        </div>

        <!-- STATUS BADGE -->
        <div v-if="overtime">
          <span :class="['px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-sm', getStatusColor(overtime.status)]">
            {{ overtime.status }}
          </span>
        </div>
      </div>

      <!-- LOADING STATE -->
      <div v-if="isLoading" class="flex justify-center py-20">
        <span class="text-blue-600 font-medium animate-pulse">Memuat data lembur...</span>
      </div>

      <!-- KONTEN UTAMA -->
      <div v-else-if="overtime" class="space-y-6">
        
        <!-- INFORMASI PENGAJUAN -->
        <div class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
          <div class="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold shrink-0 border-2 border-blue-200 shadow-sm">
              {{ getInitials(overtime.employee?.full_name) }}
            </div>
            <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Pemohon</p>
              <h2 class="text-xl font-bold text-gray-900">{{ overtime.employee?.full_name || 'Tidak Diketahui' }}</h2>
              <p class="text-sm text-gray-500">{{ overtime.employee?.job_title || '-' }} • <span class="font-semibold text-gray-700">{{ overtime.employee?.employee_id }}</span></p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p class="text-xs text-gray-400 font-semibold mb-1">Tanggal Lembur</p>
              <p class="font-bold text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-sm">{{ formatDate(overtime.overtime_date) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 font-semibold mb-1">Durasi Lembur</p>
              <p class="font-bold text-blue-700 bg-blue-50 p-2.5 rounded-lg border border-blue-100 text-sm">⏱ {{ overtime.duration }} Jam</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 font-semibold mb-1">ID Absensi Harian</p>
              <p class="font-mono text-sm text-gray-900 font-bold bg-gray-50 p-2.5 rounded-lg border border-gray-200">{{ overtime.attendance_id || '-' }}</p>
            </div>
            
            <div class="md:col-span-3">
              <p class="text-xs text-gray-400 font-semibold mb-1">Deskripsi Pekerjaan / Tugas</p>
              <p class="text-sm text-gray-800 bg-gray-50 p-3.5 rounded-lg border border-gray-200 leading-relaxed whitespace-pre-line">
                {{ overtime.task_description || overtime.reason || 'Tidak ada deskripsi pekerjaan yang dilampirkan.' }}
              </p>
            </div>

            <!-- DOKUMEN SURAT PERINTAH LEMBUR -->
            <div v-if="overtime.attachment" class="md:col-span-3 pt-4 border-t border-gray-100">
              <p class="text-xs text-gray-400 font-semibold mb-2">Dokumen Pendukung / Surat Perintah Lembur</p>
              <a :href="`http://localhost:8000/storage/${overtime.attachment}`" target="_blank" class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition text-sm font-semibold border border-blue-200 shadow-sm w-max">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                Lihat Surat Perintah Lembur
              </a>
            </div>
          </div>
        </div>

        <!-- INFORMASI KEPUTUSAN & INSENTIF -->
        <div v-if="overtime.status !== 'Pending'" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Informasi Keputusan</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-400 mb-1">Diproses Oleh</p>
              <p class="font-bold text-gray-900 text-sm">{{ overtime.approver?.full_name || 'Sistem / Administrator' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 mb-1">Tanggal Diproses</p>
              <p class="font-bold text-gray-900 text-sm">{{ formatDateTime(overtime.processed_at || overtime.updated_at) }}</p>
            </div>
            
            <div v-if="overtime.status === 'Approved'" class="md:col-span-2 mt-2 bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <p class="text-sm font-bold text-emerald-900">Insentif Lembur Diberikan</p>
                <p class="text-xs text-emerald-700">Nominal ini akan otomatis dihitung ke dalam slip gaji bulan ini.</p>
              </div>
              <p class="text-xl font-black text-emerald-700 font-mono">{{ formatRupiah(overtime.total_incentive) }}</p>
            </div>

            <div v-if="overtime.status === 'Rejected'" class="md:col-span-2 mt-2">
              <p class="text-xs text-red-500 mb-1 font-bold">Alasan Penolakan</p>
              <p class="text-sm text-red-800 bg-red-50 p-3 rounded-lg border border-red-200 leading-relaxed">{{ overtime.rejection_reason }}</p>
            </div>
          </div>
        </div>

        <!-- TOMBOL AKSI PENDING (HANYA UNTUK ROLE ADMIN & HR MANAGER) -->
        <div v-if="canApprove" class="bg-white p-6 rounded-2xl shadow-md border-2 border-indigo-100 flex flex-col md:flex-row gap-4">
          <button @click="processOvertime('Approved')" class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-sm flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            Setujui & Beri Insentif
          </button>
          <button @click="processOvertime('Rejected')" class="flex-1 py-3 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl font-bold transition flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            Tolak Lembur
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth' 
import api from '../../lib/axios'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const overtime = ref(null)
const isLoading = ref(true)

// KONTROL AKSES ROLE: Hanya System Administrator & HR Manager yang bisa Approve/Reject
const canApprove = computed(() => {
  return overtime.value?.status === 'Pending' && 
         authStore.hasAnyRole(['System Administrator', 'HR Manager'])
})

const fetchDetail = async () => {
  isLoading.value = true
  try {
    const res = await api.get(`/overtimes/${route.params.id}`)
    overtime.value = res.data.data?.data || res.data.data || res.data
  } catch (error) {
    console.error('Gagal memuat detail lembur:', error)
    Swal.fire('Error', 'Data lembur tidak ditemukan', 'error')
    router.push('/overtimes')
  } finally {
    isLoading.value = false
  }
}

const processOvertime = async (status) => {
  let payload = {
    status: status,
    approver_id: authStore.user?.employee_id,
    processed_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
  }

  if (status === 'Rejected') {
    const { value: text, isDismissed } = await Swal.fire({
      title: 'Tolak Lembur',
      input: 'textarea',
      inputLabel: 'Alasan penolakan',
      inputPlaceholder: 'Tuliskan alasan penolakan di sini...',
      showCancelButton: true,
      confirmButtonText: 'Tolak Lembur',
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Batal',
      inputValidator: (value) => { if (!value) return 'Alasan penolakan wajib diisi!' }
    })
    if (isDismissed) return; 
    payload.rejection_reason = text
  } 
  
  if (status === 'Approved') {
    const { value: nominal, isDismissed } = await Swal.fire({
      title: 'Setujui Lembur',
      input: 'number',
      inputLabel: 'Masukkan Nominal Insentif (Rupiah)',
      inputPlaceholder: 'Misal: 150000',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      confirmButtonText: 'Setujui & Simpan',
      cancelButtonText: 'Batal',
      inputValidator: (value) => { if (!value || value <= 0) return 'Nominal insentif wajib diisi!' }
    })
    if (isDismissed) return;
    payload.total_incentive = nominal
  }

  try {
    await api.put(`/overtimes/${overtime.value.overtime_id}`, payload)
    Swal.fire({ icon: 'success', title: 'Berhasil Diproses!', showConfirmButton: false, timer: 1500 })
    fetchDetail()
  } catch (error) {
    Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan sistem saat memproses.', 'error')
  }
}

const getInitials = (name) => name ? name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : '?'
const formatDate = (date) => date ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date)) : '-'
const formatDateTime = (date) => date ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' }).format(new Date(date)) : '-'
const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0)

const getStatusColor = (status) => {
  const colors = { 'Pending': 'bg-yellow-500', 'Approved': 'bg-emerald-600', 'Rejected': 'bg-red-600' }
  return colors[status] || 'bg-gray-600'
}

onMounted(() => fetchDetail())
</script>