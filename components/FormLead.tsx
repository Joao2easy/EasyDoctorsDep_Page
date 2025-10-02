"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, FormData } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { NormalizedPlan } from "@/types/plan";
import { formatUSD } from "@/lib/utils";
import PhoneInput from "./PhoneInput";
import TermsModal from "./TermsModal";

interface FormLeadProps {
  plan: NormalizedPlan | null;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export default function FormLead({ plan, onSubmit, isLoading = false }: FormLeadProps) {
  const [showTerms, setShowTerms] = React.useState(false);
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      termos: false,
    },
  });

  const phoneValue = watch("telefone");

  const handlePhoneChange = (value: string | undefined) => {
    setValue("telefone", value || "", { shouldValidate: true });
  };

  const handleTermsAccept = () => {
    setTermsAccepted(true);
    setValue("termos", true, { shouldValidate: true });
    setShowTerms(false);
  };

  const getPlanSummary = () => {
    if (!plan) return "";
    const people = plan.pessoas === 1 ? "1 pessoa" : "até 4 pessoas";
    const duration = plan.duracao_meses === 1 ? "mensal" : `${plan.duracao_meses} meses`;
    return `${people} • ${plan.nivel} • ${duration}`;
  };

  const getPlanPrice = () => {
    if (!plan) return "";
    return formatUSD(plan.preco_total);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Resumo do plano com destaque cinza elegante */}
      {plan && (
        <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl text-gray-900 relative">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-[#74237F] rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Plano Selecionado</h3>
          </div>
          
          <p className="text-base font-medium text-gray-700 leading-relaxed mb-1">
            {getPlanSummary()}
          </p>
          
          <p className="text-2xl font-bold text-[#74237F]">
            {getPlanPrice()}
          </p>
          
          <div className="mt-3 flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#74237F] rounded-full animate-pulse"></div>
            <p className="text-sm text-gray-600 font-medium">Pronto para finalizar!</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome completo</Label>
          <Input
            id="nome"
            placeholder="Seu nome completo"
            {...register("nome")}
            className={errors.nome ? "border-destructive" : ""}
          />
          {errors.nome && (
            <p className="text-sm text-destructive">{errors.nome.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            {...register("email")}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <PhoneInput
            value={phoneValue}
            onChange={handlePhoneChange}
            placeholder="+55 11 99999-9999"
            className={errors.telefone ? "border-destructive" : ""}
          />
          {errors.telefone && (
            <p className="text-sm text-destructive">{errors.telefone.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="termos"
            checked={termsAccepted}
            onCheckedChange={(checked) => {
              setValue("termos", checked === true, { shouldValidate: true });
              setTermsAccepted(checked === true);
            }}
            className={errors.termos ? "border-destructive" : ""}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="termos"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Li e aceito os{" "}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-[#74237F] underline underline-offset-4 hover:no-underline"
              >
                Termos de Uso
              </button>
            </Label>
            {errors.termos && (
              <p className="text-sm text-destructive">{errors.termos.message}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#00BE91] hover:bg-[#00A67A] text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-lg"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? "Enviando..." : "Continuar"}
        </Button>
      </form>

      <TermsModal
        open={showTerms}
        onOpenChange={setShowTerms}
        onAccept={handleTermsAccept}
      />
    </div>
  );
}
