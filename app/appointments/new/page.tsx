'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Send, Repeat, Hash } from 'lucide-react'
import { format, addWeeks } from 'date-fns'
import { supabase, type Patient } from '@/lib/supabase'

const DURATIONS = [15, 30, 45, 50, 60, 90]
const RECURRENCE_OPTIONS = [
  { value: 1,  label: 'Sem repetição' },
  { value: 2,  label: '2 semanas' },
  { value: 3,  label: '3 semanas' },
  { value: 4,  label: '4 semanas' },
  { value: 6,  label: '6 semanas' },
  { value: 8,  label: '8 semanas' },
  { value: 26, label: '6 meses' },
  { value: 52, label: '1 ano' },
]

function NewAppointmentForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [patients, setPatients] = useState<Patient[]>([])
  const [saving, setSaving] = useState(false)
  const [saveProgress, setSaveProgress] = useState(0)
  const [sendReminder, setSendReminder] = useState(true)
  const [recurrence, setRecurrence] = useState(1)
  const [startSession, setStartSession] = useState(1)
  const [form, setForm] = useState({
    patient_id: params.get('patient_id') || '',
    date: params.get('date') || format(new Date(), 'yyyy-MM-dd'),
    time: '08:00',
    duration_min: 50,
    type: 'Sessão 1',
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

  // When patient changes, suggest next session number
  useEffect(() => {
    async function loadLastSession() {
      if (!form.patient_id) return
      const { data } = await supabase
        .from('appointments')
        .select('type')
        .eq('patient_id', form.patient_id)
        .neq('status', 'cancelled')
        .order('date', { ascending: false })
        .limit(10)

      if (data && data.length > 0) {
        // Find highest session number
        let max = 0
        data.forEach(a => {
          const match = a.type?.match(/Sessão (\d+)/)
          if (match) max = Math.max(max, parseInt(match[1]))
        })
        if (max > 0) {
          setStartSession(max + 1)
          setForm(f => ({ ...f, type: `Sessão ${max + 1}` }))
        }
      } else {
        setStartSession(1)
        setForm(f => ({ ...f, type: 'Sessão 1' }))
      }
    }
    loadLastSession()
  }, [form.patient_id])

  function set(field: string, value: string | number) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function getPreviewDates() {
    const dates = []
    for (let i = 0; i < Math.min(recurrence, 5); i++) {
      const d = addWeeks(new Date(form.date + 'T12:00:00'), i)
      dates.push(format(d, 'dd/MM/yyyy (EEE)'))
    }
    return dates
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.patient_id || !form.date || !form.time) return
    setSaving(true)
    setSaveProgress(0)

    const insertedIds: string[] = []

    for (let i = 0; i < recurrence; i++) {
      const apptDate = addWeeks(new Date(form.date + 'T12:00:00'), i)
      const dateStr = format(apptDate, 'yyyy-MM-dd')
      const sessionLabel = `Sessão ${startSession + i}`

      const { data, error } = await supabase
        .from('appointments')
        .insert([{ ...form, date: dateStr, type: sessionLabel }])
        .select()
        .single()

      if (!error && data) insertedIds.push(data.id)
      setSaveProgress(Math.round(((i + 1) / recurrence) * 100))
    }

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
              <button key={d} type="button" onClick={() => set('duration_min', d)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors border ${
                  form.duration_min === d
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                }`}>
                {d}min
              </button>
            ))}
          </div>
        </div>

        {/* Session number */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
            <Hash size={12} /> Número da sessão inicial
          </label>
          <div className="flex items-center gap-3 mt-2">
            <button type="button"
              onClick={() => setStartSession(s => Math.max(1, s - 1))}
              className="w-9 h-9 rounded-xl border border-gray-200 text-gray-600 text-lg font-bold hover:border-purple-400 hover:text-purple-600 transition-colors flex items-center justify-center">
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-bold text-purple-600">{startSession}</span>
              <p className="text-xs text-gray-400 mt-0.5">
                {recurrence > 1
                  ? `Sessão ${startSession} até Sessão ${startSession + recurrence - 1}`
                  : `Sessão ${startSession}`}
              </p>
            </div>
            <button type="button"
              onClick={() => setStartSession(s => s + 1)}
              className="w-9 h-9 rounded-xl border border-gray-200 text-gray-600 text-lg font-bold hover:border-purple-400 hover:text-purple-600 transition-colors flex items-center justify-center">
              +
            </button>
          </div>
          {form.patient_id && (
            <p className="text-xs text-purple-500 mt-1.5 flex items-center gap-1">
              <Hash size={10} /> Sugerido com base no histórico do paciente
            </p>
          )}
        </div>

        {/* Recurrence */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
            <Repeat size={12} /> Repetição semanal
          </label>
          <div className="flex gap-2 mt-1 flex-wrap">
            {RECURRENCE_OPTIONS.map(opt => (
              <button key={opt.value} type="button" onClick={() => setRecurrence(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
                  recurrence === opt.value
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>

          {/* Preview */}
          {recurrence > 1 && form.date && (
            <div className="mt-3 bg-purple-50 border border-purple-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1">
                <Repeat size={11} />
                {recurrence} sessões · primeiras 5 datas:
              </p>
              <div className="space-y-1">
                {getPreviewDates().map((date, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-16 text-center rounded-full bg-purple-600 text-white text-xs px-2 py-0.5 font-bold flex-shrink-0">
                      Sessão {startSession + i}
                    </span>
                    <span className="text-xs text-purple-800">{date} às {form.time}</span>
                    {selectedPatient && <span className="text-xs text-purple-400 truncate">· {selectedPatient.name}</span>}
                  </div>
                ))}
                {recurrence > 5 && (
                  <p className="text-xs text-purple-500 pl-1">+ {recurrence - 5} sessões (até Sessão {startSession + recurrence - 1})...</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Observações</label>
          <textarea className="input mt-1 resize-none" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Evolução, observações da sessão..." />
        </div>

        {/* Reminder */}
        <div className="flex items-center gap-3 py-3 border-t border-gray-100">
          <input id="reminder" type="checkbox" checked={sendReminder}
            onChange={e => setSendReminder(e.target.checked)} className="w-4 h-4 accent-purple-600" />
          <label htmlFor="reminder" className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <Send size={14} className="text-purple-500" />
            Enviar lembrete WhatsApp para 1ª sessão
          </label>
        </div>

        {saving && recurrence > 4 && (
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${saveProgress}%` }} />
            <p className="text-xs text-gray-500 mt-1 text-center">{saveProgress}% — criando sessões...</p>
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-primary">
          {saving
            ? `Agendando... ${recurrence > 4 ? `(${saveProgress}%)` : ''}`
            : recurrence > 1
              ? `Agendar ${recurrence} sessões (${startSession} a ${startSession + recurrence - 1})`
              : `Confirmar Sessão ${startSession}`
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
