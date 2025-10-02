"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import FormularioDependentes from '@/components/FormularioDependentes';
import { FormularioData } from '@/lib/dependentes-validators';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Clock } from "lucide-react";

// Mapeamento de planos conforme documentação
const planos = {
  "fdff75fe-23c3-47d0-a84c-445532a878ef": { nome: "Plano 1 pessoa - Premium (6 meses)", dependentes: 0 },
  "9b4ace5f-1874-40ad-b5e9-93446a4447b9": { nome: "Plano 1 pessoa - VIP (12 meses)", dependentes: 0 },
  "fde207d4-fef1-4585-a285-c84507b85449": { nome: "Plano 1 pessoa: $29,90", dependentes: 0 },
  "1adf66a5-68a2-4533-a40b-14e149399130": { nome: "Plano 2 para até 4 pessoas: $49,90", dependentes: 4 },
  "94bf854e-b15e-4da3-b39d-b34cf5601388": { nome: "Plano 3 consulta única: $79,90", dependentes: 0 },
  "5b82a540-c362-4769-9331-6c69387f7176": { nome: "Plano 1 pessoa - Preferencial (3 meses)", dependentes: 0 },
  "46cb7319-1972-4af8-a216-d14a502f7394": { nome: "Plano 4 Valor adicional por dependente (mensal)", dependentes: 0 },
  "e2fde971-8359-486f-a9b7-12c9ac6dae09": { nome: "Plano 4 para até 4 pessoas - mês único: $89,90", dependentes: 4 },
  "c3323a7f-4ae6-4031-85d9-53fc892a016b": { nome: "Plano 2 para até 4 pessoas - Premium (6 meses)", dependentes: 4 },
  "2e15d471-d755-441f-abbf-3ebb89ad42d6": { nome: "Plano 2 para até 4 pessoas - VIP (12 meses)", dependentes: 4 },
  "108fa0a8-f6fb-46c3-a6b9-e5acce7adcf4": { nome: "Plano 2 para até 4 pessoas - Preferencial (3 meses)", dependentes: 4 }
};

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | undefined>();

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
