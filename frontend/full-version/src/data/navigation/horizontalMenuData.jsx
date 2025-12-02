const horizontalMenuData = dictionary => [
  // This is how you will normally render submenu
  {
    label: dictionary['navigation'].dashboards,
    icon: 'ri-home-smile-line',
    children: [
      // This is how you will normally render menu item
      {
        label: 'Student Dashboard',
        icon: 'ri-graduation-cap-line',
        href: '/dashboards/student'
      },
      {
        label: 'Teacher Dashboard',
        icon: 'ri-user-teacher-line',
        href: '/dashboards/teacher'
      },
      {
        label: 'Admin Dashboard',
        icon: 'ri-admin-line',
        href: '/dashboards/admin'
      }
    ]
  }

  // TODO: Uncomment other features when needed
  // All apps and pages sections hidden to show only active portals
]

export default horizontalMenuData

// NOTE: All other menu items (eCommerce, Academy, Logistics, Email, Calendar, Chat, etc.) have been hidden
// Uncomment them in the children array above if you need to add them back to the navigation
