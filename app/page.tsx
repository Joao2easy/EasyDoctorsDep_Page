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
import Header from "@/components/Header";
import Stepper from "@/components/Stepper";
import SelectedPlanPanel from "@/components/SelectedPlanPanel";
import PlanCard from "@/components/PlanCard";
import { formatUSD } from "@/lib/utils";

// Dynamic imports para evitar problemas de SSR
const FormLead = React.lazy(() => import("@/components/FormLead"));
const PlanWizard = React.lazy(() => import("@/components/PlanWizard"));
const LoadingOverlay = React.lazy(() => import("@/components/LoadingOverlay"));

export default function HomePage() {
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

  // Carregar planos na inicialização
  useEffect(() => {
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

  // Obter match atual do wizard (apenas planos principais, não avulso)
  const getCurrentMatch = () => {
    const filteredPlans = plans.filter(plan => 
      plan.pessoas === wizardState.people && 
      plan.duracao_meses === wizardState.duration && 
      plan.nivel === wizardState.level &&
      plan.nivel !== "Avulso" // Excluir avulso do match principal
    );
    
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

  const handleFormSubmit = async (formData: FormData) => {
    if (!planSelected) return;

    try {
      setLoading(true);
      setError(null);

      // Montar payload
      const payload: CheckoutPayload = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        stripe_price_id: planSelected.stripe_price_id,
        vendedor: vendedor,
      };

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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar!");
    } finally {
      setLoading(false);
    }
  };

  // Verificar se é o mais popular e melhor valor
  const isMostPopular = (plan: NormalizedPlan) => 
    plan.pessoas === 1 && plan.nivel === "Premium" && plan.duracao_meses === 6;

  const bestValuePlan = plans.reduce((best, current) => 
    current.preco_mensal_equivalente < best.preco_mensal_equivalente ? current : best
  , plans[0]);

  const isBestValue = (plan: NormalizedPlan) => 
    bestValuePlan && plan.id === bestValuePlan.id;

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
            <div className="grid lg:grid-cols-[1fr_520px] gap-12">
              {/* Coluna da Esquerda: Apenas Filtros (sem Avulso) */}
              <div>
                <React.Suspense fallback={<div>Carregando wizard...</div>}>
                  <PlanWizard
                    plans={plans}
                    wizardState={wizardState}
                    onWizardChange={setWizardState}
                    onPlanSelect={handlePlanSelect}
                    selectedPlan={planSelected}
                    showAvulso={false} // Não mostrar Avulso aqui
                  />
                </React.Suspense>
              </div>

              {/* Coluna da Direita: Apenas Plano Principal */}
              <div className="lg:sticky lg:top-8">
                <SelectedPlanPanel
                  plan={currentMatch}
                  onSelect={handlePlanSelect}
                  loading={isLoading}
                  isMostPopular={currentMatch ? isMostPopular(currentMatch) : false}
                  isBestValue={currentMatch ? isBestValue(currentMatch) : false}
                />
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

        {/* Seção Avulso - SEMPRE NO FINAL (mobile e desktop) */}
        {step === 1 && (
          <div className="max-w-7xl mx-auto mt-20">
            <div className="border-t border-gray-200 pt-12">
              <div className="text-center mb-8">
                <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Atendimento pontual
                </h3>
                <p className="text-xs text-gray-500 mt-2">
                  Para consultas avulsas
                </p>
              </div>
              <div className="max-w-md mx-auto">
                {plans.find(plan => plan.nivel === "Avulso") && (
                  <PlanCard
                    plan={plans.find(plan => plan.nivel === "Avulso")!}
                    isSelected={selectedPlan?.id === plans.find(plan => plan.nivel === "Avulso")?.id}
                    ctaLabel="Selecionar"
                    onSelect={handlePlanSelect}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      <React.Suspense fallback={<div>Carregando...</div>}>
        <LoadingOverlay isVisible={isLoading} />
      </React.Suspense>
    </div>
  );
}
