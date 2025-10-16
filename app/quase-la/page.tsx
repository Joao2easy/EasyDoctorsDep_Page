"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { getPlans } from "@/lib/fetcher";
import { normalizePlans } from "@/lib/plan-normalizer";
import { track } from "@/lib/fbq";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Users, User } from "lucide-react";
import Image from "next/image";

export default function QuaseLaPage() {
  const {
    plans,
    isLoading,
    error,
    setPlans,
    setLoading,
    setError,
  } = useAppStore();

  const [vendedor, setVendedor] = useState<string | null>(null);

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
        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {/* Seleção de Plano */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Escolha seu plano
              </h1>
              <p className="text-xl text-gray-600">
                Selecione o plano ideal para você e sua família
              </p>
            </div>
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
                    onClick={() => window.location.href = '/quase-la/2'}
                    className="w-full bg-[#74237F] hover:bg-[#6a1f6f] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg mt-6"
                  >
                    Escolher Plano Individual
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
                    onClick={() => window.location.href = '/quase-la/1'}
                    className="w-full bg-[#74237F] hover:bg-[#6a1f6f] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg mt-6"
                  >
                    Escolher Plano Família
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

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
    </div>
  );
}