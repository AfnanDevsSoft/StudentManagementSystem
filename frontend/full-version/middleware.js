import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export const middleware = withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Allow access to public pages
    if (pathname.includes('/login') || pathname.includes('/register') || pathname.includes('/forgot-password')) {
      if (token) {
        // User is authenticated, redirect to appropriate dashboard
        const dashboardUrl = getDashboardUrl(token)
        return NextResponse.redirect(new URL(dashboardUrl, req.url))
      }
      return NextResponse.next()
    }

    // Require auth for dashboard routes
    if (pathname.includes('/dashboards') && !token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow public pages
        const pathname = req.nextUrl.pathname
        if (pathname.includes('/login') || pathname.includes('/register') || pathname.includes('/forgot-password')) {
          return true
        }

        // Require token for protected routes
        if (pathname.includes('/dashboards')) {
          return !!token
        }

        return true
      }
    }
  }
)

/**
 * Get the appropriate dashboard URL based on user role
 */
function getDashboardUrl(token) {
  try {
    const role = (token?.role || 'admin').toLowerCase()

    if (role.includes('student')) {
      return '/dashboards/student'
    }
    if (role.includes('teacher')) {
      return '/dashboards/teacher'
    }
    if (role.includes('superadmin') || role.includes('admin') || role.includes('branchadmin')) {
      return '/dashboards/admin'
    }

    return '/dashboards/admin'
  } catch (error) {
    console.error('Error in getDashboardUrl:', error)
    return '/dashboards/admin'
  }
}

// Protect dashboard routes and auth pages
export const config = {
  matcher: ['/dashboards/:path*', '/login', '/register', '/forgot-password', '/en/:path*', '/ar/:path*']
}
