'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, Calendar, Edit2, MessageCircle, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase, type Patient, type Appointment } from '@/lib/supabase'
import StatusBadge from '@/components/StatusBadge'

export default function PatientDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPatient()
    fetchHistory()
  }, [id])

  async function fetchPatient() {
    const { data } = await supabase.from('patients').select().eq('id', id).single()
    setPatient(data)
    setLoading(false)
  }

  async function fetchHistory() {
    const { data } = await supabase
      .from('appointments')
      .select()
      .eq('patient_id', id)
      .order('date', { ascending: false })
    setAppointments(data || [])
  }

  async function deletePatient() {
    if (!confirm('Excluir este paciente e todas as consultas?')) return
    await supabase.from('patients').delete().eq('id', id)
    router.push('/patients')
  }

  if (loading) return <div className="page-container p-8 text-center text-gray-400">Carregando...</div>
  if (!patient) return <div className="page-container p-8 text-center text-gray-400">Paciente não encontrado</div>

  const initials = patient.name.split(' ').map(n => n[0]).slice(0, 2).join('')
  const whatsappLink = `https://wa.me/55${patient.phone.replace(/\D/g, '')}`

  return (
    <div className="page-container pb-8">
      {/* Header */}
      <div className="bg-purple-600 px-4 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="text-white/80 hover:text-white">
            <ArrowLeft size={22} />
          </button>
          <div className="flex gap-2">
            <Link href={`/patients/${id}/edit`} className="p-2 rounded-xl bg-white/15 text-white">
              <Edit2 size={16} />
            </Link>
            <button onClick={deletePatient} className="p-2 rounded-xl bg-white/15 text-white">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-xl">{initials}</span>
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">{patient.name}</h1>
            {patient.birth_date && (
              <p className="text-purple-100 text-sm">
                Nasc: {format(new Date(patient.birth_date + 'T12:00:00'), 'dd/MM/yyyy')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="px-4 mt-4 space-y-2">
        <a href={`tel:${patient.phone}`} className="card flex items-center gap-3 hover:bg-gray-50">
          <Phone size={18} className="text-purple-600" />
          <span className="text-gray-700 text-sm">{patient.phone}</span>
        </a>
        <a href={whatsappLink} target="_blank" rel="noreferrer" className="card flex items-center gap-3 hover:bg-gray-50">
          <MessageCircle size={18} className="text-purple-500" />
          <span className="text-gray-700 text-sm">Abrir WhatsApp</span>
        </a>
        {patient.email && (
          <a href={`mailto:${patient.email}`} className="card flex items-center gap-3 hover:bg-gray-50">
            <Mail size={18} className="text-blue-500" />
            <span className="text-gray-700 text-sm">{patient.email}</span>
          </a>
        )}
        {patient.notes && (
          <div className="card">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Observações</p>
            <p className="text-gray-700 text-sm">{patient.notes}</p>
          </div>
        )}
      </div>

      {/* Schedule button */}
      <div className="px-4 mt-4">
        <Link href={`/appointments/new?patient_id=${id}`} className="btn-primary flex items-center justify-center gap-2">
          <Calendar size={16} /> Agendar Consulta
        </Link>
      </div>

      {/* History */}
      <div className="px-4 mt-6">
        <h2 className="text-gray-800 font-semibold text-sm mb-3">Histórico de Consultas</h2>
        {appointments.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-6">Nenhuma consulta registrada</p>
        )}
        <div className="space-y-2">
          {appointments.map(appt => (
            <Link key={appt.id} href={`/appointments/${appt.id}`}>
              <div className="card flex items-center gap-3 hover:bg-gray-50">
                <div className="text-center min-w-[48px]">
                  <p className="text-xs font-bold text-gray-700">{format(new Date(appt.date + 'T12:00:00'), 'dd/MM', { locale: ptBR })}</p>
                  <p className="text-xs text-gray-400">{appt.time.slice(0, 5)}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{appt.type}</p>
                  <StatusBadge status={appt.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
