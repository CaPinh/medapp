'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Send } from 'lucide-react'
import { format } from 'date-fns'
import { supabase, type Patient } from '@/lib/supabase'

const TYPES = ['Consulta', 'Retorno', 'Exame', 'Procedimento', 'Urgência']
const DURATIONS = [15, 30, 45, 60, 90]

export default function NewAppointmentPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [patients, setPatients] = useState<Patient[]>([])
  const [saving, setSaving] = useState(false)
  const [sendReminder, setSendReminder] = useState(true)
  const [form, setForm] = useState({
    patient_id: params.get('patient_id') || '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '08:00',
    duration_min: 30,
    type: 'Consulta',
    notes: '',
    status: 'scheduled',
  })

  useEffect(() => {
    supabase.from('patients').select('*').order('name').then(({ data }) => {
      setPatients(data || [])
    })
  }, [])

  function set(field: string, value: string | number) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.patient_id || !form.date || !form.time) return
    setSaving(true)

    const { data, error } = await supabase
      .from('appointments')
      .insert([form])
      .select()
      .single()

    if (!error && data && sendReminder) {
      // Send WhatsApp reminder
      await fetch('/api/appointments/remind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: data.id }),
      })
    }

    setSaving(false)
    if (!error) router.push('/')
  }

  return (
    <div className="page-container pb-8">
      <div className="bg-green-600 px-4 pt-12 pb-5 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white/80 hover:text-white">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-white text-xl font-bold">Nova Consulta</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 mt-5 space-y-4">
        {/* Patient */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Paciente *</label>
          <select className="input mt-1" value={form.patient_id} onChange={e => set('patient_id', e.target.value)} required>
            <option value="">Selecione o paciente...</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Data *</label>
            <input className="input mt-1" type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Horário *</label>
            <input className="input mt-1" type="time" value={form.time} onChange={e => set('time', e.target.value)} required />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Duração</label>
          <div className="flex gap-2 mt-1 flex-wrap">
            {DURATIONS.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => set('duration_min', d)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors border ${
                  form.duration_min === d
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                }`}
              >
                {d}min
              </button>
            ))}
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</label>
          <div className="flex gap-2 mt-1 flex-wrap">
            {TYPES.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => set('type', t)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors border ${
                  form.type === t
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Observações</label>
          <textarea className="input mt-1 resize-none" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Motivo da consulta, observações..." />
        </div>

        {/* Send reminder toggle */}
        <div className="flex items-center gap-3 py-3 border-t border-gray-100">
          <input
            id="reminder"
            type="checkbox"
            checked={sendReminder}
            onChange={e => setSendReminder(e.target.checked)}
            className="w-4 h-4 accent-green-600"
          />
          <label htmlFor="reminder" className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <Send size={14} className="text-green-500" />
            Enviar lembrete via WhatsApp ao paciente
          </label>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Agendando...' : 'Confirmar Agendamento'}
        </button>
      </form>
    </div>
  )
}
