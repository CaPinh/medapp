# MedApp — Agenda Médica 🏥

App mobile de agendamento de consultas médicas com Next.js, Supabase e WhatsApp.

## Stack
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Banco de dados**: Supabase (PostgreSQL)
- **WhatsApp**: Evolution API (self-hosted ou cloud)
- **Deploy**: Vercel (com Cron Jobs)
- **PWA**: instalável no celular como app

---

## 1. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute o conteúdo de `supabase-schema.sql`
3. Copie as credenciais em **Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## 2. Configurar WhatsApp (Evolution API)

### Opção A — Self-hosted (gratuito)
```bash
# Docker
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=sua_chave \
  atendai/evolution-api:latest
```
Depois acesse `http://localhost:8080` e crie uma instância.

### Opção B — Cloud
Use [evolution-api.com](https://evolution-api.com) ou [Z-API](https://z-api.io) (pago, mais simples).

Configure no `.env.local`:
```
EVOLUTION_API_URL=https://sua-instancia.com
EVOLUTION_API_KEY=sua_chave
EVOLUTION_INSTANCE=nome_da_instancia
```

---

## 3. Variáveis de Ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

EVOLUTION_API_URL=https://sua-evolution.com
EVOLUTION_API_KEY=sua_chave
EVOLUTION_INSTANCE=minha_instancia

CRON_SECRET=coloque_uma_string_aleatoria_aqui
DOCTOR_PHONE=5511999999999
```

---

## 4. Rodar localmente

```bash
npm install
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000)

---

## 5. Deploy na Vercel

```bash
# Instale a CLI
npm i -g vercel

# Deploy
vercel --prod
```

Na Vercel, adicione todas as variáveis de ambiente em **Settings → Environment Variables**.

### Cron Job automático
O arquivo `vercel.json` já configura o cron para rodar às **7h todos os dias**:
- Envia resumo do dia para o médico via WhatsApp
- Envia lembretes para todos os pacientes com consulta no dia

> **Atenção**: Cron Jobs na Vercel requerem plano **Pro** ($20/mês).  
> Alternativa gratuita: use o botão "Resumo" no app manualmente.

---

## 6. Instalar como app no celular (PWA)

**iOS (Safari):**
1. Acesse o app no Safari
2. Toque no ícone de compartilhar
3. "Adicionar à Tela de Início"

**Android (Chrome):**
1. Acesse o app no Chrome
2. Menu → "Instalar app" ou "Adicionar à tela inicial"

---

## Funcionalidades

| Funcionalidade | Status |
|---|---|
| Agenda do dia com stats | ✅ |
| Cadastro de pacientes | ✅ |
| Agendamento de consultas | ✅ |
| Histórico com filtros | ✅ |
| Atualização de status | ✅ |
| Lembrete WhatsApp ao paciente | ✅ |
| Resumo diário para o médico | ✅ |
| Cron automático 7h | ✅ |
| PWA instalável | ✅ |
| Confirmação pelo paciente | 🔜 (webhook Evolution API) |

---

## Estrutura do projeto

```
medapp/
├── app/
│   ├── page.tsx                    # Agenda do dia
│   ├── patients/
│   │   ├── page.tsx                # Lista de pacientes
│   │   ├── new/page.tsx            # Novo paciente
│   │   └── [id]/page.tsx           # Detalhe do paciente
│   ├── appointments/
│   │   ├── new/page.tsx            # Novo agendamento
│   │   └── [id]/page.tsx           # Detalhe da consulta
│   ├── history/page.tsx            # Histórico
│   └── api/
│       ├── notify/route.ts         # Cron + resumo diário
│       └── appointments/
│           └── remind/route.ts     # Lembrete individual
├── components/
│   ├── BottomNav.tsx
│   └── StatusBadge.tsx
├── lib/
│   ├── supabase.ts
│   └── whatsapp.ts
├── supabase-schema.sql             # Execute no Supabase
├── vercel.json                     # Cron config
└── .env.local.example
```
