'use client'

import { useEffect, useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { supabase, type Appointment } from '@/lib/supabase'
import StatusBadge from '@/components/StatusBadge'
import BottomNav from '@/components/BottomNav'

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedDay, setSelectedDay] = useState<Date>(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMonth()
  }, [currentMonth])

  async function fetchMonth() {
    setLoading(true)
    const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
    const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('appointments')
      .select('*, patient:patients(name)')
      .gte('date', start)
      .lte('date', end)
      .neq('status', 'cancelled')
      .order('time')
    setAppointments(data || [])
    setLoading(false)
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  // blank days before first of month
  const firstDayOfWeek = getDay(startOfMonth(currentMonth))

  function getApptsForDay(day: Date) {
    return appointments.filter(a => isSameDay(new Date(a.date + 'T12:00:00'), day))
  }

  const selectedAppts = getApptsForDay(selectedDay)

  const STATUS_DOT: Record<string, string> = {
    scheduled: 'bg-blue-400',
    confirmed:  'bg-purple-500',
    completed:  'bg-gray-400',
    cancelled:  'bg-red-400',
  }

  return (
    <div className="page-container pb-24">
      {/* Header */}
      <div className="bg-purple-600 px-4 pt-12 pb-5">
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="text-white/80 hover:text-white p-1">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-white text-lg font-bold capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h1>
          <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="text-white/80 hover:text-white p-1">
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Day of week headers */}
        <div className="grid grid-cols-7 mt-4 mb-1">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-center text-white/60 text-xs font-semibold py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {days.map(day => {
            const dayAppts = getApptsForDay(day)
            const isSelected = isSameDay(day, selectedDay)
            const isTodayDay = isToday(day)

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(day)}
                className={`relative flex flex-col items-center py-1.5 rounded-xl mx-0.5 transition-all ${
                  isSelected
                    ? 'bg-white'
                    : isTodayDay
                    ? 'bg-white/20'
                    : 'hover:bg-white/10'
                }`}
              >
                <span className={`text-sm font-semibold ${
                  isSelected ? 'text-purple-600' : 'text-white'
                }`}>
                  {format(day, 'd')}
                </span>

                {/* Dots for appointments */}
                {dayAppts.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center max-w-[24px]">
                    {dayAppts.slice(0, 3).map((a, i) => (
                      <span
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? STATUS_DOT[a.status] : 'bg-white/70'
                        }`}
                      />
                    ))}
                    {dayAppts.length > 3 && (
                      <span className="text-white/70 text-[9px] leading-none">+{dayAppts.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day appointments */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-gray-800 font-semibold text-sm capitalize">
            {isToday(selectedDay)
              ? 'Hoje'
              : format(selectedDay, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            <span className="text-gray-400 font-normal ml-2">
              {selectedAppts.length > 0 ? `${selectedAppts.length} consulta(s)` : ''}
            </span>
          </h2>
          <Link
            href={`/appointments/new?date=${format(selectedDay, 'yyyy-MM-dd')}`}
            className="flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-xl hover:bg-purple-100"
          >
            <Plus size={13} /> Agendar
          </Link>
        </div>

        {loading && (
          <div className="space-y-2">
            {[1, 2].map(i => <div key={i} className="card animate-pulse h-16 bg-gray-100" />)}
          </div>
        )}

        {!loading && selectedAppts.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Nenhuma consulta neste dia</p>
            <Link
              href={`/appointments/new?date=${format(selectedDay, 'yyyy-MM-dd')}`}
              className="text-purple-600 text-sm font-medium mt-1 block"
            >
              + Agendar consulta
            </Link>
          </div>
        )}

        <div className="space-y-2">
          {selectedAppts.map(appt => (
            <Link key={appt.id} href={`/appointments/${appt.id}`}>
              <div className="card flex items-center gap-3 hover:bg-gray-50">
                <div className="text-center min-w-[44px]">
                  <p className="text-purple-600 font-bold text-base">{appt.time.slice(0, 5)}</p>
                  <p className="text-gray-400 text-xs">{appt.duration_min}min</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{appt.patient?.name}</p>
                  <p className="text-gray-500 text-xs">{appt.type}</p>
                  <div className="mt-0.5">
                    <StatusBadge status={appt.status} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <BottomNav active="calendar" />
    </div>
  )
}
