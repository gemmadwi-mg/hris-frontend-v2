<template>
    <div class="max-w-md mx-auto space-y-5">

        <!-- HEADER & TOMBOL KEMBALI -->
        <div class="flex items-center gap-3">
            <button @click="router.push('/employee/leaves')"
                class="p-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition shadow-sm">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
            </button>
            <div>
                <h1 class="text-xl font-bold text-gray-900">Pengajuan Cuti</h1>
                <p class="text-xs text-gray-500">Isi formulir & unggah dokumen pendukung.</p>
            </div>
        </div>

        <!-- FORM UTAMA -->
        <form @submit.prevent="submitLeave" class="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">

            <!-- JENIS CUTI -->
            <div class="space-y-1.5">
                <label class="text-xs font-bold text-gray-700">Jenis Cuti <span class="text-red-500">*</span></label>
                <select v-model="form.leave_type" :disabled="isLoadingLeaveTypes" required
                    class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60">
                    <option value="" disabled>
                        {{ isLoadingLeaveTypes ? '⏳ Memuat jenis & sisa cuti...' : '-- Pilih Jenis Cuti --' }}
                    </option>
                    <option v-for="type in leaveTypes" :key="type.id" :value="type.name">
                        {{ type.name }} (Sisa: {{ type.remaining_days }} Hari)
                    </option>
                </select>
            </div>

            <!-- 2. RENTANG TANGGAL -->
            <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1.5">
                    <label class="text-xs font-bold text-gray-700">Tanggal Mulai <span
                            class="text-red-500">*</span></label>
                    <input type="date" v-model="form.start_date" :min="todayDate" required
                        class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div class="space-y-1.5">
                    <label class="text-xs font-bold text-gray-700">Tanggal Selesai <span
                            class="text-red-500">*</span></label>
                    <input type="date" v-model="form.end_date" :min="form.start_date || todayDate" required
                        class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>

            <!-- RINGKASAN TOTAL HARI -->
            <div v-if="totalDays > 0"
                class="p-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between text-xs">
                <span class="font-medium text-blue-700">Durasi Cuti Diajukan:</span>
                <span class="font-black text-blue-900 bg-white px-3 py-1 rounded-xl shadow-xs border border-blue-100">
                    {{ totalDays }} Hari Kerja
                </span>
            </div>

            <!-- 3. ALASAN CUTI -->
            <div class="space-y-1.5">
                <label class="text-xs font-bold text-gray-700">Alasan / Keterangan <span
                        class="text-red-500">*</span></label>
                <textarea v-model="form.reason" rows="3" required
                    placeholder="Jelaskan alasan pengajuan cuti secara singkat..."
                    class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>

            <!-- 4. UNGGAH LAMPIRAN DOKUMEN -->
            <div class="space-y-1.5">
                <label class="text-xs font-bold text-gray-700">
                    Lampiran Dokumen <span class="text-gray-400 font-normal">(Opsional / Surat Dokter / PDF)</span>
                </label>

                <div
                    class="relative border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:bg-slate-50 transition">
                    <input type="file" ref="fileInputRef" @change="handleFileUpload" accept=".pdf,.jpg,.jpeg,.png"
                        class="hidden" />

                    <div v-if="!selectedFile" @click="triggerFileInput" class="cursor-pointer space-y-1">
                        <div
                            class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-lg">
                            📎
                        </div>
                        <p class="text-xs font-bold text-gray-700">Klik untuk unggah lampiran</p>
                        <p class="text-[10px] text-gray-400">PDF, JPG, atau PNG (Maksimal 5MB)</p>
                    </div>

                    <!-- KETERANGAN BERKAS TERPILIH -->
                    <div v-else
                        class="flex items-center justify-between bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
                        <div class="flex items-center gap-2 overflow-hidden text-left">
                            <span class="text-lg">📄</span>
                            <div class="truncate">
                                <p class="text-xs font-bold text-gray-800 truncate">{{ selectedFile.name }}</p>
                                <p class="text-[10px] text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
                            </div>
                        </div>
                        <button type="button" @click="removeFile"
                            class="p-1 text-red-500 hover:text-red-700 text-xs font-bold rounded-lg">
                            ✖
                        </button>
                    </div>
                </div>
            </div>

            <!-- TOMBOL SUBMIT -->
            <button type="submit" :disabled="isSubmitting || totalDays <= 0"
                class="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 mt-2">
                <span v-if="isSubmitting"
                    class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                {{ isSubmitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Cuti' }}
            </button>

        </form>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../lib/axios'
import { useAuthStore } from '../../stores/auth'
import Swal from 'sweetalert2'

const router = useRouter()
const authStore = useAuthStore()

const fileInputRef = ref(null)
const selectedFile = ref(null)
const isSubmitting = ref(false)
// Set initial state ke array kosong
const leaveTypes = ref([])
const isLoadingLeaveTypes = ref(true)

const todayDate = new Date().toISOString().slice(0, 10)

// FORM STATE (DIPERBAIKI: Menggunakan leave_type agar konsisten)
const form = ref({
    leave_type: '',
    start_date: '',
    end_date: '',
    reason: ''
})

// KALKULASI TOTAL HARI KERJA
const totalDays = computed(() => {
    if (!form.value.start_date || !form.value.end_date) return 0
    const start = new Date(form.value.start_date)
    const end = new Date(form.value.end_date)

    if (end < start) return 0

    let count = 0
    const current = new Date(start)

    while (current <= end) {
        const dayOfWeek = current.getDay()
        // Abaikan Sabtu (6) dan Minggu (0)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            count++
        }
        current.setDate(current.getDate() + 1)
    }

    return count
})

// FETCH SALDO CUTI REAL-TIME DARI BACKEND
const fetchLeaveTypes = async () => {
    isLoadingLeaveTypes.value = true
    try {
        const res = await api.get('/leave-balances')
        if (res.data?.data) {
            leaveTypes.value = res.data.data.map(item => ({
                id: item.id,
                name: item.leave_type,
                remaining_days: item.remaining
            }))
        }
    } catch (err) {
        console.error('Gagal memuat saldo cuti real-time:', err)
        Swal.fire('Error', 'Gagal mengambil data kuota cuti dari server.', 'error')
    } finally {
        isLoadingLeaveTypes.value = false
    }
}

// HANDLER BERKAS FILE
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

// SUBMIT PENGAJUAN
const submitLeave = async () => {
    if (!form.value.leave_type) {
        return Swal.fire('Peringatan', 'Silakan pilih Jenis Cuti terlebih dahulu!', 'warning')
    }

    if (totalDays.value <= 0) {
        return Swal.fire('Tanggal Tidak Valid', 'Tanggal selesai harus setelah tanggal mulai.', 'warning')
    }

    isSubmitting.value = true

    const employeeId = authStore.user?.employee_id || authStore.user?.id

    const formData = new FormData()
    formData.append('employee_id', employeeId)
    formData.append('leave_type', String(form.value.leave_type).trim())
    formData.append('start_date', form.value.start_date)
    formData.append('end_date', form.value.end_date)
    formData.append('reason', form.value.reason)

    if (selectedFile.value) {
        formData.append('attachment', selectedFile.value)
    }

    try {
        await api.post('/leave-requests', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })

        Swal.fire({
            icon: 'success',
            title: 'Pengajuan Cuti Berhasil!',
            text: 'Permohonan Anda telah dikirim untuk menunggu persetujuan HRD.',
            timer: 2000,
            showConfirmButton: false
        })

        router.push('/employee/leaves')
    } catch (error) {
        console.error('Submit Leave Error:', error)
        Swal.fire('Gagal Mengajukan Cuti', error.response?.data?.message || 'Terjadi kesalahan sistem.', 'error')
    } finally {
        isSubmitting.value = false
    }
}

onMounted(() => {
    fetchLeaveTypes()
})
</script>