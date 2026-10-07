<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-10">
    <div class="max-w-4xl mx-auto">
      
      <!-- HEADER -->
      <div class="flex items-center gap-4 mb-8">
        <button @click="router.push('/attendances')" class="p-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl transition shadow-sm" title="Kembali">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Input Absensi Manual</h1>
          <p class="text-sm text-gray-500">Form penambahan data kehadiran oleh HRD</p>
        </div>
      </div>

      <!-- FORM AREA -->
      <form @submit.prevent="submitForm" class="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        
        <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
          {{ errorMessage }}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- SEGMEN 1: Informasi Dasar -->
          <div class="md:col-span-2"><h2 class="text-lg font-bold text-gray-900 border-b pb-2">Informasi Karyawan & Lokasi</h2></div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Karyawan *</label>
            <select v-model="form.employee_id" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none">
              <option value="" disabled>-- Pilih Karyawan --</option>
              <option v-for="emp in options.employees" :key="emp.employee_id" :value="emp.employee_id">
                {{ emp.full_name }} ({{ emp.employee_id }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cabang Penempatan *</label>
            <select v-model="form.branch_id" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none">
              <option value="" disabled>-- Pilih Cabang --</option>
              <option v-for="branch in options.branches" :key="branch.branch_id" :value="branch.branch_id">
                {{ branch.branch_name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Absensi *</label>
            <input v-model="form.date" type="date" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status Kehadiran *</label>
            <select v-model="form.attendance_status" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none">
              <option value="Present">Hadir (Present)</option>
              <option value="Absent">Alfa (Absent)</option>
              <option value="Leave">Cuti (Leave)</option>
              <option value="Permit">Izin (Permit)</option>
              <option value="Invalid">Data Tidak Valid (Invalid)</option>
            </select>
          </div>

          <!-- SEGMEN 2: Waktu Datang & Pulang -->
          <template v-if="form.attendance_status === 'Present' || form.attendance_status === 'Invalid'">
            <div class="md:col-span-2 mt-4"><h2 class="text-lg font-bold text-gray-900 border-b pb-2">Catatan Waktu</h2></div>

            <!-- Jam Masuk -->
            <div class="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <label class="block text-sm font-medium text-blue-900 mb-1">Waktu Datang (Clock In) *</label>
              <input v-model="form.clock_in_time" type="datetime-local" step="1" required class="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-3">
              
              <label class="block text-sm font-medium text-blue-900 mb-1">Status Kedatangan</label>
              <select v-model="form.clock_in_status" class="w-full px-4 py-2 border border-blue-200 rounded-lg bg-white outline-none">
                <option value="On Time">Tepat Waktu (On Time)</option>
                <option value="Late">Terlambat (Late)</option>
              </select>
            </div>

            <!-- Jam Pulang -->
            <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label class="block text-sm font-medium text-gray-700 mb-1">Waktu Pulang (Clock Out)</label>
              <input v-model="form.clock_out_time" type="datetime-local" step="1" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 outline-none mb-3">
              
              <label class="block text-sm font-medium text-gray-700 mb-1">Status Kepulangan</label>
              <select v-model="form.clock_out_status" class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white outline-none">
                <option value="">-- Pilih Jika Sudah Pulang --</option>
                <option value="On Time">Tepat Waktu (On Time)</option>
                <option value="Early Depart">Pulang Cepat (Early Depart)</option>
              </select>
            </div>
          </template>

          <!-- Koordinat Dummy untuk input manual -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Koordinat Lokasi (Manual/Default)</label>
            <input v-model="form.clock_in_coordinates" type="text" placeholder="Misal: -7.311000, 112.728795" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50">
            <p class="text-xs text-gray-500 mt-1">Otomatis diisi dengan koordinat kantor pusat sebagai default input manual.</p>
          </div>

        </div>

        <!-- TOMBOL SIMPAN -->
        <div class="mt-8 pt-6 border-t border-gray-200 flex justify-end">
          <button type="button" @click="router.push('/attendances')" class="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition mr-3">
            Batal
          </button>
          <button type="submit" :disabled="isSubmitting" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition flex items-center shadow-md">
            <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan Data Absensi' }}
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../lib/axios'
import Swal from 'sweetalert2'

const router = useRouter()
const isSubmitting = ref(false)
const errorMessage = ref('')

const options = ref({
  employees: [],
  branches: []
})

const todayDate = new Date().toISOString().substring(0, 10)

const form = reactive({
  employee_id: '',
  branch_id: '',
  date: todayDate,
  attendance_status: 'Present',
  
  clock_in_time: '',
  clock_in_status: 'On Time',
  clock_out_time: '',
  clock_out_status: '',
  
  clock_in_coordinates: '-7.311009, 112.728790',
  clock_in_photo: 'manual_input.jpg',   // Nilai default foto masuk
  clock_out_photo: 'manual_input.jpg',  // Nilai default foto keluar
})

const fetchOptions = async () => {
  try {
    const resRef = await api.get('/references/employee-options')
    options.value.branches = resRef.data.data.branches

    const resEmp = await api.get('/employees?limit=1000') 
    options.value.employees = resEmp.data.data.data || resEmp.data.data
  } catch (error) {
    console.error('Gagal memuat opsi form:', error)
  }
}

watch(() => form.attendance_status, (newStatus) => {
  if (newStatus !== 'Present' && newStatus !== 'Invalid') {
    form.clock_in_time = ''
    form.clock_out_time = ''
    form.clock_in_status = ''
    form.clock_out_status = ''
  } else {
    form.clock_in_status = 'On Time'
  }
})

const formatDateTimeForMySQL = (isoString) => {
  if (!isoString) return null
  return isoString.replace('T', ' ')
}

const submitForm = async () => {
  isSubmitting.value = true
  errorMessage.value = ''
  
  // Siapkan Payload
  const payload = { ...form }

  // PASTIKAN FOTO SELALU ADA ISI DEFAULT
  if (!payload.clock_in_photo) payload.clock_in_photo = 'manual_input.jpg'
  if (!payload.clock_out_photo) payload.clock_out_photo = 'manual_input.jpg'

  // Format Waktu
  if (payload.clock_in_time) {
    payload.clock_in_time = formatDateTimeForMySQL(payload.clock_in_time)
  }
  if (payload.clock_out_time) {
    payload.clock_out_time = formatDateTimeForMySQL(payload.clock_out_time)
  }
  
  if (!payload.clock_out_time) delete payload.clock_out_time
  if (!payload.clock_in_time && payload.attendance_status !== 'Present') {
      delete payload.clock_in_time
  }

  try {
    await api.post('/attendances', payload)
    
    await Swal.fire({
      icon: 'success',
      title: 'Tersimpan!',
      text: 'Data absensi manual berhasil ditambahkan.',
      confirmButtonColor: '#2563eb',
      timer: 1500,
      showConfirmButton: false
    })
    
    router.push('/attendances')
    
  } catch (error) {
    if (error.response && error.response.data.errors) {
      errorMessage.value = Object.values(error.response.data.errors).flat().join(' | ')
    } else {
      errorMessage.value = error.response?.data?.message || 'Terjadi kesalahan pada server.'
    }
    
    Swal.fire({
      icon: 'error',
      title: 'Gagal Menyimpan!',
      text: errorMessage.value,
      confirmButtonColor: '#ef4444', 
    })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchOptions()
})
</script>