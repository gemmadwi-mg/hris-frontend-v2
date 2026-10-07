<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-10">
    <div class="max-w-5xl mx-auto">
      
      <!-- HEADER & TOMBOL AKSI -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        
        <div class="flex items-center gap-4">
          <button @click="router.push('/employees')" class="p-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl transition shadow-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Profil Karyawan</h1>
            <p class="text-sm text-gray-500">Detail informasi dan histori kepegawaian</p>
          </div>
        </div>

        <!-- Tombol Edit & Hapus (Muncul jika data sudah dimuat) -->
        <div v-if="employee && !isLoading" class="flex items-center gap-3">
          <router-link :to="`/employees/${employee.employee_id}/edit`" class="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium flex items-center gap-2 transition shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
            Edit
          </router-link>
          
          <button @click="handleDelete" class="px-4 py-2 bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium flex items-center gap-2 transition shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
            Hapus
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
        <svg class="animate-spin h-10 w-10 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p class="text-gray-500 font-medium">Memuat data karyawan...</p>
      </div>

      <div v-else-if="employee" class="space-y-6">
        
        <!-- KARTU HEADER (Identitas Utama) -->
        <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
          <div class="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-sm">
            {{ employee.employee_id }}
          </div>
          <!-- Avatar Dummy -->
          <div class="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold shrink-0 border-4 border-white shadow-md">
            {{ getInitials(employee.full_name) }}
          </div>
          <div class="text-center md:text-left flex-1">
            <h2 class="text-2xl font-bold text-gray-900">{{ employee.full_name }}</h2>
            <p class="text-blue-600 font-medium text-lg mt-1">{{ employee.job_title }}</p>
            <div class="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
              <span class="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                {{ employee.employment_status }}
              </span>
              <span class="px-3 py-1 bg-gray-50 text-gray-700 text-xs font-semibold rounded-full border border-gray-200 flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                {{ getCompanyName(employee.company_id) }}
              </span>
            </div>
          </div>
        </div>

        <!-- GRID KONTEN DETAIL -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Personal Data -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 class="text-sm font-bold text-gray-400 uppercase mb-4 border-b border-gray-100 pb-2">Informasi Pribadi</h3>
            <dl class="space-y-3.5 text-sm">
              <div class="flex justify-between"><dt class="text-gray-500">NIK (KTP)</dt><dd class="font-semibold text-gray-900">{{ employee.nik || '-' }}</dd></div>
              <div class="flex justify-between"><dt class="text-gray-500">Tanggal Lahir</dt><dd class="font-semibold text-gray-900">{{ formatDate(employee.date_of_birth) }}</dd></div>
              <div class="flex justify-between"><dt class="text-gray-500">Jenis Kelamin</dt><dd class="font-semibold text-gray-900">{{ employee.gender === 'Male' ? 'Laki-laki' : 'Perempuan' }}</dd></div>
              <div class="flex justify-between"><dt class="text-gray-500">Nomor HP</dt><dd class="font-semibold text-gray-900">{{ employee.phone_number || '-' }}</dd></div>
              <div class="flex justify-between"><dt class="text-gray-500">Email Login</dt><dd class="font-semibold text-gray-900">{{ employee.email || '-' }}</dd></div>
              <div class="pt-2"><dt class="text-gray-500 mb-1">Alamat Lengkap</dt><dd class="font-medium text-gray-900 leading-relaxed">{{ employee.address || '-' }}</dd></div>
            </dl>
          </div>

          <!-- Job Data -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 class="text-sm font-bold text-gray-400 uppercase mb-4 border-b border-gray-100 pb-2">Informasi Pekerjaan</h3>
            <dl class="space-y-3.5 text-sm">
              <div class="flex justify-between"><dt class="text-gray-500">Tanggal Bergabung</dt><dd class="font-semibold text-gray-900">{{ formatDate(employee.join_date) }}</dd></div>
              <div class="flex justify-between"><dt class="text-gray-500">Masa Kerja</dt><dd class="font-semibold text-blue-600">{{ calculateTenure(employee.join_date) }}</dd></div>
              <div class="flex justify-between"><dt class="text-gray-500">Kuota Cuti Tahunan</dt><dd class="font-semibold text-gray-900">{{ employee.annual_leave_quota }} Hari</dd></div>
              <div class="flex justify-between"><dt class="text-gray-500">Role Sistem</dt><dd class="font-semibold text-gray-900">{{ getRoleName(employee.role_id) }}</dd></div>
              <div class="flex justify-between"><dt class="text-gray-500">Cabang Penempatan</dt><dd class="font-semibold text-gray-900">{{ getBranchName(employee.branch_id) }}</dd></div>
            </dl>
          </div>

          <!-- Financial Data (Full Width) -->
          <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 class="text-sm font-bold text-gray-400 uppercase mb-4 border-b border-gray-100 pb-2">Gaji, Rekening & Pajak</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Gaji -->
              <dl class="space-y-3.5 text-sm">
                <div class="flex justify-between"><dt class="text-gray-500">Gaji Pokok</dt><dd class="font-semibold text-gray-900">{{ formatRupiah(employee.basic_salary) }}</dd></div>
                <div class="flex justify-between"><dt class="text-gray-500">Tunjangan Jabatan</dt><dd class="font-medium text-gray-600">{{ formatRupiah(employee.position_allowance) }}</dd></div>
                <div class="flex justify-between"><dt class="text-gray-500">Tunjangan Makan</dt><dd class="font-medium text-gray-600">{{ formatRupiah(employee.meal_allowance) }}</dd></div>
                <div class="flex justify-between"><dt class="text-gray-500">Tunjangan Transport</dt><dd class="font-medium text-gray-600">{{ formatRupiah(employee.transport_allowance) }}</dd></div>
                <div class="flex justify-between pt-3 border-t border-gray-100">
                  <dt class="text-gray-900 font-bold">Total Gaji Kotor</dt>
                  <dd class="font-bold text-green-600 text-base">{{ formatRupiah(totalGross) }}</dd>
                </div>
              </dl>
              <!-- Rekening & Pajak -->
              <dl class="space-y-3.5 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div class="flex justify-between"><dt class="text-gray-500">Bank</dt><dd class="font-bold text-gray-900">{{ employee.bank_name || '-' }}</dd></div>
                <div class="flex justify-between"><dt class="text-gray-500">No. Rekening</dt><dd class="font-mono font-semibold text-gray-900">{{ employee.account_number || '-' }}</dd></div>
                <div class="flex justify-between"><dt class="text-gray-500">Atas Nama</dt><dd class="font-semibold text-gray-900">{{ employee.account_holder_name || '-' }}</dd></div>
                <div class="flex justify-between pt-3 border-t border-gray-200"><dt class="text-gray-500">Golongan PTKP</dt><dd class="font-semibold text-blue-700">{{ getPtkpName(employee.ptkp_group_id) }}</dd></div>
                <div class="flex justify-between"><dt class="text-gray-500">No. BPJS Kesehatan</dt><dd class="font-mono font-semibold text-gray-900">{{ employee.bpjs_health_number || '-' }}</dd></div>
              </dl>
            </div>
          </div>
          
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../lib/axios'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const isLoading = ref(true)
const employee = ref(null)
const options = ref({ roles: [], companies: [], branches: [], ptkp_groups: [] })

const totalGross = computed(() => {
  if (!employee.value) return 0
  return Number(employee.value.basic_salary || 0) + 
         Number(employee.value.position_allowance || 0) + 
         Number(employee.value.meal_allowance || 0) + 
         Number(employee.value.transport_allowance || 0)
})

const fetchData = async () => {
  try {
    const resOptions = await api.get('/references/employee-options')
    options.value = resOptions.data.data

    const resEmp = await api.get(`/employees/${route.params.id}`)
    employee.value = resEmp.data.data || resEmp.data
  } catch (error) {
    console.error('Gagal memuat data', error)
  } finally {
    isLoading.value = false
  }
}

// Fungsi Hapus Karyawan langsung dari halaman Detail
const handleDelete = async () => {
  const result = await Swal.fire({
    title: 'Apakah Anda yakin?',
    text: `Data karyawan ${employee.value.full_name} akan dihapus permanen!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#9ca3af',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await api.delete(`/employees/${employee.value.employee_id}`)
      
      await Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: `Data ${employee.value.full_name} berhasil dihapus.`,
        showConfirmButton: false,
        timer: 1500
      })
      
      // Kembali ke halaman daftar karyawan setelah berhasil dihapus
      router.push('/employees')
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menghapus',
        text: 'Terjadi kesalahan saat menghapus data di server.',
        confirmButtonColor: '#ef4444'
      })
    }
  }
}

// Helpers
const getRoleName = (id) => options.value.roles.find(r => r.role_id === id)?.role_name || '-'
const getCompanyName = (id) => options.value.companies.find(c => c.company_id === id)?.company_name || '-'
const getBranchName = (id) => {
  if (!id) return 'Pusat (Tanpa Cabang)'
  return options.value.branches.find(b => b.branch_id === id)?.branch_name || '-'
}
const getPtkpName = (id) => options.value.ptkp_groups.find(p => p.ptkp_group_id === id)?.ptkp_group_name || '-'

const formatRupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value || 0)
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateString))
}
const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}
const calculateTenure = (joinDate) => {
  if (!joinDate) return '-'
  const start = new Date(joinDate)
  const now = new Date()
  const diffTime = Math.abs(now - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const years = Math.floor(diffDays / 365)
  const months = Math.floor((diffDays % 365) / 30)
  if (years > 0) return `${years} Tahun, ${months} Bulan`
  return `${months} Bulan`
}

onMounted(() => {
  fetchData()
})
</script>