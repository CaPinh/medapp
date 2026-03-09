'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase, type Appointment } from '@/lib/supabase'
import StatusBadge from '@/components/StatusBadge'

const STATUS_ACTIONS = [
  { value: 'scheduled',  label: 'Agendado',   icon: Clock,        color: 'text-blue-600 bg-blue-50' },
  { value: 'confirmed',  label: 'Confirmado',  icon: CheckCircle,  color: 'text-purple-600 bg-purple-50' },
  { value: 'completed',  label: 'Realizado',   icon: CheckCircle,  color: 'text-gray-600 bg-gray-50' },
  { value: 'cancelled',  label: 'Cancelado',   icon: XCircle,      color: 'text-red-600 bg-red-50' },
]

export default function AppointmentDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [appt, setAppt] = useState<Appointment | null>(null)
  const [sending, setSending] = useState(false)

  useEffect(() => { fetchAppt() }, [id])

  async function fetchAppt() {
    const { data } = await supabase
      .from('appointments')
      .select('*, patient:patients(*)')
      .eq('id', id)
      .single()
    setAppt(data)
  }

  async function updateStatus(status: Appointment['status']) {
    await supabase.from('appointments').update({ status }).eq('id', id)
    fetchAppt()
  }

  async function deleteAppt() {
    if (!confirm('Excluir este agendamento?')) return
    await supabase.from('appointments').delete().eq('id', id)
    router.push('/')
  }

  async function sendReminder() {
    setSending(true)
    await fetch('/api/appointments/remind', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointment_id: id }),
    })
    setSending(false)
    alert('Lembrete enviado via WhatsApp!')
  }

  if (!appt) return <div className="page-container p-8 text-center text-gray-400">Carregando...</div>

  const dateLabel = format(new Date(appt.date + 'T12:00:00'), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  return (
    <div className="page-container pb-8">
      <div className="bg-purple-600 px-4 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="text-white/80 hover:text-white">
            <ArrowLeft size={22} />
          </button>
          <button onClick={deleteAppt} className="p-2 rounded-xl bg-white/15 text-white">
            <Trash2 size={16} />
          </button>
        </div>
        <h1 className="text-white text-xl font-bold mt-4 capitalize">{dateLabel}</h1>
        <p className="text-purple-100 text-sm mt-0.5">{appt.time.slice(0, 5)} · {appt.duration_min} min · {appt.type}</p>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {/* Patient card */}
        <Link href={`/patients/${appt.patient_id}`}>
          <div className="card flex items-center gap-3 hover:bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-purple-700 font-bold text-sm">
                {appt.patient?.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{appt.patient?.name}</p>
              <p className="text-gray-500 text-xs">{appt.patient?.phone}</p>
            </div>
          </div>
        </Link>

        {/* Status */}
        <div className="card">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Status</p>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_ACTIONS.map(({ value, label, icon: Icon, color }) => (
              <button
                key={value}
                onClick={() => updateStatus(value as Appointment['status'])}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border-2 ${
                  appt.status === value
                    ? `${color} border-current`
                    : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        {appt.notes && (
          <div className="card">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Observações</p>
            <p className="text-gray-700 text-sm">{appt.notes}</p>
          </div>
        )}

        {/* Send WhatsApp reminder */}
        <button
          onClick={sendReminder}
          disabled={sending}
          className="card flex items-center gap-3 w-full text-left hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
            <MessageCircle size={18} className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {sending ? 'Enviando...' : 'Enviar lembrete WhatsApp'}
            </p>
            <p className="text-xs text-gray-500">Notificar paciente sobre esta consulta</p>
          </div>
        </button>

        <div className="text-xs text-gray-400 text-center pt-2">
          Lembrete {appt.reminder_sent ? 'enviado ✓' : 'não enviado'} · Agendado em {format(new Date(appt.created_at), 'dd/MM/yyyy HH:mm')}
        </div>
      </div>
    </div>
  )
}
