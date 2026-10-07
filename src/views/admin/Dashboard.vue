<template>
  <div class="p-6 md:p-8">
    <div class="max-w-7xl mx-auto">
      
      <!-- HEADER -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Dashboard Eksekutif</h1>
        <p class="text-sm text-gray-500 mt-1">Ringkasan analitik sumber daya manusia dan pengeluaran finansial.</p>
      </div>

      <!-- LOADING STATE -->
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <span class="text-blue-600 font-medium animate-pulse">Memuat analitik...</span>
      </div>

      <div v-else>
        <!-- KARTU METRIK UTAMA -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div class="p-4 bg-blue-50 text-blue-600 rounded-xl">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-500">Total Karyawan Aktif</p>
              <h3 class="text-2xl font-black text-gray-900">{{ metrics.total_employees }} <span class="text-sm font-normal text-gray-500">Orang</span></h3>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div class="p-4 bg-teal-50 text-teal-600 rounded-xl">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-500">Total Take Home Pay (Bulan Ini)</p>
              <h3 class="text-2xl font-black text-gray-900">{{ formatRupiah(metrics.total_net_salary) }}</h3>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div class="p-4 bg-red-50 text-red-600 rounded-xl">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"></path></svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-500">Pajak PPh21 Disetor (Bulan Ini)</p>
              <h3 class="text-2xl font-black text-gray-900">{{ formatRupiah(metrics.total_pph21) }}</h3>
            </div>
          </div>
          
        </div>

        <!-- GRAFIK TREND PENGELUARAN -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Trend Pengeluaran Gaji (6 Bulan Terakhir)</h2>
          <apexchart 
            type="area" 
            height="350" 
            :options="chartOptions" 
            :series="chartSeries"
          ></apexchart>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../lib/axios'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts

const isLoading = ref(true)
const metrics = ref({ total_employees: 0, total_net_salary: 0, total_pph21: 0 })

const chartSeries = ref([])
const chartOptions = ref({
  chart: {
    type: 'area',
    fontFamily: 'inherit',
    toolbar: { show: false }
  },
  colors: ['#94a3b8', '#0d9488'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  xaxis: {
    categories: [],
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: {
      formatter: (value) => { return 'Rp ' + (value / 1000000).toFixed(1) + ' Jt' }
    }
  },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
  tooltip: {
    y: { formatter: (val) => formatRupiah(val) }
  }
})

const fetchDashboardData = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/dashboard')
    const data = res.data.data
    
    metrics.value = data.metrics
    
    chartOptions.value = {
      ...chartOptions.value,
      xaxis: { categories: data.chart.categories }
    }
    chartSeries.value = data.chart.series

  } catch (error) {
    console.error('Gagal memuat dashboard', error)
  } finally {
    isLoading.value = false
  }
}

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0)
}

onMounted(() => fetchDashboardData())
</script>