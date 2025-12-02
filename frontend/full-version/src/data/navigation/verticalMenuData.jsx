'use client'

import { getRoleBasedMenuData } from './roleBasedMenuData'

const verticalMenuData = dictionary => {
  // Get the role from localStorage or sessionStorage (set by RBAC context)
  // In production, this would come from Redux state
  const role = typeof window !== 'undefined' ? (localStorage.getItem('userRole') || 'student') : 'student'

  // Get role-specific menu
  const roleMenuData = getRoleBasedMenuData(role, dictionary)

  // If role-based menu is available, use it
  if (roleMenuData && roleMenuData.length > 0) {
    return roleMenuData
  }

  // Fallback to default menu structure
  return [
    {
      label: dictionary['navigation'].dashboards,
      icon: 'ri-home-smile-line',
      suffix: {
        label: '5',
        color: 'error'
      },
      children: [
        {
          label: dictionary['navigation'].crm,
          href: '/dashboards/crm'
        },
        {
          label: dictionary['navigation'].analytics,
          href: '/dashboards/analytics'
        }
      ]
    }
  ]
}

export default verticalMenuData
