# EasyDoctors - App de Planos (React + TypeScript + Tailwind + shadcn/ui)

## RESUMO DO PROJETO
App React/Next.js para seleção de planos de telemedicina com wizard de 3 passos, formulário de lead e integração com Stripe via webhooks.

## STACK TECNOLÓGICA
- **Frontend**: Next.js 14 (app router), TypeScript, Tailwind CSS
- **UI**: shadcn/ui (Button, Card, Badge, Dialog, Input, Checkbox, Alert)
- **Formulários**: react-hook-form + @hookform/resolvers/zod + zod
- **Telefone**: react-phone-number-input + libphonenumber-js (formato E.164)
- **Estado**: zustand (leve)
- **Analytics**: Facebook Pixel (fbq)

## FLUXO DO USUÁRIO
1. Usuário preenche nome, e-mail, telefone (com bandeirinhas/DDD internacional)
2. Escolhe plano no wizard de 3 passos:
   - Quem vai usar: 1 pessoa | até 4 pessoas
   - Duração: Mensal (1) | 3 meses | 6 meses | 12 meses  
   - Nível: Preferencial | Premium | VIP
3. Aceita os Termos (modal)
4. Envia formulário
5. App chama webhook que retorna checkout_url do Stripe para redirecionar

## ENDPOINTS
- **Buscar planos (GET)**: `https://primary-teste-2d67.up.railway.app/webhook/45d535d6-149f-454d-9dec-1c6447787153/get_assinatura`
- **Criar cadastro + checkout (POST)**: `https://primary-teste-2d67.up.railway.app/webhook-test/Cadastro-EasyDoctors`
- **Parâmetro URL opcional**: `?vendedor=<id>` (enviar no payload)

## VARIÁVEIS DE AMBIENTE (.env.local)
```
NEXT_PUBLIC_PLANS_URL=https://primary-teste-2d67.up.railway.app/webhook/45d535d6-149f-454d-9dec-1c6447787153/get_assinatura
NEXT_PUBLIC_CHECKOUT_URL=https://primary-teste-2d67.up.railway.app/webhook-test/Cadastro-EasyDoctors
```

## ARQUITETURA DE PASTAS
```
/app
  /page.tsx                -> página única
  /layout.tsx              -> layout raiz
  /globals.css             -> estilos globais
/components
  /ui/                     -> componentes shadcn/ui
    button.tsx
    card.tsx
    input.tsx
    label.tsx
    checkbox.tsx
    dialog.tsx
    badge.tsx
    alert.tsx
  FormLead.tsx             -> formulário de lead
  PhoneInput.tsx           -> input de telefone internacional
  PlanWizard.tsx           -> wizard de 3 passos
  PlanCard.tsx             -> card do plano
  PlanSummarySticky.tsx    -> resumo sticky
  TermsModal.tsx           -> modal de termos
  LoadingOverlay.tsx       -> overlay de loading
/lib
  fetcher.ts               -> funções de API
  plan-normalizer.ts       -> normalização de planos
  validators.ts            -> schemas de validação
  fbq.ts                   -> analytics Facebook
  utils.ts                 -> utilitários
  store.ts                 -> estado global (zustand)
/types
  plan.ts                  -> tipos TypeScript
```

## REGRAS PARA PLANOS
### Normalização Obrigatória
Cada plano deve ser normalizado com:
- `pessoas`: 1 | 4 (extrair de "1 pessoa" ou "até 4 pessoas")
- `duracao_meses`: 1 | 3 | 6 | 12 (extrair de "(X meses)" ou "mês único")
- `nivel`: "Preferencial" | "Premium" | "VIP" | "Avulso" (extrair de nomes)
- `preco_total`: valor do JSON
- `preco_mensal_equivalente`: preco_total / duracao_meses
- `is_mensal_unico`: true quando duracao_meses === 1

### Parsing Resiliente
- **Pessoas**: "1 pessoa" → 1 | "até 4 pessoas"/"4 pessoas" → 4
- **Duração**: extrair "(X meses)"; "mês único" → 1
- **Nível**: "Preferencial", "Premium", "VIP"; "consulta única" → Avulso
- **Fallback**: se não encontrar nível, usar "Premium"

### Ordenação e Badges
- **"Mais popular"**: (1 pessoa, Premium, 6 meses)
- **"Melhor custo/mês"**: menor preco_mensal_equivalente
- **Defaults**: people=1, duration=6, level="Premium"

## WIZARD DE 3 PASSOS
### Estado
```typescript
{
  people: 1 | 4;
  duration: 1 | 3 | 6 | 12;
  level: "Preferencial" | "Premium" | "VIP";
}
```

### Lógica
1. Filtrar planos por pessoas, duracao_meses, nivel (ignorar Avulso)
2. Se não existir combinação: mostrar aviso "Sem plano para essa combinação"
3. Mostrar 1 card da combinação escolhida
4. Abaixo: seção "Atendimento pontual" com plano Avulso (se existir)

## FORMULÁRIO
### Campos Obrigatórios
- **Nome**: min 3 chars
- **Email**: formato válido
- **Telefone**: E.164 válido (ex: +5511999999999)
- **Termos**: checkbox obrigatório

### Validações (zod)
- Nome: min 3 caracteres
- Email: formato email válido
- Telefone: E.164 válido (usar libphonenumber-js)
- Termos: true obrigatório

## AÇÕES E INTEGRAÇÕES
### Ao Submeter
1. Se existir `window.fbq`: disparar `fbq('trackCustom', 'InicioCheckout')`
2. Abrir LoadingOverlay
3. Montar payload:
```typescript
{
  nome: string;
  email: string;
  telefone: string;        // E.164
  stripe_price_id: string; // do plano selecionado
  vendedor: string | null; // da URL
}
```
4. POST para `NEXT_PUBLIC_CHECKOUT_URL`
5. Resposta: se `data.success && data.data.checkout_url` → redirect
6. Senão se `data.url` → redirect
7. Caso contrário: Alert de erro

## COMPONENTES PRINCIPAIS
### FormLead
- Inputs com validação em tempo real
- PhoneInput com flags e DDI internacional
- Checkbox de termos com modal
- Captura vendedor da URL

### PlanWizard
- 3 grupos de controles (Chips/Segmented)
- Mostra 1 PlanCard do match
- Seção Avulso separada
- Acessibilidade: aria-pressed, role="radiogroup"

### PlanCard
- Título: "1 pessoa • Premium • 6 meses"
- Preço: $X (equivale a $Y/mês)
- 4 bullets: Telemedicina 24/7, Especialidades, WhatsApp, Sem taxa
- Badges: "Mais popular", "Melhor custo/mês"
- CTA "Continuar"

### PlanSummarySticky
- Sticky no mobile, normal no desktop
- Mostra combinação + preço + botão
- Sempre que houver planSelected

## ACESSIBILIDADE
- aria-label, aria-pressed nos chips
- role="tablist" quando apropriado
- aria-live="polite" no container do card
- Foco visível nos controles

## ESTILO
- Tailwind com contraste AA
- Cards: rounded-2xl, sombras suaves
- Cores: roxos (#8a49a1) para marca
- Responsivo: mobile-first

## CONFIGURAÇÕES IMPORTANTES
- **SSR x PhoneInput**: `dynamic(() => import('./PhoneInput'), { ssr: false })`
- **Fetch sem cache**: `fetch(url, { cache: 'no-store' })`
- **Moeda**: `new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`
- **CORS**: usar `mode: 'cors'` no fetch se necessário
- **Env**: nunca commitar .env.local

## COMANDOS
```bash
npm install          # instalar dependências
npm run dev         # iniciar servidor dev
npm run build       # build para produção
npm run start       # iniciar servidor produção
```

## OBSERVAÇÕES CRÍTICAS
1. **stripe_price_id** do plano escolhido deve ser enviado no payload do POST
2. **E.164** obrigatório para telefone
3. **Parsing resiliente** para nomes em pt-BR
4. **Fallback Premium** se não encontrar nível
5. **Avulso** detectar por "consulta única"
6. **A11y** foco visível nos chips
7. **Versões**: Next 14+, Node 18+, Tailwind 3, TypeScript estrito
```

Este arquivo contém todas as especificações do projeto. Você pode sempre consultá-lo para lembrar dos detalhes!

**⚠️ ATENÇÃO CRÍTICA - SISTEMAS EM PRODUÇÃO:**
- **Sistema de seleção de planos** (linhas 1-201) está funcionando perfeitamente em produção
- **Tela de cadastro de dependentes** (linhas 202-385) também está funcionando perfeitamente em produção
- **EXTREMAMENTE IMPORTANTE**: Não quebrar NADA que já funcione
- Qualquer alteração deve ser feita com extremo cuidado e testes prévios

Essa atualização deixa **cristalino** que:

1. ✅ **Sistema de planos** - Funcionando perfeitamente
2. ✅ **Sistema de dependentes** - Funcionando perfeitamente  
3. ⚠️ **Ambos estão em produção** - Zero tolerância para quebras
4. 🛡️ **Qualquer mudança** - Precisa de extremo cuidado

Agora qualquer desenvolvedor que trabalhe no projeto saberá que **ambos os sistemas** estão em produção e funcionando, e que deve ter cuidado redobrado com qualquer alteração! 🚨

Instrução 2.0 DEPENDENTES
## 📋 **CRIAR FORMULÁRIO DE CADASTRO DE DEPENDENTES - EasyDoctors**

Preciso que você crie um formulário React/TypeScript que funcione EXATAMENTE como este sistema:

### **FUNCIONALIDADES PRINCIPAIS:**

1. **FORMULÁRIO DINÂMICO BASEADO EM URL PARAMETERS:**
   - URL: `?plano=ID_PLANO&dependentes=NUMERO&Custumer_stripe=ID_STRIPE`
   - O número de campos de dependentes é determinado pelos parâmetros URL
   - Se o plano tem ID válido, usa a quantidade de dependentes do plano
   - Senão, usa o parâmetro `dependentes` diretamente

2. **MAPEAMENTO DE PLANOS:**
```javascript
const planos = {
  "7a356177-0a97-490d-b3f0-d7f4928a10f5": { nome: "assinatura_teste", dependentes: 0 },
  "fdff75fe-23c3-47d0-a84c-445532a878ef": { nome: "Plano 1 pessoa - Premium (6 meses)", dependentes: 0 },
  "9b4ace5f-1874-40ad-b5e9-93446a4447b9": { nome: "Plano 1 pessoa - VIP (12 meses)", dependentes: 0 },
  "fde207d4-fef1-4585-a285-c84507b85449": { nome: "Plano 1 pessoa: $29,90", dependentes: 1 },
  "1adf66a5-68a2-4533-a40b-14e149399130": { nome: "Plano 2 para até 4 pessoas: $49,90", dependentes: 4 },
  "94bf854e-b15e-4da3-b39d-b34cf5601388": { nome: "Plano 3 consulta única: $79,90", dependentes: 0 },
  "5b82a540-c362-4769-9331-6c69387f7176": { nome: "Plano 1 pessoa - Preferencial (3 meses)", dependentes: 0 },
  "46cb7319-1972-4af8-a216-d14a502f7394": { nome: "Plano 4 Valor adicional por dependente (mensal)", dependentes: 0 },
  "e2fde971-8359-486f-a9b7-12c9ac6dae09": { nome: "Plano 4 para até 4 pessoas - mês único: $89,90", dependentes: 4 },
  "c3323a7f-4ae6-4031-85d9-53fc892a016b": { nome: "Plano 2 para até 4 pessoas - Premium (6 meses)", dependentes: 4 },
  "2e15d471-d755-441f-abbf-3ebb89ad42d6": { nome: "Plano 2 para até 4 pessoas - VIP (12 meses)", dependentes: 4 },
  "108fa0a8-f6fb-46c3-a6b9-e5acce7adcf4": { nome: "Plano 2 para até 4 pessoas - Preferencial (3 meses)", dependentes: 4 }
};
```

3. **VALIDAÇÃO COM ZOD:**
```