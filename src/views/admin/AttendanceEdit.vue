<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-10">
    <div class="max-w-4xl mx-auto">
      
      <div class="flex items-center gap-4 mb-8">
        <button @click="router.push('/attendances')" class="p-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl transition shadow-sm">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Edit Absensi</h1>
          <p class="text-sm text-gray-500">ID: {{ route.params.id }}</p>
        </div>
      </div>

      <div v-if="isLoadingData" class="flex justify-center py-10"><span class="animate-pulse text-blue-600">Memuat data...</span></div>

      <form v-else @submit.prevent="submitForm" class="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        
        <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">{{ errorMessage }}</div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div class="md:col-span-2"><h2 class="text-lg font-bold text-gray-900 border-b pb-2">Informasi Dasar (Hanya Baca)</h2></div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Karyawan</label>
            <input :value="employeeName" type="text" disabled class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 outline-none">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Absensi *</label>
            <input v-model="form.date" type="date" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          </div>

          <div class="md:col-span-2 mt-4"><h2 class="text-lg font-bold text-gray-900 border-b pb-2">Data Kehadiran</h2></div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Status Kehadiran *</label>
            <select v-model="form.attendance_status" required class="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none">
              <option value="Present">Hadir (Present)</option>
              <option value="Absent">Alfa (Absent)</option>
              <option value="Leave">Cuti (Leave)</option>
              <option value="Permit">Izin (Permit)</option>
              <option value="Invalid">Data Tidak Valid (Invalid)</option>
            </select>
          </div>

          <template v-if="form.attendance_status === 'Present' || form.attendance_status === 'Invalid'">
            <!-- Jam Masuk -->
            <div class="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <label class="block text-sm font-medium text-blue-900 mb-1">Waktu Datang (Clock In)</label>
              <input v-model="form.clock_in_time" type="datetime-local" step="1" required class="w-full px-4 py-2 border border-blue-200 rounded-lg outline-none mb-3">
              <label class="block text-sm font-medium text-blue-900 mb-1">Status Kedatangan</label>
              <select v-model="form.clock_in_status" class="w-full px-4 py-2 border border-blue-200 rounded-lg bg-white outline-none">
                <option value="On Time">Tepat Waktu (On Time)</option>
                <option value="Late">Terlambat (Late)</option>
              </select>
            </div>

            <!-- Jam Pulang -->
            <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label class="block text-sm font-medium text-gray-700 mb-1">Waktu Pulang (Clock Out)</label>
              <input v-model="form.clock_out_time" type="datetime-local" step="1" class="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none mb-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">Status Kepulangan</label>
              <select v-model="form.clock_out_status" class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white outline-none">
                <option value="">-- Belum Pulang --</option>
                <option value="On Time">Tepat Waktu (On Time)</option>
                <option value="Early Depart">Pulang Cepat (Early Depart)</option>
              </select>
            </div>
          </template>

        </div>

        <div class="mt-8 pt-6 border-t border-gray-200 flex justify-end">
          <button type="submit" :disabled="isSubmitting" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition flex items-center shadow-md">
            {{ isSubmitting ? 'Menyimpan...' : 'Perbarui Data' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../../lib/axios'
import Swal from 'sweetalert2'

const router = useRouter()
const route = useRoute()
const isSubmitting = ref(false)
const isLoadingData = ref(true)
const errorMessage = ref('')

const employeeName = ref('')

const form = reactive({
  date: '',
  attendance_status: '',
  clock_in_time: '',
  clock_in_status: '',
  clock_out_time: '',
  clock_out_status: '',
})

// Fungsi mengubah "2026-10-01 08:00:00" (MySQL) menjadi "2026-10-01T08:00:00" (HTML Input)
const formatForInput = (dbDateTime) => {
  if (!dbDateTime) return ''
  return dbDateTime.replace(' ', 'T')
}

// Fungsi mengubah "2026-10-01T08:00" (HTML Input) menjadi "2026-10-01 08:00:00" (MySQL)
const formatForMySQL = (inputDateTime) => {
  if (!inputDateTime) return null
  return inputDateTime.replace('T', ' ')
}

const fetchData = async () => {
  try {
    const res = await api.get(`/attendances/${route.params.id}`)
    const data = res.data.data
    
    employeeName.value = data.employee?.full_name || 'Karyawan'
    
    form.date = data.date
    form.attendance_status = data.attendance_status
    form.clock_in_time = formatForInput(data.clock_in_time)
    form.clock_in_status = data.clock_in_status || 'On Time'
    form.clock_out_time = formatForInput(data.clock_out_time)
    form.clock_out_status = data.clock_out_status || ''
  } catch (error) {
    Swal.fire('Error', 'Data tidak ditemukan', 'error')
    router.push('/attendances')
  } finally {
    isLoadingData.value = false
  }
}

watch(() => form.attendance_status, (newStatus) => {
  if (newStatus !== 'Present' && newStatus !== 'Invalid') {
    form.clock_in_time = ''; form.clock_out_time = ''; form.clock_in_status = ''; form.clock_out_status = ''
  }
})

const submitForm = async () => {
  isSubmitting.value = true
  errorMessage.value = ''
  
  const payload = { ...form }
  if (payload.clock_in_time) payload.clock_in_time = formatForMySQL(payload.clock_in_time)
  if (payload.clock_out_time) payload.clock_out_time = formatForMySQL(payload.clock_out_time)
  
  if (!payload.clock_out_time) delete payload.clock_out_time

  try {
    await api.put(`/attendances/${route.params.id}`, payload)
    
    await Swal.fire({ icon: 'success', title: 'Diperbarui!', text: 'Absensi berhasil dikoreksi.', showConfirmButton: false, timer: 1500 })
    router.push('/attendances')
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Gagal menyimpan perubahan.'
    Swal.fire({ icon: 'error', title: 'Gagal Menyimpan!', text: errorMessage.value, confirmButtonColor: '#ef4444' })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => fetchData())
</script>