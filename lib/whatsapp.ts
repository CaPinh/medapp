const EVOLUTION_URL = process.env.EVOLUTION_API_URL
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE

export async function sendWhatsApp(phone: string, message: string) {
  if (!EVOLUTION_URL || !EVOLUTION_KEY || !EVOLUTION_INSTANCE) {
    console.warn('WhatsApp not configured — skipping send')
    return { success: false, reason: 'not_configured' }
  }

  // Normalize phone: remove non-digits, ensure country code
  const normalized = phone.replace(/\D/g, '')
  const number = normalized.startsWith('55') ? normalized : `55${normalized}`

  try {
    const res = await fetch(
      `${EVOLUTION_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: EVOLUTION_KEY,
        },
        body: JSON.stringify({
          number,
          options: { delay: 1000 },
          textMessage: { text: message },
        }),
      }
    )
    const data = await res.json()
    return { success: res.ok, data }
  } catch (err) {
    console.error('WhatsApp send error:', err)
    return { success: false, error: err }
  }
}

export function buildReminderMessage(patientName: string, date: string, time: string, doctorName = 'seu médico') {
  return `Olá, *${patientName}*! 👋

Lembramos que você tem uma consulta agendada com *${doctorName}* para *hoje, ${date}* às *${time}*.

✅ Para *confirmar* sua presença, responda com *SIM*.
❌ Para *cancelar*, responda com *NÃO*.

Em caso de dúvidas, entre em contato conosco. Até logo! 🏥`
}

export function buildDailySummaryMessage(appointments: Array<{ time: string; patientName: string; type: string }>) {
  if (appointments.length === 0) {
    return `📅 *Agenda do dia*\n\nVocê não tem consultas agendadas para hoje. Bom descanso! 😊`
  }

  const lines = appointments
    .map((a, i) => `${i + 1}. *${a.time}* — ${a.patientName} (${a.type})`)
    .join('\n')

  return `📅 *Agenda do dia — ${new Date().toLocaleDateString('pt-BR')}*\n\nVocê tem *${appointments.length} consulta(s)* hoje:\n\n${lines}\n\nBom trabalho! 💙`
}
