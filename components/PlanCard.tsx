"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { NormalizedPlan } from "@/types/plan";
import { formatUSD } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  plan: NormalizedPlan;
  isMostPopular?: boolean;
  isBestValue?: boolean;
  isSelected?: boolean;
  highlight?: boolean;
  ctaLabel?: string;
  onSelect: (plan: NormalizedPlan) => void;
}

export default function PlanCard({ 
  plan, 
  isMostPopular, 
  isBestValue, 
  isSelected = false,
  highlight = false,
  ctaLabel = "Selecionar",
  onSelect 
}: PlanCardProps) {
  const getTitle = () => {
    // Caso especial para Avulso
    if (plan.nivel === "Avulso") {
      return "1 pessoa • Avulso • 30 dias";
    }
    
    // Para os outros planos
    const people = plan.pessoas === 1 ? "1 pessoa" : "até 4 pessoas";
    const duration = plan.duracao_meses === 1 ? "mensal" : `${plan.duracao_meses} meses`;
    return `${people} • ${plan.nivel} • ${duration}`;
  };

  // Função que retorna os benefícios de acordo com o preço do plano
  const getBenefits = () => {
    const baseItems = [
      "Clínico Geral ilimitado"
    ];
    
    // Usar o preço para determinar os benefícios específicos
    let specificBenefits: string[] = [];
    
    if (plan.preco_total === 149.90) {
      // Preferencial ($149.90)
      specificBenefits = [
        "* 1 consulta com psicólogo",
        "* 1 consulta com especialista"
      ];
    } else if (plan.preco_total === 299.40) {
      // Premium ($299.40)
      specificBenefits = [
        "* 2 consultas com psicólogo",
        "* 2 consultas com especialistas"
      ];
    } else if (plan.preco_total === 598.80) {
      // VIP ($598.80)
      specificBenefits = [
        "* 6 consultas com psicólogo",
        "* 6 consultas com especialistas"
      ];
    }
    
    const commonItems = [
      "WhatsApp exclusivo",
      "Sem taxa de adesão"
    ];
    
    // Se tem benefícios específicos, adiciona entre base e common
    if (specificBenefits.length > 0) {
      return [...baseItems, ...specificBenefits, ...commonItems];
    }
    
    // Para Individual ($29.90), Básico ($49.90) e Avulso ($79.90): apenas base + common
    return [...baseItems, ...commonItems];
  };

  // Função para verificar se deve mostrar o disclaimer
  const shouldShowDisclaimer = () => {
    return [149.90, 299.40, 598.80].includes(plan.preco_total);
  };

  const benefits = getBenefits();

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-200 shadow-lg border-0",
      isSelected && "ring-2 ring-[#74237F]",
      highlight && "ring-2 ring-[#74237F]"
    )}>
      {/* Badge "Mais popular" - apenas um, no canto superior direito */}
      {isMostPopular && (
        <div className="absolute top-0 right-0 bg-[#74237F] text-white px-4 py-2 text-xs font-semibold rounded-bl-lg z-10">
          Mais popular
        </div>
      )}
      
      <CardHeader className="pb-6">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">{getTitle()}</CardTitle>
            <CardDescription className="text-3xl font-bold text-[#74237F] mt-3">
              {formatUSD(plan.preco_total)}
            </CardDescription>
            {plan.duracao_meses > 1 && plan.nivel !== "Avulso" && (
              <p className="text-sm text-gray-600 mt-2">
                equivale a {formatUSD(plan.preco_mensal_equivalente)}/mês
              </p>
            )}
          </div>
          {isBestValue && (
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs border-[#74237F] text-[#74237F]">
              Melhor custo/mês
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <ul className="space-y-3 text-sm">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-center">
              <div className="w-5 h-5 bg-[#00BE91] rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-700">{benefit}</span>
            </li>
          ))}
        </ul>

        {/* Disclaimer para planos com benefícios específicos */}
        {shouldShowDisclaimer() && (
          <div className="text-xs text-gray-600 px-3 py-3 bg-gray-50 rounded-md border border-gray-200">
            <p className="font-semibold mb-1 text-[10px]">* O benefício está vinculado à assinatura, e não a cada membro individualmente.</p>
            <p className="text-[10px]">Isso significa que a quantidade de benefícios informada corresponde ao total da assinatura, independentemente do número de membros.</p>
          </div>
        )}

        <Button
          onClick={() => onSelect(plan)}
          className="w-full bg-[#00BE91] hover:bg-[#00A67A] text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-lg"
          size="lg"
        >
          {ctaLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
