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
    const people = plan.pessoas === 1 ? "1 pessoa" : "até 4 pessoas";
    const duration = plan.duracao_meses === 1 ? "mensal" : `${plan.duracao_meses} meses`;
    return `${people} • ${plan.nivel} • ${duration}`;
  };

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
            {plan.duracao_meses > 1 && (
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
          <li className="flex items-center">
            <div className="w-5 h-5 bg-[#00BE91] rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-gray-700">Telemedicina 24/7</span>
          </li>
          <li className="flex items-center">
            <div className="w-5 h-5 bg-[#00BE91] rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-gray-700">Especialidades principais</span>
          </li>
          <li className="flex items-center">
            <div className="w-5 h-5 bg-[#00BE91] rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-gray-700">WhatsApp exclusivo</span>
          </li>
          <li className="flex items-center">
            <div className="w-5 h-5 bg-[#00BE91] rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-gray-700">Sem taxa de adesão</span>
          </li>
        </ul>

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
