import Link from 'next/link'
import { Home, Users, History, Plus } from 'lucide-react'

type Tab = 'home' | 'patients' | 'history'

export default function BottomNav({ active }: { active: Tab }) {
  const items = [
    { href: '/',          icon: Home,    label: 'Hoje',      id: 'home'     },
    { href: '/patients',  icon: Users,   label: 'Pacientes', id: 'patients' },
    { href: '/history',   icon: History, label: 'Histórico', id: 'history'  },
  ]

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 px-2 py-2 safe-area-bottom">
      <div className="flex items-center justify-around relative">
        {items.map(({ href, icon: Icon, label, id }, idx) => {
          const isActive = active === id
          // Insert FAB between index 1 and 2
          return (
            <>
              {idx === 2 && (
                <Link
                  key="fab"
                  href="/appointments/new"
                  className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-200 hover:bg-purple-700 transition-colors"
                >
                  <Plus size={24} className="text-white" />
                </Link>
              )}
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl transition-colors ${
                  isActive ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            </>
          )
        })}
        {/* Spacer for FAB */}
        <div className="w-14" />
      </div>
    </nav>
  )
}
