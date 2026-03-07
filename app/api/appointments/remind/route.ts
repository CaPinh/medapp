import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendWhatsApp, buildReminderMessage } from '@/lib/whatsapp'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function POST(req: NextRequest) {
  const { appointment_id } = await req.json()

  const { data: appt, error } = await supabaseAdmin
    .from('appointments')
    .select('*, patient:patients(*)')
    .eq('id', appointment_id)
    .single()

  if (error || !appt) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  }

  if (!appt.patient?.phone) {
    return NextResponse.json({ error: 'Patient has no phone' }, { status: 400 })
  }

  const dateLabel = format(new Date(appt.date + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })
  const msg = buildReminderMessage(appt.patient.name, dateLabel, appt.time.slice(0, 5))
  const result = await sendWhatsApp(appt.patient.phone, msg)

  if (result.success) {
    await supabaseAdmin
      .from('appointments')
      .update({ reminder_sent: true })
      .eq('id', appointment_id)
  }

  return NextResponse.json({ success: result.success, result })
}
