import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendWhatsApp, buildDailySummaryMessage, buildReminderMessage } from '@/lib/whatsapp'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Called by Vercel Cron or manually from the app
export async function POST(req: NextRequest) {
  // Simple secret check
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET && secret !== '') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = format(new Date(), 'yyyy-MM-dd')

  const { data: appointments, error } = await supabaseAdmin
    .from('appointments')
    .select('*, patient:patients(*)')
    .eq('date', today)
    .neq('status', 'cancelled')
    .order('time')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const appts = appointments || []

  // 1. Send daily summary to doctor
  const doctorPhone = process.env.DOCTOR_PHONE || ''
  if (doctorPhone) {
    const summaryMsg = buildDailySummaryMessage(
      appts.map(a => ({
        time: a.time.slice(0, 5),
        patientName: a.patient?.name || 'Paciente',
        type: a.type,
      }))
    )
    await sendWhatsApp(doctorPhone, summaryMsg)
  }

  // 2. Send reminders to patients who haven't received one yet
  let remindersCount = 0
  for (const appt of appts) {
    if (!appt.reminder_sent && appt.patient?.phone) {
      const dateLabel = format(new Date(appt.date + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })
      const msg = buildReminderMessage(
        appt.patient.name,
        dateLabel,
        appt.time.slice(0, 5)
      )
      const result = await sendWhatsApp(appt.patient.phone, msg)
      if (result.success) {
        await supabaseAdmin
          .from('appointments')
          .update({ reminder_sent: true })
          .eq('id', appt.id)
        remindersCount++
      }
    }
  }

  return NextResponse.json({
    success: true,
    appointments: appts.length,
    reminders_sent: remindersCount,
  })
}

// GET for Vercel Cron
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return POST(req)
}
