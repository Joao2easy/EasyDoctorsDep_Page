// Mock dos planos para desenvolvimento (fallback)
const MOCK_PLANS = [
  {
    "id": "fdff75fe-23c3-47d0-a84c-445532a878ef",
    "nome": "Plano 1 pessoa - Premium (6 meses)",
    "stripe_product_id": "prod_T7VHLHht1SECk3",
    "stripe_price_id": "price_1SBbYaGbfw1lxjkCCt50fWPC",
    "max_dependentes": 0,
    "max_sessoes_mes": null,
    "ativo": true,
    "criado_em": "2025-09-26T13:19:28+00:00",
    "valor": 179.4,
    "grupo_plano": "plano 1"
  },
  {
    "id": "9b4ace5f-1874-40ad-b5e9-93446a4447b9",
    "nome": "Plano 1 pessoa - VIP (12 meses)",
    "stripe_product_id": "prod_T7VHLHht1SECk3",
    "stripe_price_id": "price_1SBbZjGbfw1lxjkCEVLv6Ukp",
    "max_dependentes": 0,
    "max_sessoes_mes": null,
    "ativo": true,
    "criado_em": "2025-09-26T13:20:39+00:00",
    "valor": 358.8,
    "grupo_plano": "plano 1"
  },
  {
    "id": "fde207d4-fef1-4585-a285-c84507b85449",
    "nome": "Plano 1 pessoa: $29,90",
    "stripe_product_id": "prod_T7VHLHht1SECk3",
    "stripe_price_id": "price_1SBGHOGbfw1lxjkCdiZfIlIG",
    "max_dependentes": 1,
    "max_sessoes_mes": 6,
    "ativo": true,
    "criado_em": "2025-09-25T14:36:18+00:00",
    "valor": 29.9,
    "grupo_plano": "plano 1"
  },
  {
    "id": "1adf66a5-68a2-4533-a40b-14e149399130",
    "nome": "Plano 2 para até 4 pessoas: $49,90",
    "stripe_product_id": "prod_T7VLmlZ4zjAmg4",
    "stripe_price_id": "price_1SBGKSGbfw1lxjkClws15uCH",
    "max_dependentes": 4,
    "max_sessoes_mes": 6,
    "ativo": true,
    "criado_em": "2025-09-25T14:39:27+00:00",
    "valor": 49.9,
    "grupo_plano": "plano 2"
  },
  {
    "id": "94bf854e-b15e-4da3-b39d-b34cf5601388",
    "nome": "Plano 3 consulta única: $79,90",
    "stripe_product_id": "prod_T7VLwiGWeiuErf",
    "stripe_price_id": "price_1SBGLDGbfw1lxjkCtKHplT67",
    "max_dependentes": 0,
    "max_sessoes_mes": 1,
    "ativo": true,
    "criado_em": "2025-09-25T14:40:14+00:00",
    "valor": 79.9,
    "grupo_plano": "plano 3"
  },
  {
    "id": "5b82a540-c362-4769-9331-6c69387f7176",
    "nome": "Plano 1 pessoa - Preferencial (3 meses)",
    "stripe_product_id": "prod_T1scfj64yakM2I",
    "stripe_price_id": "price_1SBLoSGbfw1lxjkCoBIpr7Ue",
    "max_dependentes": 0,
    "max_sessoes_mes": null,
    "ativo": true,
    "criado_em": "2025-09-25T20:30:48+00:00",
    "valor": 89.7,
    "grupo_plano": "plano 1"
  },
  {
    "id": "e2fde971-8359-486f-a9b7-12c9ac6dae09",
    "nome": "Plano 4 para até 4 pessoas - mês único: $89,90",
    "stripe_product_id": "prod_T7VM1qRjhaTZpN",
    "stripe_price_id": "price_1SBGMCGbfw1lxjkCKQ3GrH2Z",
    "max_dependentes": 4,
    "max_sessoes_mes": 4,
    "ativo": true,
    "criado_em": "2025-09-25T14:41:15+00:00",
    "valor": 89.9,
    "grupo_plano": "plano 4"
  },
  {
    "id": "c3323a7f-4ae6-4031-85d9-53fc892a016b",
    "nome": "Plano 2 para até 4 pessoas - Premium (6 meses)",
    "stripe_product_id": "prod_T7VLmlZ4zjAmg4",
    "stripe_price_id": "price_1SBbcpGbfw1lxjkCUlZhs6wW",
    "max_dependentes": 4,
    "max_sessoes_mes": null,
    "ativo": true,
    "criado_em": "2025-09-26T13:23:51+00:00",
    "valor": 299.4,
    "grupo_plano": "plano 2"
  },
  {
    "id": "2e15d471-d755-441f-abbf-3ebb89ad42d6",
    "nome": "Plano 2 para até 4 pessoas - VIP (12 meses)",
    "stripe_product_id": "prod_T7VLmlZ4zjAmg4",
    "stripe_price_id": "price_1SBbcpGbfw1lxjkCNxkzXTyn",
    "max_dependentes": 4,
    "max_sessoes_mes": null,
    "ativo": true,
    "criado_em": "2025-09-26T13:23:51+00:00",
    "valor": 598.8,
    "grupo_plano": "plano 2"
  },
  {
    "id": "108fa0a8-f6fb-46c3-a6b9-e5acce7adcf4",
    "nome": "Plano 2 para até 4 pessoas - Preferencial (3 meses)",
    "stripe_product_id": "prod_T7VLmlZ4zjAmg4",
    "stripe_price_id": "price_1SBbcpGbfw1lxjkCj8R3ZvOk",
    "max_dependentes": 4,
    "max_sessoes_mes": null,
    "ativo": true,
    "criado_em": "2025-09-26T13:23:51+00:00",
    "valor": 149.9,
    "grupo_plano": "plano 2"
  }
];

export async function getPlans(): Promise<any[]> {
  try {
    // Tentar buscar da API do Supabase primeiro
    const response = await fetch(
      'https://zvpeojnmnmbszncbgudt.supabase.co/rest/v1/Plano?select=*&ativo=is.true',
      {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2cGVvam5tbm1ic3puY2JndWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTMyODIsImV4cCI6MjA2NzEyOTI4Mn0.3NB5VhDG_QVikSD0KsWQ9UplX648SKQVl9b-2HgKTFk',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2cGVvam5tbm1ic3puY2JndWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTMyODIsImV4cCI6MjA2NzEyOTI4Mn0.3NB5VhDG_QVikSD0KsWQ9UplX648SKQVl9b-2HgKTFk',
          'Range': '0-9',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`Erro na API Supabase: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Verificar se retornou dados válidos
    if (Array.isArray(data) && data.length > 0) {
      console.log('✅ Planos carregados da API Supabase:', data.length);
      return data;
    } else {
      throw new Error('API retornou dados inválidos');
    }
    
  } catch (error) {
    console.warn('⚠️ Erro ao carregar da API Supabase, usando dados mockados:', error);
    
    // Fallback para dados mockados
    await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay
    return MOCK_PLANS;
  }
}



