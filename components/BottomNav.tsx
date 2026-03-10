'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Home, Users, CalendarDays, History, Plus, LogOut } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Tab = 'home' | 'patients' | 'calendar' | 'history'

export default function BottomNav({ active }: { active: Tab }) {
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const leftItems = [
    { href: '/',         icon: Home,         label: 'Hoje',      id: 'home'     },
    { href: '/patients', icon: Users,        label: 'Pacientes', id: 'patients' },
  ]

  const rightItems = [
    { href: '/calendar', icon: CalendarDays, label: 'Agenda',    id: 'calendar' },
    { href: '/history',  icon: History,      label: 'Histórico', id: 'history'  },
  ]

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 px-2 py-2">
      <div className="flex items-center justify-around relative">

        {/* Left items */}
        {leftItems.map(({ href, icon: Icon, label, id }) => (
          <Link key={href} href={href}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors flex-1 ${
              active === id ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
            }`}>
            <Icon size={20} strokeWidth={active === id ? 2.5 : 1.5} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}

        {/* Center FAB */}
        <div className="flex-1 flex justify-center relative">
          <Link
            href="/appointments/new"
            className="absolute -top-7 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-200 hover:bg-purple-700 transition-colors border-4 border-white"
          >
            <Plus size={20} className="text-white" />
          </Link>
          {/* Empty space to preserve layout */}
          <div className="h-10 w-12" />
        </div>

        {/* Right items */}
        {rightItems.map(({ href, icon: Icon, label, id }) => (
          <Link key={href} href={href}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors flex-1 ${
              active === id ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
            }`}>
            <Icon size={20} strokeWidth={active === id ? 2.5 : 1.5} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}

        {/* Logout */}
        <button onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-gray-400 hover:text-red-500 transition-colors flex-1">
          <LogOut size={20} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">Sair</span>
        </button>

      </div>
    </nav>
  )
}
