"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import FormularioDependentes from '@/components/FormularioDependentes';
import { FormularioData } from '@/lib/dependentes-validators';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Mapeamento de planos conforme documentação
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

function CadastroDependentesContent() {
  const searchParams = useSearchParams();
  const [quantidadeDependentes, setQuantidadeDependentes] = useState(0);
  const [planoNome, setPlanoNome] = useState('');
  const [customerStripe, setCustomerStripe] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const plano = searchParams.get('plano');
    const dependentes = searchParams.get('dependentes');
    const customer = searchParams.get('Customer_stripe') || searchParams.get('Custumer_stripe');

    if (!plano) {
      setError('ID do plano não fornecido na URL');
      return;
    }

    if (!customer) {
      setError('ID do customer Stripe não fornecido na URL');
      return;
    }

    setCustomerStripe(customer);

    // Verificar se o plano existe no mapeamento
    if (plano in planos) {
      const planoData = planos[plano as keyof typeof planos];
      setPlanoNome(planoData.nome);
      setQuantidadeDependentes(planoData.dependentes);
    } else {
      // Se não existe no mapeamento, usar o parâmetro dependentes diretamente
      const numDependentes = dependentes ? parseInt(dependentes, 10) : 0;
      if (isNaN(numDependentes) || numDependentes < 0) {
        setError('Número de dependentes inválido');
        return;
      }
      setPlanoNome(`Plano ID: ${plano}`);
      setQuantidadeDependentes(numDependentes);
    }
  }, [searchParams]);

  const handleSubmit = async (data: FormularioData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Montar payload final conforme documentação
      const payload = {
        titular: {
          tipoDocumento: data.titular.tipoDocumento,
          numeroDocumento: data.titular.numeroDocumento,
          genero: data.titular.genero,
        },
        dependentes: data.dependentes.map(dep => ({
          nome: dep.nome,
          telefone: dep.telefone,
          codigoPais: dep.codigoPais || "BR",
          email: dep.email,
          genero: dep.genero,
          tipoDocumento: dep.tipoDocumento,
          numeroDocumento: dep.numeroDocumento,
        })),
        plano: data.plano,
        quantidadeDependentes,
        customerStripe,
      };

      console.log('Payload enviado:', payload);
      console.log('Webhook URL:', process.env.NEXT_PUBLIC_DEPENDENTES_WEBHOOK_URL);

      // Fazer requisição para o webhook de dependentes
      const webhookUrl = process.env.NEXT_PUBLIC_DEPENDENTES_WEBHOOK_URL || 
                        'https://primary-teste-2d67.up.railway.app/webhook-test/finalizar-cadastros';
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API: ${response.status} - ${errorText}`);
      }

      const resultado = await response.json();
      console.log('Resposta da API:', resultado);
      
      // Verificar se a resposta indica sucesso
      if (resultado.success || resultado.data) {
        alert('Formulário enviado com sucesso!');
        
        // Se houver URL de redirecionamento, redirecionar
        if (resultado.data?.checkout_url || resultado.url) {
          window.location.href = resultado.data?.checkout_url || resultado.url;
        }
      } else {
        throw new Error(resultado.message || 'Erro desconhecido na API');
      }
      
    } catch (err) {
      console.error('Erro ao enviar formulário:', err);
      setError(err instanceof Error ? err.message : 'Erro ao enviar formulário');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Erro</CardTitle>
            <CardDescription>Não foi possível carregar a página</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quantidadeDependentes === 0 && planoNome === '') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#74237F]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cadastro de Dependentes
          </h1>
          <p className="text-gray-600">
            Complete os dados dos dependentes para finalizar sua assinatura
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <p><strong>Plano:</strong> {planoNome}</p>
            <p><strong>Dependentes:</strong> {quantidadeDependentes}</p>
          </div>
        </div>

        <FormularioDependentes
          quantidadeDependentes={quantidadeDependentes}
          planoNome={planoNome}
          customerStripe={customerStripe}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default function CadastroDependentesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#74237F]"></div>
      </div>
    }>
      <CadastroDependentesContent />
    </Suspense>
  );
}
