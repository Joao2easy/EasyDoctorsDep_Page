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
import { Check, User } from "lucide-react";
import Image from "next/image";

// Dynamic imports
const FormLead = React.lazy(() => import("@/components/FormLead"));
const LoadingOverlay = React.lazy(() => import("@/components/LoadingOverlay"));

export default function PlanoIndividualPage() {
  const {
    plans,
    selectedPlan,
    isLoading,
    error,
    setPlans,
    setSelectedPlan,
    setLoading,
    setError,
  } = useAppStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [vendedor, setVendedor] = useState<string | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<FormData | null>(null);

  // Encontrar o plano individual
  const individualPlan = plans.find(plan => 
    plan.pessoas === 1 && 
    plan.nivel === "Premium" && 
    plan.duracao_meses === 1 &&
    plan.preco_total === 29.90
  );

  // Carregar planos e selecionar automaticamente o plano individual
  useEffect(() => {
    track("PageView", {
      page_name: "quase-la-individual"
    });
    
    const loadPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        const plansData = await getPlans();
        const normalizedPlans = normalizePlans(plansData);
        setPlans(normalizedPlans);
        
        // Selecionar automaticamente o plano individual
        const individual = normalizedPlans.find(plan => 
          plan.pessoas === 1 && 
          plan.nivel === "Premium" && 
          plan.duracao_meses === 1 &&
          plan.preco_total === 29.90
        );
        
        if (individual) {
          setSelectedPlan(individual);
          track("InicioCheckout", {
            plan: individual.nome_original,
            price: individual.preco_total,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar planos");
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [setPlans, setLoading, setError, setSelectedPlan]);

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
    
    const utmKeys = ['utm_source', 'utm_campaign', 'utm_medium', 'utm_content', 'utm_term'];
    
    utmKeys.forEach(key => {
      const value = urlParams.get(key);
      if (value) {
        utmParams.append(key, value);
      }
    });
    
    const utmString = utmParams.toString();
    return utmString || null;
  };

  const handleGoToStep2 = () => {
    if (!individualPlan) {
      setError("Plano individual não disponível");
      return;
    }
    setStep(2);
  };


  const handleConfirmRedirect = async () => {
    if (!individualPlan || !formDataToSubmit) return;

    try {
      setLoading(true);
      setError(null);

      const utmParameters = getUTMParameters();
      console.log('🔗 Parâmetros UTM capturados:', utmParameters);

      const payload: CheckoutPayload = {
        nome: formDataToSubmit.nome,
        email: formDataToSubmit.email,
        telefone: formDataToSubmit.telefone,
        stripe_price_id: individualPlan.stripe_price_id,
        vendedor: vendedor,
        URL_utmfy: utmParameters,
      };

      console.log('📦 Payload completo:', payload);

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
    if (!individualPlan) return;

    setFormDataToSubmit(formData);
    setShowConfirmationModal(true);
  };

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
      {/* Logo centralizado */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center">
            <Image
              src="/images/logo.png"
              alt="EasyDoctors"
              width={120}
              height={40}
              style={{ width: 'auto', height: 'auto' }}
              className="h-8 w-auto"
              priority
            />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        {/* Stepper */}
        <Stepper currentStep={step === 1 ? 2 : 3} />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {/* Step 1: Confirmação do Plano Individual */}
          {step === 1 && individualPlan && (
            <div className="max-w-2xl mx-auto">
              <div className="space-y-8">
                <Card className="shadow-xl border-0 bg-white">
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
                      Para você
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
                        <span className="text-gray-700">Receitas e encaminhamentos digitais</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Atendimento 100% em português</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Sem carência, sem burocracia</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">WhatsApp exclusivo para suporte</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Ideal para:</strong> Quem mora sozinho ou quer ter acesso rápido e ilimitado a médicos em português.
                      </p>
                    </div>
                    
                    <Button
                      onClick={handleGoToStep2}
                      className="w-full bg-[#74237F] hover:bg-[#6a1f6f] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg mt-6"
                    >
                      Continuar com Plano Individual
                    </Button>
                  </CardContent>
                </Card>
                
              </div>
            </div>
          )}

          {/* Step 2: Formulário */}
          {step === 2 && (
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
                      plan={individualPlan || null} 
                      onSubmit={handleFormSubmit} 
                      isLoading={isLoading} 
                    />
                  </React.Suspense>
                  
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
