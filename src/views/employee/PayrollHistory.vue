<script setup>
import { ref, onMounted } from 'vue';
import { useEmployeePayrollStore } from '../../stores/employeePayroll';
import PayrollDetailModal from '../../components/PayrollDetailModal.vue';

const payrollStore = useEmployeePayrollStore();
const selectedYear = ref(new Date().getFullYear());
const isModalOpen = ref(false);

const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
};

const handleViewDetail = async (id) => {
  await payrollStore.fetchPayrollDetail(id);
  isModalOpen.value = true;
};

onMounted(() => {
  payrollStore.fetchMyPayrolls(selectedYear.value);
});
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Slip Gaji & Penggajian</h1>
        <p class="text-gray-500 text-sm">Lihat dan unduh riwayat gaji bulanan Anda.</p>
      </div>
      
      <!-- Filter Tahun -->
      <select 
        v-model="selectedYear" 
        @change="payrollStore.fetchMyPayrolls(selectedYear)"
        class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
      >
        <option :value="2026">2026</option>
        <option :value="2025">2025</option>
      </select>
    </div>

    <!-- Table Riwayat Slip Gaji -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="payrollStore.isLoading" class="p-8 text-center text-gray-500">
        Memuat data slip gaji...
      </div>

      <div v-else-if="payrollStore.payrolls.length === 0" class="p-8 text-center text-gray-500">
        Belum ada slip gaji yang tersedia untuk tahun {{ selectedYear }}.
      </div>

      <table v-else class="w-full text-left text-sm text-gray-600">
        <thead class="bg-gray-50 text-gray-700 font-semibold border-b border-gray-100">
          <tr>
            <th class="p-4">ID Slip</th>
            <th class="p-4">Periode</th>
            <th class="p-4">Gaji Pokok</th>
            <th class="p-4">Total Potongan</th>
            <th class="p-4">Gaji Bersih (THP)</th>
            <th class="p-4">Status</th>
            <th class="p-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="item in payrollStore.payrolls" :key="item.id" class="hover:bg-gray-50/80 transition">
            <td class="p-4 font-mono font-medium text-gray-900">{{ item.payroll_id }}</td>
            <td class="p-4 font-medium">{{ item.period_month }}/{{ item.period_year }}</td>
            <td class="p-4">{{ formatRupiah(item.basic_salary) }}</td>
            <td class="p-4 text-red-600">-{{ formatRupiah(item.total_deductions) }}</td>
            <td class="p-4 font-bold text-emerald-600">{{ formatRupiah(item.net_salary) }}</td>
            <td class="p-4">
              <span 
                class="px-2.5 py-1 text-xs font-semibold rounded-full"
                :class="item.is_transferred ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
              >
                {{ item.is_transferred ? 'Ditransfer' : 'Diproses' }}
              </span>
            </td>
            <td class="p-4 text-center space-x-2">
              <button 
                @click="handleViewDetail(item.id)" 
                class="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition"
              >
                Detail
              </button>
              <button 
                @click="payrollStore.downloadSlipPdf(item.id, item.payroll_id)" 
                class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
              >
                PDF
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Detail Slip Gaji -->
    <PayrollDetailModal 
      :is-open="isModalOpen" 
      @close="isModalOpen = false" 
    />
  </div>
</template>