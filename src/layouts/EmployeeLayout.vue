<template>
  <div class="min-h-screen bg-slate-100 flex justify-center py-0 md:py-6">
    
    <!-- CONTAINER UTAMA TAMPILAN MOBILE APP -->
    <div class="w-full max-w-md bg-gray-50 min-h-screen md:min-h-[820px] md:rounded-3xl md:shadow-2xl md:border border-gray-200 overflow-hidden flex flex-col justify-between relative">
      
      <!-- TEMPAT HALAMAN ANAK BERGANTI (Dashboard, Absen, Cuti, Slip Gaji) -->
      <main class="flex-1 pb-20 overflow-y-auto">
        <router-view />
      </main>

      <!-- BOTTOM NAVIGATION BAR MANDIRI -->
      <nav class="fixed md:absolute bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-md border-t border-gray-200 p-2 flex justify-around items-center z-50 md:rounded-b-3xl">
        
        <router-link to="/employee/dashboard" active-class="text-blue-600 font-bold" class="flex flex-col items-center gap-0.5 text-gray-400 p-2 text-xs">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l1.293 1.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
          <span class="text-[10px]">Beranda</span>
        </router-link>

        <router-link to="/employee/attendances" active-class="text-blue-600 font-bold" class="flex flex-col items-center gap-0.5 text-gray-400 p-2 text-xs">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span class="text-[10px]">Absensi</span>
        </router-link>

        <router-link to="/employee/leaves" active-class="text-blue-600 font-bold" class="flex flex-col items-center gap-0.5 text-gray-400 p-2 text-xs">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <span class="text-[10px]">Cuti</span>
        </router-link>

        <router-link to="/employee/payrolls" active-class="text-blue-600 font-bold" class="flex flex-col items-center gap-0.5 text-gray-400 p-2 text-xs">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span class="text-[10px]">Slip Gaji</span>
        </router-link>

      </nav>

    </div>
  </div>
</template>