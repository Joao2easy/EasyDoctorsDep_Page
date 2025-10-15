"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import FormularioDependentes from '@/components/FormularioDependentes';
import { FormularioData } from '@/lib/dependentes-validators';
import { getDependentes, getPlans } from '@/lib/fetcher'; // NOVO: Import das funções
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Clock } from "lucide-react";

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
  const [quantidadeDependentes, setQuantidadeDependentes] = useState(0);
  const [planoNome, setPlanoNome] = useState('');
  const [customerStripe, setCustomerStripe] = useState('');
  const [clientId, setClientId] = useState(''); // ID do cliente para buscar dependentes
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPlanos, setIsLoadingPlanos] = useState(true);
  const [planos, setPlanos] = useState<{[key: string]: PlanoMapeado}>({});
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | undefined>();

  // Carregar planos da API
  useEffect(() => {
    const carregarPlanos = async () => {
      try {
        setIsLoadingPlanos(true);
        setError(null);
        
        console.log('🔍 Carregando planos da API...');
        const planosData = await getPlans();
        
        // Converter array para objeto com ID como chave
        const planosMap = planosData.reduce((acc, plano: PlanoAPI) => {
          acc[plano.id] = {
            nome: plano.nome,
            dependentes: plano.max_dependentes
          };
          return acc;
        }, {} as {[key: string]: PlanoMapeado});
        
        console.log('✅ Planos carregados com sucesso:', Object.keys(planosMap).length, 'planos');
        setPlanos(planosMap);
      } catch (error) {
        console.error('❌ Erro ao carregar planos:', error);
        setError('Erro ao carregar informações dos planos. Tente novamente.');
      } finally {
        setIsLoadingPlanos(false);
      }
    };
    
    carregarPlanos();
  }, []);

  useEffect(() => {
    // Só processar se os planos já foram carregados
    if (isLoadingPlanos) return;
    
    const plano = searchParams.get('plano');
    const dependentes = searchParams.get('dependentes');
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

    // Verificar se o plano existe no mapeamento da API
    if (plano in planos) {
      const planoData = planos[plano];
      setPlanoNome(planoData.nome);
      
      console.log('📋 Plano encontrado:', planoData.nome, 'Max dependentes:', planoData.dependentes);
      
      // Buscar dependentes já cadastrados e calcular restantes
      buscarDependentesECalcularRestantes(client, planoData.dependentes);
    } else {
      setError('Plano não encontrado. Verifique se o ID do plano está correto.');
    }
  }, [searchParams, planos, isLoadingPlanos]);

  // NOVA FUNÇÃO: Buscar dependentes já cadastrados e calcular restantes
  const buscarDependentesECalcularRestantes = async (clientId: string, maxDependentes: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 Buscando dependentes para client_id:', clientId);
      console.log('📊 Máximo de dependentes permitidos:', maxDependentes);
      
      // Buscar dependentes já cadastrados
      const dependentesJaCadastrados = await getDependentes(clientId);
      const quantidadeJaCadastrada = dependentesJaCadastrados.length;
      
      // Calcular dependentes restantes
      const dependentesRestantes = Math.max(0, maxDependentes - quantidadeJaCadastrada);
      
      console.log('📊 Resumo de dependentes:');
      console.log(`- Máximo permitido: ${maxDependentes}`);
      console.log(`- Já cadastrados: ${quantidadeJaCadastrada}`);
      console.log(`- Restantes para cadastrar: ${dependentesRestantes}`);
      
      setQuantidadeDependentes(dependentesRestantes);
      
      // Só mostrar erro se o plano permite dependentes mas já foram todos cadastrados
      if (maxDependentes > 0 && dependentesRestantes === 0) {
        setError('Você já cadastrou todos os dependentes permitidos pelo seu plano.');
      }
      
    } catch (error) {
      console.error('Erro ao buscar dependentes:', error);
      console.log('⚠️ API indisponível, usando quantidade máxima do plano como fallback');
      // Fallback: usar quantidade máxima do plano (sem mostrar erro na tela)
      setQuantidadeDependentes(maxDependentes);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: FormularioData) => {
    console.log('🚀 handleSubmit chamado!', data);
    
    try {
      setIsLoading(true);
      setError(null);

      // Montar payload final conforme documentação
      const payload = {
        titular: {
          tipoDocumento: data.titular.tipoDocumento,
          numeroDocumento: data.titular.numeroDocumento.replace(/\D/g, ''), // Remove pontuação
          genero: data.titular.genero,
        },
        dependentes: data.dependentes.map(dep => {
          // Extrair código do país do telefone (ex: +5511999999999 -> +55)
          let codigoPais = "+55"; // Default Brasil
          let telefoneSemCodigo = dep.telefone;
          
          if (dep.telefone.startsWith('+55')) {
            codigoPais = "+55";
            telefoneSemCodigo = dep.telefone.substring(3); // Remove +55
          } else if (dep.telefone.startsWith('+1')) {
            codigoPais = "+1";
            telefoneSemCodigo = dep.telefone.substring(2); // Remove +1
          }
          
          return {
            nome: dep.nome,
            telefone: telefoneSemCodigo,
            codigoPais: codigoPais,
            email: dep.email,
            genero: dep.genero,
            tipoDocumento: dep.tipoDocumento,
            numeroDocumento: dep.numeroDocumento.replace(/\D/g, ''), // Remove pontuação
          };
        }),
        plano: data.plano,
        quantidadeDependentes,
        customerStripe,
      };

      console.log('📦 Payload enviado:', payload);
      console.log('📱 Telefones processados:', data.dependentes.map(dep => ({
        original: dep.telefone,
        processado: payload.dependentes.find(p => p.nome === dep.nome)?.telefone,
        codigoPais: payload.dependentes.find(p => p.nome === dep.nome)?.codigoPais
      })));
      console.log('📄 Documentos processados:', {
        titular: {
          original: data.titular.numeroDocumento,
          processado: payload.titular.numeroDocumento
        },
        dependentes: data.dependentes.map(dep => ({
          nome: dep.nome,
          original: dep.numeroDocumento,
          processado: payload.dependentes.find(p => p.nome === dep.nome)?.numeroDocumento
        }))
      });

      // Fazer POST diretamente para a API externa
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
      console.log('📡 Headers da resposta:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na API:', response.status, errorText);
        throw new Error(`Erro na API: ${response.status} - ${errorText}`);
      }

      // Verificar se há conteúdo na resposta antes de tentar fazer parse JSON
      const responseText = await response.text();
      console.log('📄 Resposta bruta da API:', responseText);

      let resultado;
      if (responseText.trim()) {
        try {
          resultado = JSON.parse(responseText);
          console.log('✅ Resposta da API (JSON):', resultado);
        } catch (parseError) {
          console.warn('⚠️ Resposta não é JSON válido:', responseText);
          // Se não for JSON, tratar como sucesso se o status for 200
          if (response.status === 200) {
            resultado = { success: true, message: 'Formulário enviado com sucesso!' };
          } else {
            throw new Error('Resposta inválida da API');
          }
        }
      } else {
        console.warn('⚠️ Resposta vazia da API');
        // Se a resposta estiver vazia mas o status for 200, considerar sucesso
        if (response.status === 200) {
          resultado = { success: true, message: 'Formulário enviado com sucesso!' };
        } else {
          throw new Error('Resposta vazia da API');
        }
      }
      
      // Verificar se a resposta indica sucesso
      if (resultado.success || resultado.data) {
        // Capturar URL de redirecionamento - CORRIGIDO para capturar resultado.data.url
        const redirectUrl = resultado.data?.url || resultado.data?.checkout_url || resultado.url;
        setRedirectUrl(redirectUrl);
        
        console.log('🔗 URL de redirecionamento capturada:', redirectUrl);
        
        // Mostrar modal de sucesso
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

  // Loading dos planos
  if (isLoadingPlanos) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#74237F] mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Carregando informações do plano...</h3>
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

  // Removido: loading desnecessário - o FormularioDependentes se adapta à quantidade

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

        {/* Sempre renderizar FormularioDependentes - ele se adapta à quantidade de dependentes */}
        <FormularioDependentes
          quantidadeDependentes={quantidadeDependentes}
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
