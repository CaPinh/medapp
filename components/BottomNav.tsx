import Link from 'next/link'
import { Home, Users, CalendarDays, History, Plus } from 'lucide-react'

type Tab = 'home' | 'patients' | 'calendar' | 'history'

export default function BottomNav({ active }: { active: Tab }) {
  const items = [
    { href: '/',          icon: Home,        label: 'Hoje',      id: 'home'     },
    { href: '/patients',  icon: Users,       label: 'Pacientes', id: 'patients' },
    { href: '/calendar',  icon: CalendarDays,label: 'Agenda',    id: 'calendar' },
    { href: '/history',   icon: History,     label: 'Histórico', id: 'history'  },
  ]

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 px-2 py-2">
      <div className="flex items-center justify-around relative">
        {items.map(({ href, icon: Icon, label, id }, idx) => {
          const isActive = active === id
          return (
            <div key={href} className="relative flex-1 flex justify-center">
              {idx === 2 && (
                <Link
                  href="/appointments/new"
                  className="absolute -top-8 left-1/2 -translate-x-1/2 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-200 hover:bg-purple-700 transition-colors z-10"
                >
                  <Plus size={22} className="text-white" />
                </Link>
              )}
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                  isActive ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            </div>
          )
        })}
      </div>
    </nav>
  )
}
