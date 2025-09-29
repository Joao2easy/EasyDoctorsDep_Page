"use client";

import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PlanCard from "./PlanCard";
import { NormalizedPlan } from "@/types/plan";

type Props = {
  plan: NormalizedPlan | null;
  onSelect: (p: NormalizedPlan) => void;
  loading?: boolean;
  isMostPopular?: boolean;
  isBestValue?: boolean;
};

export default function SelectedPlanPanel({
  plan, 
  onSelect, 
  loading = false, 
  isMostPopular = false, 
  isBestValue = false,
}: Props) {
  if (loading) return <Card className="min-h-[280px]" />;
  
  if (!plan) {
    return (
      <Alert>
        <AlertDescription>Sem plano para essa combinação. Tente alterar a duração ou o nível.</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <PlanCard
      plan={plan}
      isMostPopular={isMostPopular}
      isBestValue={isBestValue}
      ctaLabel="Continuar"
      onSelect={() => onSelect(plan)}
      highlight
    />
  );
}
