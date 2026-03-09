'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Plus, User, Phone, ChevronRight } from 'lucide-react'
import { supabase, type Patient } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchPatients() }, [])

  async function fetchPatients() {
    setLoading(true)
    const { data } = await supabase
      .from('patients')
      .select()
      .order('name')
    setPatients(data || [])
    setLoading(false)
  }

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  )

  return (
    <div className="page-container pb-24">
      {/* Header */}
      <div className="bg-purple-600 px-4 pt-12 pb-5">
        <h1 className="text-white text-2xl font-bold">Pacientes</h1>
        <p className="text-purple-100 text-sm mt-0.5">{patients.length} cadastrados</p>
      </div>

      {/* Search + Add */}
      <div className="px-4 mt-4 flex gap-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-10"
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Link
          href="/patients/new"
          className="bg-purple-600 text-white rounded-xl px-3 flex items-center gap-1 text-sm font-semibold hover:bg-purple-700 transition-colors"
        >
          <Plus size={16} />
        </Link>
      </div>

      {/* List */}
      <div className="px-4 mt-4 space-y-2">
        {loading && [1,2,3,4].map(i => (
          <div key={i} className="card animate-pulse h-16 bg-gray-100" />
        ))}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <User size={40} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Nenhum paciente encontrado</p>
            <Link href="/patients/new" className="text-purple-600 text-sm font-medium mt-2 block">
              + Cadastrar paciente
            </Link>
          </div>
        )}

        {filtered.map(patient => (
          <Link key={patient.id} href={`/patients/${patient.id}`}>
            <div className="card flex items-center gap-3 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-700 font-bold text-sm">
                  {patient.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{patient.name}</p>
                <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                  <Phone size={11} /> {patient.phone}
                </p>
              </div>
              <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
            </div>
          </Link>
        ))}
      </div>

      <BottomNav active="patients" />
    </div>
  )
}
