<template>
    <div class="min-h-screen bg-gray-50 p-6 md:p-10">
        <div class="max-w-4xl mx-auto">

            <!-- HEADER & TOMBOL KEMBALI -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div class="flex items-center gap-4">
                    <button @click="router.push('/leave-requests')"
                        class="p-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl transition shadow-sm">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                    </button>
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">Detail Pengajuan Cuti</h1>
                        <p class="text-sm text-gray-500">ID: {{ route.params.id }}</p>
                    </div>
                </div>
            </div>

            <div v-if="isLoading" class="flex justify-center py-20"><span
                    class="text-blue-600 font-medium animate-pulse">Memuat data...</span></div>

            <div v-else-if="leave" class="space-y-6">

                <!-- CARD 1: STATUS DAN PEMOHON -->
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">

                    <!-- Indikator Status -->
                    <div
                        :class="['absolute top-0 right-0 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-sm', getStatusColor(leave.status)]">
                        {{ leave.status }}
                    </div>

                    <div class="flex items-center gap-4 mb-6">
                        <div
                            class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold shrink-0 border-4 border-white shadow-sm">
                            {{ getInitials(leave.employee?.full_name) }}
                        </div>
                        <div>
                            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Pemohon</p>
                            <h2 class="text-xl font-bold text-gray-900">{{ leave.employee?.full_name || 'TidakDiketahui' }}</h2>
                            <p class="text-sm text-gray-500">{{ leave.employee?.job_title || '-' }}</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                        <div>
                            <p class="text-xs text-gray-500 mb-1">Tipe Cuti</p>
                            <p class="font-semibold text-gray-900">{{ leave.leave_type }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500 mb-1">Durasi</p>
                            <p class="font-semibold text-gray-900">{{ formatDate(leave.start_date) }} <span
                                    class="text-gray-400 font-normal mx-1">s/d</span> {{ formatDate(leave.end_date) }}
                            </p>
                        </div>
                        <div class="md:col-span-2 mt-2">
                            <p class="text-xs text-gray-500 mb-1">Alasan / Keterangan</p>
                            <p class="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100">{{
                                leave.reason }}</p>
                        </div>
                        <!-- TOMBOL LIHAT LAMPIRAN -->
                        <div v-if="leave.attachment" class="md:col-span-2 mt-4 pt-4 border-t border-gray-50">
                            <p class="text-xs text-gray-500 mb-2">Dokumen Pendukung</p>
                            <a :href="`http://localhost:8000/storage/${leave.attachment}`" target="_blank"
                                class="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-semibold border border-blue-200 w-max">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13">
                                    </path>
                                </svg>
                                Lihat Lampiran File
                            </a>
                        </div>
                    </div>
                </div>

                <!-- CARD 2: HASIL KEPUTUSAN (Jika sudah diproses) -->
                <div v-if="leave.status !== 'Pending'"
                    class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 class="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-100 pb-2">Informasi
                        Keputusan</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p class="text-xs text-gray-500 mb-1">Diproses Oleh</p>
                            <p class="font-semibold text-gray-900">{{ leave.approver?.full_name || 'Sistem' }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500 mb-1">Tanggal Diproses</p>
                            <p class="font-semibold text-gray-900">{{ formatDateTime(leave.processed_at) }}</p>
                        </div>
                        <div v-if="leave.status === 'Rejected'" class="md:col-span-2 mt-2">
                            <p class="text-xs text-red-500 mb-1 font-bold">Alasan Penolakan</p>
                            <p class="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-100">{{
                                leave.rejection_reason }}</p>
                        </div>
                    </div>
                </div>

                <!-- ACTION BUTTONS (Approve/Reject) HANYA MUNCUL JIKA PENDING -->
                <div v-if="leave.status === 'Pending'" class="flex gap-4 pt-4">
                    <button @click="processLeave('Approved')"
                        class="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition shadow-md shadow-green-200">
                        Terima Cuti
                    </button>
                    <button @click="processLeave('Rejected')"
                        class="flex-1 py-3 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl font-bold transition">
                        Tolak Cuti
                    </button>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth' // Kita butuh data user yang sedang login untuk dicatat sebagai Approver
import api from '../lib/axios'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const leave = ref(null)
const isLoading = ref(true)

const fetchDetail = async () => {
    try {
        const res = await api.get(`/leave-requests/${route.params.id}`)
        leave.value = res.data.data
    } catch (error) {
        Swal.fire('Error', 'Data tidak ditemukan', 'error')
        router.push('/leave-requests')
    } finally {
        isLoading.value = false
    }
}

const processLeave = async (status) => {
    let rejectionReason = null

    // Jika HRD menekan Tolak, paksa mereka mengisi alasannya via popup SweetAlert
    if (status === 'Rejected') {
        const { value: text, isDismissed } = await Swal.fire({
            title: 'Tolak Pengajuan',
            input: 'textarea',
            inputLabel: 'Berikan alasan penolakan (wajib)',
            inputPlaceholder: 'Misal: Kuota cuti tahunan sudah habis...',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            inputValidator: (value) => {
                if (!value) { return 'Alasan penolakan tidak boleh kosong!' }
            }
        })

        if (isDismissed) return; // Batal memproses
        rejectionReason = text
    } else {
        // Konfirmasi biasa jika menyetujui
        const confirm = await Swal.fire({
            title: 'Setujui Pengajuan?', text: 'Cuti akan disetujui.', icon: 'question',
            showCancelButton: true, confirmButtonColor: '#16a34a', confirmButtonText: 'Ya, Setujui'
        })
        if (!confirm.isConfirmed) return;
    }

    // Waktu diproses (Format MySQL YYYY-MM-DD HH:MM:SS)
    const now = new Date()
    const processedAt = now.toISOString().slice(0, 19).replace('T', ' ')

    try {
        // Kirim update ke backend
        await api.put(`/leave-requests/${leave.value.leave_request_id}`, {
            status: status,
            approver_id: authStore.user?.employee_id, // ID HRD yang sedang login
            processed_at: processedAt,
            rejection_reason: rejectionReason
        })

        Swal.fire({ icon: 'success', title: 'Berhasil Diproses!', showConfirmButton: false, timer: 1500 })
        fetchDetail() // Refresh data di layar
    } catch (error) {
        Swal.fire('Gagal', 'Terjadi kesalahan sistem saat memproses.', 'error')
    }
}

// Helpers
const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?'
const formatDate = (date) => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date))
const formatDateTime = (date) => date ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date)) : '-'
const getStatusColor = (status) => {
    const colors = { 'Pending': 'bg-yellow-500', 'Approved': 'bg-green-600', 'Rejected': 'bg-red-600' }
    return colors[status] || 'bg-gray-600'
}

onMounted(() => fetchDetail())
</script>