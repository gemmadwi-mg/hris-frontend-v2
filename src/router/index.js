import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    component: () => import('../layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: () => import('../views/Dashboard.vue') },

      // === MODUL KARYAWAN ===
      { path: 'employees', name: 'Employees', component: () => import('../views/Employees.vue') },
      { path: 'employees/create', name: 'EmployeeCreate', component: () => import('../views/EmployeeCreate.vue'), meta: { roles: ['System Administrator', 'HR Manager', 'HR Staff'] } },
      { path: 'employees/:id', name: 'EmployeeDetail', component: () => import('../views/EmployeeDetail.vue') },
      { path: 'employees/:id/edit', name: 'EmployeeEdit', component: () => import('../views/EmployeeEdit.vue'), meta: { roles: ['System Administrator', 'HR Manager', 'HR Staff'] } },

      // === MODUL ABSENSI ===
      { path: 'attendances', name: 'Attendances', component: () => import('../views/Attendances.vue') },
      { path: 'attendances/create', name: 'AttendanceCreate', component: () => import('../views/AttendanceCreate.vue'), meta: { roles: ['System Administrator', 'HR Manager', 'HR Staff'] } },
      { path: 'attendances/:id', name: 'AttendanceDetail', component: () => import('../views/AttendanceDetail.vue') },
      { path: 'attendances/:id/edit', name: 'AttendanceEdit', component: () => import('../views/AttendanceEdit.vue'), meta: { roles: ['System Administrator', 'HR Manager', 'HR Staff'] } },

      // === MODUL CUTI & IZIN ===
      { path: 'leave-requests', name: 'LeaveRequests', component: () => import('../views/LeaveRequests.vue') },
      { path: 'leave-requests/create', name: 'LeaveRequestCreate', component: () => import('../views/LeaveRequestCreate.vue') },
      { path: 'leave-requests/:id', name: 'LeaveRequestDetail', component: () => import('../views/LeaveRequestDetail.vue') },

      { path: 'permit-requests', name: 'PermitRequests', component: () => import('../views/PermitRequests.vue') },
      { path: 'permit-requests/create', name: 'PermitRequestCreate', component: () => import('../views/PermitRequestCreate.vue') },
      { path: 'permit-requests/:id', name: 'PermitRequestDetail', component: () => import('../views/PermitRequestDetail.vue') },
      { path: 'permit-requests/:id/edit', name: 'PermitRequestEdit', component: () => import('../views/PermitRequestEdit.vue') },

      // === MODUL LEMBUR ===
      { path: 'overtimes', name: 'Overtimes', component: () => import('../views/Overtimes.vue') },
      { path: 'overtimes/create', name: 'OvertimeCreate', component: () => import('../views/OvertimeCreate.vue') },
      { path: 'overtimes/:id', name: 'OvertimeDetail', component: () => import('../views/OvertimeDetail.vue') },
      { path: 'overtimes/:id/edit', name: 'OvertimeEdit', component: () => import('../views/OvertimeEdit.vue'), meta: { roles: ['System Administrator', 'HR Manager', 'HR Staff'] } },

      // === MODUL PAYROLL ===
      { 
        path: 'payrolls', 
        name: 'Payrolls', 
        component: () => import('../views/Payrolls.vue'),
        meta: { roles: ['System Administrator', 'HR Manager', 'HR Staff', 'Finance'] } 
      },
      { 
        path: 'payrolls/create', 
        name: 'PayrollCreate', 
        component: () => import('../views/PayrollCreate.vue'),
        meta: { roles: ['System Administrator', 'HR Manager', 'HR Staff'] } 
      },
      { 
        path: 'payrolls/:id', 
        name: 'PayrollDetail', 
        component: () => import('../views/PayrollDetail.vue'),
        meta: { roles: ['System Administrator', 'HR Manager', 'HR Staff', 'Finance'] } 
      },
      { 
        path: 'payrolls/:id/edit', 
        name: 'PayrollEdit', 
        component: () => import('../views/PayrollEdit.vue'),
        meta: { roles: ['System Administrator', 'HR Manager', 'HR Staff'] } 
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// === SECURITY GUARD ===
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'Login' })
  } 
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return next({ name: 'Dashboard' })
  }

  // Load data user jika belum ada di Pinia State
  if (to.meta.requiresAuth && authStore.isAuthenticated && !authStore.user) {
    await authStore.fetchUser()
  }

  // Pengecekan Berdasarkan Role
  if (to.meta.roles && authStore.user) {
    const isAllowed = authStore.hasAnyRole(to.meta.roles)
    
    if (!isAllowed) {
      alert('Akses Ditolak: Jabatan Anda tidak diizinkan membuka halaman ini.')
      return next({ name: 'Dashboard' }) 
    }
  }

  next()
})

export default router