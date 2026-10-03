<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-10">
    <div class="max-w-4xl mx-auto">
      
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <button @click="router.push('/payrolls')" class="p-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-3">
              Detail Slip Gaji
              <span v-if="payroll" :class="{
                'bg-gray-100 text-gray-600': payroll.status === 'Draft',
                'bg-blue-100 text-blue-700': payroll.status === 'Submitted',
                'bg-yellow-100 text-yellow-700': payroll.status === 'Verified',
                'bg-green-100 text-green-700': payroll.status === 'Approved',
                'bg-red-100 text-red-700': payroll.status === 'Rejected'
              }" class="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
                {{ payroll.status }}
              </span>
              
              <!-- BADGE LUNAS & TERKUNCI -->
              <span v-if="payroll?.is_transferred" class="bg-indigo-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                DITRANSFER (TERKUNCI)
              </span>
            </h1>
          </div>
        </div>
        
        <!-- HILANGKAN TOMBOL JIKA SUDAH DITRANSFER -->
        <div class="flex gap-2" v-if="payroll && !payroll.is_transferred">
          <button v-if="payroll.status === 'Draft'" @click="updateStatus('Submitted')" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm">Ajukan (Submit)</button>
          
          <template v-if="payroll.status === 'Submitted'">
            <button @click="updateStatus('Rejected')" class="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 font-semibold rounded-lg">Tolak</button>
            <button @click="updateStatus('Verified')" class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-sm">Verifikasi Data</button>
          </template>

          <template v-if="payroll.status === 'Verified'">
            <button @click="updateStatus('Rejected')" class="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 font-semibold rounded-lg">Tolak</button>
            <button @click="updateStatus('Approved')" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm">Setujui (Approve)</button>
          </template>

          <!-- TOMBOL CAIRKAN MUNCUL JIKA APPROVED -->
          <button v-if="payroll.status === 'Approved'" @click="disbursePayroll" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            Cairkan & Kirim Email
          </button>
        </div>

        <button v-if="payroll" @click="downloadPDF" :disabled="isDownloading" class="ml-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg shadow-sm flex items-center gap-2 disabled:bg-gray-400">
           {{ isDownloading ? 'Memproses...' : 'Cetak PDF' }}
        </button>
      </div>

      <div v-if="isLoading" class="text-center py-10">Memuat slip gaji...</div>

      <div v-else-if="payroll" class="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        
        <!-- HEADER -->
        <div class="border-b border-gray-100 pb-6 mb-6">
          <p class="text-sm text-gray-500 font-mono">{{ payroll.employee?.employee_id }}</p>
          <h2 class="text-xl font-bold text-gray-900 mt-1">{{ payroll.employee?.full_name }}</h2>
          <div class="flex gap-2 mt-2">
            <span class="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">{{ payroll.employee?.job_title }}</span>
            <span class="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full">{{ payroll.employee?.department || '-' }}</span>
          </div>
        </div>

        <div class="space-y-8">
          
          <!-- PENDAPATAN -->
          <div>
            <h3 class="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <span class="w-5 h-5 bg-gray-900 text-white rounded-full flex justify-center items-center text-xs">↑</span> Pendapatan
            </h3>
            <div class="space-y-3">
              <div class="flex justify-between text-sm"><span class="text-gray-600">Gaji Pokok:</span><span class="font-semibold text-gray-900">{{ formatRupiah(payroll.basic_salary) }}</span></div>
              <div class="flex justify-between text-sm"><span class="text-gray-600">Tunjangan Jabatan:</span><span class="font-semibold text-green-600">{{ formatRupiah(payroll.position_allowance) }}</span></div>
              <div class="flex justify-between text-sm"><span class="text-gray-600">Tunjangan Makan:</span><span class="font-semibold text-green-600">{{ formatRupiah(payroll.meal_allowance) }}</span></div>
              <div class="flex justify-between text-sm"><span class="text-gray-600">Tunjangan Transport:</span><span class="font-semibold text-green-600">{{ formatRupiah(payroll.transport_allowance) }}</span></div>
              
              <div class="pt-2">
                <div class="flex justify-between text-sm"><span class="text-gray-600">Upah Lembur:</span><span class="font-semibold text-green-600">{{ formatRupiah(payroll.total_overtime) }}</span></div>
                <div class="text-xs text-gray-400 italic mt-0.5">{{ payroll.calculation_details?.overtime_text }}</div>
              </div>
            </div>
            <div class="flex justify-between mt-4 pt-4 border-t border-gray-100 font-bold text-sm">
              <span class="text-gray-600">Total Pendapatan:</span><span class="text-green-600">{{ formatRupiah(payroll.gross_salary) }}</span>
            </div>
          </div>

          <!-- POTONGAN -->
          <div>
            <h3 class="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <span class="w-5 h-5 bg-gray-900 text-white rounded-full flex justify-center items-center text-xs">−</span> Potongan
            </h3>
            <div class="space-y-3">
              <div class="pt-1">
                <div class="flex justify-between text-sm"><span class="text-gray-600">Potongan Alfa:</span><span class="font-semibold text-red-600">{{ formatRupiah(payroll.absence_deduction) }}</span></div>
                <div class="text-xs text-gray-400 italic mt-0.5">{{ payroll.calculation_details?.absence_text }}</div>
              </div>
              <div class="pt-1">
                <div class="flex justify-between text-sm"><span class="text-gray-600">Potongan Terlambat:</span><span class="font-semibold text-red-600">{{ formatRupiah(payroll.late_deduction) }}</span></div>
                <div class="text-xs text-gray-400 italic mt-0.5">{{ payroll.calculation_details?.late_text }}</div>
              </div>
              <div class="pt-1">
                <div class="flex justify-between text-sm"><span class="text-gray-600">BPJS Kesehatan:</span><span class="font-semibold text-red-600">{{ formatRupiah(payroll.bpjs_health) }}</span></div>
                <div class="text-xs text-gray-400 italic mt-0.5">{{ payroll.calculation_details?.bpjs_kes_text }}</div>
              </div>
              <div class="pt-1">
                <div class="flex justify-between text-sm"><span class="text-gray-600">BPJS JHT:</span><span class="font-semibold text-red-600">{{ formatRupiah(payroll.bpjs_jht) }}</span></div>
                <div class="text-xs text-gray-400 italic mt-0.5">{{ payroll.calculation_details?.bpjs_jht_text }}</div>
              </div>
              <div class="pt-1">
                <div class="flex justify-between text-sm"><span class="text-gray-600">BPJS JP:</span><span class="font-semibold text-red-600">{{ formatRupiah(payroll.bpjs_jp) }}</span></div>
                <div class="text-xs text-gray-400 italic mt-0.5">{{ payroll.calculation_details?.bpjs_jp_text }}</div>
              </div>
              <div class="pt-1">
                <div class="flex justify-between text-sm"><span class="text-gray-600">Pajak PPh21:</span><span class="font-semibold text-red-600">Rp. {{ formatRupiah(payroll.pph21_deduction) }}</span></div>
                <div class="text-xs text-gray-400 italic mt-0.5 whitespace-pre-line">{{ payroll.calculation_details?.tax_text }}</div>
              </div>
            </div>
            <div class="flex justify-between mt-4 pt-4 border-t border-gray-100 font-bold text-sm">
              <span class="text-gray-600">Total Potongan:</span><span class="text-red-600">Rp. {{ formatRupiah(payroll.total_deductions) }}</span>
            </div>
          </div>
          
        </div>

        <!-- GAJI BERSIH & PENYESUAIAN -->
        <div v-if="payroll.adjustment !== 0" class="mt-4 p-4 border border-yellow-200 bg-yellow-50 rounded-lg flex justify-between items-center">
          <div>
            <span class="font-bold text-yellow-800 text-sm">Penyesuaian Manual</span>
            <div class="text-xs text-yellow-700 mt-1">{{ payroll.adjustment_note || 'Tidak ada catatan' }}</div>
          </div>
          <span class="text-lg font-bold text-yellow-800">Rp. {{ formatRupiah(payroll.adjustment) }}</span>
        </div>

        <div class="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-lg flex justify-between items-center">
          <span class="font-bold text-gray-900 uppercase tracking-widest text-sm">Gaji Bersih:</span>
          <span class="text-2xl font-black text-teal-600">Rp. {{ formatRupiah(payroll.net_salary) }}</span>
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

const route = useRoute()
const router = useRouter()
const payroll = ref(null)
const isLoading = ref(true)
const isDownloading = ref(false)

const fetchDetail = async () => {
  try {
    const res = await api.get(`/payrolls/${route.params.id}`)
    payroll.value = res.data.data
  } catch (error) {
    Swal.fire('Error', 'Data slip gaji tidak ditemukan', 'error')
    router.push('/payrolls')
  } finally {
    isLoading.value = false
  }
}

const disbursePayroll = async () => {
  const result = await Swal.fire({
    title: 'Cairkan Gaji Sekarang?',
    html: `Sistem akan mengunci slip gaji secara permanen dan mengirim email ke <b>${payroll.value.employee.email}</b>.`,
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
      payroll.value.is_transferred = true; // Langsung update UI menjadi terkunci
      Swal.fire('Berhasil!', res.data.message, 'success');
    } catch (error) {
      Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan.', 'error');
    }
  }
}

const downloadPDF = async () => {
  isDownloading.value = true
  try {
    // PENTING: responseType wajib 'blob' agar axios tahu ini adalah file biner
    const response = await api.get(`/payrolls/${route.params.id}/export-pdf`, {
      responseType: 'blob' 
    })
    
    // Membuat URL sementara dari data Blob
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    
    // Atur nama file saat disave
    link.setAttribute('download', `Slip_Gaji_${payroll.value.employee.full_name}_${payroll.value.period_month}_${payroll.value.period_year}.pdf`)
    document.body.appendChild(link)
    
    // Eksekusi klik otomatis untuk memicu download browser
    link.click()
    
    // Bersihkan URL sementara
    document.body.removeChild(link)
  } catch (error) {
    Swal.fire('Error', 'Gagal mengunduh dokumen PDF', 'error')
  } finally {
    isDownloading.value = false
  }
}

const updateStatus = async (newStatus) => {
  let note = '';

  // Jika menolak, minta alasan penolakan via popup
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
    // Jika selain reject, cukup konfirmasi biasa
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
    const res = await api.patch(`/payrolls/${route.params.id}/status`, {
      status: newStatus,
      rejection_note: note
    });
    
    // Perbarui data di layar langsung tanpa harus refresh browser
    payroll.value.status = newStatus;
    payroll.value.rejection_note = note;
    
    Swal.fire('Berhasil!', `Status gaji telah menjadi ${newStatus}`, 'success');
  } catch (error) {
    Swal.fire('Error', 'Gagal memperbarui status', 'error');
  }
}

const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(angka || 0)

onMounted(() => fetchDetail())
</script>