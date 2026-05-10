# Dara Venture Dashboard

Dashboard em tempo real para acompanhar as conversas do agente de IA do WhatsApp da Dara Venture. Construído como SPA pura em React + Vite, conectado diretamente ao Supabase via cliente JS e Realtime.

## Stack

- **React 19** + **Vite 7** (SPA, sem SSR)
- **TypeScript** estrito
- **Tailwind CSS v4** + design tokens em `oklch`
- **shadcn/ui** + **Radix UI** + **Lucide Icons**
- **react-router-dom** v7 (roteamento client-side)
- **@supabase/supabase-js** (REST + Realtime)
- **Recharts** (gráficos)
- **n8n Webhook** (integração futura com Google Agenda)

## Funcionalidades

- **Dashboard**: cards de métricas (total, números únicos, hoje, status), feed ao vivo das últimas conversas e destaque de leads quentes.
- **Conversas**: lista filtrável por número, status, intent, data e busca textual em mensagens.
- **Kanban**: 6 colunas (Novo, Em andamento, Aguardando humano, Agendado, Encerrado, Cancelado) com destaque para leads quentes e itens aguardando atendimento humano.
- **Métricas**: gráfico de linha (últimos 7 dias), pizza por status e barras por intents mais frequentes.
- **Agenda via n8n**: dispara payload da conversa para o webhook configurado.
- **Realtime**: assinatura Supabase em `conversations` com fallback de refresh a cada 30s e indicador visual de conexão.
- **Qualificação de lead**: score 0–100 e classificação (Quente / Morno / Frio / Baixa intenção) baseada no intent, recorrência do número e atividade do dia.

## Estrutura

```
src/
├── App.tsx                  # rotas SPA
├── main.tsx                 # bootstrap React + BrowserRouter
├── styles.css               # design tokens (dark theme)
├── components/
│   ├── Layout.tsx           # sidebar + topo mobile
│   ├── PageHeader.tsx
│   ├── EmptyState.tsx
│   ├── RealtimeBadge.tsx
│   └── ui/                  # shadcn components
├── hooks/
│   ├── use-conversations.ts # fetch + realtime + polling
│   └── use-realtime-status.ts
├── lib/
│   ├── supabase.ts          # cliente Supabase
│   ├── status.ts            # mapeamento de status
│   └── lead-score.ts        # cálculo de qualificação
└── pages/
    ├── Dashboard.tsx
    ├── Conversas.tsx
    ├── Kanban.tsx
    ├── Metricas.tsx
    └── Agenda.tsx
```

## Integração Supabase

Tabela `public.conversations`:

| campo         | tipo        |
|---------------|-------------|
| id            | uuid / int  |
| number        | text        |
| user_message  | text        |
| ai_response   | text        |
| intent        | text        |
| status        | text        |
| created_at    | timestamptz |

O hook `useConversations` faz `select('*').order('created_at', desc).limit(2000)` e assina mudanças `INSERT/UPDATE/DELETE` via canal Realtime `postgres_changes`. Em paralelo, há um `setInterval` de 30s como fallback.

## Realtime

- Canal: `conversations-rt`
- Eventos: `*` (INSERT, UPDATE, DELETE)
- Indicador visual do estado da conexão (`conectado` / `conectando` / `sem conexão`) na sidebar.

## Variáveis de ambiente

Crie um arquivo `.env` (ver `.env.example`):

```
VITE_SUPABASE_URL=https://uvdelreayemjkuuhxgoc.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
VITE_N8N_WEBHOOK_CREATE_EVENT=
```

## Execução

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de produção em dist/
npm run preview  # serve o build
A aplicação continuará conectada ao Supabase remoto configurado nas variáveis de ambiente.

---

## LGPD e privacidade

Este projeto possui finalidade educacional/demonstrativa.

Os dados exibidos no dashboard podem conter informações sensíveis, como números de telefone e mensagens de atendimento. Em ambiente real de produção, o recomendado é:

- autenticação obrigatória
- Row Level Security (RLS) ativo no Supabase
- políticas restritivas de acesso
- mascaramento de dados sensíveis
- uso apenas por usuários autorizados

Nenhuma `service_role key` deve ser exposta no frontend.
```

## Deploy

- **Lovable**: clique em *Publish* — sem configuração adicional.
- **Vercel**: importe o repositório, framework `Vite`, build command `npm run build`, output `dist`. Configure as variáveis `VITE_*` no painel.
- **GitHub**: o projeto sincroniza com o repositório conectado via Lovable.

## Licença

MIT
