<script setup>
import { useEmployeePayrollStore } from '../stores/employeePayroll';

defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close']);
const payrollStore = useEmployeePayrollStore();

const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
      
      <!-- Modal Header -->
      <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div>
          <h3 class="text-lg font-bold text-gray-800">
            Rincian Slip Gaji #{{ payrollStore.selectedPayroll?.payroll_id }}
          </h3>
          <p class="text-xs text-gray-500">
            Periode: {{ payrollStore.selectedPayroll?.period_month }}/{{ payrollStore.selectedPayroll?.period_year }}
          </p>
        </div>
        <button @click="emit('close')" class="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
      </div>

      <!-- Modal Body (Breakdown) -->
      <div v-if="payrollStore.selectedPayroll" class="p-6 overflow-y-auto space-y-6 text-sm">
        
        <!-- Grid Breakdown Pendapatan vs Potongan -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Kolom Pendapatan (Earnings) -->
          <div class="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-2">
            <h4 class="font-bold text-emerald-900 border-b border-emerald-200 pb-2 mb-3">PENDAPATAN</h4>
            <div class="flex justify-between text-gray-700">
              <span>Gaji Pokok:</span>
              <span class="font-medium">{{ formatRupiah(payrollStore.selectedPayroll.basic_salary) }}</span>
            </div>
            <div class="flex justify-between text-gray-700">
              <span>Tunj. Jabatan:</span>
              <span>{{ formatRupiah(payrollStore.selectedPayroll.position_allowance) }}</span>
            </div>
            <div class="flex justify-between text-gray-700">
              <span>Tunj. Makan:</span>
              <span>{{ formatRupiah(payrollStore.selectedPayroll.meal_allowance) }}</span>
            </div>
            <div class="flex justify-between text-gray-700">
              <span>Tunj. Transport:</span>
              <span>{{ formatRupiah(payrollStore.selectedPayroll.transport_allowance) }}</span>
            </div>
            <div class="flex justify-between text-gray-700">
              <span>Uang Lembur:</span>
              <span>{{ formatRupiah(payrollStore.selectedPayroll.total_overtime) }}</span>
            </div>
            <div class="flex justify-between font-bold text-emerald-900 border-t border-emerald-200 pt-2 mt-2">
              <span>Total Pendapatan:</span>
              <span>{{ formatRupiah(payrollStore.selectedPayroll.total_earnings) }}</span>
            </div>
          </div>

          <!-- Kolom Potongan (Deductions) -->
          <div class="bg-red-50/50 p-4 rounded-xl border border-red-100 space-y-2">
            <h4 class="font-bold text-red-900 border-b border-red-200 pb-2 mb-3">POTONGAN</h4>
            <div class="flex justify-between text-gray-700">
              <span>BPJS Kesehatan (1%):</span>
              <span>{{ formatRupiah(payrollStore.selectedPayroll.bpjs_health) }}</span>
            </div>
            <div class="flex justify-between text-gray-700">
              <span>BPJS JHT (2%):</span>
              <span>{{ formatRupiah(payrollStore.selectedPayroll.bpjs_jht) }}</span>
            </div>
            <div class="flex justify-between text-gray-700">
              <span>BPJS JP (1%):</span>
              <span>{{ formatRupiah(payrollStore.selectedPayroll.bpjs_jp) }}</span>
            </div>
            <div class="flex justify-between text-gray-700">
              <span>PPh 21 TER:</span>
              <span>{{ formatRupiah(payrollStore.selectedPayroll.pph21_deduction) }}</span>
            </div>
            <div class="flex justify-between text-gray-700">
              <span>Potongan Absen/Keterlambatan:</span>
              <span>{{ formatRupiah(payrollStore.selectedPayroll.absence_deduction + payrollStore.selectedPayroll.late_deduction) }}</span>
            </div>
            <div class="flex justify-between font-bold text-red-900 border-t border-red-200 pt-2 mt-2">
              <span>Total Potongan:</span>
              <span>{{ formatRupiah(payrollStore.selectedPayroll.total_deductions) }}</span>
            </div>
          </div>

        </div>

        <!-- Take Home Pay Card -->
        <div class="bg-indigo-600 text-white p-4 rounded-xl flex justify-between items-center shadow-md">
          <div>
            <p class="text-xs text-indigo-200 uppercase font-semibold">Gaji Bersih Diterima (Take Home Pay)</p>
            <p class="text-2xl font-extrabold">{{ formatRupiah(payrollStore.selectedPayroll.net_salary) }}</p>
          </div>
          <span class="text-xs bg-indigo-500/80 px-3 py-1 rounded-full text-indigo-100">
            {{ payrollStore.selectedPayroll.is_transferred ? 'Telah Ditransfer' : 'Menunggu Transfer' }}
          </span>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="p-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
        <button @click="emit('close')" class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg">
          Tutup
        </button>
        <button 
          @click="payrollStore.downloadSlipPdf(payrollStore.selectedPayroll.id, payrollStore.selectedPayroll.payroll_id)"
          class="px-4 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition flex items-center gap-2"
        >
          Unduh Slip PDF
        </button>
      </div>

    </div>
  </div>
</template>