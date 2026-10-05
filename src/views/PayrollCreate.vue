<template>
  <div class="max-w-7xl mx-auto py-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Proses Gaji Baru</h1>
      <button @click="router.push('/payrolls')" class="text-gray-500 hover:text-gray-700">
        Batal & Kembali
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- FORM INPUT (KIRI) -->
      <div class="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form @submit.prevent="submitForm">
          
          <h2 class="text-lg font-bold text-gray-700 mb-4 border-b pb-2">1. Data Utama</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Karyawan</label>
              <select v-model="form.employee_id" required class="w-full border-gray-300 rounded-md p-2 border">
                <option value="" disabled>Pilih Karyawan</option>
                <option v-for="emp in employees" :key="emp.employee_id" :value="emp.employee_id">
                  {{ emp.employee_id }} - {{ emp.full_name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
              <select v-model="form.period_month" required class="w-full border-gray-300 rounded-md p-2 border">
                <option v-for="(m, i) in months" :key="i" :value="i + 1">{{ m }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
              <input type="number" v-model="form.period_year" required class="w-full border-gray-300 rounded-md p-2 border" />
            </div>
          </div>

          <div v-if="isCalculating" class="text-sm text-blue-600 font-bold mb-4 animate-pulse">
            Menghitung lembur, BPJS, dan PPh21 (TER)...
          </div>

          <h2 class="text-lg font-bold text-gray-700 mb-4 border-b pb-2">2. Pendapatan (Penambah)</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div><label class="block text-sm text-gray-700 mb-1">Gaji Pokok</label><input type="number" v-model="form.basic_salary" class="w-full bg-gray-50 rounded-md p-2 border" readonly /></div>
            <div><label class="block text-sm text-gray-700 mb-1">Insentif Lembur</label><input type="number" v-model="form.total_overtime" class="w-full bg-gray-50 rounded-md p-2 border" readonly /></div>
            
            <!-- Menggunakan Variabel Full English -->
            <div><label class="block text-sm text-gray-700 mb-1">Tunjangan Jabatan</label><input type="number" v-model="form.position_allowance" class="w-full rounded-md p-2 border" /></div>
            <div><label class="block text-sm text-gray-700 mb-1">Tunjangan Makan</label><input type="number" v-model="form.meal_allowance" class="w-full rounded-md p-2 border" /></div>
            <div><label class="block text-sm text-gray-700 mb-1">Tunjangan Transport</label><input type="number" v-model="form.transport_allowance" class="w-full rounded-md p-2 border" /></div>
          </div>

          <h2 class="text-lg font-bold text-gray-700 mb-4 border-b pb-2">3. Potongan & Pajak (Pengurang)</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
            <div><label class="block text-gray-700 mb-1">Potongan Alfa</label><input type="number" v-model="form.absence_deduction" class="w-full bg-red-50 rounded-md p-2 border" readonly /></div>
            <div><label class="block text-gray-700 mb-1">Potongan Terlambat</label><input type="number" v-model="form.late_deduction" class="w-full bg-red-50 rounded-md p-2 border" readonly /></div>
            
            <!-- Menggunakan Variabel Full English -->
            <div><label class="block text-gray-700 mb-1">BPJS Kesehatan</label><input type="number" v-model="form.bpjs_health" class="w-full bg-red-50 rounded-md p-2 border" readonly /></div>
            <div><label class="block text-gray-700 mb-1">BPJS JHT</label><input type="number" v-model="form.bpjs_jht" class="w-full bg-red-50 rounded-md p-2 border" readonly /></div>
            <div><label class="block text-gray-700 mb-1">BPJS JP</label><input type="number" v-model="form.bpjs_jp" class="w-full bg-red-50 rounded-md p-2 border" readonly /></div>
            
            <div><label class="block text-gray-700 mb-1">Pajak PPh21</label><input type="number" v-model="form.pph21_deduction" class="w-full bg-red-50 rounded-md p-2 border" readonly /></div>
          </div>

          <h2 class="text-lg font-bold text-gray-700 mb-4 border-b pb-2">4. Penyesuaian Ekstra</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div><label class="block text-sm text-gray-700 mb-1">Penyesuaian (Minus utk Kasbon)</label><input type="number" v-model="form.adjustment" class="w-full rounded-md p-2 border" /></div>
            <div><label class="block text-sm text-gray-700 mb-1">Keterangan</label><input type="text" v-model="form.adjustment_note" class="w-full rounded-md p-2 border" placeholder="Cth: Cicilan Kasbon" /></div>
          </div>

          <button type="submit" :disabled="isSubmitting || !form.employee_id" class="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700">
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan Draft Gaji' }}
          </button>
        </form>
      </div>

      <!-- PANEL RINGKASAN (KANAN) -->
      <div class="lg:col-span-1">
        <div class="bg-gray-900 text-white rounded-lg p-6 sticky top-6">
          <h3 class="text-lg font-bold border-b border-gray-700 pb-3 mb-4">Ringkasan (Live)</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between"><span class="text-gray-400">Total Pendapatan:</span><span class="font-semibold text-green-400">{{ formatRupiah(calculatedGross) }}</span></div>
            <div class="flex justify-between"><span class="text-gray-400">Total Potongan:</span><span class="font-semibold text-red-400">- {{ formatRupiah(calculatedDeductions) }}</span></div>
            <div v-if="form.adjustment !== 0" class="flex justify-between"><span class="text-gray-400">Penyesuaian:</span><span class="font-semibold text-yellow-400">{{ formatRupiah(form.adjustment) }}</span></div>
          </div>
          <div class="mt-6 pt-4 border-t border-gray-700">
            <div class="text-sm text-gray-400 mb-1">Take Home Pay</div>
            <div class="text-3xl font-black text-white">{{ formatRupiah(calculatedNet) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '../lib/axios'
import Swal from 'sweetalert2'

const router = useRouter()
const isSubmitting = ref(false)
const isCalculating = ref(false)
const employees = ref([])
const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const form = reactive({
  employee_id: '',
  period_month: new Date().getMonth() + 1,
  period_year: new Date().getFullYear(),
  basic_salary: 0,
  
  position_allowance: 0,
  meal_allowance: 0,
  transport_allowance: 0,
  total_overtime: 0,
  
  absence_deduction: 0,
  late_deduction: 0,
  bpjs_health: 0,
  bpjs_jht: 0,
  bpjs_jp: 0,
  pph21_deduction: 0,
  
  adjustment: 0,
  adjustment_note: '',
  calculation_details: {} 
})

const calculatedGross = computed(() => (form.basic_salary || 0) + (form.position_allowance || 0) + (form.meal_allowance || 0) + (form.transport_allowance || 0) + (form.total_overtime || 0))
const calculatedDeductions = computed(() => (form.absence_deduction || 0) + (form.late_deduction || 0) + (form.bpjs_health || 0) + (form.bpjs_jht || 0) + (form.bpjs_jp || 0) + (form.pph21_deduction || 0))
const calculatedNet = computed(() => calculatedGross.value - calculatedDeductions.value + (form.adjustment || 0))

const fetchEmployees = async () => {
  try {
    const res = await api.get('/references/employee-options')
    // Mengambil array 'employees' dari response reference
    employees.value = res.data.data.employees || []
  } catch (error) {
    console.error('Gagal mengambil data karyawan:', error)
  }
}

const autoCalculate = async (isEmployeeChange = false) => {
  if (!form.employee_id || !form.period_month || !form.period_year) return;
  isCalculating.value = true;
  try {
    const res = await api.get('/payrolls/preview', {
      params: {
        employee_id: form.employee_id, period_month: form.period_month, period_year: form.period_year,
        position_allowance: form.position_allowance, meal_allowance: form.meal_allowance, transport_allowance: form.transport_allowance
      }
    })
    const data = res.data.data;
    
    form.basic_salary = data.basic_salary;
    form.total_overtime = data.total_overtime;
    form.absence_deduction = data.absence_deduction;
    form.late_deduction = data.late_deduction;
    
    /// KODE BENAR (Full English, sesuai dengan Controller)
    if (isEmployeeChange) {
      form.position_allowance = data.default_position_allowance;
      form.meal_allowance = data.default_meal_allowance;
      form.transport_allowance = data.default_transport_allowance;
    }
    
    // KODE BENAR (Sudah Full English)
    form.bpjs_health = data.bpjs_health; 
    form.bpjs_jht = data.bpjs_jht;
    form.bpjs_jp = data.bpjs_jp;
    form.pph21_deduction = data.pph21_deduction;
    form.calculation_details = data.calculation_details;
  } catch (error) { console.error(error) } finally { isCalculating.value = false; }
}

watch(() => form.employee_id, () => autoCalculate(true))
watch([() => form.period_month, () => form.period_year, () => form.position_allowance, () => form.meal_allowance, () => form.transport_allowance], () => {
  if (form.employee_id) autoCalculate(false)
})

const submitForm = async () => {
  isSubmitting.value = true
  try {
    await api.post('/payrolls', form)
    await Swal.fire('Berhasil!', 'Draft gaji disimpan.', 'success')
    router.push('/payrolls')
  } catch (error) { Swal.fire('Error', 'Gagal menyimpan.', 'error') } 
  finally { isSubmitting.value = false }
}

const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka)

onMounted(() => fetchEmployees())
</script>