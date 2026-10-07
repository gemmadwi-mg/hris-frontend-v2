import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Layouts
import AdminLayout from '../layouts/AppLayout.vue'
import EmployeeLayout from '../layouts/EmployeeLayout.vue'

const routes = [
  // REDIREKSI JALUR UTAMA ( / )
  {
    path: '/',
    redirect: () => {
      const authStore = useAuthStore()

      if (!authStore.token) {
        return '/login'
      }

      // Gunakan getter hasRole('Employee'), BUKAN user.role === 'Employee'
      return authStore.hasRole('Employee')
        ? '/employee/dashboard'
        : '/admin/dashboard'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },

  // ==========================================
  // 1. JALUR KHUSUS KARYAWAN (MOBILE APP UI)
  // ==========================================
  {
    path: '/employee',
    component: EmployeeLayout,
    meta: { requiresAuth: true, roles: ['Employee'] },
    children: [
      {
        path: 'dashboard',
        name: 'EmployeeDashboard',
        component: () => import('../views/employee/Dashboard.vue')
      },
      {
        path: 'attendances',
        name: 'EmployeeAttendances',
        component: () => import('../views/employee/AttendanceList.vue')
      },
      {
        path: 'attendances/create',
        name: 'EmployeeClockIn',
        component: () => import('../views/employee/AttendanceCreate.vue')
      },
      {
        path: 'leaves',
        name: 'EmployeeLeaveList',
        component: () => import('../views/employee/LeaveList.vue')
      },
      {
        path: 'leaves/create',
        name: 'EmployeeLeaveCreate',
        component: () => import('../views/employee/LeaveCreate.vue')
      },
      {
        path: 'permits',
        name: 'EmployeePermits',
        component: () => import('../views/employee/PermitList.vue')
      },
      {
        path: 'permits/create',
        name: 'EmployeePermitCreate',
        component: () => import('../views/employee/PermitCreate.vue')
      },
      {
        path: 'overtimes',
        name: 'EmployeeOvertime',
        component: () => import('../views/employee/OvertimeList.vue')
      },
      {
        path: 'overtimes/create',
        name: 'EmployeeOvertimeCreate',
        component: () => import('../views/employee/OvertimeCreate.vue')
      },
      {
        path: 'payrolls',
        name: 'EmployeePayrolls',
        component: () => import('../views/employee/PayrollList.vue')
      },
    ]
  },

  // ==========================================
  // 2. JALUR KHUSUS ADMIN & HR (DESKTOP UI)
  // ==========================================
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, roles: ['System Administrator', 'HR Manager', 'HR Staff', 'Finance'] },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/Dashboard.vue')
      },
      {
        path: 'employees',
        name: 'AdminEmployees',
        component: () => import('../views/admin/EmployeeList.vue')
      },
      {
        path: 'payrolls',
        name: 'AdminPayrolls',
        component: () => import('../views/admin/PayrollList.vue')
      },
      {
        path: 'payrolls/:id',
        name: 'AdminPayrollDetail',
        component: () => import('../views/admin/PayrollDetail.vue')
      },
      {
        path: 'attendances',
        name: 'AdminAttendances',
        component: () => import('../views/admin/AttendanceList.vue')
      },
      {
        path: 'attendance/:id',
        name: 'AdminAttendanceDetail',
        component: () => import('../views/admin/AttendanceDetail.vue')
      },
      {
        path: 'leave-requests',
        name: 'AdminLeaveRequests',
        component: () => import('../views/admin/LeaveRequestList.vue')
      },
      {
        path: 'leave-requests/:id',
        name: 'AdminLeaveRequestDetail',
        component: () => import('../views/admin/LeaveRequestDetail.vue')
      },
      {
        path: 'permit-requests',
        name: 'AdminPermitRequest',
        component: () => import('../views/admin/PermitRequestList.vue')
      },
      {
        path: 'permit-requests/:id',
        name: 'AdminPermitRequestDetail',
        component: () => import('../views/admin/PermitRequestDetail.vue')
      },
      {
        path: 'overtimes',
        name: 'AdminOvertime',
        component: () => import('../views/admin/OvertimeList.vue')
      },
      {
        path: 'overtimes/:id',
        name: 'AdminOvertimeDetail',
        component: () => import('../views/admin/OvertimeDetail.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// NAVIGATION GUARD PERIKSA LOGIN & ROLE
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 1. Jika ada token tapi data user belum dimuat (misal setelah refresh browser)
  if (authStore.token && !authStore.user) {
    await authStore.fetchUser()
  }

  // 2. Jika butuh login tapi tidak ada token
  if (to.meta.requiresAuth && !authStore.token) {
    return next('/login')
  }

  // 3. Jika sudah login tapi mencoba membuka halaman /login
  if (to.path === '/login' && authStore.token) {
    return authStore.hasRole('Employee')
      ? next('/employee/dashboard')
      : next('/admin/dashboard')
  }

  // 4. Periksa Hak Akses Role
  if (to.meta.roles) {
    const hasRole = authStore.hasAnyRole(to.meta.roles)

    if (!hasRole) {
      // Gunakan hasRole('Employee')
      const targetPath = authStore.hasRole('Employee') ? '/employee/dashboard' : '/admin/dashboard'

      // Cegah infinite loop jika lokasi asal sama dengan target pengalihan
      if (to.path !== targetPath) {
        return next(targetPath)
      }
    }
  }

  next()
})

export default router