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
    // Rute Induk untuk Layout
    path: '/',
    component: () => import('../layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // Rute Anak (Akan dirender di dalam <router-view /> milik AppLayout)
      {
        path: '', // Kosong berarti me-render di rute utama '/'
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue')
      },
      // Nanti tambahkan rute '/employees' di sini
      // TAMBAHKAN RUTE INI
      {
        path: 'employees', // Tidak pakai '/' di awal karena anak dari '/'
        name: 'Employees',
        component: () => import('../views/Employees.vue')
      },
      {
        path: 'attendances',
        name: 'Attendances',
        component: () => import('../views/Attendances.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'leave-requests',
        name: 'LeaveRequests',
        component: () => import('../views/LeaveRequests.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'permit-requests',
        name: 'PermitRequests',
        component: () => import('../views/PermitRequests.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'overtimes',
        name: 'Overtimes',
        component: () => import('../views/Overtimes.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'payrolls',
        name: 'Payrolls',
        component: () => import('../views/Payrolls.vue'),
        meta: { requiresAuth: true }
      },
    ]
  },
  // ROUTE BARU: Di luar AppLayout, tapi tetap dilindungi (requiresAuth)
  {
    path: '/employees/create',
    name: 'EmployeeCreate',
    component: () => import('../views/EmployeeCreate.vue'),
    meta: { requiresAuth: true }
  },
  // TAMBAHKAN INI UNTUK DETAIL KARYAWAN
  {
    path: '/employees/:id',
    name: 'EmployeeDetail',
    component: () => import('../views/EmployeeDetail.vue'),
    meta: { requiresAuth: true }
  },
  // TAMBAHKAN ROUTE INI
  {
    path: '/employees/:id/edit',
    name: 'EmployeeEdit',
    component: () => import('../views/EmployeeEdit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/attendances/create',
    name: 'AttendanceCreate',
    component: () => import('../views/AttendanceCreate.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/attendances/:id',
    name: 'AttendanceDetail',
    component: () => import('../views/AttendanceDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/attendances/:id/edit',
    name: 'AttendanceEdit',
    component: () => import('../views/AttendanceEdit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/leave-requests/create',
    name: 'LeaveRequestCreate',
    component: () => import('../views/LeaveRequestCreate.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/leave-requests/:id',
    name: 'LeaveRequestDetail',
    component: () => import('../views/LeaveRequestDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/permit-requests/create',
    name: 'PermitRequestCreate',
    component: () => import('../views/PermitRequestCreate.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/permit-requests/:id',
    name: 'PermitRequestDetail',
    component: () => import('../views/PermitRequestDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/permit-requests/:id/edit',
    name: 'PermitRequestEdit',
    component: () => import('../views/PermitRequestEdit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/overtimes/create',
    name: 'OvertimeCreate',
    component: () => import('../views/OvertimeCreate.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/overtimes/:id',
    name: 'OvertimeDetail',
    component: () => import('../views/OvertimeDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/overtimes/:id/edit',
    name: 'OvertimeEdit',
    component: () => import('../views/OvertimeEdit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/payrolls/create',
    name: 'PayrollCreate',
    component: () => import('../views/PayrollCreate.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/payrolls/:id',
    name: 'PayrollDetail',
    component: () => import('../views/PayrollDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/payrolls/:id/edit',
    name: 'PayrollEdit',
    component: () => import('../views/PayrollEdit.vue'),
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' })
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router