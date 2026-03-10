'use client'
import { useAuth } from '@/hooks/useAuth'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { Calendar, Clock, CheckCircle, Bell, ChevronRight, Plus } from 'lucide-react'
import { supabase, type Appointment } from '@/lib/supabase'
import StatusBadge from '@/components/StatusBadge'
import BottomNav from '@/components/BottomNav'

export default function Home() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  useAuth()
  const [loading, setLoading] = useState(true)
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayLabel = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })

  useEffect(() => {
    fetchToday()
  }, [])

  async function fetchToday() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('appointments')
        .select('*, patient:patients(*)')
        .eq('date', today)
        .neq('status', 'cancelled')
        .order('time')
      setAppointments(data || [])
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  async function updateStatus(id: string, status: Appointment['status']) {
    await supabase.from('appointments').update({ status }).eq('id', id)
    fetchToday()
  }

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  }

  return (
    <div className="page-container pb-24">
      <div className="bg-purple-600 px-4 pt-12 pb-6">
        <p className="text-purple-100 text-sm capitalize">{todayLabel}</p>
        <h1 className="text-white text-2xl font-bold mt-1">Agenda de Hoje</h1>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: 'Total', value: stats.total, icon: Calendar },
            { label: 'Confirmados', value: stats.confirmed, icon: CheckCircle },
            { label: 'Realizados', value: stats.completed, icon: Clock },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white/15 rounded-2xl p-3 text-center">
              <Icon size={16} className="text-white/80 mx-auto mb-1" />
              <p className="text-white text-xl font-bold">{value}</p>
              <p className="text-purple-100 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4 flex gap-2">
        <Link href="/appointments/new" className="flex-1 btn-primary flex items-center justify-center gap-2">
          <Plus size={16} /> Nova Consulta
        </Link>
        <button
          onClick={async () => {
            await fetch('/api/notify', { method: 'POST', headers: { 'x-cron-secret': '' } })
            alert('Resumo enviado via WhatsApp!')
          }}
          className="btn-ghost flex items-center gap-1.5 px-3"
        >
          <Bell size={16} /> Resumo
        </button>
      </div>

      <div className="px-4 mt-5">
        <h2 className="text-gray-800 font-semibold text-base mb-3">Consultas do dia</h2>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="card animate-pulse h-20 bg-gray-100" />
            ))}
          </div>
        )}

        {!loading && appointments.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Calendar size={40} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Nenhuma consulta para hoje</p>
            <Link href="/appointments/new" className="text-purple-600 text-sm font-medium mt-2 block">
              + Agendar consulta
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {appointments.map(appt => (
            <div key={appt.id} className="card flex items-start gap-3">
              <div className="text-center min-w-[44px]">
                <p className="text-purple-600 font-bold text-base">{appt.time.slice(0, 5)}</p>
                <p className="text-gray-400 text-xs">{appt.duration_min}min</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{appt.patient?.name}</p>
                <p className="text-gray-500 text-xs">{appt.type}</p>
                <div className="mt-1">
                  <StatusBadge status={appt.status} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {appt.status === 'scheduled' && (
                  <button
                    onClick={() => updateStatus(appt.id, 'confirmed')}
                    className="p-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100"
                  >
                    <CheckCircle size={16} />
                  </button>
                )}
                {appt.status === 'confirmed' && (
                  <button
                    onClick={() => updateStatus(appt.id, 'completed')}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                  >
                    <CheckCircle size={16} />
                  </button>
                )}
                <Link
                  href={`/appointments/${appt.id}`}
                  className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100"
                >
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  )
}
