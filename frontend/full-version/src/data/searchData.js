const data = [
  {
    id: '1',
    name: 'Student Dashboard',
    url: '/dashboards/student',
    icon: 'ri-graduation-cap-line',
    section: 'Active Dashboards'
  },
  {
    id: '2',
    name: 'Teacher Dashboard',
    url: '/dashboards/teacher',
    icon: 'ri-user-teacher-line',
    section: 'Active Dashboards'
  },
  {
    id: '3',
    name: 'Admin Dashboard',
    url: '/dashboards/admin',
    icon: 'ri-admin-line',
    section: 'Active Dashboards'
  }

  // TODO: Uncomment other dashboards and apps when they are implemented
  // {
  //   id: '4',
  //   name: 'CRM',
  //   url: '/dashboards/crm',
  //   icon: 'ri-pie-chart-2-line',
  //   section: 'Dashboards'
  // },
  // {
  //   id: '5',
  //   name: 'Analytics Dashboard',
  //   url: '/dashboards/analytics',
  //   icon: 'ri-bar-chart-line',
  //   section: 'Dashboards'
  // },
  // ... all other entries hidden
]

export default data

// NOTE: All other menu entries have been hidden to show only the 3 active portal dashboards
// To restore other dashboards and apps, uncomment the sections above
