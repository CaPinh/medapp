'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function NewPatientPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', phone: '', email: '', birth_date: '', notes: '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.phone) return
    setSaving(true)
    const { data, error } = await supabase.from('patients').insert([form]).select().single()
    setSaving(false)
    if (!error && data) router.push(`/patients/${data.id}`)
  }

  return (
    <div className="page-container pb-8">
      <div className="bg-green-600 px-4 pt-12 pb-5 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white/80 hover:text-white">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-white text-xl font-bold">Novo Paciente</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 mt-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome completo *</label>
          <input className="input mt-1" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nome do paciente" required />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Telefone / WhatsApp *</label>
          <input className="input mt-1" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(11) 99999-9999" required />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">E-mail</label>
          <input className="input mt-1" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@exemplo.com" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Data de nascimento</label>
          <input className="input mt-1" type="date" value={form.birth_date} onChange={e => set('birth_date', e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Observações</label>
          <textarea className="input mt-1 resize-none" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Alergias, histórico relevante..." />
        </div>

        <button type="submit" disabled={saving} className="btn-primary mt-2">
          {saving ? 'Salvando...' : 'Cadastrar Paciente'}
        </button>
      </form>
    </div>
  )
}
