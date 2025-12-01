// Third-party Imports
import { getServerSession } from 'next-auth'

// Component Imports
import AuthRedirect from '@/components/AuthRedirect'

export default async function AuthGuard({ children, locale }) {
  // Temporarily disabled authentication check to view dashboard
  // const session = await getServerSession()
  // return <>{session ? children : <AuthRedirect lang={locale} />}</>

  return <>{children}</>
}
