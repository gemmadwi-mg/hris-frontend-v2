<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    
    <!-- 1. TOP NAVBAR (HANYA MUNCUL DI PC / TABLET) -->
    <header class="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div class="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black">
            HR
          </div>
          <div>
            <h1 class="text-base font-bold text-gray-900 leading-tight">Portal Karyawan</h1>
            <p class="text-xs text-gray-500">PT TEKNOLOGI NUSANTARA</p>
          </div>
        </div>

        <!-- Menu Navigasi Desktop -->
        <nav class="flex items-center gap-1 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
          <router-link to="/employee/dashboard" active-class="bg-white text-blue-600 shadow-sm" class="px-4 py-2 text-xs font-bold text-gray-600 rounded-lg transition">
            Beranda
          </router-link>
          <router-link to="/employee/attendances" active-class="bg-white text-blue-600 shadow-sm" class="px-4 py-2 text-xs font-bold text-gray-600 rounded-lg transition">
            Presensi
          </router-link>
          <router-link to="/employee/leaves" active-class="bg-white text-blue-600 shadow-sm" class="px-4 py-2 text-xs font-bold text-gray-600 rounded-lg transition">
            Pengajuan Cuti
          </router-link>
        </nav>

        <!-- Profil & Logout Desktop -->
        <div class="flex items-center gap-3">
          <div class="text-right">
            <p class="text-xs font-bold text-gray-900">{{ authStore.user?.full_name || 'Karyawan' }}</p>
            <p class="text-[10px] text-gray-500">{{ authStore.user?.job_title || 'Employee' }}</p>
          </div>
          <button @click="authStore.logout()" class="p-2 text-gray-400 hover:text-red-600 rounded-lg transition" title="Keluar">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </div>
    </header>

    <!-- 2. KONTEN HALAMAN (RESPONSIF DI HP MAUPUN PC) -->
    <main class="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8 pb-24 md:pb-8">
      <router-view />
    </main>

    <!-- 3. BOTTOM NAV BAR (HANYA MUNCUL DI SMARTPHONE) -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-2 flex justify-around items-center z-50">
      <router-link to="/employee/dashboard" active-class="text-blue-600 font-bold" class="flex flex-col items-center gap-0.5 text-gray-400 p-1.5 text-[10px]">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l1.293 1.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
        <span>Beranda</span>
      </router-link>

      <router-link to="/employee/attendances" active-class="text-blue-600 font-bold" class="flex flex-col items-center gap-0.5 text-gray-400 p-1.5 text-[10px]">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span>Absensi</span>
      </router-link>

      <button @click="authStore.logout()" class="flex flex-col items-center gap-0.5 text-gray-400 p-1.5 text-[10px]">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
        <span>Keluar</span>
      </button>
    </nav>

  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
const authStore = useAuthStore()
</script>