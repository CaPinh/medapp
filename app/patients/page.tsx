'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Send, Repeat } from 'lucide-react'
import { format, addWeeks } from 'date-fns'
import { supabase, type Patient } from '@/lib/supabase'

const TYPES = ['Consulta', 'Retorno', 'Exame', 'Procedimento', 'Urgência']
const DURATIONS = [15, 30, 45, 50, 60, 90]
const RECURRENCE_OPTIONS = [
  { value: 1, label: '1x (sem repetição)' },
  { value: 2, label: '2 semanas seguidas' },
  { value: 3, label: '3 semanas seguidas' },
  { value: 4, label: '4 semanas seguidas' },
  { value: 6, label: '6 semanas seguidas' },
  { value: 8, label: '8 semanas seguidas' },
]

function NewAppointmentForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [patients, setPatients] = useState<Patient[]>([])
  const [saving, setSaving] = useState(false)
  const [sendReminder, setSendReminder] = useState(true)
  const [recurrence, setRecurrence] = useState(1)
  const [form, setForm] = useState({
    patient_id: params.get('patient_id') || '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '08:00',
    duration_min: 50,
    type: 'Consulta',
    notes: '',
    status: 'scheduled',
  })

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('patients').select().order('name')
      setPatients((data as Patient[]) || [])
    }
    load()
  }, [])

  function set(field: string, value: string | number) {
    setForm(f => ({ ...f, [field]: value }))
  }

  // Preview das datas que serão criadas
  function getPreviewDates() {
    const dates = []
    for (let i = 0; i < recurrence; i++) {
      const d = addWeeks(new Date(form.date + 'T12:00:00'), i)
      dates.push(format(d, "dd/MM/yyyy (EEE)", { locale: undefined }))
    }
    return dates
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.patient_id || !form.date || !form.time) return
    setSaving(true)

    const insertedIds: string[] = []

    // Insert one appointment per week
    for (let i = 0; i < recurrence; i++) {
      const apptDate = addWeeks(new Date(form.date + 'T12:00:00'), i)
      const dateStr = format(apptDate, 'yyyy-MM-dd')

      const { data, error } = await supabase
        .from('appointments')
        .insert([{ ...form, date: dateStr }])
        .select()
        .single()

      if (!error && data) {
        insertedIds.push(data.id)
      }
    }

    // Send reminder for first appointment only
    if (sendReminder && insertedIds.length > 0) {
      await fetch('/api/appointments/remind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: insertedIds[0] }),
      })
    }

    setSaving(false)
    router.push('/')
  }

  const previewDates = recurrence > 1 ? getPreviewDates() : []
  const selectedPatient = patients.find(p => p.id === form.patient_id)

  return (
    <div className="page-container pb-8">
      <div className="bg-purple-600 px-4 pt-12 pb-5 flex items-center gap-3">
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
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
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
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Recurrence */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
            <Repeat size={12} /> Repetição semanal
          </label>
          <div className="flex gap-2 mt-1 flex-wrap">
            {RECURRENCE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRecurrence(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
                  recurrence === opt.value
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Preview dates */}
          {recurrence > 1 && form.date && (
            <div className="mt-3 bg-purple-50 border border-purple-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1">
                <Repeat size={11} /> {recurrence} consultas serão criadas:
              </p>
              <div className="space-y-1">
                {getPreviewDates().map((date, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                    <span className="text-xs text-purple-800">{date} às {form.time}</span>
                    {selectedPatient && <span className="text-xs text-purple-600">· {selectedPatient.name}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Observações</label>
          <textarea className="input mt-1 resize-none" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Motivo da consulta, observações..." />
        </div>

        {/* Reminder */}
        <div className="flex items-center gap-3 py-3 border-t border-gray-100">
          <input
            id="reminder"
            type="checkbox"
            checked={sendReminder}
            onChange={e => setSendReminder(e.target.checked)}
            className="w-4 h-4 accent-purple-600"
          />
          <label htmlFor="reminder" className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <Send size={14} className="text-purple-500" />
            Enviar lembrete WhatsApp para 1ª consulta
          </label>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving
            ? `Agendando ${recurrence} consulta(s)...`
            : recurrence > 1
              ? `Agendar ${recurrence} consultas semanais`
              : 'Confirmar Agendamento'
          }
        </button>
      </form>
    </div>
  )
}

export default function NewAppointmentPage() {
  return (
    <Suspense fallback={<div className="page-container p-8 text-center text-gray-400">Carregando...</div>}>
      <NewAppointmentForm />
    </Suspense>
  )
}
