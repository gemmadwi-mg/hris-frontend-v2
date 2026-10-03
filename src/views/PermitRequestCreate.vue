<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-10">
    <div class="max-w-3xl mx-auto">
      
      <!-- HEADER -->
      <div class="flex items-center gap-4 mb-8">
        <button @click="router.push('/permit-requests')" class="p-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl transition shadow-sm">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Form Pengajuan Izin</h1>
          <p class="text-sm text-gray-500">Buat permohonan izin sakit, kedukaan, atau keperluan pribadi.</p>
        </div>
      </div>

      <!-- FORM AREA -->
      <form @submit.prevent="submitForm" class="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">{{ errorMessage }}</div>

        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Karyawan Pemohon *</label>
            <select v-model="form.employee_id" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none">
              <option value="" disabled>-- Pilih Karyawan --</option>
              <option v-for="emp in employees" :key="emp.employee_id" :value="emp.employee_id">
                {{ emp.full_name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipe Izin *</label>
            <select v-model="form.permit_type" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none">
              <option value="Sick">Sakit (Sick)</option>
              <option value="Condolence">Kedukaan (Condolence)</option>
              <option value="Marriage">Pernikahan (Marriage)</option>
              <option value="Personal">Keperluan Pribadi Darurat (Personal)</option>
            </select>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai *</label>
              <input v-model="form.start_date" type="date" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai *</label>
              <input v-model="form.end_date" type="date" :min="form.start_date" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Keterangan / Alasan *</label>
            <textarea v-model="form.description" rows="3" required placeholder="Jelaskan alasan izin secara rinci..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Lampiran Dokumen (Opsional)</label>
            <input type="file" @change="handleFileChange" accept=".jpg,.jpeg,.png,.pdf" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
            <p class="text-xs text-gray-500 mt-1">Format: PDF, JPG, PNG. (Sangat disarankan melampirkan Surat Dokter jika sakit)</p>
          </div>
        </div>

        <div class="mt-8 pt-6 border-t border-gray-200 flex justify-end">
          <button type="submit" :disabled="isSubmitting" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition flex items-center shadow-md">
            {{ isSubmitting ? 'Memproses...' : 'Ajukan Izin' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../lib/axios'
import Swal from 'sweetalert2'

const router = useRouter()
const isSubmitting = ref(false)
const errorMessage = ref('')
const employees = ref([])
const selectedFile = ref(null)

const form = reactive({
  employee_id: '',
  permit_type: 'Sick',
  start_date: '',
  end_date: '',
  description: ''
})

const fetchEmployees = async () => {
  try {
    const res = await api.get('/employees?limit=1000')
    employees.value = res.data.data.data || res.data.data
  } catch (error) {
    console.error('Gagal memuat daftar karyawan')
  }
}

const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0]
}

const submitForm = async () => {
  isSubmitting.value = true
  errorMessage.value = ''
  
  const formData = new FormData()
  formData.append('employee_id', form.employee_id)
  formData.append('permit_type', form.permit_type)
  formData.append('start_date', form.start_date)
  formData.append('end_date', form.end_date)
  formData.append('description', form.description)
  
  if (selectedFile.value) {
    formData.append('attachment', selectedFile.value)
  }

  try {
    await api.post('/permit-requests', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Pengajuan izin berhasil dibuat.', showConfirmButton: false, timer: 1500 })
    router.push('/permit-requests')
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Gagal menyimpan pengajuan izin.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => fetchEmployees())
</script>