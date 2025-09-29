"use client";

import React from "react";
import { NormalizedPlan } from "@/types/plan";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatUSD } from "@/lib/utils";

interface PlanSummaryStickyProps {
  selectedPlan: NormalizedPlan | null;
  onSelect: (plan: NormalizedPlan) => void;
}

export default function PlanSummarySticky({ selectedPlan, onSelect }: PlanSummaryStickyProps) {
  if (!selectedPlan) return null;

  const getTitle = () => {
    const people = selectedPlan.pessoas === 1 ? "1 pessoa" : "até 4 pessoas";
    const duration = selectedPlan.duracao_meses === 1 ? "mensal" : `${selectedPlan.duracao_meses} meses`;
    return `${people} • ${selectedPlan.nivel} • ${duration}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t p-4 md:relative md:border-0 md:p-0">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{getTitle()}</CardTitle>
              <CardDescription className="text-xl font-bold text-purple-600">
                {formatUSD(selectedPlan.preco_total)}
              </CardDescription>
              {selectedPlan.duracao_meses > 1 && (
                <p className="text-sm text-muted-foreground">
                  equivale a {formatUSD(selectedPlan.preco_mensal_equivalente)}/mês
                </p>
              )}
            </div>
            <Button
              onClick={() => onSelect(selectedPlan)}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700"
            >
              Continuar
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

