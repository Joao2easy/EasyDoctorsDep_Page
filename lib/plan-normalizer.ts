import { NormalizedPlan, PlanLevel, People, Duration } from "@/types/plan";

export function normalizePlans(dto: any[]): NormalizedPlan[] {
  return dto.map((item) => {
    const pessoas = parsePeople(item.nome);
    const duracao_meses = parseDuration(item.nome, item.valor);
    const nivel = parseLevel(item.nome, duracao_meses);
    const preco_total = parseFloat(item.valor) || 0;
    const preco_mensal_equivalente = duracao_meses > 1 ? preco_total / duracao_meses : preco_total;

    return {
      id: item.id || "",
      stripe_price_id: item.stripe_price_id || "",
      nome_original: item.nome || "",
      grupo: item.grupo_plano || "plano 1",
      pessoas,
      duracao_meses,
      nivel,
      max_dependentes: item.max_dependentes || 0,
      max_sessoes_mes: item.max_sessoes_mes || null,
      preco_total,
      preco_mensal_equivalente,
      is_mensal_unico: duracao_meses === 1,
    };
  });
}

function parsePeople(nome: string): People {
  const lower = nome.toLowerCase();
  if (lower.includes("1 pessoa") || lower.includes("uma pessoa")) {
    return 1;
  }
  if (lower.includes("4 pessoas") || lower.includes("até 4 pessoas") || lower.includes("até 4")) {
    return 4;
  }
  return 1; // default
}

function parseDuration(nome: string, valor: string): Duration {
  const lower = nome.toLowerCase();
  
  // Buscar por padrões como "(6 meses)", "(3 meses)", etc.
  const monthMatch = lower.match(/\((\d+)\s*meses?\)/);
  if (monthMatch) {
    const months = parseInt(monthMatch[1]);
    if ([1, 3, 6, 12].includes(months)) {
      return months as Duration;
    }
  }
  
  // Se contém "mês único" ou "consulta única"
  if (lower.includes("mês único") || lower.includes("consulta única")) {
    return 1;
  }
  
  // NOVO: Se não tem indicação de meses no nome, é mensal (1 mês)
  if (!lower.includes("meses") && !lower.includes("mês") && !lower.includes("meses")) {
    return 1; // Plano mensal
  }
  
  // Default para 6 meses se não encontrar
  return 6;
}

function parseLevel(nome: string, duracao_meses: Duration): PlanLevel {
  const lower = nome.toLowerCase();
  
  if (lower.includes("consulta única")) {
    return "Avulso";
  }
  
  // Determinar nível baseado na duração
  if (duracao_meses === 1) return "Premium"; // Mensal = Premium
  if (duracao_meses === 3) return "Preferencial";
  if (duracao_meses === 6) return "Premium";
  if (duracao_meses === 12) return "VIP";
  
  // Fallback baseado no nome se não conseguir determinar pela duração
  if (lower.includes("preferencial")) return "Preferencial";
  if (lower.includes("premium")) return "Premium";
  if (lower.includes("vip")) return "VIP";
  
  // Default para Premium
  return "Premium";
}
