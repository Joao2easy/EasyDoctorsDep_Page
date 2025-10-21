"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { NormalizedPlan } from "@/types/plan";
import { formatUSD } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import { DollarSign } from "lucide-react";

// MAPEAMENTO COMPLETO com stripe_price_id (CORRIGIDO)
const PLANOS_EXTRAS_MAP = {
  "1adf66a5-68a2-4533-a40b-14e149399130": { // Plano base $49.90
    base_nome: "Plano 2 para até 4 pessoas: $49,90",
    extras: {
      0: { 
        id: "1adf66a5-68a2-4533-a40b-14e149399130", 
        nome: "Plano 2 para até 4 pessoas: $49,90", 
        valor: 49.90, 
        max_dependentes: 3,
        stripe_price_id: "price_1SCmotGbfw1lxjkCggettiPx"
      },
      1: { 
        id: "8dd0a455-7527-4680-aec4-64bb69b14231", 
        nome: "Plano Familia +1 Easy Doctors: $64.80", 
        valor: 64.80, 
        max_dependentes: 4,
        stripe_price_id: "price_1SKm9fGbfw1lxjkCIZtJHWro"
      },
      2: { 
        id: "e96977ae-984e-400b-858b-b7613f0d6ea0", 
        nome: "Plano Familia +2 Easy Doctors: $79.70", 
        valor: 79.70, 
        max_dependentes: 5,
        stripe_price_id: "price_1SKmAlGbfw1lxjkCIAHUXKBj"
      },
      3: { 
        id: "329c6dc5-f605-4399-8967-fae9b1d3a9a7", 
        nome: "Plano Familia +3 Easy Doctors: $94.60", 
        valor: 94.60, 
        max_dependentes: 6,
        stripe_price_id: "price_1SKmBZGbfw1lxjkCiJ7xYXf6"
      },
    },
  },
  "108fa0a8-f6fb-46c3-a6b9-e5acce7adcf4": { // Plano Preferencial 3 meses
    base_nome: "Plano 2 para até 4 pessoas - Preferencial (3 meses)",
    extras: {
      0: { 
        id: "108fa0a8-f6fb-46c3-a6b9-e5acce7adcf4", 
        nome: "Plano 2 para até 4 pessoas - Preferencial (3 meses)", 
        valor: 149.90, 
        max_dependentes: 3,
        stripe_price_id: "price_1SCmotGbfw1lxjkCb8NqwxSu"
      },
      1: { 
        id: "82c6e5f2-2bde-47a5-b7c8-5f62ce759792", 
        nome: "Plano Familia +1 Easy Doctors - Preferencial (3 meses)", 
        valor: 194.40, 
        max_dependentes: 4,
        stripe_price_id: "price_1SKmlPGbfw1lxjkCZkEjt7M8"
      },
      2: { 
        id: "6de024d1-1773-4072-bd86-7ac60d0e7212", 
        nome: "Plano Familia +2 Easy Doctors - Preferencial (3 meses)", 
        valor: 239.10, 
        max_dependentes: 5,
        stripe_price_id: "price_1SKmmZGbfw1lxjkCXZCWXLuS"
      },
      3: { 
        id: "4d6420ae-3a28-4c25-9103-6f459731fc07", 
        nome: "Plano Familia +3 Easy Doctors - Preferencial (3 meses)", 
        valor: 283.80, 
        max_dependentes: 6,
        stripe_price_id: "price_1SKmnQGbfw1lxjkC7aaRo7HC"
      },
    },
  },
  "c3323a7f-4ae6-4031-85d9-53fc892a016b": { // Plano Premium 6 meses
    base_nome: "Plano 2 para até 4 pessoas - Premium (6 meses)",
    extras: {
      0: { 
        id: "c3323a7f-4ae6-4031-85d9-53fc892a016b", 
        nome: "Plano 2 para até 4 pessoas - Premium (6 meses)", 
        valor: 299.40, 
        max_dependentes: 3,
        stripe_price_id: "price_1SCmotGbfw1lxjkCEit4T2s5"
      },
      1: { 
        id: "036dae82-7b9f-4ecf-98b1-e9629917e733", 
        nome: "Plano Familia +1 Easy Doctors - Premium (6 meses)", 
        valor: 388.80, 
        max_dependentes: 4,
        stripe_price_id: "price_1SKmlPGbfw1lxjkC2dn1UslX"
      },
      2: { 
        id: "5d632554-8974-4c29-b702-441a10442989", 
        nome: "Plano Familia +2 Easy Doctors - Premium (6 meses)", 
        valor: 478.20, 
        max_dependentes: 5,
        stripe_price_id: "price_1SKmmZGbfw1lxjkCVO3Udqet"
      },
      3: { 
        id: "fddf407f-cbb6-42df-9e06-05d28d35ee3b", 
        nome: "Plano Familia +3 Easy Doctors - Premium (6 meses)", 
        valor: 567.60, 
        max_dependentes: 6,
        stripe_price_id: "price_1SKmnQGbfw1lxjkCVYyIQqnM"
      },
    },
  },
  "2e15d471-d755-441f-abbf-3ebb89ad42d6": { // Plano VIP 12 meses
    base_nome: "Plano 2 para até 4 pessoas - VIP (12 meses)",
    extras: {
      0: { 
        id: "2e15d471-d755-441f-abbf-3ebb89ad42d6", 
        nome: "Plano 2 para até 4 pessoas - VIP (12 meses)", 
        valor: 598.80, 
        max_dependentes: 3,
        stripe_price_id: "price_1SCmotGbfw1lxjkCwsONjOyC"
      },
      1: { 
        id: "705a8566-ebe2-4c6b-9f21-7a1d2faaa763", 
        nome: "Plano Familia +1 Easy Doctors - VIP (12 meses)", 
        valor: 777.60, 
        max_dependentes: 4,
        stripe_price_id: "price_1SKmlPGbfw1lxjkChBTXGjke"
      },
      2: { 
        id: "0ca760eb-9384-4a63-af7c-dea5a20c645a", 
        nome: "Plano Familia +2 Easy Doctors - VIP (12 meses)", 
        valor: 956.40, 
        max_dependentes: 5,
        stripe_price_id: "price_1SKmmZGbfw1lxjkCWusK586Z"
      },
      3: { 
        id: "77975cb2-bbd1-45ad-bbee-3233c0f0a0b1", 
        nome: "Plano Familia +3 Easy Doctors - VIP (12 meses)", 
        valor: 1135.20, 
        max_dependentes: 6,
        stripe_price_id: "price_1SKmnQGbfw1lxjkCM51sJ4CR"
      },
    },
  },
};

interface PlanCardProps {
  plan: NormalizedPlan;
  onSelect: (plan: NormalizedPlan) => void;
  selected?: boolean;
  isLoading?: boolean;
  isMostPopular?: boolean;
  isBestValue?: boolean;
  ctaLabel?: string;
  highlight?: boolean;
  showExtrasSection?: boolean;
}

export default function PlanCard({ 
  plan, 
  onSelect, 
  selected = false, 
  isLoading = false,
  isMostPopular = false,
  isBestValue = false,
  ctaLabel = "Contratar Agora",
  highlight = false,
  showExtrasSection = false,
}: PlanCardProps) {
  const [selectedExtras, setSelectedExtras] = useState(0);

  // Mapear NormalizedPlan para interface interna
  const planData = plan || {
    id: '',
    nome_original: 'Carregando...',
    preco_total: 0,
    max_dependentes: 0,
    pessoas: 1,
    duracao_meses: 1,
    nivel: 'Premium' as const
  };

  const getTitle = () => {
    if (planData.nivel === "Avulso") {
      return "1 pessoa • Avulso • 30 dias";
    }
    
    const people = planData.pessoas === 1 ? "1 pessoa" : "até 4 pessoas";
    const duration = planData.duracao_meses === 1 ? "mensal" : `${planData.duracao_meses} meses`;
    return `${people} • ${planData.nivel} • ${duration}`;
  };

  const getBenefits = () => {
    const baseItems = ["Clínico Geral ilimitado"];
    
    let specificBenefits: string[] = [];
    
    if (planData.preco_total === 149.90) {
      specificBenefits = [
        "* 1 consulta com psicólogo",
        "* 1 consulta com especialista"
      ];
    } else if (planData.preco_total === 299.40) {
      specificBenefits = [
        "* 2 consultas com psicólogo",
        "* 2 consultas com especialistas"
      ];
    } else if (planData.preco_total === 598.80) {
      specificBenefits = [
        "* 6 consultas com psicólogo",
        "* 6 consultas com especialistas"
      ];
    }
    
    const commonItems = [
      "WhatsApp exclusivo",
      "Sem taxa de adesão"
    ];
    
    if (specificBenefits.length > 0) {
      return [...baseItems, ...specificBenefits, ...commonItems];
    }
    
    return [...baseItems, ...commonItems];
  };

  const shouldShowDisclaimer = () => {
    return [149.90, 299.40, 598.80].includes(planData.preco_total);
  };

  const permiteExtras = () => {
    return planData.nome_original.includes("até 4 pessoas") && 
           !planData.nome_original.includes("Familia +") &&
           planData.max_dependentes === 3;
  };

  // CORREÇÃO: getPlanoComExtras com stripe_price_id
  const getPlanoComExtras = (extras: number) => {
    const mapping = PLANOS_EXTRAS_MAP[planData.id];
    if (!mapping) return planData;
    
    const planoExtra = mapping.extras[extras];
    if (!planoExtra) return planData;
    
    return {
      ...planData,
      id: planoExtra.id,
      nome_original: planoExtra.nome,
      preco_total: planoExtra.valor,
      max_dependentes: planoExtra.max_dependentes,
      stripe_price_id: planoExtra.stripe_price_id // CORREÇÃO: Adicionar stripe_price_id
    };
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const benefits = getBenefits();

  return (
    <div className="relative">
      {/* CORREÇÃO 1: Design - Badges fora do card com z-index */}
      {isMostPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-[#74237F] text-white px-4 py-1 shadow-lg">
            Mais Popular
          </Badge>
        </div>
      )}
      
      {isBestValue && (
        <div className="absolute -top-3 right-4 z-10">
          <Badge className="bg-green-500 text-white px-4 py-1 shadow-lg">
            Melhor Valor
          </Badge>
        </div>
      )}

      <Card className={cn(
        "relative transition-all duration-200 shadow-lg border-0",
        selected && "ring-2 ring-[#74237F]",
        highlight && "ring-2 ring-[#74237F]",
        (isMostPopular || isBestValue) && "pt-4"
      )}>
        <CardHeader className={`text-center pb-4 ${(isMostPopular || isBestValue) ? 'pt-8' : ''}`}>
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            {!showExtrasSection ? getTitle() : getTitle()}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {!showExtrasSection 
              ? `${planData.max_dependentes + 1} pessoas incluídas`
              : `1 Titular + ${getPlanoComExtras(selectedExtras).max_dependentes} Dependentes`
            }
          </CardDescription>
        </CardHeader>

        {/* PASSO 1: Sem extras */}
        {!showExtrasSection && (
          <CardContent className="space-y-6">
            {/* PREÇO - RESTAURADO COMO ESTAVA */}
            <div className="text-center">
              <div className="text-4xl font-bold text-[#74237F] mb-2">
                {formatUSD(planData.preco_total)}
              </div>
              <p className="text-gray-600 text-sm">
                {planData.duracao_meses === 1 ? 'por mês' : `por ${planData.duracao_meses} meses`}
              </p>
            </div>

            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700 text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            {shouldShowDisclaimer() && (
              <div className="text-xs text-gray-600 px-3 py-3 bg-gray-50 rounded-md border border-gray-200">
                <p className="font-semibold mb-1 text-[10px]">* O benefício está vinculado à assinatura, e não a cada membro individualmente.</p>
                <p className="text-[10px]">Isso significa que a quantidade de benefícios informada corresponde ao total da assinatura, independentemente do número de membros.</p>
              </div>
            )}

            {permiteExtras() && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-blue-800 text-sm">
                  💡 Para adicionar dependentes complementares, siga para o passo 2
                </p>
              </div>
            )}
          </CardContent>
        )}

        {/* PASSO 2: Com extras */}
        {showExtrasSection && (
          <CardContent className="space-y-6">
            {permiteExtras() && (
              <div className="border-t pt-4 space-y-4">
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Dependentes Extras
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    +{formatUSD(getPlanoComExtras(1).preco_total - getPlanoComExtras(0).preco_total)} por dependente extra
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((extras) => (
                    <Button
                      key={extras}
                      variant={selectedExtras === extras ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedExtras(extras)}
                      className={cn(
                        "text-xs",
                        selectedExtras === extras
                          ? "bg-[#74237F] text-white"
                          : "border-gray-300 text-gray-600"
                      )}
                    >
                      {extras === 0 ? "Base" : `+${extras}`}
                    </Button>
                  ))}
                </div>

                {selectedExtras > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-800">
                        +{selectedExtras} dependente{selectedExtras > 1 ? "s" : ""} extra{selectedExtras > 1 ? "s" : ""}
                      </span>
                      <span className="font-semibold text-green-900">
                        +{formatUSD(getPlanoComExtras(selectedExtras).preco_total - getPlanoComExtras(0).preco_total)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">Preço Total</span>
                </div>
                <span className="text-2xl font-bold text-green-900">
                  {formatUSD(getPlanoComExtras(selectedExtras).preco_total)}
                </span>
              </div>
            </div>
          </CardContent>
        )}

        {/* CORREÇÃO 3: Botão com espaçamento correto */}
        <div className="p-6 pt-0">
          <Button
            onClick={() => {
              if (showExtrasSection) {
                onSelect(getPlanoComExtras(selectedExtras)); // CORREÇÃO: Agora com stripe_price_id correto
              } else {
                onSelect(planData);
              }
            }}
            className="w-full bg-[#00BE91] hover:bg-[#00A67A] text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-lg"
            size="lg"
          >
            {ctaLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}
