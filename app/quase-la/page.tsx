"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { getPlans } from "@/lib/fetcher";
import { normalizePlans } from "@/lib/plan-normalizer";
import { track } from "@/lib/fbq";
import { FormData } from "@/lib/validators";
import { CheckoutPayload, ApiResponse, NormalizedPlan } from "@/types/plan";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Stepper from "@/components/Stepper";
import SelectedPlanPanel from "@/components/SelectedPlanPanel";
import PlanCard from "@/components/PlanCard";
import Header from "@/components/Header";
import { formatUSD } from "@/lib/utils";
import { Check, Users, User } from "lucide-react";

// Dynamic imports para evitar problemas de SSR
const FormLead = React.lazy(() => import("@/components/FormLead"));
const PlanWizard = React.lazy(() => import("@/components/PlanWizard"));
const LoadingOverlay = React.lazy(() => import("@/components/LoadingOverlay"));

export default function QuaseLaPage() {
  const {
    plans,
    wizardState,
    selectedPlan,
    isLoading,
    error,
    setPlans,
    setWizardState,
    setSelectedPlan,
    setLoading,
    setError,
  } = useAppStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [planSelected, setPlanSelected] = useState<NormalizedPlan | null>(null);
  const [vendedor, setVendedor] = useState<string | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [formDataToSubmit, setFormDataToSubmit] = useState<FormData | null>(null);

  // Carregar planos na inicialização
  useEffect(() => {
    // Disparar PageView
    track("PageView", {
      page_name: "quase-la"
    });
    
    const loadPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        const plansData = await getPlans();
        const normalizedPlans = normalizePlans(plansData);
        setPlans(normalizedPlans);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar planos");
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [setPlans, setLoading, setError]);

  // Capturar parâmetro vendedor da URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const vendedorParam = urlParams.get("vendedor");
      if (vendedorParam) {
        setVendedor(vendedorParam);
      }
    }
  }, []);

  // Função para capturar parâmetros UTM da URL
  const getUTMParameters = () => {
    if (typeof window === "undefined") return null;
    
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = new URLSearchParams();
    
    // Capturar todos os parâmetros UTM
    const utmKeys = ['utm_source', 'utm_campaign', 'utm_medium', 'utm_content', 'utm_term'];
    
    utmKeys.forEach(key => {
      const value = urlParams.get(key);
      if (value) {
        utmParams.append(key, value);
      }
    });
    
    // Retornar string de parâmetros UTM ou null se não houver nenhum
    const utmString = utmParams.toString();
    return utmString || null;
  };

  // Obter match atual do wizard
  const getCurrentMatch = () => {
    // Se está no modo avulso, retornar o plano avulso
    if (wizardState.isAvulso) {
      return plans.find(plan => plan.nivel === "Avulso") || null;
    }
    
    // Caso contrário, filtrar planos normais
    const filteredPlans = plans.filter(plan => {
      const isMatchingWizard = plan.pessoas === wizardState.people && 
        plan.duracao_meses === wizardState.duration && 
        plan.nivel === wizardState.level;
      
      const isNotAvulso = plan.nivel !== "Avulso";
      
      return isMatchingWizard && isNotAvulso;
    });
    
    console.log('🔍 Debug getCurrentMatch:', {
      wizardState,
      filteredPlans: filteredPlans.map(p => ({
        id: p.id,
        nome: p.nome_original,
        pessoas: p.pessoas,
        duracao_meses: p.duracao_meses,
        nivel: p.nivel
      }))
    });
    
    return filteredPlans[0] || null;
  };

  const handlePlanSelect = (plan: NormalizedPlan) => {
    setPlanSelected(plan);
    setSelectedPlan(plan);
    setStep(2);
    
    // Disparar evento do Facebook
    track("InicioCheckout", {
      plan: plan.nome_original,
      price: plan.preco_total,
    });
  };

  const handleGoToStep3 = () => {
    if (!planSelected) {
      setError("Selecione um plano para continuar");
      return;
    }
    setStep(3);
  };

  const handleBackToStep2 = () => {
    setStep(2);
  };

  const handleBackToStep1 = () => {
    setStep(1);
  };

  const handleConfirmRedirect = async () => {
    if (!planSelected || !formDataToSubmit) return;

    try {
      setLoading(true);
      setError(null);

      // Capturar parâmetros UTM
      const utmParameters = getUTMParameters();
      console.log('🔗 Parâmetros UTM capturados:', utmParameters);

      // Montar payload
      const payload: CheckoutPayload = {
        nome: formDataToSubmit.nome,
        email: formDataToSubmit.email,
        telefone: formDataToSubmit.telefone,
        stripe_price_id: planSelected.stripe_price_id,
        vendedor: vendedor,
        URL_utmfy: utmParameters,
      };

      console.log('📦 Payload completo:', payload);

      // Fazer requisição para o webhook de PRODUÇÃO
      const response = await fetch('https://primary-production-2441.up.railway.app/webhook/Cadastro-EasyDoctors', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();

      // Redirecionar para checkout
      if (data.success && data.data?.checkout_url) {
        window.location.href = data.data.checkout_url;
      } else if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Enviado, mas não recebemos o link do pagamento.");
        setShowConfirmationModal(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar!");
      setShowConfirmationModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (formData: FormData) => {
    if (!planSelected) return;

    // Salvar os dados do formulário para enviar depois
    setFormDataToSubmit(formData);
    
    // Mostrar modal de confirmação
    setShowConfirmationModal(true);
  };

  // Encontrar os planos específicos
  const individualPlan = plans.find(plan => 
    plan.pessoas === 1 && 
    plan.nivel === "Premium" && 
    plan.duracao_meses === 1 &&
    plan.preco_total === 29.90
  );

  const familiaPlan = plans.find(plan => 
    plan.pessoas === 4 && 
    plan.nivel === "Premium" && 
    plan.duracao_meses === 1 &&
    plan.preco_total === 49.90
  );

  // Verificar se é o mais popular e melhor valor
  const isMostPopular = (plan: NormalizedPlan) => 
    plan.preco_total === 49.90; // Família 4 pessoas mensal - O mais escolhido

  const bestValuePlan = plans.reduce((best, current) => 
    current.preco_mensal_equivalente < best.preco_mensal_equivalente ? current : best
  , plans[0]);

  const isBestValue = (plan: NormalizedPlan) => 
    plan.preco_total === 29.90; // Individual 1 pessoa - Melhor custo/mês

  const currentMatch = getCurrentMatch();

  if (isLoading && plans.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#74237F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando planos...</p>
        </div>
      </div>
    );
  }

  if (error && plans.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader>
            <CardTitle className="text-destructive">Erro</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#74237F] text-white px-4 py-3 rounded-lg hover:bg-[#6a1f6f] transition-colors"
            >
              Tentar novamente
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="font-bold text-gray-900 mb-2 leading-tight" style={{ fontSize: '20px' }}>
            Escolha seu plano em{" "}
            <span className="text-[#74237F]">3 passos</span>
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed" style={{ fontSize: '16px' }}>
            Acesso completo à telemedicina com especialistas qualificados
          </p>
        </div>

        {/* Stepper */}
        <Stepper currentStep={step} />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {/* Step 1: Seleção de Plano */}
          {step === 1 && (
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                
                {/* Plano Individual */}
                <Card className="shadow-xl border-0 bg-white hover:shadow-2xl transition-shadow duration-300">
                  <CardHeader className="text-center pb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                      Plano Individual
                    </CardTitle>
                    <div className="text-3xl font-bold text-[#74237F] mb-2">
                      $29,90/mês
                    </div>
                    <CardDescription className="text-gray-600">
                      Ideal para quem mora sozinho
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Clínico Geral Ilimitado</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Consultas por vídeo 24h</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Atendimento 100% em português</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Receitas e encaminhamentos digitais</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Sem carência, sem burocracia</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">WhatsApp exclusivo</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => individualPlan && handlePlanSelect(individualPlan)}
                      className="w-full bg-[#74237F] hover:bg-[#6a1f6f] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg mt-6"
                      disabled={!individualPlan}
                    >
                      {individualPlan ? "Escolher Plano Individual" : "Plano não disponível"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Plano Família */}
                <Card className="shadow-xl border-0 bg-white hover:shadow-2xl transition-shadow duration-300 relative">
                  {/* Badge Mais Popular */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#74237F] text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Mais Popular
                    </span>
                  </div>
                  
                  <CardHeader className="text-center pb-6 pt-6">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-[#74237F]" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                      Plano Família
                    </CardTitle>
                    <div className="text-3xl font-bold text-[#74237F] mb-2">
                      $49,90/mês
                    </div>
                    <CardDescription className="text-gray-600">
                      Até 4 pessoas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Clínico e Pediatra Ilimitado</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Consultas 24h</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">WhatsApp com prioridade</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Retorno com especialistas</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Todos os outros benefícios do individual</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => familiaPlan && handlePlanSelect(familiaPlan)}
                      className="w-full bg-[#74237F] hover:bg-[#6a1f6f] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg mt-6"
                      disabled={!familiaPlan}
                    >
                      {familiaPlan ? "Escolher Plano Família" : "Plano não disponível"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 2: Confirmação */}
          {step === 2 && planSelected && (
            <div className="max-w-2xl mx-auto">
              <div className="space-y-8">
                <PlanCard
                  plan={planSelected}
                  isMostPopular={isMostPopular(planSelected)}
                  isBestValue={isBestValue(planSelected)}
                  ctaLabel="Ir para os dados"
                  onSelect={handleGoToStep3}
                />
                
                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={handleBackToStep1}
                    className="text-gray-600 hover:text-[#74237F]"
                  >
                    Voltar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Formulário */}
          {step === 3 && (
            <div className="max-w-2xl mx-auto">
              <Card className="shadow-xl border-0">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl text-gray-900">Seus dados</CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    Preencha seus dados para finalizar a compra
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <React.Suspense fallback={<div>Carregando formulário...</div>}>
                    <FormLead 
                      plan={planSelected} 
                      onSubmit={handleFormSubmit} 
                      isLoading={isLoading} 
                    />
                  </React.Suspense>
                  
                  <div className="mt-8">
                    <Button
                      variant="outline"
                      onClick={handleBackToStep2}
                      className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Voltar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mt-8">
              <Alert variant="destructive" className="shadow-lg">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
        </div>

      </div>

      {/* Modal de Confirmação */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-[#74237F] rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Quase lá…
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-center leading-relaxed">
                "Agora vamos te direcionar para a Stripe, nossa plataforma de pagamentos certificada e licenciada em todo o mundo onde processamos nossos pagamentos com total segurança"
              </p>
              <p className="text-gray-600 text-center leading-relaxed text-sm">
                <strong>OBS:</strong> Assim que confirmado, você receberá automaticamente em seu e-mail o acesso a Easy Doctors e um presente de boas-vindas.
              </p>
              <Button
                onClick={handleConfirmRedirect}
                disabled={isLoading}
                className="w-full bg-[#74237F] hover:bg-[#6a1f6f] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg mt-6 disabled:opacity-50"
              >
                {isLoading ? "Processando..." : "Continuar"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading Overlay */}
      <React.Suspense fallback={<div>Carregando...</div>}>
        <LoadingOverlay isVisible={isLoading} />
      </React.Suspense>
    </div>
  );
}
