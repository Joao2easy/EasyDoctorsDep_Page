export type PlanLevel = "Preferencial" | "Premium" | "VIP" | "Avulso";
export type People = 1 | 4;
export type Duration = 1 | 3 | 6 | 12;

export type NormalizedPlan = {
  id: string;
  stripe_price_id: string;
  nome_original: string;
  grupo: "plano 1" | "plano 2" | "plano 3" | "plano 4";
  pessoas: People;
  duracao_meses: Duration;
  nivel: PlanLevel;
  max_dependentes: number;
  max_sessoes_mes: number | null;
  preco_total: number;
  preco_mensal_equivalente: number;
  is_mensal_unico: boolean;
};

export type WizardState = {
  people: People;
  duration: Duration;
  level: Exclude<PlanLevel, "Avulso">;
  isAvulso: boolean; // Nova flag para identificar modo avulso
};

export type CheckoutPayload = {
  nome: string;
  email: string;
  telefone: string;
  stripe_price_id: string;
  vendedor: string | null;
  URL_utmfy: string | null;
};

export type ApiResponse = {
  success: boolean;
  data?: {
    checkout_url: string;
  };
  url?: string;
  message?: string;
};

