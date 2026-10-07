<template>
  <div class="max-w-md mx-auto space-y-5">
    
    <!-- HEADER & TOMBOL KEMBALI -->
    <div class="flex items-center gap-3">
      <button 
        @click="router.push('/employee/overtimes')" 
        class="p-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition shadow-sm"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      </button>
      <div>
        <h1 class="text-xl font-bold text-gray-900">Pengajuan Lembur</h1>
        <p class="text-xs text-gray-500">Isi tanggal, durasi, dan rincian pekerjaan lembur.</p>
      </div>
    </div>

    <!-- FORM UTAMA -->
    <form @submit.prevent="submitOvertime" class="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
      
      <!-- 1. TANGGAL LEMBUR -->
      <div class="space-y-1.5">
        <label class="text-xs font-bold text-gray-700">Tanggal Lembur <span class="text-red-500">*</span></label>
        <input 
          type="date" 
          v-model="form.overtime_date" 
          :max="todayDate"
          required
          class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- 2. DURASI LEMBUR (JAM & MENIT) -->
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-gray-700">Durasi Jam <span class="text-red-500">*</span></label>
          <select 
            v-model="form.hours" 
            required
            class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="h in 12" :key="h" :value="h">{{ h }} Jam</option>
          </select>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-bold text-gray-700">Durasi Menit</label>
          <select 
            v-model="form.minutes" 
            class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="00">00 Menit</option>
            <option value="30">30 Menit</option>
          </select>
        </div>
      </div>

      <!-- ESTIMASI INSENTIF LEMBUR -->
      <div class="p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between text-xs">
        <div>
          <span class="font-bold text-emerald-800 block">Estimasi Insentif Lembur</span>
          <span class="text-[10px] text-emerald-600">Tarif standar Rp 25.000 / Jam</span>
        </div>
        <span class="font-black text-emerald-900 text-sm bg-white px-3 py-1 rounded-xl border border-emerald-100">
          {{ formatRupiah(estimatedIncentive) }}
        </span>
      </div>

      <!-- 3. DESKRIPSI PEKERJAAN -->
      <div class="space-y-1.5">
        <label class="text-xs font-bold text-gray-700">Rincian Pekerjaan Lembur <span class="text-red-500">*</span></label>
        <textarea 
          v-model="form.task_description" 
          rows="3" 
          required
          placeholder="Tuliskan tugas/pekerjaan yang diselesaikan selama jam lembur..."
          class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <!-- 4. UNGGAH LAMPIRAN / SPKL -->
      <div class="space-y-1.5">
        <label class="text-xs font-bold text-gray-700">
          Lampiran Dokumen <span class="text-gray-400 font-normal">(Opsional / SPKL / Foto)</span>
        </label>
        
        <div class="relative border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:bg-slate-50 transition">
          <input 
            type="file" 
            ref="fileInputRef" 
            @change="handleFileUpload" 
            accept=".pdf,.jpg,.jpeg,.png" 
            class="hidden" 
          />

          <div v-if="!selectedFile" @click="triggerFileInput" class="cursor-pointer space-y-1">
            <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-lg">
              📎
            </div>
            <p class="text-xs font-bold text-gray-700">Klik untuk unggah SPKL / Bukti Foto</p>
            <p class="text-[10px] text-gray-400">PDF, JPG, atau PNG (Maksimal 5MB)</p>
          </div>

          <div v-else class="flex items-center justify-between bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
            <div class="flex items-center gap-2 overflow-hidden text-left">
              <span class="text-lg">📄</span>
              <div class="truncate">
                <p class="text-xs font-bold text-gray-800 truncate">{{ selectedFile.name }}</p>
                <p class="text-[10px] text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
            </div>
            <button 
              type="button" 
              @click="removeFile" 
              class="p-1 text-red-500 hover:text-red-700 text-xs font-bold rounded-lg"
            >
              ✖
            </button>
          </div>
        </div>
      </div>

      <!-- TOMBOL SUBMIT -->
      <button 
        type="submit" 
        :disabled="isSubmitting"
        class="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 mt-2"
      >
        <span v-if="isSubmitting" class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
        {{ isSubmitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Lembur' }}
      </button>

    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../lib/axios'
import { useAuthStore } from '../../stores/auth'
import Swal from 'sweetalert2'

const router = useRouter()
const authStore = useAuthStore()

const fileInputRef = ref(null)
const selectedFile = ref(null)
const isSubmitting = ref(false)

const todayDate = new Date().toISOString().slice(0, 10)

const form = ref({
  overtime_date: todayDate,
  hours: 2,
  minutes: '00',
  task_description: ''
})

const estimatedIncentive = computed(() => {
  const totalHours = Number(form.value.hours) + (Number(form.value.minutes) / 60)
  return totalHours * 25000
})

const triggerFileInput = () => fileInputRef.value?.click()

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    Swal.fire('Ukuran Berkas Terlalu Besar', 'Maksimal ukuran berkas lampiran adalah 5MB.', 'warning')
    return
  }

  selectedFile.value = file
}

const removeFile = () => {
  selectedFile.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0)
}

const submitOvertime = async () => {
  isSubmitting.value = true

  const durationFormatted = `${String(form.value.hours).padStart(2, '0')}:${form.value.minutes}`
  const employeeId = authStore.user?.employee_id || authStore.user?.id

  const formData = new FormData()
  formData.append('employee_id', employeeId)
  formData.append('overtime_date', form.value.overtime_date)
  formData.append('duration', durationFormatted)
  formData.append('total_incentive', estimatedIncentive.value)
  formData.append('task_description', form.value.task_description)

  if (selectedFile.value) {
    formData.append('attachment', selectedFile.value)
  }

  try {
    await api.post('/overtimes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    Swal.fire({
      icon: 'success',
      title: 'Pengajuan Lembur Berhasil!',
      text: 'Permohonan lembur Anda telah dikirim untuk diproses HRD.',
      timer: 2000,
      showConfirmButton: false
    })

    router.push('/employee/overtimes')
  } catch (error) {
    console.error('Submit Overtime Error:', error)
    Swal.fire('Gagal Mengajukan Lembur', error.response?.data?.message || 'Terjadi kesalahan sistem.', 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>