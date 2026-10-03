<template>
  <div class="p-6 md:p-8">
    <div class="max-w-7xl mx-auto">
      
      <!-- HEADER -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Manajemen Penggajian (Payroll)</h1>
          <p class="text-sm text-gray-500 mt-1">Kelola slip gaji, perhitungan komponen, dan status persetujuan.</p>
        </div>
        
        <!-- BAGIAN TOMBOL (Tambahan Tombol Massal) -->
        <div class="flex flex-wrap gap-3">
          <!-- Tombol Generate Massal Baru -->
          <button @click="generateMassal" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition shadow-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            Generate Massal
          </button>

          <!-- Tombol Proses Gaji Lama -->
          <router-link to="/payrolls/create" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Proses Satuan
          </router-link>
        </div>
      </div>

      <!-- FILTER & SEARCH -->
      <div class="bg-white p-4 rounded-t-2xl border border-gray-200 border-b-0 flex flex-wrap gap-4 items-center justify-between">
        <input v-model="searchQuery" @keyup.enter="fetchPayrolls(1)" type="text" placeholder="Cari ID atau Karyawan..." class="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
        
        <div class="flex gap-2 w-full md:w-auto">
          <select v-model="filterMonth" @change="fetchPayrolls(1)" class="px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none bg-white">
            <option value="">Semua Bulan</option>
            <option v-for="m in 12" :key="m" :value="m">{{ getMonthName(m) }}</option>
          </select>
          <select v-model="filterYear" @change="fetchPayrolls(1)" class="px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none bg-white">
            <option value="">Semua Tahun</option>
            <option v-for="y in [2025, 2026, 2027]" :key="y" :value="y">{{ y }}</option>
          </select>
          <select v-model="filterStatus" @change="fetchPayrolls(1)" class="px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none bg-white">
            <option value="">Semua Status</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Diajukan</option>
            <option value="Verified">Terverifikasi</option>
            <option value="Approved">Disetujui</option>
            <option value="Rejected">Ditolak</option>
          </select>
        </div>
      </div>

      <!-- TABLE -->
      <div class="bg-white border border-gray-200 rounded-b-2xl shadow-sm overflow-hidden">
        <div v-if="isLoading" class="p-10 flex justify-center items-center">
          <span class="text-blue-600 font-medium animate-pulse">Memuat data penggajian...</span>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Periode</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Karyawan</th>
                <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Gross Salary</th>
                <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Deductions</th>
                <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Take Home Pay</th>
                <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="payroll in payrolls" :key="payroll.payroll_id" class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-bold text-gray-900">{{ getMonthName(payroll.period_month) }} {{ payroll.period_year }}</div>
                  <div class="text-xs text-gray-500">{{ payroll.payroll_id }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-bold text-gray-900">{{ payroll.employee?.full_name || 'Tidak Diketahui' }}</div>
                  <div class="text-xs text-gray-500">{{ payroll.employee?.employee_id }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right font-mono text-sm text-gray-700">
                  {{ formatRupiah(payroll.gross_salary) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right font-mono text-sm text-red-600">
                  -{{ formatRupiah(payroll.total_deductions) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right font-mono text-sm font-extrabold text-green-700">
                  {{ formatRupiah(payroll.net_salary) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span :class="['px-3 py-1 inline-flex text-xs font-semibold rounded-full border', getStatusClass(payroll.status)]">
                    {{ payroll.status }}
                  </span>
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <div class="flex justify-center items-center gap-2">
                    <router-link :to="`/payrolls/${payroll.payroll_id}`" title="Detail / Slip Gaji" class="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </router-link>
                    
                    <router-link v-if="payroll.status === 'Draft' || payroll.status === 'Rejected'" :to="`/payrolls/${payroll.payroll_id}/edit`" title="Edit Penggajian" class="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                    </router-link>

                    <button @click="handleDelete(payroll.payroll_id)" title="Hapus Data" class="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
              
              <tr v-if="payrolls.length === 0 && !isLoading">
                <td colspan="7" class="px-6 py-10 text-center text-gray-500">Tidak ada data penggajian ditemukan.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../lib/axios'
import Swal from 'sweetalert2'

const payrolls = ref([])
const isLoading = ref(true)
const searchQuery = ref('')
const filterMonth = ref('')
const filterYear = ref(new Date().getFullYear())
const filterStatus = ref('')

const fetchPayrolls = async (page = 1) => {
  isLoading.value = true
  try {
    const res = await api.get('/payrolls', {
      params: { page, search: searchQuery.value, month: filterMonth.value, year: filterYear.value, status: filterStatus.value }
    })
    payrolls.value = res.data.data.data || res.data.data // Sesuaikan dengan response format Anda
  } catch (error) {
    console.error('Gagal memuat data penggajian', error)
  } finally {
    isLoading.value = false
  }
}

// === TAMBAHAN FUNGSI GENERATE MASSAL ===
const generateMassal = async () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { value: formValues } = await Swal.fire({
    title: 'Generate Gaji Massal',
    html: `
      <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
        <select id="swal-month" class="swal2-input" style="width: 80%; margin: 0 auto;">
          <option value="1" ${currentMonth === 1 ? 'selected' : ''}>Januari</option>
          <option value="2" ${currentMonth === 2 ? 'selected' : ''}>Februari</option>
          <option value="3" ${currentMonth === 3 ? 'selected' : ''}>Maret</option>
          <option value="4" ${currentMonth === 4 ? 'selected' : ''}>April</option>
          <option value="5" ${currentMonth === 5 ? 'selected' : ''}>Mei</option>
          <option value="6" ${currentMonth === 6 ? 'selected' : ''}>Juni</option>
          <option value="7" ${currentMonth === 7 ? 'selected' : ''}>Juli</option>
          <option value="8" ${currentMonth === 8 ? 'selected' : ''}>Agustus</option>
          <option value="9" ${currentMonth === 9 ? 'selected' : ''}>September</option>
          <option value="10" ${currentMonth === 10 ? 'selected' : ''}>Oktober</option>
          <option value="11" ${currentMonth === 11 ? 'selected' : ''}>November</option>
          <option value="12" ${currentMonth === 12 ? 'selected' : ''}>Desember</option>
        </select>
        <input id="swal-year" type="number" class="swal2-input" value="${currentYear}" style="width: 80%; margin: 0 auto;">
      </div>
      <p style="font-size: 13px; color: #666; margin-top: 15px;">Sistem otomatis menghitung absensi, lembur, dan pajak seluruh Karyawan Aktif.</p>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: '⚡ Mulai Proses',
    confirmButtonColor: '#4f46e5',
    cancelButtonText: 'Batal',
    preConfirm: () => {
      return {
        period_month: document.getElementById('swal-month').value,
        period_year: document.getElementById('swal-year').value
      }
    }
  });

  if (formValues) {
    Swal.fire({ 
      title: 'Memproses Gaji...', 
      text: 'Mohon tunggu, jangan tutup halaman ini.', 
      allowOutsideClick: false, 
      didOpen: () => Swal.showLoading() 
    });
    
    try {
      const res = await api.post('/payrolls/generate', formValues);
      Swal.fire('Berhasil!', res.data.message, 'success');
      
      // Auto-set filter ke bulan & tahun yang baru saja digenerate
      filterMonth.value = formValues.period_month;
      filterYear.value = formValues.period_year;
      filterStatus.value = 'Draft'; 
      
      fetchPayrolls(); 
    } catch (error) {
      Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan server.', 'error');
    }
  }
}
// =======================================

const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus Data Penggajian?', text: 'Hanya lakukan ini jika ada kesalahan fatal. Data akan dihapus permanen.', icon: 'warning',
    showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Ya, Hapus'
  })
  if (result.isConfirmed) {
    try {
      await api.delete(`/payrolls/${id}`)
      fetchPayrolls()
      Swal.fire({ icon: 'success', title: 'Terhapus!', showConfirmButton: false, timer: 1500 })
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Terjadi kesalahan sistem.' })
    }
  }
}

// Formatters
const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka)
const getMonthName = (monthNumber) => {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return months[monthNumber - 1] || '-'
}
const getStatusClass = (status) => {
  const maps = {
    'Draft': 'bg-gray-100 text-gray-800 border-gray-200',
    'Submitted': 'bg-blue-50 text-blue-700 border-blue-200',
    'Verified': 'bg-purple-50 text-purple-700 border-purple-200',
    'Approved': 'bg-green-50 text-green-700 border-green-200',
    'Rejected': 'bg-red-50 text-red-700 border-red-200'
  }
  return maps[status] || 'bg-gray-50 text-gray-700'
}

onMounted(() => fetchPayrolls())
</script>