"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import FormularioDependentes from '@/components/FormularioDependentes';
import { FormularioData } from '@/lib/dependentes-validators';
import { getDependentes, getPlans, getNumeroDependentes } from '@/lib/fetcher';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Clock } from "lucide-react";

// Interface para dados da API de dependentes
interface DadosDependentesAPI {
  numero_documento_titular: string | null;
  max_dependentes: number;
  dependentes_cadastrados: number;
  dependentes_restantes: number;
  lista_dependentes: any[];
}

// Interface para planos da API
interface PlanoAPI {
  id: string;
  nome: string;
  max_dependentes: number;
  [key: string]: any;
}

// Interface para planos mapeados
interface PlanoMapeado {
  nome: string;
  dependentes: number;
}

// Modal de Sucesso
interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  redirectUrl?: string;
}

function SuccessModal({ open, onClose, redirectUrl }: SuccessModalProps) {
  const handleOk = () => {
    onClose();
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Cadastro efetuado com sucesso!
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-600 mt-2">
            Em breve você receberá os próximos passos em seu e-mail.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-6">
          <div className="flex items-start space-x-3">
            <Mail className="w-5 h-5 text-[#74237F] mt-1 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              Verifique sua caixa de entrada (e spam) para as instruções de acesso.
            </p>
          </div>
          
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-[#74237F] mt-1 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              O e-mail pode levar alguns minutos para chegar.
            </p>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button
            onClick={handleOk}
            className="bg-gradient-to-r from-[#74237F] to-[#8a49a1] hover:from-[#6a1f6f] hover:to-[#7a3d8a] text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg"
          >
            OK, continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CadastroDependentesContent() {
  const searchParams = useSearchParams();
  const [planoNome, setPlanoNome] = useState('');
  const [customerStripe, setCustomerStripe] = useState('');
  const [clientId, setClientId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | undefined>();
  
  // NOVOS ESTADOS da API
  const [dadosDependentes, setDadosDependentes] = useState<DadosDependentesAPI | null>(null);

  // Carregar dados da API de dependentes
  useEffect(() => {
    const carregarDadosDependentes = async () => {
      try {
        setIsLoadingData(true);
        setError(null);
        
        // Pegar parâmetros da URL
        const plano = searchParams.get('plano');
        const customer = searchParams.get('Customer_stripe') || searchParams.get('Custumer_stripe');
        const client = searchParams.get('client_id');

        if (!plano) {
          setError('ID do plano não fornecido na URL');
          return;
        }

        if (!customer) {
          setError('ID do customer Stripe não fornecido na URL');
          return;
        }

        if (!client) {
          setError('ID do cliente não fornecido na URL');
          return;
        }

        setCustomerStripe(customer);
        setClientId(client);

        console.log('🔍 Buscando dados de dependentes...');
        console.log('📦 Parâmetros:', { client, customer, plano });
        
        // Buscar dados da nova API
        const dados = await getNumeroDependentes(client, customer, plano);
        
        console.log('✅ Dados recebidos da API:', dados);
        setDadosDependentes(dados);
        
        // Buscar nome do plano (ainda precisa da API de planos)
        const planosData = await getPlans();
        const planoEncontrado = planosData.find((p: PlanoAPI) => p.id === plano);
        
        if (planoEncontrado) {
          setPlanoNome(planoEncontrado.nome);
        } else {
          setPlanoNome('Plano Selecionado');
        }
        
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        setError('Erro ao carregar informações. Tente novamente.');
      } finally {
        setIsLoadingData(false);
      }
    };
    
    carregarDadosDependentes();
  }, [searchParams]);

  const handleSubmit = async (data: FormularioData) => {
    console.log('🚀 handleSubmit chamado!', data);
    
    try {
      setIsLoading(true);
      setError(null);

      // Montar payload final conforme documentação
      const payload = {
        titular: {
          tipoDocumento: data.titular.tipoDocumento,
          numeroDocumento: data.titular.numeroDocumento.replace(/\D/g, ''),
          genero: data.titular.genero,
        },
        dependentes: data.dependentes.map(dep => {
          let codigoPais = "+55";
          let telefoneSemCodigo = dep.telefone;
          
          if (dep.telefone.startsWith('+55')) {
            codigoPais = "+55";
            telefoneSemCodigo = dep.telefone.substring(3);
          } else if (dep.telefone.startsWith('+1')) {
            codigoPais = "+1";
            telefoneSemCodigo = dep.telefone.substring(2);
          }
          
          return {
            nome: dep.nome,
            telefone: telefoneSemCodigo,
            codigoPais: codigoPais,
            email: dep.email,
            genero: dep.genero,
            tipoDocumento: dep.tipoDocumento,
            numeroDocumento: dep.numeroDocumento.replace(/\D/g, ''),
          };
        }),
        plano: data.plano,
        quantidadeDependentes: dadosDependentes?.max_dependentes || 0,
        customerStripe,
      };

      console.log('📦 Payload enviado:', payload);

      const apiUrl = 'https://primary-production-2441.up.railway.app/webhook/finalizar-cadastros';
      
      console.log('🌐 Fazendo requisição para:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 Status da resposta:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na API:', response.status, errorText);
        throw new Error(`Erro na API: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log('📄 Resposta bruta da API:', responseText);

      let resultado;
      if (responseText.trim()) {
        try {
          resultado = JSON.parse(responseText);
          console.log('✅ Resposta da API (JSON):', resultado);
        } catch (parseError) {
          console.warn('⚠️ Resposta não é JSON válido:', responseText);
          if (response.status === 200) {
            resultado = { success: true, message: 'Formulário enviado com sucesso!' };
          } else {
            throw new Error('Resposta inválida da API');
          }
        }
      } else {
        console.warn('⚠️ Resposta vazia da API');
        if (response.status === 200) {
          resultado = { success: true, message: 'Formulário enviado com sucesso!' };
        } else {
          throw new Error('Resposta vazia da API');
        }
      }
      
      if (resultado.success || resultado.data) {
        const redirectUrl = resultado.data?.url || resultado.data?.checkout_url || resultado.url;
        setRedirectUrl(redirectUrl);
        
        console.log('🔗 URL de redirecionamento capturada:', redirectUrl);
        
        setShowSuccessModal(true);
      } else {
        throw new Error(resultado.message || 'Erro desconhecido na API');
      }
      
    } catch (err) {
      console.error('❌ Erro ao enviar formulário:', err);
      setError(err instanceof Error ? err.message : 'Erro ao enviar formulário');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading inicial
  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#74237F] mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Carregando informações...</h3>
          <p className="text-gray-600">Aguarde enquanto buscamos os dados do seu plano.</p>
        </div>
      </div>
    );
  }

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

  if (!dadosDependentes) {
    return null;
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
          </div>
        </div>

        <FormularioDependentes
          dadosAPI={dadosDependentes}
          planoNome={planoNome}
          customerStripe={customerStripe}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>

      {/* Modal de Sucesso */}
      <SuccessModal 
        open={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
        redirectUrl={redirectUrl}
      />
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
