'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Filter } from 'lucide-react'
import { supabase, type Appointment } from '@/lib/supabase'
import StatusBadge from '@/components/StatusBadge'
import BottomNav from '@/components/BottomNav'

const FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'scheduled', label: 'Agendados' },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'completed', label: 'Realizados' },
  { value: 'cancelled', label: 'Cancelados' },
]

export default function HistoryPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [filter])

  async function fetchAll() {
    setLoading(true)
    let query = supabase
      .from('appointments')
      .select('*, patient:patients(name, phone)')
      .order('date', { ascending: false })
      .order('time', { ascending: false })

    if (filter !== 'all') query = query.eq('status', filter)

    const { data } = await query.limit(100)
    setAppointments(data || [])
    setLoading(false)
  }

  // Group by month
  const grouped: Record<string, Appointment[]> = {}
  appointments.forEach(a => {
    const key = format(new Date(a.date + 'T12:00:00'), 'MMMM yyyy', { locale: ptBR })
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(a)
  })

  return (
    <div className="page-container pb-24">
      <div className="bg-green-600 px-4 pt-12 pb-5">
        <h1 className="text-white text-2xl font-bold">Histórico</h1>
        <p className="text-green-100 text-sm mt-0.5">{appointments.length} consultas</p>
      </div>

      {/* Filter chips */}
      <div className="px-4 mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
              filter === f.value
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="px-4 mt-4 space-y-6 pb-4">
        {loading && [1,2,3].map(i => (
          <div key={i} className="card animate-pulse h-16 bg-gray-100" />
        ))}

        {!loading && Object.entries(grouped).map(([month, appts]) => (
          <div key={month}>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 capitalize">{month}</h3>
            <div className="space-y-2">
              {appts.map(appt => (
                <Link key={appt.id} href={`/appointments/${appt.id}`}>
                  <div className="card flex items-center gap-3 hover:bg-gray-50">
                    <div className="text-center min-w-[44px]">
                      <p className="text-sm font-bold text-gray-700">{format(new Date(appt.date + 'T12:00:00'), 'dd', { locale: ptBR })}</p>
                      <p className="text-xs text-gray-400">{format(new Date(appt.date + 'T12:00:00'), 'EEE', { locale: ptBR })}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{appt.patient?.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">{appt.time.slice(0, 5)}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-gray-500">{appt.type}</span>
                      </div>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {!loading && appointments.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">Nenhuma consulta encontrada</p>
        )}
      </div>

      <BottomNav active="history" />
    </div>
  )
}
