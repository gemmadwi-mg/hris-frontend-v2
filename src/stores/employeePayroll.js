import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from '../lib/axios'; // Axios instance yang sudah terpasang Sanctum Token

export const useEmployeePayrollStore = defineStore('employeePayroll', () => {
  const payrolls = ref([]);
  const selectedPayroll = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  // Fetch riwayat slip gaji milik karyawan yang sedang login
  const fetchMyPayrolls = async (year = new Date().getFullYear()) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await axios.get(`payrolls`, {
        params: { year }
      });
      payrolls.value = response.data.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Gagal mengambil data slip gaji';
    } finally {
      isLoading.value = false;
    }
  };

  // Fetch detail slip gaji spesifik
  const fetchPayrollDetail = async (id) => {
    isLoading.value = true;
    try {
      const response = await axios.get(`/api/employee/payrolls/${id}`);
      selectedPayroll.value = response.data.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Gagal mengambil detail slip gaji';
    } finally {
      isLoading.value = false;
    }
  };

  // Download PDF Slip Gaji (Response Type Blob)
  const downloadSlipPdf = async (id, payrollId) => {
    try {
      const response = await axios.get(`/api/employee/payrolls/${id}/download-pdf`, {
        responseType: 'blob'
      });
      
      // Buat temporary link untuk download PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Slip_Gaji_${payrollId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      alert('Gagal mengunduh PDF slip gaji.');
    }
  };

  return {
    payrolls,
    selectedPayroll,
    isLoading,
    error,
    fetchMyPayrolls,
    fetchPayrollDetail,
    downloadSlipPdf
  };
});