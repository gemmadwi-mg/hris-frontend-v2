<template>
  <div class="max-w-4xl mx-auto space-y-6">
    
    <!-- HEADER & TOMBOL KEMBALI -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200 shadow-sm print:hidden">
      <div class="flex items-center gap-3">
        <button 
          @click="router.push('/employee/dashboard')" 
          class="p-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100 transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </button>
        <div>
          <h1 class="text-xl font-bold text-gray-900">Portal Slip Gaji</h1>
          <p class="text-xs text-gray-500">Riwayat penerimaan gaji & rincian tunjangan/potongan.</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <select 
          v-model="selectedYear" 
          @change="fetchPayrolls(1)"
          class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option v-for="year in yearOptions" :key="year" :value="year">Tahun {{ year }}</option>
        </select>
      </div>
    </div>

    <!-- STATISTIK RINGKASAN GAJI -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 print:hidden">
      <div class="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-3xl shadow-sm space-y-1">
        <p class="text-[10px] font-bold uppercase tracking-wider text-blue-100">Gaji Bersih Terakhir</p>
        <p class="text-2xl font-black">{{ formatRupiah(latestPayroll?.net_salary || 0) }}</p>
        <p class="text-[11px] text-blue-200 pt-1 font-medium">Periode: {{ latestPayroll ? formatPeriod(latestPayroll.period_month, latestPayroll.period_year) : '-' }}</p>
      </div>

      <div class="bg-white border border-gray-200 p-5 rounded-3xl shadow-sm space-y-1">
        <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Diterima ({{ selectedYear }})</p>
        <p class="text-2xl font-black text-gray-900">{{ formatRupiah(totalYearlySalary) }}</p>
        <p class="text-[11px] text-emerald-600 font-bold pt-1">Terbayar {{ paidCount }} Slip Gaji</p>
      </div>

      <div class="bg-white border border-gray-200 p-5 rounded-3xl shadow-sm space-y-1">
        <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Rata-Rata Gaji / Bulan</p>
        <p class="text-2xl font-black text-gray-900">{{ formatRupiah(averageSalary) }}</p>
        <p class="text-[11px] text-gray-500 font-medium pt-1">Berdasarkan data tahun {{ selectedYear }}</p>
      </div>
    </div>

    <!-- LOADING STATE -->
    <div v-if="isLoading" class="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3 print:hidden">
      <div class="animate-spin border-4 border-blue-600 border-t-transparent rounded-full w-8 h-8 mx-auto"></div>
      <p class="text-xs font-semibold text-gray-500">Memuat riwayat slip gaji...</p>
    </div>

    <!-- EMPTY STATE -->
    <div v-else-if="payrolls.length === 0" class="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3 print:hidden">
      <div class="text-4xl">💵</div>
      <h3 class="text-sm font-bold text-gray-800">Belum Ada Slip Gaji</h3>
      <p class="text-xs text-gray-400">Belum ada catatan slip gaji untuk periode tahun {{ selectedYear }}.</p>
    </div>

    <!-- DAFTAR SLIP GAJI -->
    <div v-else class="space-y-4 print:hidden">
      
      <!-- DESKTOP TABLE VIEW -->
      <div class="hidden md:block bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <th class="p-4">Periode</th>
              <th class="p-4">Gaji Pokok</th>
              <th class="p-4">Tunjangan</th>
              <th class="p-4">Potongan</th>
              <th class="p-4">Gaji Bersih (THP)</th>
              <th class="p-4">Status</th>
              <th class="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-xs">
            <tr v-for="item in payrolls" :key="item.payroll_id" class="hover:bg-slate-50/80 transition">
              <td class="p-4 font-bold text-gray-900">
                {{ formatPeriod(item.period_month, item.period_year) }}
                <span class="block text-[10px] text-gray-400 font-mono font-normal">#{{ item.payroll_id }}</span>
              </td>
              <td class="p-4 font-medium text-gray-700">{{ formatRupiah(item.basic_salary) }}</td>
              <td class="p-4 font-semibold text-emerald-600">+ {{ formatRupiah(calculateTotalAllowances(item)) }}</td>
              <td class="p-4 font-semibold text-rose-600">- {{ formatRupiah(calculateTotalDeductions(item)) }}</td>
              <td class="p-4 font-black text-gray-900">{{ formatRupiah(item.net_salary) }}</td>
              <td class="p-4">
                <span :class="getStatusBadgeClass(item.payment_status || (item.is_transferred ? 'Paid' : 'Pending'))">
                  {{ getStatusLabel(item.payment_status || (item.is_transferred ? 'Paid' : 'Pending')) }}
                </span>
              </td>
              <td class="p-4 text-center">
                <button 
                  @click="openDetailModal(item)"
                  class="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] rounded-xl border border-blue-100 transition"
                >
                  📄 Lihat Slip
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MOBILE CARD VIEW -->
      <div class="md:hidden space-y-3">
        <div 
          v-for="item in payrolls" 
          :key="item.payroll_id"
          class="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3"
        >
          <div class="flex justify-between items-start pb-2 border-b border-gray-100">
            <div>
              <span class="text-xs font-bold text-gray-900 block">{{ formatPeriod(item.period_month, item.period_year) }}</span>
              <span class="text-[10px] text-gray-400 font-mono">#{{ item.payroll_id }}</span>
            </div>
            <span :class="getStatusBadgeClass(item.payment_status || (item.is_transferred ? 'Paid' : 'Pending'))">
              {{ getStatusLabel(item.payment_status || (item.is_transferred ? 'Paid' : 'Pending')) }}
            </span>
          </div>

          <div class="space-y-1 text-xs">
            <div class="flex justify-between text-gray-600">
              <span>Gaji Pokok:</span>
              <span class="font-medium text-gray-800">{{ formatRupiah(item.basic_salary) }}</span>
            </div>
            <div class="flex justify-between text-emerald-600">
              <span>Tunjangan:</span>
              <span class="font-medium">+ {{ formatRupiah(calculateTotalAllowances(item)) }}</span>
            </div>
            <div class="flex justify-between text-rose-600">
              <span>Potongan:</span>
              <span class="font-medium">- {{ formatRupiah(calculateTotalDeductions(item)) }}</span>
            </div>
            <div class="flex justify-between pt-2 border-t border-gray-100 font-bold text-gray-900">
              <span>Take Home Pay:</span>
              <span class="text-blue-600 text-sm">{{ formatRupiah(item.net_salary) }}</span>
            </div>
          </div>

          <div class="pt-2 border-t border-gray-100">
            <button 
              @click="openDetailModal(item)"
              class="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              📄 Detail & Cetak Slip Gaji
            </button>
          </div>
        </div>
      </div>

      <!-- PAGINASI -->
      <div v-if="pagination.last_page > 1" class="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200">
        <button 
          @click="fetchPayrolls(pagination.current_page - 1)" 
          :disabled="pagination.current_page === 1"
          class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-xs font-bold rounded-xl transition"
        >
          ← Sebelumnya
        </button>
        <span class="text-xs text-gray-500 font-semibold">
          Halaman {{ pagination.current_page }} dari {{ pagination.last_page }}
        </span>
        <button 
          @click="fetchPayrolls(pagination.current_page + 1)" 
          :disabled="pagination.current_page === pagination.last_page"
          class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-xs font-bold rounded-xl transition"
        >
          Selanjutnya →
        </button>
      </div>

    </div>

    <!-- MODAL DETAIL SLIP GAJI (PRINTABLE) -->
    <div v-if="isModalOpen && selectedPayroll" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm printable-area">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 animate-fade-in border border-gray-100 max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none">
        
        <!-- HEADER SLIP -->
        <div class="flex justify-between items-start pb-3 border-b border-gray-200">
          <div>
            <h2 class="text-base font-black text-gray-900 uppercase tracking-wide">SLIP GAJI KARYAWAN</h2>
            <p class="text-xs text-gray-500 font-semibold">Periode {{ formatPeriod(selectedPayroll.period_month, selectedPayroll.period_year) }}</p>
          </div>
          <button @click="isModalOpen = false" class="p-1 rounded-full text-gray-400 hover:text-gray-600 text-sm print:hidden">
            ✖
          </button>
        </div>

        <!-- INFO KARYAWAN -->
        <div class="bg-gray-50 p-3.5 rounded-2xl grid grid-cols-2 gap-2 text-xs border border-gray-100">
          <div>
            <span class="text-gray-400 text-[10px] uppercase font-bold block">ID Karyawan</span>
            <span class="font-bold text-gray-800">{{ selectedPayroll.employee_id }}</span>
          </div>
          <div>
            <span class="text-gray-400 text-[10px] uppercase font-bold block">Tanggal Pembayaran</span>
            <span class="font-semibold text-gray-800">{{ formatDate(selectedPayroll.payment_date || selectedPayroll.updated_at || selectedPayroll.created_at) }}</span>
          </div>
          <div>
            <span class="text-gray-400 text-[10px] uppercase font-bold block">Nama Karyawan</span>
            <span class="font-bold text-gray-800">{{ selectedPayroll.employee?.full_name || authStore.user?.name || '-' }}</span>
          </div>
          <div>
            <span class="text-gray-400 text-[10px] uppercase font-bold block">Metode Pembayaran</span>
            <span class="font-semibold text-gray-800">{{ selectedPayroll.payment_method || 'Transfer Bank' }}</span>
          </div>
        </div>

        <!-- RINCIAN GAJI POKOK, TUNJANGAN & POTONGAN -->
        <div class="space-y-3 text-xs">
          
          <!-- PENERIMAAN -->
          <div>
            <h4 class="font-bold text-gray-800 border-b pb-1 mb-2 text-[11px] uppercase text-emerald-700">I. Rincian Penerimaan</h4>
            <div class="space-y-1.5 pl-1">
              <div class="flex justify-between text-gray-600">
                <span>Gaji Pokok</span>
                <span class="font-medium text-gray-800">{{ formatRupiah(selectedPayroll.basic_salary) }}</span>
              </div>
              
              <!-- Dynamic Allowance List -->
              <div v-for="(allowance, idx) in getAllowancesList(selectedPayroll)" :key="idx" class="flex justify-between text-gray-600">
                <span>{{ allowance.title }}</span>
                <span class="font-medium text-gray-800">+ {{ formatRupiah(allowance.amount) }}</span>
              </div>
            </div>
            
            <div class="flex justify-between font-bold text-emerald-800 pt-1.5 mt-1 border-t border-dashed">
              <span>Total Penerimaan:</span>
              <span>{{ formatRupiah(Number(selectedPayroll.basic_salary || 0) + calculateTotalAllowances(selectedPayroll)) }}</span>
            </div>
          </div>

          <!-- POTONGAN -->
          <div>
            <h4 class="font-bold text-gray-800 border-b pb-1 mb-2 text-[11px] uppercase text-rose-700">II. Rincian Potongan</h4>
            <div class="space-y-1.5 pl-1">
              
              <!-- Dynamic Deduction List -->
              <div v-for="(deduction, idx) in getDeductionsList(selectedPayroll)" :key="idx" class="flex justify-between text-gray-600">
                <span>{{ deduction.title }}</span>
                <span class="font-medium text-rose-600">- {{ formatRupiah(deduction.amount) }}</span>
              </div>

              <div v-if="getDeductionsList(selectedPayroll).length === 0" class="text-gray-400 italic text-[11px]">
                Tidak ada potongan pada periode ini.
              </div>
            </div>

            <div class="flex justify-between font-bold text-rose-800 pt-1.5 mt-1 border-t border-dashed">
              <span>Total Potongan:</span>
              <span>- {{ formatRupiah(calculateTotalDeductions(selectedPayroll)) }}</span>
            </div>
          </div>

          <!-- GAJI BERSIH / THP -->
          <div class="bg-blue-50/80 p-4 rounded-2xl border border-blue-100 flex justify-between items-center">
            <div>
              <span class="text-[10px] font-bold text-blue-600 uppercase block">GAJI BERSIH (TAKE HOME PAY)</span>
              <span class="text-xs text-blue-800 font-medium">Transfer langsung ke rekening karyawan</span>
            </div>
            <span class="text-lg font-black text-blue-900">{{ formatRupiah(selectedPayroll.net_salary) }}</span>
          </div>

        </div>

        <!-- TOMBOL AKSI -->
        <div class="flex gap-2 pt-2 print:hidden">
          <button 
            @click="downloadPdf(selectedPayroll)"
            :disabled="isDownloading"
            class="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span v-if="isDownloading">⏳ Mengunduh...</span>
            <span v-else>📥 Unduh Slip PDF</span>
          </button>
          <button 
            @click="printSlip"
            class="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl transition flex items-center gap-1.5"
          >
            🖨️ Cetak
          </button>
          <button 
            @click="isModalOpen = false" 
            class="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl transition"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../lib/axios' // Instance axios dengan Authorization Header
import { useAuthStore } from '../../stores/auth' // Pastikan path Pinia Auth Store disesuaikan

const router = useRouter()
const authStore = useAuthStore()

// State Data
const payrolls = ref([])
const isLoading = ref(false)
const isDownloading = ref(false)
const selectedYear = ref(new Date().getFullYear())
const yearOptions = [2024, 2025, 2026]

const isModalOpen = ref(false)
const selectedPayroll = ref(null)

const pagination = ref({
  current_page: 1,
  last_page: 1
})

// Fetch Data Slip Gaji dari Backend
const fetchPayrolls = async (page = 1) => {
  isLoading.value = true
  try {
    const response = await api.get('/payrolls', {
      params: {
        year: selectedYear.value,
        page: page
      }
    })

    if (response.data?.success) {
      const resData = response.data.data
      payrolls.value = resData.data || []
      pagination.value = {
        current_page: resData.current_page || 1,
        last_page: resData.last_page || 1
      }
    }
  } catch (error) {
    console.error('Gagal mengambil data slip gaji:', error)
  } finally {
    isLoading.value = false
  }
}

// Perhitungan Ringkasan Statistik
const latestPayroll = computed(() => payrolls.value[0] || null)

const paidPayrolls = computed(() => {
  return payrolls.value.filter(item => item.is_transferred || item.payment_status === 'Paid' || item.status === 'Approved')
})

const paidCount = computed(() => paidPayrolls.value.length)

const totalYearlySalary = computed(() => {
  return paidPayrolls.value.reduce((acc, curr) => acc + Number(curr.net_salary || 0), 0)
})

const averageSalary = computed(() => {
  return paidCount.value > 0 ? totalYearlySalary.value / paidCount.value : 0
})

// Helper Kalkulasi Rincian
const calculateTotalAllowances = (item) => {
  if (!item) return 0
  return (Number(item.position_allowance) || 0) +
         (Number(item.meal_allowance) || 0) +
         (Number(item.transport_allowance) || 0) +
         (Number(item.total_overtime) || 0)
}

const calculateTotalDeductions = (item) => {
  if (!item) return 0
  if (item.total_deductions) return Number(item.total_deductions)
  return (Number(item.absence_deduction) || 0) +
         (Number(item.late_deduction) || 0) +
         (Number(item.bpjs_health) || 0) +
         (Number(item.bpjs_jht) || 0) +
         (Number(item.bpjs_jp) || 0) +
         (Number(item.pph21_deduction) || 0)
}

// Helper Rincian Tunjangan untuk v-for Modal Detail
const getAllowancesList = (item) => {
  if (!item) return []
  const list = []
  if (Number(item.position_allowance) > 0) list.push({ title: 'Tunjangan Jabatan', amount: Number(item.position_allowance) })
  if (Number(item.meal_allowance) > 0) list.push({ title: 'Tunjangan Makan', amount: Number(item.meal_allowance) })
  if (Number(item.transport_allowance) > 0) list.push({ title: 'Tunjangan Transport', amount: Number(item.transport_allowance) })
  if (Number(item.total_overtime) > 0) list.push({ title: 'Uang Lembur', amount: Number(item.total_overtime) })
  return list
}

// Helper Rincian Potongan untuk v-for Modal Detail
const getDeductionsList = (item) => {
  if (!item) return []
  const list = []
  if (Number(item.absence_deduction) > 0) list.push({ title: 'Potongan Absensi', amount: Number(item.absence_deduction) })
  if (Number(item.late_deduction) > 0) list.push({ title: 'Potongan Keterlambatan', amount: Number(item.late_deduction) })
  if (Number(item.bpjs_health) > 0) list.push({ title: 'BPJS Kesehatan', amount: Number(item.bpjs_health) })
  if (Number(item.bpjs_jht) > 0) list.push({ title: 'BPJS Ketenagakerjaan (JHT)', amount: Number(item.bpjs_jht) })
  if (Number(item.bpjs_jp) > 0) list.push({ title: 'BPJS Jaminan Pensiun (JP)', amount: Number(item.bpjs_jp) })
  if (Number(item.pph21_deduction) > 0) list.push({ title: 'PPh 21', amount: Number(item.pph21_deduction) })
  return list
}

// Helper Format Tampilan
const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0)
}

const formatPeriod = (month, year) => {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${months[month - 1] || month} ${year}`
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

const getStatusBadgeClass = (status) => {
  if (status === 'Paid' || status === 'Approved') return 'px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200'
  return 'px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200'
}

const getStatusLabel = (status) => {
  if (status === 'Paid' || status === 'Approved') return 'Terbayar'
  return 'Diproses'
}

// Modal Actions
const openDetailModal = (item) => {
  selectedPayroll.value = item
  isModalOpen.value = true
}

const printSlip = () => {
  window.print()
}

const downloadPdf = async (item) => {
  if (!item) return
  isDownloading.value = true
  try {
    const response = await api.get(`/payrolls/${item.payroll_id}/export-pdf`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Slip_Gaji_${item.period_month}_${item.period_year}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Gagal mengunduh file PDF:', error)
  } finally {
    isDownloading.value = false
  }
}

onMounted(() => {
  fetchPayrolls(1)
})
</script>

<style scoped>
/* CSS Khusus untuk Fitur Cetak Browser */
@media print {
  body * {
    visibility: hidden;
  }
  .printable-area, .printable-area * {
    visibility: visible;
  }
  .printable-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    background: white !important;
  }
}
</style>