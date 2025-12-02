// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Third-party Imports
import classnames from 'classnames'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const defaultSuggestions = [
  {
    sectionLabel: 'Active Dashboards',
    items: [
      {
        label: 'Student Dashboard',
        href: '/dashboards/student',
        icon: 'ri-graduation-cap-line'
      },
      {
        label: 'Teacher Dashboard',
        href: '/dashboards/teacher',
        icon: 'ri-user-teacher-line'
      },
      {
        label: 'Admin Dashboard',
        href: '/dashboards/admin',
        icon: 'ri-admin-line'
      }
    ]
  }

  // TODO: Uncomment other suggestions when features are added
  // {
  //   sectionLabel: 'Apps',
  //   items: [
  //     {
  //       label: 'Calendar',
  //       href: '/apps/calendar',
  //       icon: 'ri-calendar-line'
  //     },
  //     // ... other apps
  //   ]
  // }
]

const DefaultSuggestions = ({ setOpen }) => {
  // Hooks
  const { lang: locale } = useParams()

  return (
    <div className='flex grow flex-wrap gap-x-[48px] gap-y-8 plb-14 pli-16 overflow-y-auto overflow-x-hidden bs-full'>
      {defaultSuggestions.map((section, index) => (
        <div
          key={index}
          className='flex flex-col justify-center overflow-x-hidden gap-4 basis-full sm:basis-[calc((100%-3rem)/2)]'
        >
          <p className='text-xs uppercase text-textDisabled tracking-[0.8px]'>{section.sectionLabel}</p>
          <ul className='flex flex-col gap-4'>
            {section.items.map((item, i) => (
              <li key={i} className='flex'>
                <Link
                  href={getLocalizedUrl(item.href, locale)}
                  className='flex items-center overflow-x-hidden cursor-pointer gap-2 hover:text-primary focus-visible:text-primary focus-visible:outline-0'
                  onClick={() => setOpen(false)}
                >
                  {item.icon && <i className={classnames(item.icon, 'flex text-xl')} />}
                  <p className='text-[15px] overflow-hidden whitespace-nowrap overflow-ellipsis'>{item.label}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default DefaultSuggestions
