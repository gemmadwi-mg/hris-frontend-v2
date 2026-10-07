<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-10">
    <div class="max-w-3xl mx-auto">
      
      <div class="flex items-center gap-4 mb-8">
        <button @click="router.push('/permit-requests')" class="p-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl transition shadow-sm">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Edit Pengajuan Izin</h1>
          <p class="text-sm text-gray-500">ID: {{ route.params.id }}</p>
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-center py-20"><span class="animate-pulse text-blue-600">Memuat data...</span></div>

      <form v-else @submit.prevent="submitForm" class="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        
        <div v-if="form.status !== 'Pending'" class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <svg class="w-6 h-6 text-yellow-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <div>
            <p class="text-sm font-bold text-yellow-800">Tidak Bisa Diedit</p>
            <p class="text-xs text-yellow-700 mt-1">Pengajuan izin ini berstatus <strong>{{ form.status }}</strong>. Data sudah tidak dapat diubah.</p>
          </div>
        </div>

        <div class="space-y-6" :class="{'opacity-60 pointer-events-none': form.status !== 'Pending'}">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Karyawan Pemohon</label>
            <input type="text" :value="employeeName" disabled class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 outline-none">
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
            <textarea v-model="form.description" rows="3" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ganti Lampiran (Opsional)</label>
            <div v-if="currentAttachment" class="mb-2 text-sm text-blue-600 font-medium">
              <a :href="`http://localhost:8000/storage/${currentAttachment}`" target="_blank" class="hover:underline">Lihat Lampiran Saat Ini</a>
            </div>
            <input type="file" @change="handleFileChange" accept=".jpg,.jpeg,.png,.pdf" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
            <p class="text-xs text-gray-500 mt-1">Biarkan kosong jika tidak ingin mengganti dokumen lama.</p>
          </div>
        </div>

        <div class="mt-8 pt-6 border-t border-gray-200 flex justify-end">
          <button v-if="form.status === 'Pending'" type="submit" :disabled="isSubmitting" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-md">
            {{ isSubmitting ? 'Menyimpan...' : 'Perbarui Pengajuan' }}
          </button>
        </div>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../../lib/axios'
import Swal from 'sweetalert2'

const router = useRouter()
const route = useRoute()
const isLoading = ref(true)
const isSubmitting = ref(false)

const employeeName = ref('')
const currentAttachment = ref(null)
const selectedFile = ref(null)

const form = reactive({
  permit_type: '',
  start_date: '',
  end_date: '',
  description: '',
  status: ''
})

const fetchDetail = async () => {
  try {
    const res = await api.get(`/permit-requests/${route.params.id}`)
    const data = res.data.data
    
    employeeName.value = data.employee?.full_name || 'Karyawan'
    currentAttachment.value = data.attachment
    
    form.status = data.status
    form.permit_type = data.permit_type
    form.start_date = data.start_date
    form.end_date = data.end_date
    form.description = data.description
  } catch (error) {
    Swal.fire('Error', 'Data tidak ditemukan', 'error')
    router.push('/permit-requests')
  } finally {
    isLoading.value = false
  }
}

const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0]
}

const submitForm = async () => {
  isSubmitting.value = true
  
  const formData = new FormData()
  formData.append('_method', 'PUT') // Trik Laravel untuk update dengan file
  formData.append('permit_type', form.permit_type)
  formData.append('start_date', form.start_date)
  formData.append('end_date', form.end_date)
  formData.append('description', form.description)
  
  if (selectedFile.value) {
    formData.append('attachment', selectedFile.value)
  }

  try {
    await api.post(`/permit-requests/${route.params.id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    await Swal.fire({ icon: 'success', title: 'Diperbarui!', text: 'Data izin berhasil diubah.', showConfirmButton: false, timer: 1500 })
    router.push('/permit-requests')
  } catch (error) {
    Swal.fire('Gagal', 'Terjadi kesalahan saat menyimpan perubahan.', 'error')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => fetchDetail())
</script>