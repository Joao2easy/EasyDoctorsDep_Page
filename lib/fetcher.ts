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

export async function getPlans() {
  const url = process.env.NEXT_PUBLIC_PLANS_URL;
  
  if (!url) {
    console.warn('NEXT_PUBLIC_PLANS_URL não configurada, usando dados mock');
    return MOCK_PLANS;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    
    // Verificar se a resposta é válida
    if (!Array.isArray(data)) {
      console.warn('API retornou dados inválidos, usando dados mock');
      return MOCK_PLANS;
    }
    
    console.log('✅ Planos carregados com sucesso da API:', data.length, 'planos');
    return data;
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    console.log('Usando dados mock como fallback');
    
    // Retornar dados mock em caso de erro
    return MOCK_PLANS;
  }
}

export async function getDependentes(clientId: string) {
  const url = 'https://primary-production-2441.up.railway.app/webhook/buscar-dependentes';
  
  try {
    console.log('🔍 Buscando dependentes para client_id:', clientId);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Dependentes carregados com sucesso da API:', data);
    return data;
  } catch (error) {
    console.error('Erro ao buscar dependentes:', error);
    throw error;
  }
}



