"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StepperProps {
  currentStep: 1 | 2 | 3;
  className?: string;
}

export default function Stepper({ currentStep, className }: StepperProps) {
  const steps = [
    { number: 1, label: "Escolha", description: "Selecione seu plano" },
    { number: 2, label: "Confirmação", description: "Revise sua escolha" },
    { number: 3, label: "Seus dados", description: "Preencha seus dados" },
  ];

  return (
    <div className={cn("w-full max-w-2xl mx-auto mb-8", className)}>
      <div className="flex items-center justify-between relative">
        {/* Linha de conexão */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
        <div 
          className="absolute top-6 left-0 h-0.5 bg-[#74237F] -z-10 transition-all duration-300"
          style={{ 
            width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' 
          }}
        />
        
        {steps.map((step, index) => (
          <div key={step.number} className="flex flex-col items-center relative z-10">
            {/* Círculo do step */}
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors",
                currentStep === step.number
                  ? "bg-[#74237F] border-[#74237F] text-white"
                  : currentStep > step.number
                  ? "bg-[#74237F] border-[#74237F] text-white"
                  : "bg-white border-gray-300 text-gray-500"
              )}
            >
              {currentStep > step.number ? "✓" : step.number}
            </div>
            
            {/* Label */}
            <div className="mt-2 text-center">
              <div
                className={cn(
                  "text-sm font-medium",
                  currentStep >= step.number ? "text-[#74237F]" : "text-gray-500"
                )}
              >
                {step.label}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {step.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
