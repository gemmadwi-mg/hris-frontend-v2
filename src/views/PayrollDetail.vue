<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-10">
    <div class="max-w-4xl mx-auto">
      
      <!-- NAVIGASI & AKSI HEADER (DIsembunyikan saat cetak) -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 print:hidden">
        <div class="flex items-center gap-4">
          <button @click="router.push('/payrolls')" class="p-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl shadow-sm transition" title="Kembali">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-3">
              Detail Slip Gaji
              <span v-if="payroll" :class="getStatusBadgeClass(payroll.status)" class="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border">
                {{ payroll.status }}
              </span>
              
              <!-- BADGE LUNAS & TERKUNCI -->
              <span v-if="payroll?.is_transferred" class="bg-indigo-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1 shadow-sm">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                DITRANSFER (TERKUNCI)
              </span>
            </h1>
          </div>
        </div>
        
        <!-- TOMBOL AKSI BERBASIS ROLE & STATUS (TIDAK MUNCUL JIKA SUDAH DITRANSFER) -->
        <div class="flex flex-wrap items-center gap-2" v-if="payroll">
          <div v-if="!payroll.is_transferred" class="flex flex-wrap gap-2">
            
            <!-- Submit (Draft -> Submitted) -->
            <button 
              v-if="payroll.status === 'Draft' && authStore.hasAnyRole(['System Administrator', 'HR Manager', 'HR Staff'])" 
              @click="updateStatus('Submitted')" 
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm text-sm transition"
            >
              Ajukan (Submit)
            </button>
            
            <!-- Process Submitted (Verified / Rejected) -->
            <template v-if="payroll.status === 'Submitted' && authStore.hasAnyRole(['System Administrator', 'HR Manager', 'Finance'])">
              <button @click="updateStatus('Rejected')" class="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 font-semibold rounded-lg text-sm transition">Tolak</button>
              <button @click="updateStatus('Verified')" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-sm text-sm transition">Verifikasi Data</button>
            </template>

            <!-- Process Verified (Approved / Rejected) -->
            <template v-if="payroll.status === 'Verified' && authStore.hasAnyRole(['System Administrator', 'HR Manager'])">
              <button @click="updateStatus('Rejected')" class="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 font-semibold rounded-lg text-sm transition">Tolak</button>
              <button @click="updateStatus('Approved')" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm text-sm transition">Setujui (Approve)</button>
            </template>

            <!-- Disburse (Cairkan Gaji & Kirim Email) -->
            <button 
              v-if="payroll.status === 'Approved' && authStore.hasAnyRole(['System Administrator', 'HR Manager', 'Finance'])" 
              @click="disbursePayroll" 
              class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 text-sm transition animate-pulse"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              Cairkan & Kirim Email
            </button>
          </div>

          <!-- DOWNLOAD PDF API -->
          <button @click="downloadPDF" :disabled="isDownloading" class="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg shadow-sm flex items-center gap-2 text-sm disabled:bg-gray-400 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            {{ isDownloading ? 'Memproses...' : 'Unduh PDF' }}
          </button>

          <!-- CETAK DIRECT BROWSER -->
          <button @click="printSlip" class="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm flex items-center gap-2 text-sm transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Cetak
          </button>
        </div>
      </div>

      <!-- LOADING STATE -->
      <div v-if="isLoading" class="text-center py-12 bg-white rounded-xl border border-gray-200">
        <span class="text-blue-600 font-medium animate-pulse">Memuat slip gaji...</span>
      </div>

      <!-- TEMPLATE KERTAS SLIP GAJI RESMI -->
      <div v-else-if="payroll" id="printable-slip" class="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-gray-200 print:border-none print:shadow-none print:p-0">
        
        <!-- KOP SURAT PERUSAHAAN -->
        <div class="border-b-2 border-gray-900 pb-6 mb-6 flex justify-between items-start">
          <div>
            <h2 class="text-2xl font-extrabold text-blue-900 tracking-tight">PT TEKNOLOGI NUSANTARA</h2>
            <p class="text-xs text-gray-500 mt-1">Gedung Cyber Tower Lt. 8, Jl. HR Rasuna Said, Jakarta Selatan</p>
            <p class="text-xs text-gray-500">Email: hrd@teknologinusantara.co.id | Telp: (021) 555-0192</p>
          </div>
          <div class="text-right">
            <span class="inline-block px-3 py-1 bg-gray-100 text-gray-800 font-mono text-xs font-bold rounded uppercase">
              SLIP GAJI
            </span>
            <p class="text-sm font-bold text-gray-900 mt-2">Periode: {{ getMonthName(payroll.period_month) }} {{ payroll.period_year }}</p>
            <p class="text-xs font-mono text-gray-400">ID: {{ payroll.payroll_id }}</p>
          </div>
        </div>

        <!-- INFORMASI KARYAWAN -->
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm print:bg-white print:border-gray-300">
          <div>
            <div class="flex py-0.5"><span class="w-32 text-gray-500 text-xs">ID Karyawan</span><span class="font-mono font-bold text-gray-900 text-xs">: {{ payroll.employee?.employee_id }}</span></div>
            <div class="flex py-0.5"><span class="w-32 text-gray-500 text-xs">Nama Karyawan</span><span class="font-bold text-gray-900 text-xs">: {{ payroll.employee?.full_name }}</span></div>
            <div class="flex py-0.5"><span class="w-32 text-gray-500 text-xs">Jabatan</span><span class="text-gray-800 text-xs">: {{ payroll.employee?.job_title || '-' }}</span></div>
          </div>
          <div>
            <div class="flex py-0.5"><span class="w-32 text-gray-500 text-xs">Departemen</span><span class="text-gray-800 text-xs">: {{ payroll.employee?.department || '-' }}</span></div>
            <div class="flex py-0.5"><span class="w-32 text-gray-500 text-xs">Email</span><span class="text-gray-800 text-xs">: {{ payroll.employee?.email || '-' }}</span></div>
            <div class="flex py-0.5"><span class="w-32 text-gray-500 text-xs">Status Transfer</span><span class="text-gray-800 text-xs font-bold">: {{ payroll.is_transferred ? 'Ditransfer' : 'Belum Ditransfer' }}</span></div>
          </div>
        </div>

        <!-- TABEL KANAN KIRI: PENDAPATAN VS POTONGAN -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          
          <!-- PENDAPATAN -->
          <div class="border border-gray-200 rounded-xl overflow-hidden">
            <div class="bg-emerald-50 border-b border-emerald-100 px-4 py-2.5 font-bold text-emerald-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <span class="w-4 h-4 bg-emerald-600 text-white rounded-full flex justify-center items-center text-xs">↑</span> Pendapatan (Earnings)
            </div>
            <div class="p-4 space-y-3 text-sm">
              <div class="flex justify-between"><span class="text-gray-600">Gaji Pokok:</span><span class="font-semibold text-gray-900 font-mono">{{ formatRupiah(payroll.basic_salary) }}</span></div>
              <div class="flex justify-between"><span class="text-gray-600">Tunjangan Jabatan:</span><span class="font-semibold text-green-600 font-mono">{{ formatRupiah(payroll.position_allowance) }}</span></div>
              <div class="flex justify-between"><span class="text-gray-600">Tunjangan Makan:</span><span class="font-semibold text-green-600 font-mono">{{ formatRupiah(payroll.meal_allowance) }}</span></div>
              <div class="flex justify-between"><span class="text-gray-600">Tunjangan Transport:</span><span class="font-semibold text-green-600 font-mono">{{ formatRupiah(payroll.transport_allowance) }}</span></div>
              
              <div class="pt-2 border-t border-gray-100">
                <div class="flex justify-between"><span class="text-gray-600">Upah Lembur:</span><span class="font-semibold text-green-600 font-mono">{{ formatRupiah(payroll.total_overtime) }}</span></div>
                <div v-if="payroll.calculation_details?.overtime_text" class="text-xs text-gray-400 italic mt-0.5">{{ payroll.calculation_details?.overtime_text }}</div>
              </div>

              <div class="flex justify-between pt-3 border-t border-gray-200 font-bold">
                <span class="text-gray-700">Total Pendapatan:</span>
                <span class="text-green-700 font-mono">{{ formatRupiah(payroll.gross_salary) }}</span>
              </div>
            </div>
          </div>

          <!-- POTONGAN -->
          <div class="border border-gray-200 rounded-xl overflow-hidden">
            <div class="bg-red-50 border-b border-red-100 px-4 py-2.5 font-bold text-red-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <span class="w-4 h-4 bg-red-600 text-white rounded-full flex justify-center items-center text-xs">−</span> Potongan (Deductions)
            </div>
            <div class="p-4 space-y-3 text-sm">
              <div>
                <div class="flex justify-between"><span class="text-gray-600">Potongan Alfa:</span><span class="font-semibold text-red-600 font-mono">-{{ formatRupiah(payroll.absence_deduction) }}</span></div>
                <div v-if="payroll.calculation_details?.absence_text" class="text-xs text-gray-400 italic mt-0.5">{{ payroll.calculation_details?.absence_text }}</div>
              </div>
              
              <div>
                <div class="flex justify-between"><span class="text-gray-600">Potongan Terlambat:</span><span class="font-semibold text-red-600 font-mono">-{{ formatRupiah(payroll.late_deduction) }}</span></div>
                <div v-if="payroll.calculation_details?.late_text" class="text-xs text-gray-400 italic mt-0.5">{{ payroll.calculation_details?.late_text }}</div>
              </div>
              
              <div>
                <div class="flex justify-between"><span class="text-gray-600">BPJS Kesehatan:</span><span class="font-semibold text-red-600 font-mono">-{{ formatRupiah(payroll.bpjs_health) }}</span></div>
                <div v-if="payroll.calculation_details?.bpjs_kes_text" class="text-xs text-gray-400 italic mt-0.5">{{ payroll.calculation_details?.bpjs_kes_text }}</div>
              </div>
              
              <div>
                <div class="flex justify-between"><span class="text-gray-600">BPJS JHT:</span><span class="font-semibold text-red-600 font-mono">-{{ formatRupiah(payroll.bpjs_jht) }}</span></div>
                <div v-if="payroll.calculation_details?.bpjs_jht_text" class="text-xs text-gray-400 italic mt-0.5">{{ payroll.calculation_details?.bpjs_jht_text }}</div>
              </div>
              
              <div>
                <div class="flex justify-between"><span class="text-gray-600">BPJS JP:</span><span class="font-semibold text-red-600 font-mono">-{{ formatRupiah(payroll.bpjs_jp) }}</span></div>
                <div v-if="payroll.calculation_details?.bpjs_jp_text" class="text-xs text-gray-400 italic mt-0.5">{{ payroll.calculation_details?.bpjs_jp_text }}</div>
              </div>
              
              <div>
                <div class="flex justify-between"><span class="text-gray-600">Pajak PPh 21:</span><span class="font-semibold text-red-600 font-mono">-{{ formatRupiah(payroll.pph21_deduction) }}</span></div>
                <div v-if="payroll.calculation_details?.tax_text" class="text-xs text-gray-400 italic mt-0.5 whitespace-pre-line">{{ payroll.calculation_details?.tax_text }}</div>
              </div>

              <div class="flex justify-between pt-3 border-t border-gray-200 font-bold">
                <span class="text-gray-700">Total Potongan:</span>
                <span class="text-red-700 font-mono">-{{ formatRupiah(payroll.total_deductions) }}</span>
              </div>
            </div>
          </div>

        </div>

        <!-- PENYESUAIAN MANUAL (JIKA ADA) -->
        <div v-if="payroll.adjustment !== 0" class="mb-4 p-4 border border-yellow-200 bg-yellow-50 rounded-xl flex justify-between items-center">
          <div>
            <span class="font-bold text-yellow-800 text-sm">Penyesuaian Manual (Adjustment)</span>
            <div class="text-xs text-yellow-700 mt-1">{{ payroll.adjustment_note || 'Tidak ada catatan' }}</div>
          </div>
          <span class="text-lg font-bold text-yellow-800 font-mono">{{ formatRupiah(payroll.adjustment) }}</span>
        </div>

        <!-- GAJI BERSIH (TAKE HOME PAY) -->
        <div class="p-5 bg-blue-50 border-2 border-blue-200 rounded-xl flex justify-between items-center mb-10 print:bg-white print:border-gray-900">
          <div>
            <span class="font-bold text-blue-900 uppercase tracking-wider text-xs block">Penerimaan Bersih (Take Home Pay)</span>
            <span class="text-xs text-blue-700">Total Pendapatan dikurangi Total Potongan + Penyesuaian</span>
          </div>
          <span class="text-2xl font-black text-blue-950 font-mono">{{ formatRupiah(payroll.net_salary) }}</span>
        </div>

        <!-- TANDA TANGAN RESMI -->
        <div class="grid grid-cols-2 gap-8 text-center text-xs text-gray-700 pt-6 border-t border-gray-200">
          <div>
            <p>Penerima,</p>
            <div class="h-16"></div>
            <p class="font-bold underline text-gray-900">{{ payroll.employee?.full_name }}</p>
            <p class="text-gray-400">Karyawan</p>
          </div>
          <div>
            <p>Jakarta, {{ formatDate(new Date()) }}</p>
            <p class="font-semibold text-gray-500 mb-12">Manager Keuangan / HRD</p>
            <p class="font-bold underline text-gray-900">PT Teknologi Nusantara</p>
            <p class="text-gray-400">Payroll Department</p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../lib/axios'
import Swal from 'sweetalert2'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const payroll = ref(null)
const isLoading = ref(true)
const isDownloading = ref(false)

const fetchDetail = async () => {
  isLoading.value = true
  try {
    const res = await api.get(`/payrolls/${route.params.id}`)
    payroll.value = res.data.data?.data || res.data.data || res.data
  } catch (error) {
    console.error('Gagal memuat slip gaji:', error)
    Swal.fire('Error', 'Data slip gaji tidak ditemukan', 'error')
    router.push('/payrolls')
  } finally {
    isLoading.value = false
  }
}

const disbursePayroll = async () => {
  const result = await Swal.fire({
    title: 'Cairkan Gaji Sekarang?',
    html: `Sistem akan mengunci slip gaji secara permanen dan mengirim email ke <b>${payroll.value.employee?.email}</b>.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#4f46e5',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Ya, Cairkan & Kirim!'
  });

  if (result.isConfirmed) {
    Swal.fire({ title: 'Memproses...', text: 'Mengirim perintah transfer dan email PDF', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await api.post(`/payrolls/${payroll.value.payroll_id}/disburse`);
      payroll.value.is_transferred = true;
      Swal.fire('Berhasil!', res.data.message, 'success');
    } catch (error) {
      Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan.', 'error');
    }
  }
}

const downloadPDF = async () => {
  isDownloading.value = true
  try {
    const response = await api.get(`/payrolls/${route.params.id}/export-pdf`, {
      responseType: 'blob' 
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    
    const empName = payroll.value.employee?.full_name ? payroll.value.employee.full_name.replace(/\s+/g, '_') : 'Karyawan'
    link.setAttribute('download', `Slip_Gaji_${empName}_${payroll.value.period_month}_${payroll.value.period_year}.pdf`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    Swal.fire('Error', 'Gagal mengunduh dokumen PDF', 'error')
  } finally {
    isDownloading.value = false
  }
}

const updateStatus = async (newStatus) => {
  let note = '';

  if (newStatus === 'Rejected') {
    const { value: text, isConfirmed } = await Swal.fire({
      title: 'Tolak Gaji Ini?',
      input: 'textarea',
      inputLabel: 'Masukkan alasan penolakan',
      inputPlaceholder: 'Contoh: Tunjangan makan kurang Rp 50.000...',
      showCancelButton: true,
      confirmButtonText: 'Tolak Gaji',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#d33'
    });

    if (!isConfirmed) return;
    note = text;
  } else {
    const result = await Swal.fire({
      title: 'Ubah Status?',
      text: `Status akan diubah menjadi ${newStatus}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Lanjutkan!'
    });
    
    if (!result.isConfirmed) return;
  }

  try {
    await api.patch(`/payrolls/${route.params.id}/status`, {
      status: newStatus,
      rejection_note: note
    });
    
    payroll.value.status = newStatus;
    if (note) payroll.value.rejection_note = note;
    
    Swal.fire('Berhasil!', `Status gaji telah menjadi ${newStatus}`, 'success');
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'Gagal memperbarui status', 'error');
  }
}

const printSlip = () => {
  window.print()
}

const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0)
const formatDate = (date) => date ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(date)) : '-'
const getMonthName = (monthNumber) => {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return months[monthNumber - 1] || '-'
}

const getStatusBadgeClass = (status) => {
  const maps = {
    'Draft': 'bg-gray-100 text-gray-600 border-gray-200',
    'Submitted': 'bg-blue-100 text-blue-700 border-blue-200',
    'Verified': 'bg-purple-100 text-purple-700 border-purple-200',
    'Approved': 'bg-green-100 text-green-700 border-green-200',
    'Rejected': 'bg-red-100 text-red-700 border-red-200'
  }
  return maps[status] || 'bg-gray-50 text-gray-700 border-gray-200'
}

onMounted(() => fetchDetail())
</script>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #printable-slip, #printable-slip * {
    visibility: visible;
  }
  #printable-slip {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>