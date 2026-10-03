<template>
    <div class="min-h-screen bg-gray-50 flex flex-col md:flex-row">

        <!-- SIDEBAR KIRI (VERTICAL STEPPER) -->
        <aside class="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10 shrink-0">
            <!-- Header Sidebar -->
            <div class="p-6 border-b border-gray-200 flex items-center gap-3">
                <button @click="router.push('/employees')"
                    class="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition" title="Batal & Kembali">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                </button>
                <div>
                    <h1 class="text-lg font-bold text-gray-900">Karyawan Baru</h1>
                    <p class="text-xs text-gray-500">Mode Wizard Pengisian Data</p>
                </div>
            </div>

            <!-- Stepper List -->
            <div class="p-8 flex-1 overflow-y-auto">
                <ul class="space-y-8">
                    <li v-for="(item, index) in stepsList" :key="index" class="relative flex items-start gap-4">

                        <!-- Garis Vertikal Penghubung -->
                        <div v-if="index !== stepsList.length - 1"
                            :class="['absolute left-4 top-8 bottom-[-32px] w-0.5 z-0 transition-colors duration-300', step > index + 1 ? 'bg-blue-600' : 'bg-gray-200']">
                        </div>

                        <!-- Lingkaran Angka/Icon -->
                        <div
                            :class="['relative z-10 w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300', step > index + 1 ? 'bg-blue-600 border-blue-600 text-white' : step === index + 1 ? 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-50' : 'bg-white border-gray-300 text-gray-400']">
                            <svg v-if="step > index + 1" class="w-4 h-4" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span v-else>{{ index + 1 }}</span>
                        </div>

                        <!-- Label Title & Deskripsi -->
                        <div class="flex flex-col pt-1">
                            <span
                                :class="['text-sm font-bold transition-colors', step >= index + 1 ? 'text-gray-900' : 'text-gray-400']">{{
                                    item.title }}</span>
                            <span class="text-xs text-gray-500 mt-1">{{ item.desc }}</span>
                        </div>

                    </li>
                </ul>
            </div>
        </aside>

        <!-- KONTEN KANAN (AREA FORM) -->
        <main class="flex-1 p-6 md:p-12 overflow-y-auto">
            <div class="max-w-3xl mx-auto">

                <div v-if="errorMessage"
                    class="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                    {{ errorMessage }}
                </div>

                <form @submit.prevent="submitForm" class="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">

                    <!-- STEP 1: Data Pribadi & Autentikasi -->
                    <div v-show="step === 1" id="step-1"
                        class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                        <div class="md:col-span-2">
                            <h2 class="text-xl font-bold text-gray-900 mb-2">Profil Pribadi</h2>
                            <p class="text-sm text-gray-500 border-b pb-4 mb-2">Masukkan identitas asli dan data login
                                karyawan.</p>
                        </div>

                        <div><label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label><input
                                v-model="form.full_name" type="text" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-1">NIK (KTP) *</label><input
                                v-model="form.nik" type="text" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-1">Email Karyawan *</label><input
                                v-model="form.email" type="email" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-1">Password Sementara
                                *</label><input v-model="form.password" type="password" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir *</label><input
                                v-model="form.date_of_birth" type="date" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin *</label>
                            <select v-model="form.gender" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none">
                                <option value="Male">Laki-laki</option>
                                <option value="Female">Perempuan</option>
                            </select>
                        </div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-1">Nomor HP</label><input
                                v-model="form.phone_number" type="text"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <div class="md:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Alamat
                                Lengkap *</label><textarea v-model="form.address" rows="2" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                        </div>
                    </div>

                    <!-- STEP 2: Pekerjaan & Penempatan -->
                    <div v-show="step === 2" id="step-2"
                        class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                        <div class="md:col-span-2">
                            <h2 class="text-xl font-bold text-gray-900 mb-2">Data Pekerjaan</h2>
                            <p class="text-sm text-gray-500 border-b pb-4 mb-2">Tentukan jabatan, status, dan penempatan
                                cabang.</p>
                        </div>

                        <div><label class="block text-sm font-medium text-gray-700 mb-1">Nama Jabatan *</label><input
                                v-model="form.job_title" type="text" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <!-- Pilihan 2: Jika ingin HRD memilih dari opsi statis yang sudah Anda tentukan -->
                        <div>
                            <label>Departemen</label>
                            <select v-model="form.department" class="form-select">
                                <option value="">Pilih Departemen</option>
                                <option value="Information Technology">Information Technology</option>
                                <option value="Human Resources">Human Resources</option>
                                <option value="Finance">Finance</option>
                                <option value="Marketing">Marketing</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Status Karyawan *</label>
                            <select v-model="form.employment_status" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none">
                                <option value="Permanent">Permanent</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                                <option value="Freelance">Freelance</option>
                            </select>
                        </div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Bergabung
                                *</label><input v-model="form.join_date" type="date" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-1">Kuota Cuti
                                Tahunan</label><input v-model="form.annual_leave_quota" type="number"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>

                        <div class="md:col-span-2 border-t pt-4 mt-2">
                            <h3 class="text-sm font-bold text-gray-400 uppercase">Relasi Sistem & Akses</h3>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Role Akses *</label>
                            <select v-model="form.role_id" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none">
                                <option value="" disabled>-- Pilih Role --</option>
                                <option v-for="role in options.roles" :key="role.role_id" :value="role.role_id">{{
                                    role.role_name }}</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Perusahaan Utama *</label>
                            <select v-model="form.company_id" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none">
                                <option value="" disabled>-- Pilih Perusahaan --</option>
                                <option v-for="company in options.companies" :key="company.company_id"
                                    :value="company.company_id">{{ company.company_name }}</option>
                            </select>
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Cabang Penempatan</label>
                            <select v-model="form.branch_id"
                                class="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none">
                                <option value="">-- Pusat (Tanpa Cabang) --</option>
                                <option v-for="branch in options.branches" :key="branch.branch_id"
                                    :value="branch.branch_id">{{ branch.branch_name }}</option>
                            </select>
                        </div>
                    </div>

                    <!-- STEP 3: Finansial & Tambahan -->
                    <div v-show="step === 3" id="step-3"
                        class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                        <div class="md:col-span-2">
                            <h2 class="text-xl font-bold text-gray-900 mb-2">Informasi Gaji & Finansial</h2>
                            <p class="text-sm text-gray-500 border-b pb-4 mb-2">Atur komponen gaji tetap dan informasi
                                rekening bank.</p>
                        </div>

                        <div><label class="block text-sm font-medium text-gray-700 mb-1">Gaji Pokok</label><input
                                v-model="form.basic_salary" type="number"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-1">Tunjangan Jabatan</label><input
                                v-model="form.position_allowance" type="number"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-1">Tunjangan Makan</label><input
                                v-model="form.meal_allowance" type="number"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-1">Tunjangan
                                Transportasi</label><input v-model="form.transport_allowance" type="number"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>

                        <div class="md:col-span-2 border-t pt-4 mt-2">
                            <h3 class="text-sm font-bold text-gray-400 uppercase">Rekening & Administrasi</h3>
                        </div>

                        <div><label class="block text-sm font-medium text-gray-700 mb-1">Nama Bank</label><input
                                v-model="form.bank_name" type="text" placeholder="Misal: BCA"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-1">Nomor Rekening</label><input
                                v-model="form.account_number" type="text"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-1">A/N Rekening</label><input
                                v-model="form.account_holder_name" type="text"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Golongan PTKP (Pajak) *</label>
                            <select v-model="form.ptkp_group_id" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none">
                                <option value="" disabled>-- Pilih Golongan PTKP --</option>
                                <!-- Melakukan perulangan data PTKP dari API -->
                                <option v-for="ptkp in options.ptkp_groups" :key="ptkp.ptkp_group_id"
                                    :value="ptkp.ptkp_group_id">
                                    {{ ptkp.ptkp_group_name }} - {{ ptkp.description }}
                                </option>
                            </select>
                        </div>
                        <div class="md:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Nomor
                                BPJS Kesehatan</label><input v-model="form.bpjs_health_number" type="text"
                                class="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                    </div>

                    <!-- STEP 4: PREVIEW & KONFIRMASI -->
                    <div v-show="step === 4" class="animate-in fade-in duration-300 space-y-6">
                        <div class="border-b pb-4 mb-4">
                            <h2 class="text-xl font-bold text-gray-900 mb-2">Preview & Konfirmasi</h2>
                            <p class="text-sm text-gray-500">Pastikan seluruh data yang telah dimasukkan sudah akurat
                                sebelum disimpan ke database.</p>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                            <!-- Blok 1: Review Pribadi -->
                            <div class="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <h3
                                    class="text-sm font-bold text-gray-400 uppercase mb-4 border-b border-gray-200 pb-2">
                                    1. Profil Pribadi</h3>
                                <dl class="space-y-3 text-sm">
                                    <div class="flex justify-between">
                                        <dt class="text-gray-500">Nama Lengkap</dt>
                                        <dd class="font-semibold text-gray-900 text-right">{{ form.full_name || '-' }}
                                        </dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt class="text-gray-500">NIK (KTP)</dt>
                                        <dd class="font-semibold text-gray-900 text-right">{{ form.nik || '-' }}</dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt class="text-gray-500">Tanggal Lahir</dt>
                                        <dd class="font-semibold text-gray-900 text-right">{{ form.date_of_birth || '-'
                                            }}</dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt class="text-gray-500">Jenis Kelamin</dt>
                                        <dd class="font-semibold text-gray-900 text-right">{{ form.gender === 'Male' ?
                                            'Laki-laki' : 'Perempuan' }}</dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt class="text-gray-500">Nomor HP</dt>
                                        <dd class="font-semibold text-gray-900 text-right">{{ form.phone_number || '-'
                                            }}</dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt class="text-gray-500">Email Login</dt>
                                        <dd class="font-semibold text-gray-900 text-right">{{ form.email || '-' }}</dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt class="text-gray-500">Password</dt>
                                        <dd class="font-semibold text-gray-400 text-right">••••••••</dd>
                                    </div>
                                    <div class="flex flex-col mt-3 pt-3 border-t border-gray-200">
                                        <dt class="text-gray-500 mb-1">Alamat Lengkap</dt>
                                        <dd
                                            class="font-medium text-gray-900 bg-white p-3 rounded-lg border border-gray-200">
                                            {{ form.address || '-' }}</dd>
                                    </div>
                                </dl>
                            </div>

                            <!-- Blok 2: Review Pekerjaan -->
                            <div class="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <h3
                                    class="text-sm font-bold text-gray-400 uppercase mb-4 border-b border-gray-200 pb-2">
                                    2. Data Pekerjaan</h3>
                                <dl class="space-y-3 text-sm">
                                    <div class="flex justify-between">
                                        <dt class="text-gray-500">Jabatan</dt>
                                        <dd class="font-semibold text-gray-900 text-right">{{ form.job_title || '-' }}
                                        </dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt class="text-gray-500">Status Karyawan</dt>
                                        <dd class="font-semibold text-gray-900 text-right">{{ form.employment_status ||
                                            '-' }}</dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt class="text-gray-500">Tanggal Bergabung</dt>
                                        <dd class="font-semibold text-gray-900 text-right">{{ form.join_date || '-' }}
                                        </dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt class="text-gray-500">Kuota Cuti Tahunan</dt>
                                        <dd class="font-semibold text-gray-900 text-right">{{ form.annual_leave_quota }}
                                            Hari</dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt class="text-gray-500">Role Akses (Sistem)</dt>
                                        <dd class="font-semibold text-blue-600 text-right">{{ getRoleName(form.role_id)
                                            }}</dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt class="text-gray-500">Perusahaan Utama</dt>
                                        <dd class="font-semibold text-gray-900 text-right">{{
                                            getCompanyName(form.company_id) }}</dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt class="text-gray-500">Cabang Penempatan</dt>
                                        <dd class="font-semibold text-gray-900 text-right">{{
                                            getBranchName(form.branch_id) }}</dd>
                                    </div>
                                </dl>
                            </div>

                            <!-- Blok 3: Review Finansial (Full Width) -->
                            <div class="md:col-span-2 bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <h3
                                    class="text-sm font-bold text-gray-400 uppercase mb-4 border-b border-gray-200 pb-2">
                                    3. Gaji, Rekening & Administrasi</h3>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <!-- Sub-Blok Kiri: Rincian Gaji -->
                                    <dl class="space-y-3 text-sm">
                                        <div class="flex justify-between items-center">
                                            <dt class="text-gray-500">Gaji Pokok</dt>
                                            <dd class="font-semibold text-gray-900">{{ formatRupiah(form.basic_salary)
                                                }}</dd>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <dt class="text-gray-500">Tunjangan Jabatan</dt>
                                            <dd class="font-medium text-gray-600">{{
                                                formatRupiah(form.position_allowance) }}</dd>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <dt class="text-gray-500">Tunjangan Makan</dt>
                                            <dd class="font-medium text-gray-600">{{ formatRupiah(form.meal_allowance)
                                                }}</dd>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <dt class="text-gray-500">Tunjangan Transport</dt>
                                            <dd class="font-medium text-gray-600">{{
                                                formatRupiah(form.transport_allowance) }}</dd>
                                        </div>
                                        <div
                                            class="flex justify-between items-center pt-3 border-t border-gray-200 mt-2">
                                            <dt class="text-gray-900 font-bold">Total Gaji Kotor (Gross)</dt>
                                            <dd class="font-bold text-green-600 text-lg">{{
                                                formatRupiah(Number(form.basic_salary) + Number(form.position_allowance)
                                                    + Number(form.meal_allowance) + Number(form.transport_allowance)) }}
                                            </dd>
                                        </div>
                                    </dl>

                                    <!-- Sub-Blok Kanan: Bank & BPJS -->
                                    <dl class="space-y-3 text-sm">
                                        <div class="flex justify-between">
                                            <dt class="text-gray-500">Bank Transfer</dt>
                                            <dd class="font-semibold text-gray-900">{{ form.bank_name || '-' }}</dd>
                                        </div>
                                        <div class="flex justify-between">
                                            <dt class="text-gray-500">Nomor Rekening</dt>
                                            <dd class="font-semibold text-gray-900">{{ form.account_number || '-' }}
                                            </dd>
                                        </div>
                                        <div class="flex justify-between">
                                            <dt class="text-gray-500">Atas Nama Rekening</dt>
                                            <dd class="font-semibold text-gray-900">{{ form.account_holder_name || '-'
                                                }}</dd>
                                        </div>
                                        <div class="flex justify-between pt-3 border-t border-gray-200 mt-2">
                                            <dt class="text-gray-500">Golongan PTKP (Pajak)</dt>
                                            <dd class="font-semibold text-gray-900">{{ getPtkpName(form.ptkp_group_id)
                                                || '-' }}</dd>
                                        </div>
                                        <div class="flex justify-between">
                                            <dt class="text-gray-500">No. BPJS Kesehatan</dt>
                                            <dd class="font-semibold text-gray-900">{{ form.bpjs_health_number || '-' }}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                        </div>
                    </div>

                    <!-- TOMBOL NAVIGASI BAWAH -->
                    <div class="mt-10 flex justify-between items-center border-t border-gray-200 pt-6">
                        <button type="button" @click="prevStep"
                            :class="['px-6 py-2.5 rounded-lg text-sm font-medium border transition-colors', step === 1 ? 'opacity-0 cursor-default' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50']"
                            :disabled="step === 1">
                            Kembali
                        </button>

                        <button v-if="step < 4" type="button" @click="nextStep"
                            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                            Selanjutnya
                        </button>

                        <button v-if="step === 4" type="submit" :disabled="isSubmitting"
                            class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-md">
                            <span v-if="isSubmitting">Menyimpan...</span>
                            <span v-else>Konfirmasi & Simpan</span>
                        </button>
                    </div>

                </form>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../lib/axios'
import Swal from 'sweetalert2' // <-- TAMBAHKAN INI

const router = useRouter()
const step = ref(1)
const isSubmitting = ref(false)
const errorMessage = ref('')

// Daftar menu yang muncul di Sidebar Kiri
const stepsList = [
    { title: 'Data Pribadi', desc: 'Identitas & Autentikasi' },
    { title: 'Data Pekerjaan', desc: 'Jabatan, Status & Relasi' },
    { title: 'Data Finansial', desc: 'Komponen Gaji & Rekening' },
    { title: 'Preview & Simpan', desc: 'Cek kelengkapan data' }
]

const options = ref({ roles: [], companies: [], branches: [], ptkp_groups: [] })

const form = reactive({
    full_name: '', nik: '', email: '', password: '',
    date_of_birth: '', gender: 'Male', phone_number: '', address: '',
    job_title: '', departement: '', employment_status: 'Permanent', join_date: '', annual_leave_quota: 12,
    role_id: '', company_id: '', branch_id: '',
    basic_salary: 0, position_allowance: 0, meal_allowance: 0, transport_allowance: 0,
    bank_name: '', account_number: '', account_holder_name: '',
    ptkp_group_id: '', bpjs_health_number: ''
})

const fetchFormOptions = async () => {
    try {
        const response = await api.get('/references/employee-options')
        options.value = response.data.data
    } catch (error) {
        console.error('Gagal mengambil opsi form', error)
    }
}

const getRoleName = (id) => options.value.roles.find(r => r.role_id === id)?.role_name || '-'
const getCompanyName = (id) => options.value.companies.find(c => c.company_id === id)?.company_name || '-'

// TAMBAHKAN FUNGSI INI
const getBranchName = (id) => {
    if (!id) return 'Pusat (Tanpa Cabang)'
    return options.value.branches.find(b => b.branch_id === id)?.branch_name || '-'
}

const getPtkpName = (id) => options.value.ptkp_groups.find(p => p.ptkp_group_id === id)?.ptkp_group_name || '-'
const formatRupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value || 0)

const nextStep = () => {
    // Ambil elemen HTML (div) dari step yang saat ini sedang tampil
    const currentStepElement = document.getElementById(`step-${step.value}`)

    if (currentStepElement) {
        // Cari semua input, select, dan textarea hanya di dalam step ini
        const inputs = currentStepElement.querySelectorAll('input, select, textarea')

        // Cek satu per satu
        for (let input of inputs) {
            if (!input.reportValidity()) {
                return // Berhenti! Jangan pindah step. Biarkan browser memunculkan alert merah di kolom yang kosong
            }
        }
    }

    // Jika kode sampai ke sini, berarti semua input di step ini sudah valid
    if (step.value < 4) step.value++
}

const prevStep = () => {
    if (step.value > 1) step.value--
}

const submitForm = async () => {
    isSubmitting.value = true
    errorMessage.value = ''

    try {
        await api.post('/employees', form)

        // Notifikasi Sukses Cantik
        await Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Karyawan baru berhasil ditambahkan.',
            confirmButtonColor: '#2563eb', // Sesuai warna tombol biru Tailwind
        })

        router.push('/employees')

    } catch (error) {
        let errorText = 'Terjadi kesalahan pada server.'
        if (error.response && error.response.data.errors) {
            errorText = Object.values(error.response.data.errors).flat().join('\n')
            errorMessage.value = errorText // Tetap tampilkan teks merah di atas form
            step.value = 1
        }

        // Notifikasi Error Cantik
        Swal.fire({
            icon: 'error',
            title: 'Gagal Menyimpan!',
            text: errorText,
            confirmButtonColor: '#ef4444',
        })

    } finally {
        isSubmitting.value = false
    }
}

onMounted(() => {
    fetchFormOptions()
})
</script>