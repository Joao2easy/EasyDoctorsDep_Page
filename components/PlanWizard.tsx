"use client";

import React from "react";
import { NormalizedPlan, WizardState } from "@/types/plan";
import PlanCard from "./PlanCard";

interface PlanWizardProps {
  plans: NormalizedPlan[];
  wizardState: WizardState;
  onWizardChange: (state: WizardState) => void;
  onPlanSelect: (plan: NormalizedPlan) => void;
  selectedPlan?: NormalizedPlan | null;
  showAvulso?: boolean;
}

export default function PlanWizard({ 
  plans, 
  wizardState, 
  onWizardChange, 
  onPlanSelect,
  selectedPlan,
  showAvulso = true
}: PlanWizardProps) {
  const { people, duration } = wizardState;

  // Encontrar plano avulso
  const avulsoPlan = plans.find(plan => plan.nivel === "Avulso");

  const handlePeopleChange = (newPeople: 1 | 4) => {
    onWizardChange({ ...wizardState, people: newPeople });
  };

  const handleDurationChange = (newDuration: 1 | 3 | 6 | 12) => {
    // Determinar o nível automaticamente baseado na duração
    let level: "Preferencial" | "Premium" | "VIP";
    if (newDuration === 1) level = "Premium"; // Mensal = Premium
    else if (newDuration === 3) level = "Preferencial";
    else if (newDuration === 6) level = "Premium";
    else if (newDuration === 12) level = "VIP";
    else level = "Premium"; // fallback
    
    onWizardChange({ ...wizardState, duration: newDuration, level });
  };

  return (
    <div className="space-y-10">
      {/* Wizard Controls */}
      <div className="space-y-8">
        {/* Quem vai usar */}
        <div>
          <h3 className="text-xl font-semibold mb-6 text-gray-900">Quem vai usar?</h3>
          <div className="flex gap-3" role="radiogroup" aria-label="Número de pessoas">
            <button
              className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                people === 1 
                  ? "bg-[#74237F] text-white shadow-lg" 
                  : "bg-white text-gray-700 border-2 border-gray-200 hover:border-[#74237F] hover:shadow-md"
              }`}
              onClick={() => handlePeopleChange(1)}
              aria-pressed={people === 1}
              role="radio"
            >
              1 pessoa
            </button>
            <button
              className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                people === 4 
                  ? "bg-[#74237F] text-white shadow-lg" 
                  : "bg-white text-gray-700 border-2 border-gray-200 hover:border-[#74237F] hover:shadow-md"
              }`}
              onClick={() => handlePeopleChange(4)}
              aria-pressed={people === 4}
              role="radio"
            >
              até 4 pessoas
            </button>
          </div>
        </div>

        {/* Duração */}
        <div>
          <h3 className="text-xl font-semibold mb-6 text-gray-900">Duração</h3>
          <div className="flex gap-3 flex-wrap" role="radiogroup" aria-label="Duração do plano">
            {[
              { value: 1, label: "Mensal", description: "Premium" },
              { value: 3, label: "3 meses", description: "Preferencial" },
              { value: 6, label: "6 meses", description: "Premium" },
              { value: 12, label: "12 meses", description: "VIP" }
            ].map(({ value, label, description }) => (
              <button
                key={value}
                className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  duration === value 
                    ? "bg-[#74237F] text-white shadow-lg" 
                    : "bg-white text-gray-700 border-2 border-gray-200 hover:border-[#74237F] hover:shadow-md"
                }`}
                onClick={() => handleDurationChange(value as 1 | 3 | 6 | 12)}
                aria-pressed={duration === value}
                role="radio"
                title={`${label} - ${description}`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            
          </p>
        </div>
      </div>

      {/* Seção Avulso - SÓ SE showAvulso for true */}
      {showAvulso && avulsoPlan && (
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
            <PlanCard
              plan={avulsoPlan}
              isSelected={selectedPlan?.id === avulsoPlan.id}
              ctaLabel="Selecionar"
              onSelect={onPlanSelect}
            />
          </div>
        </div>
      )}
    </div>
  );
}
