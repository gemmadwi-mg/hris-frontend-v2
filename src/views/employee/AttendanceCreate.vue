<template>
  <div class="max-w-md mx-auto space-y-5">
    
    <!-- HEADER & TOMBOL KEMBALI -->
    <div class="flex items-center gap-3">
      <button @click="router.push('/employee/dashboard')" class="p-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition shadow-sm">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      </button>
      <div>
        <h1 class="text-xl font-bold text-gray-900">Presensi Karyawan</h1>
        <p class="text-xs text-gray-500">Ambil selfie & pastikan lokasi GPS sesuai.</p>
      </div>
    </div>

    <!-- TIPE ABSENSI (CHECK-IN / CHECK-OUT) -->
    <div class="grid grid-cols-2 gap-2 bg-gray-200/60 p-1.5 rounded-2xl border border-gray-200">
      <!-- TAB CLOCK IN -->
      <button 
        @click="attendanceType = 'In'" 
        :disabled="hasClockedIn"
        :class="[
          'py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2',
          attendanceType === 'In' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900',
          hasClockedIn ? 'opacity-40 cursor-not-allowed select-none' : ''
        ]"
      >
        <span class="w-2 h-2 rounded-full bg-emerald-300"></span>
        Clock In {{ hasClockedIn ? '(Sudah)' : '(Masuk)' }}
      </button>

      <!-- TAB CLOCK OUT (Bisa diakses jika sudah Clock In) -->
      <button 
        @click="attendanceType = 'Out'" 
        :disabled="!hasClockedIn || hasClockedOut"
        :class="[
          'py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2',
          attendanceType === 'Out' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900',
          (!hasClockedIn || hasClockedOut) ? 'opacity-40 cursor-not-allowed select-none' : ''
        ]"
      >
        <span class="w-2 h-2 rounded-full bg-blue-300"></span>
        Clock Out {{ hasClockedOut ? '(Sudah)' : '(Pulang)' }}
      </button>
    </div>

    <!-- BANNER PERINGATAN JAM ABSENSI MASUK -->
    <div 
      v-if="attendanceType === 'In' && !isClockInTimeValid" 
      class="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs font-semibold text-center leading-relaxed"
    >
      ⏰ Presensi Masuk (Clock In) belum dibuka. Presensi dibuka pukul 06:00 - 13:00 WIB.
    </div>

    <!-- BANNER PERINGATAN PULANG CEPAT -->
    <div 
      v-if="attendanceType === 'Out' && hasClockedIn && !hasClockedOut && !isClockOutTimeValid" 
      class="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold text-center leading-relaxed"
    >
      ⚠️ Anda presensi sebelum jam 16:00 WIB. Status akan dicatat sebagai <strong>Pulang Cepat (Early Depart)</strong>.
    </div>

    <!-- BOX CAMERA SELFIE -->
    <div class="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm space-y-3">
      <div class="flex justify-between items-center">
        <span class="text-xs font-bold text-gray-700 flex items-center gap-1.5">
          📷 Verifikasi Wajah (Selfie)
        </span>
        <span v-if="capturedImage" class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
          ✓ Foto Terekam
        </span>
      </div>

      <div class="relative w-full aspect-square bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300">
        <!-- Live Camera Stream -->
        <video 
          v-show="isCameraActive && !capturedImage" 
          ref="videoRef" 
          autoplay 
          playsinline 
          class="w-full h-full object-cover scale-x-[-1]"
        ></video>

        <!-- Preview Foto Terfoto -->
        <img 
          v-if="capturedImage" 
          :src="capturedImage" 
          class="w-full h-full object-cover scale-x-[-1]" 
          alt="Selfie Attendance" 
        />

        <!-- Hidden Canvas for Capture -->
        <canvas ref="canvasRef" class="hidden"></canvas>

        <!-- Overlay Status Kamera Mati/Loading -->
        <div v-if="!isCameraActive && !capturedImage" class="text-center p-4">
          <p class="text-xs text-slate-400 mb-3">{{ cameraErrorMessage || 'Kamera belum diaktifkan' }}</p>
          <button @click="startCamera" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-sm">
            Buka Kamera
          </button>
        </div>
      </div>

      <!-- Action Button Kamera -->
      <div class="flex gap-2">
        <button 
          v-if="isCameraActive && !capturedImage" 
          @click="takeSnapshot" 
          class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h0.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
          Ambil Foto Selfie
        </button>

        <button 
          v-if="capturedImage" 
          @click="resetSnapshot" 
          class="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 border border-gray-200"
        >
          🔄 Foto Ulang
        </button>
      </div>
    </div>

    <!-- BOX LOKASI GEOLOCATION GPS -->
    <div class="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm space-y-3">
      <div class="flex justify-between items-center">
        <span class="text-xs font-bold text-gray-700 flex items-center gap-1.5">
          📍 Lokasi GPS (Geofencing)
        </span>
        <button @click="fetchLocation" class="text-[10px] font-bold text-blue-600 hover:underline">
          Refresh GPS
        </button>
      </div>

      <!-- Detail Lokasi -->
      <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
        <div v-if="isLoadingLocation" class="text-center py-2">
          <span class="text-xs font-semibold text-blue-600 animate-pulse">Mendeteksi koordinat GPS...</span>
        </div>

        <div v-else-if="location.latitude" class="space-y-1.5 text-xs">
          <div class="flex justify-between">
            <span class="text-gray-400">Koordinat:</span>
            <span class="font-mono font-bold text-gray-800">{{ location.latitude.toFixed(6) }}, {{ location.longitude.toFixed(6) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Jarak ke Kantor:</span>
            <span :class="['font-bold', location.isWithinRadius ? 'text-emerald-600' : 'text-red-600']">
              ± {{ location.distance }} Meter
            </span>
          </div>
          
          <div :class="['p-2 rounded-xl text-[11px] font-semibold flex items-center gap-2 mt-2', location.isWithinRadius ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200']">
            <span>{{ location.isWithinRadius ? '✅ Dalam Radius Kantor (Presensi Diizinkan)' : '❌ Di Luar Radius Kantor (Maks. 100m)' }}</span>
          </div>
        </div>

        <div v-else class="text-center py-2">
          <p class="text-xs text-red-500 font-medium mb-1">{{ locationError || 'Gagal mengambil lokasi GPS' }}</p>
          <button @click="fetchLocation" class="text-xs text-blue-600 font-bold underline">Coba Lagi</button>
        </div>
      </div>
    </div>

    <!-- TOMBOL SUBMIT PRESENSI (💡 Pembatasan Jam Out Dihapus dari :disabled) -->
    <button 
      @click="submitAttendance" 
      :disabled="isSubmitting || !capturedImage || !location.isWithinRadius || (attendanceType === 'In' && !isClockInTimeValid)"
      class="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
    >
      <span v-if="isSubmitting" class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
      {{ isSubmitting ? 'Mengirim Data...' : `Kirim Presensi ${attendanceType === 'In' ? 'Masuk' : 'Pulang'}` }}
    </button>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../../lib/axios'
import { useAuthStore } from '../../stores/auth'
import Swal from 'sweetalert2'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// KONFIGURASI KOORDINAT KANTOR PUSAT & JAM PRESENSI
const OFFICE_LAT = -7.343063
const OFFICE_LNG = 112.723965
const MAX_RADIUS_METERS = 100

const START_CLOCK_IN_HOUR = 6
const END_CLOCK_IN_HOUR = 13

// STATE MANAGEMENT PRESENSI
const todayAttendance = ref(null)
const isLoadingStatus = ref(true)

// 🔒 COMPUTED STATUS ABSENSI HARI INI
const hasClockedIn = computed(() => !!todayAttendance.value?.clock_in)
const hasClockedOut = computed(() => !!todayAttendance.value?.clock_out)

// STATE TIPE ABSENSI
const attendanceType = ref('In')

const isCameraActive = ref(false)
const cameraErrorMessage = ref('')
const capturedImage = ref(null)
const capturedBlob = ref(null)

const videoRef = ref(null)
const canvasRef = ref(null)
let mediaStream = null

const isLoadingLocation = ref(true)
const locationError = ref('')
const location = ref({
  latitude: null,
  longitude: null,
  distance: 0,
  isWithinRadius: false
})

const isSubmitting = ref(false)

// 🕒 CEK KELAYAKAN WAKTU CLOCK IN & OUT (FRONTEND)
const isClockInTimeValid = computed(() => {
  const currentHour = new Date().getHours()
  return currentHour >= START_CLOCK_IN_HOUR && currentHour < END_CLOCK_IN_HOUR
})

const isClockOutTimeValid = computed(() => {
  const hour = new Date().getHours()
  return hour >= 16 // Jam standar pulang (16:00 WIB)
})

// 🔍 FETCH STATUS PRESENSI HARI INI
const fetchTodayAttendanceStatus = async () => {
  isLoadingStatus.value = true
  try {
    const response = await api.get('/employee/dashboard-summary')
    if (response.data?.success) {
      todayAttendance.value = response.data.data.today_attendance

      if (route.query.type) {
        attendanceType.value = route.query.type
      } else if (hasClockedIn.value && !hasClockedOut.value) {
        attendanceType.value = 'Out'
      } else {
        attendanceType.value = 'In'
      }
    }
  } catch (error) {
    console.error('Gagal mengambil status presensi hari ini:', error)
  } finally {
    isLoadingStatus.value = false
  }
}

// 1. KAMERA WEBCAM / HP
const startCamera = async () => {
  cameraErrorMessage.value = ''
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
      audio: false
    })
    
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
      isCameraActive.value = true
    }
  } catch (error) {
    console.error('Error mengakses kamera:', error)
    cameraErrorMessage.value = 'Izin kamera ditolak atau tidak tersedia pada perangkat.'
    isCameraActive.value = false
  }
}

const stopCamera = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
  isCameraActive.value = false
}

const takeSnapshot = () => {
  const video = videoRef.value
  const canvas = canvasRef.value
  if (!video || !canvas) return

  const context = canvas.getContext('2d')
  canvas.width = video.videoWidth || 640
  canvas.height = video.videoHeight || 640

  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  
  capturedImage.value = canvas.toDataURL('image/jpeg', 0.8)
  canvas.toBlob((blob) => {
    capturedBlob.value = blob
  }, 'image/jpeg', 0.8)

  stopCamera()
}

const resetSnapshot = () => {
  capturedImage.value = null
  capturedBlob.value = null
  startCamera()
}

// 2. GEOLOCATION GPS & HAVERSINE RADIUS CALCULATION
// 2. GEOLOCATION GPS & HAVERSINE RADIUS CALCULATION
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3 // Radius bumi dalam meter
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return Math.round(R * c) // Jarak dalam satuan Meter
}

const fetchLocation = () => {
  isLoadingLocation.value = true
  locationError.value = ''

  if (!navigator.geolocation) {
    locationError.value = 'Browser Anda tidak mendukung Geolocation.'
    isLoadingLocation.value = false
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude
      const userLng = position.coords.longitude

      const dist = calculateDistance(userLat, userLng, OFFICE_LAT, OFFICE_LNG)

      location.value = {
        latitude: userLat,
        longitude: userLng,
        distance: dist,
        isWithinRadius: dist <= MAX_RADIUS_METERS
      }
      isLoadingLocation.value = false
    },
    (error) => {
      console.error('Error Geolocation:', error)
      locationError.value = 'Gagal mengambil koordinat GPS. Pastikan Izin Lokasi diaktifkan.'
      isLoadingLocation.value = false
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
}

const submitAttendance = async () => {
  if (attendanceType.value === 'In' && !isClockInTimeValid.value) {
    return Swal.fire('Belum Waktunya Presensi', 'Presensi Masuk (Clock In) hanya dapat dilakukan antara pukul 06:00 - 13:00 WIB.', 'warning')
  }

  // 💡 DIALOG KONFIRMASI JIKA CLOCK OUT SEBELUM JAM 16:00 WIB (PULANG CEPAT)
  if (attendanceType.value === 'Out' && !isClockOutTimeValid.value) {
    const confirmEarly = await Swal.fire({
      title: 'Konfirmasi Pulang Cepat',
      text: 'Saat ini belum memasuki jam pulang normal (16:00 WIB). Absensi Anda akan dicatat sebagai "Pulang Cepat / Early Depart". Lanjutkan?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Clock Out',
      cancelButtonText: 'Batal'
    })

    if (!confirmEarly.isConfirmed) return
  }

  if (!capturedBlob.value) {
    return Swal.fire('Peringatan', 'Foto selfie wajib diambil!', 'warning')
  }
  if (!location.value.isWithinRadius) {
    return Swal.fire('Akses Ditolak', 'Lokasi Anda berada di luar radius kantor.', 'error')
  }

  isSubmitting.value = true

  const employeeId = authStore.user?.employee_id || authStore.user?.id
  const branchId = authStore.user?.branch_id || authStore.user?.employee?.branch_id || 'BRANCH01'

  const formData = new FormData()
  formData.append('employee_id', employeeId)
  formData.append('branch_id', branchId)
  formData.append('type', attendanceType.value)
  formData.append('latitude', location.value.latitude)
  formData.append('longitude', location.value.longitude)
  formData.append('photo', capturedBlob.value, `selfie_${Date.now()}.jpg`)

  try {
    await api.post('/attendances', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    Swal.fire({
      icon: 'success',
      title: `Berhasil Clock ${attendanceType.value === 'In' ? 'In' : 'Out'}!`,
      text: 'Presensi Anda telah tersimpan.',
      timer: 1800,
      showConfirmButton: false
    })

    router.push('/employee/dashboard')
  } catch (error) {
    console.error('Submit Error:', error)
    Swal.fire('Gagal Presensi', error.response?.data?.message || 'Terjadi kesalahan sistem.', 'error')
  } finally {
    isSubmitting.value = false
  }
}

// LIFECYCLE
onMounted(() => {
  fetchTodayAttendanceStatus()
  startCamera()
  fetchLocation()
})

onUnmounted(() => {
  stopCamera()
})
</script>