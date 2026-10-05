<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-10">
    <div class="max-w-7xl mx-auto">
      
      <!-- HEADER -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Data Karyawan</h1>
          <p class="text-sm text-gray-500 mt-1">Kelola informasi, posisi, dan akses sistem karyawan.</p>
        </div>
        
        <!-- TOMBOL TAMBAH (Hanya untuk Admin, HR Manager, & HR Staff) -->
        <router-link 
          v-if="authStore.hasAnyRole(['System Administrator', 'HR Manager', 'HR Staff'])"
          to="/employees/create" 
          class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm flex items-center gap-2 w-max"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Tambah Karyawan
        </router-link>
      </div>

      <!-- FILTER & SEARCH BAR -->
      <div class="bg-white p-4 rounded-t-2xl border border-gray-200 border-b-0 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        <!-- Search Input -->
        <div class="relative w-full md:w-96">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input 
            v-model="searchQuery" 
            @keyup.enter="handleSearch"
            type="text" 
            placeholder="Cari nama, ID, atau NIK... (Tekan Enter)" 
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
          >
        </div>

        <!-- Filter Dropdown & Refresh -->
        <div class="flex gap-3 w-full md:w-auto">
          <select 
            v-model="filterStatus" 
            @change="handleSearch"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm outline-none w-full md:w-48"
          >
            <option value="">Semua Status</option>
            <option value="Permanent">Permanent</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>

          <button @click="resetFilter" title="Reset Pencarian" class="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </button>
        </div>
      </div>

      <!-- TABLE AREA -->
      <div class="bg-white border border-gray-200 rounded-b-2xl shadow-sm overflow-hidden">
        
        <!-- Loading State -->
        <div v-if="isLoading" class="p-10 flex justify-center items-center">
          <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">ID</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Karyawan</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Jabatan</th>
                <th scope="col" class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Status</th>
                <th scope="col" class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="emp in employees" :key="emp.employee_id" class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{{ emp.employee_id }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full font-bold shadow-sm border border-blue-200">
                      {{ emp.full_name ? emp.full_name.charAt(0) : '?' }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-bold text-gray-900">{{ emp.full_name }}</div>
                      <div class="text-xs text-gray-500">{{ emp.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ emp.job_title }}</div>
                  <div class="text-xs text-gray-500">{{ emp.role ? emp.role.role_name : '-' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span :class="['px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border', 
                    emp.employment_status === 'Permanent' ? 'bg-green-50 text-green-700 border-green-200' : 
                    emp.employment_status === 'Contract' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-50 text-gray-700 border-gray-200']">
                    {{ emp.employment_status }}
                  </span>
                </td>
                
                <!-- KOLOM AKSI -->
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <div class="flex justify-center items-center gap-2">
                    
                    <!-- Detail: Semua user terautentikasi dapat melihat detail -->
                    <router-link :to="`/employees/${emp.employee_id}`" title="Lihat Detail" class="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </router-link>

                    <!-- Edit: Hanya Admin, HR Manager, & HR Staff -->
                    <router-link 
                      v-if="authStore.hasAnyRole(['System Administrator', 'HR Manager', 'HR Staff'])"
                      :to="`/employees/${emp.employee_id}/edit`" 
                      title="Edit Karyawan" 
                      class="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                    </router-link>

                    <!-- Hapus: Hanya Admin & HR Manager -->
                    <button 
                      v-if="authStore.hasAnyRole(['System Administrator', 'HR Manager'])"
                      @click="handleDelete(emp.employee_id, emp.full_name)" 
                      title="Hapus Karyawan" 
                      class="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
              
              <!-- State Kosong jika pencarian tidak ditemukan -->
              <tr v-if="employees.length === 0 && !isLoading">
                <td colspan="5" class="px-6 py-10 text-center text-gray-500">
                  Data karyawan tidak ditemukan.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- PAGINATION CONTROLS -->
        <div v-if="pagination.total > 0" class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="text-sm text-gray-500">
            Menampilkan <span class="font-medium text-gray-900">{{ pagination.from }}</span> - <span class="font-medium text-gray-900">{{ pagination.to }}</span> dari <span class="font-bold text-gray-900">{{ pagination.total }}</span> data
          </div>
          
          <div class="flex items-center gap-2">
            <button 
              @click="changePage(pagination.current_page - 1)" 
              :disabled="!pagination.prev_page_url"
              class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium transition"
              :class="!pagination.prev_page_url ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'"
            >
              Sebelumnya
            </button>
            
            <div class="px-4 py-1.5 text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg">
              Hal. {{ pagination.current_page }} / {{ pagination.last_page }}
            </div>
            
            <button 
              @click="changePage(pagination.current_page + 1)" 
              :disabled="!pagination.next_page_url"
              class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium transition"
              :class="!pagination.next_page_url ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'"
            >
              Selanjutnya
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../lib/axios'
import Swal from 'sweetalert2'
import { useAuthStore } from '../stores/auth' // 1. Import Pinia Store

const authStore = useAuthStore() // 2. Inisialisasi Auth Store

const employees = ref([])
const isLoading = ref(true)

// State Pencarian & Pagination
const searchQuery = ref('')
const filterStatus = ref('')
const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0,
  from: 0,
  to: 0,
  prev_page_url: null,
  next_page_url: null
})

// Fungsi utama ambil data
const fetchEmployees = async (page = 1) => {
  isLoading.value = true
  try {
    const response = await api.get('/employees', {
      params: {
        page: page,
        search: searchQuery.value,
        status: filterStatus.value
      }
    })
    
    const pagedData = response.data.data
    employees.value = pagedData.data || pagedData
    
    pagination.value = {
      current_page: pagedData.current_page || 1,
      last_page: pagedData.last_page || 1,
      total: pagedData.total || employees.value.length,
      from: pagedData.from || 0,
      to: pagedData.to || 0,
      prev_page_url: pagedData.prev_page_url,
      next_page_url: pagedData.next_page_url
    }
  } catch (error) {
    console.error('Gagal mengambil data karyawan:', error)
    Swal.fire({
      icon: 'error',
      title: 'Koneksi Terputus',
      text: 'Gagal memuat daftar karyawan dari server.',
      confirmButtonColor: '#ef4444'
    })
  } finally {
    isLoading.value = false
  }
}

// Handler Aksi
const handleSearch = () => {
  fetchEmployees(1)
}

const resetFilter = () => {
  searchQuery.value = ''
  filterStatus.value = ''
  fetchEmployees(1)
}

const changePage = (newPage) => {
  if (newPage >= 1 && newPage <= pagination.value.last_page) {
    fetchEmployees(newPage)
  }
}

const handleDelete = async (id, name) => {
  const result = await Swal.fire({
    title: 'Apakah Anda yakin?',
    text: `Data karyawan ${name} akan dihapus permanen!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#9ca3af',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await api.delete(`/employees/${id}`)
      
      fetchEmployees(pagination.value.current_page)
      
      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: `Data ${name} berhasil dihapus.`,
        showConfirmButton: false,
        timer: 1500
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menghapus',
        text: 'Terjadi kesalahan saat menghapus data di server.',
        confirmButtonColor: '#ef4444'
      })
    }
  }
}

onMounted(() => {
  fetchEmployees()
})
</script>