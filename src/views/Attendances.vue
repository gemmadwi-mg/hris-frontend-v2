<template>
    <div class="p-6 md:p-8">
        <div class="max-w-7xl mx-auto">

            <!-- HEADER -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Data Absensi</h1>
                    <p class="text-sm text-gray-500 mt-1">Pantau kehadiran, keterlambatan, dan jam kerja karyawan.</p>
                </div>
                <router-link to="/attendances/create"
                    class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm">
                    + Input Absensi Manual
                </router-link>
            </div>

            <!-- FILTER & SEARCH -->
            <div
                class="bg-white p-4 rounded-t-2xl border border-gray-200 border-b-0 flex gap-4 items-center justify-between">
                <input v-model="searchQuery" @keyup.enter="fetchAttendances(1)" type="text"
                    placeholder="Cari nama karyawan..."
                    class="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                <select v-model="filterStatus" @change="fetchAttendances(1)"
                    class="px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none bg-white">
                    <option value="">Semua Status</option>
                    <option value="Present">Hadir (Present)</option>
                    <option value="Late">Terlambat</option>
                    <option value="Absent">Alfa (Absent)</option>
                    <option value="Leave">Cuti (Leave)</option>
                </select>
            </div>

            <!-- TABLE -->
            <div class="bg-white border border-gray-200 rounded-b-2xl shadow-sm overflow-hidden">
                <div v-if="isLoading" class="p-10 flex justify-center items-center">
                    <span class="text-blue-600 font-medium">Memuat data absensi...</span>
                </div>

                <div v-else class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tanggal</th>
                                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Karyawan</th>
                                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Jam Masuk</th>
                                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Jam Pulang
                                </th>
                                <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <tr v-for="att in attendances" :key="att.attendance_id" class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {{ formatDate(att.date) }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-bold text-gray-900">{{ att.employee?.full_name ||
                                        'TidakDiketahui' }}</div>
                                    <div class="text-xs text-gray-500">{{ att.branch?.branch_name || '-' }}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900 font-mono">{{ formatTime(att.clock_in_time) }}
                                    </div>
                                    <span v-if="att.clock_in_status === 'Late'"
                                        class="text-xs font-semibold text-red-600 border border-red-200 bg-red-50 px-2 py-0.5 rounded">Terlambat</span>
                                    <span v-else-if="att.clock_in_status === 'On Time'"
                                        class="text-xs font-semibold text-green-600">Tepat Waktu</span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900 font-mono">{{ formatTime(att.clock_out_time) ||
                                        '--:--' }}</div>
                                    <span v-if="att.clock_out_status === 'Early Depart'"
                                        class="text-xs font-semibold text-yellow-600">Pulang Cepat</span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-center">
                                    <span
                                        :class="['px-3 py-1 inline-flex text-xs font-semibold rounded-full border', getStatusClass(att.attendance_status)]">
                                        {{ att.attendance_status }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-center">
                                    <div class="flex justify-center items-center gap-2">
                                        <!-- TOMBOL DETAIL (Mata) -->
                                        <router-link :to="`/attendances/${att.attendance_id}`" title="Lihat Detail"
                                            class="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </router-link>

                                        <!-- TOMBOL EDIT (Pensil) -->
                                        <router-link :to="`/attendances/${att.attendance_id}/edit`" title="Edit Absensi"
                                            class="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                            </svg>
                                        </router-link>

                                        <!-- TOMBOL HAPUS (Tempat Sampah) -->
                                        <button @click="handleDelete(att.attendance_id)" title="Hapus Absensi"
                                            class="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../lib/axios'
import Swal from 'sweetalert2'

const attendances = ref([])
const isLoading = ref(true)
const searchQuery = ref('')
const filterStatus = ref('')

const fetchAttendances = async (page = 1) => {
    isLoading.value = true
    try {
        const res = await api.get('/attendances', {
            params: { page, search: searchQuery.value, status: filterStatus.value }
        })
        attendances.value = res.data.data.data
    } catch (error) {
        console.error('Gagal memuat absensi', error)
    } finally {
        isLoading.value = false
    }
}

const handleDelete = async (id) => {
    const result = await Swal.fire({
        title: 'Hapus Absensi?', text: 'Data akan dihapus permanen.', icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Ya, Hapus'
    })
    if (result.isConfirmed) {
        try {
            await api.delete(`/attendances/${id}`)
            fetchAttendances()
            Swal.fire({ icon: 'success', title: 'Terhapus!', showConfirmButton: false, timer: 1500 })
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Gagal', text: 'Terjadi kesalahan sistem.' })
        }
    }
}

// Formatters
const formatDate = (date) => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date))
const formatTime = (datetime) => {
    if (!datetime) return null;
    return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(datetime))
}
const getStatusClass = (status) => {
    const maps = {
        'Present': 'bg-green-50 text-green-700 border-green-200',
        'Absent': 'bg-red-50 text-red-700 border-red-200',
        'Leave': 'bg-blue-50 text-blue-700 border-blue-200',
        'Permit': 'bg-purple-50 text-purple-700 border-purple-200',
        'Invalid': 'bg-gray-50 text-gray-700 border-gray-200'
    }
    return maps[status] || 'bg-gray-50 text-gray-700'
}

onMounted(() => fetchAttendances())
</script>