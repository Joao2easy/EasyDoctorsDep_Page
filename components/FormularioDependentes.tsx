"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formularioSchema, FormularioData, tiposDocumento, generos, formatTelefone, formatDocumento, getCodigoPais } from "@/lib/dependentes-validators";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PhoneInput from "./PhoneInput";

interface FormularioDependentesProps {
  quantidadeDependentes: number;
  planoNome: string;
  customerStripe: string;
  onSubmit: (data: FormularioData) => void;
  isLoading?: boolean;
}

// Funções de máscara para documentos
const formatCPF = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  return cleaned
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .slice(0, 14);
};

const formatSSN = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  return cleaned
    .replace(/(\d{3})(\d)/, '$1-$2')
    .replace(/(\d{3})(\d{1,4})/, '$1-$2')
    .slice(0, 11);
};

const formatITIN = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  return cleaned
    .replace(/(\d{2})(\d)/, '$1-$2')
    .replace(/(\d{3})(\d{1,4})/, '$1-$2')
    .slice(0, 11);
};

const formatPassaporte = (value: string) => {
  return value.slice(0, 20);
};

// Função para aplicar máscara baseada no tipo de documento
const applyDocumentMask = (value: string, tipoDocumento: number) => {
  switch (tipoDocumento) {
    case 0: return formatCPF(value); // CPF
    case 1: return formatSSN(value); // SSN
    case 2: return formatITIN(value); // ITIN
    case 3: return formatPassaporte(value); // PASSAPORTE
    default: return value;
  }
};

export default function FormularioDependentes({ 
  quantidadeDependentes, 
  planoNome, 
  customerStripe, 
  onSubmit, 
  isLoading = false 
}: FormularioDependentesProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormularioData>({
    resolver: zodResolver(formularioSchema),
    defaultValues: {
      titular: {
        tipoDocumento: 0,
        numeroDocumento: "",
        genero: "",
      },
      dependentes: Array(quantidadeDependentes).fill(null).map(() => ({
        nome: "",
        telefone: "",
        codigoPais: "BR",
        email: "",
        genero: "",
        tipoDocumento: 0,
        numeroDocumento: "",
      })),
      plano: planoNome,
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "dependentes",
  });

  const handleTelefoneChange = (value: string | undefined, index: number, isTitular: boolean = false) => {
    if (isTitular) {
      setValue("titular.telefone", value || "");
    } else {
      setValue(`dependentes.${index}.telefone`, value || "");
    }
  };

  const handleDocumentoChange = (value: string, tipoDocumento: number, index: number, isTitular: boolean = false) => {
    const masked = applyDocumentMask(value, tipoDocumento);
    if (isTitular) {
      setValue("titular.numeroDocumento", masked);
    } else {
      setValue(`dependentes.${index}.numeroDocumento`, masked);
    }
  };

  const getDocumentPlaceholder = (tipoDocumento: number) => {
    switch (tipoDocumento) {
      case 0: return "000.000.000-00"; // CPF
      case 1: return "000-00-0000"; // SSN
      case 2: return "00-000-0000"; // ITIN
      case 3: return "Número do passaporte"; // PASSAPORTE
      default: return "Digite o número";
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      {/* Seção Titular */}
      <Card className="shadow-xl border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#74237F] rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">Dados do Titular</CardTitle>
              <CardDescription className="text-gray-600">
                Informações do responsável pela assinatura
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Tipo de Documento */}
            <div className="space-y-3">
              <Label htmlFor="titular.tipoDocumento" className="text-sm font-semibold text-gray-700">
                Tipo de Documento
              </Label>
              <select
                {...register("titular.tipoDocumento")}
                className="flex h-12 w-full rounded-lg border-2 border-gray-200 bg-background px-4 py-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-[#74237F] focus:ring-offset-2 focus:border-[#74237F] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                {tiposDocumento.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
              {errors.titular?.tipoDocumento && (
                <p className="text-sm text-destructive font-medium">{errors.titular.tipoDocumento.message}</p>
              )}
            </div>

            {/* Número do Documento */}
            <div className="space-y-3">
              <Label htmlFor="titular.numeroDocumento" className="text-sm font-semibold text-gray-700">
                Número do Documento
              </Label>
              <Input
                id="titular.numeroDocumento"
                placeholder={getDocumentPlaceholder(watch("titular.tipoDocumento"))}
                value={watch("titular.numeroDocumento")}
                onChange={(e) => handleDocumentoChange(e.target.value, watch("titular.tipoDocumento"), 0, true)}
                className={`h-12 rounded-lg border-2 px-4 py-3 text-sm transition-colors ${
                  errors.titular?.numeroDocumento 
                    ? "border-destructive focus:ring-destructive" 
                    : "border-gray-200 focus:ring-[#74237F] focus:border-[#74237F]"
                }`}
              />
              {errors.titular?.numeroDocumento && (
                <p className="text-sm text-destructive font-medium">{errors.titular.numeroDocumento.message}</p>
              )}
            </div>

            {/* Gênero */}
            <div className="space-y-3">
              <Label htmlFor="titular.genero" className="text-sm font-semibold text-gray-700">
                Gênero
              </Label>
              <select
                {...register("titular.genero")}
                className="flex h-12 w-full rounded-lg border-2 border-gray-200 bg-background px-4 py-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-[#74237F] focus:ring-offset-2 focus:border-[#74237F] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                <option value="">Selecione</option>
                {generos.map((genero) => (
                  <option key={genero.value} value={genero.value}>
                    {genero.label}
                  </option>
                ))}
              </select>
              {errors.titular?.genero && (
                <p className="text-sm text-destructive font-medium">{errors.titular.genero.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção Dependentes */}
      {quantidadeDependentes > 0 && (
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-[#74237F] to-[#8a49a1] text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-xl text-white">Dependentes ({quantidadeDependentes})</CardTitle>
                <CardDescription className="text-white/90">
                  Preencha os dados de cada dependente
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-8">
              {fields.map((field, index) => (
                <div key={field.id} className="border-2 border-gray-100 rounded-xl p-8 space-y-8 bg-gradient-to-br from-gray-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#74237F] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Dependente {index + 1}
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nome */}
                    <div className="space-y-3">
                      <Label htmlFor={`dependentes.${index}.nome`} className="text-sm font-semibold text-gray-700">
                        Nome Completo
                      </Label>
                      <Input
                        id={`dependentes.${index}.nome`}
                        placeholder="Nome completo"
                        {...register(`dependentes.${index}.nome`)}
                        className={`h-12 rounded-lg border-2 px-4 py-3 text-sm transition-colors ${
                          errors.dependentes?.[index]?.nome 
                            ? "border-destructive focus:ring-destructive" 
                            : "border-gray-200 focus:ring-[#74237F] focus:border-[#74237F]"
                        }`}
                      />
                      {errors.dependentes?.[index]?.nome && (
                        <p className="text-sm text-destructive font-medium">{errors.dependentes[index]?.nome?.message}</p>
                      )}
                    </div>

                    {/* Telefone com PhoneInput */}
                    <div className="space-y-3">
                      <Label htmlFor={`dependentes.${index}.telefone`} className="text-sm font-semibold text-gray-700">
                        Telefone
                      </Label>
                      <PhoneInput
                        value={watch(`dependentes.${index}.telefone`)}
                        onChange={(value) => handleTelefoneChange(value, index)}
                        placeholder="+55 11 99999-9999"
                        className={errors.dependentes?.[index]?.telefone ? "border-destructive" : ""}
                      />
                      {errors.dependentes?.[index]?.telefone && (
                        <p className="text-sm text-destructive font-medium">{errors.dependentes[index]?.telefone?.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-3">
                      <Label htmlFor={`dependentes.${index}.email`} className="text-sm font-semibold text-gray-700">
                        Email
                      </Label>
                      <Input
                        id={`dependentes.${index}.email`}
                        type="email"
                        placeholder="email@exemplo.com"
                        {...register(`dependentes.${index}.email`)}
                        className={`h-12 rounded-lg border-2 px-4 py-3 text-sm transition-colors ${
                          errors.dependentes?.[index]?.email 
                            ? "border-destructive focus:ring-destructive" 
                            : "border-gray-200 focus:ring-[#74237F] focus:border-[#74237F]"
                        }`}
                      />
                      {errors.dependentes?.[index]?.email && (
                        <p className="text-sm text-destructive font-medium">{errors.dependentes[index]?.email?.message}</p>
                      )}
                    </div>

                    {/* Gênero */}
                    <div className="space-y-3">
                      <Label htmlFor={`dependentes.${index}.genero`} className="text-sm font-semibold text-gray-700">
                        Gênero
                      </Label>
                      <select
                        {...register(`dependentes.${index}.genero`)}
                        className="flex h-12 w-full rounded-lg border-2 border-gray-200 bg-background px-4 py-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-[#74237F] focus:ring-offset-2 focus:border-[#74237F] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                      >
                        <option value="">Selecione</option>
                        {generos.map((genero) => (
                          <option key={genero.value} value={genero.value}>
                            {genero.label}
                          </option>
                        ))}
                      </select>
                      {errors.dependentes?.[index]?.genero && (
                        <p className="text-sm text-destructive font-medium">{errors.dependentes[index]?.genero?.message}</p>
                      )}
                    </div>

                    {/* Tipo de Documento */}
                    <div className="space-y-3">
                      <Label htmlFor={`dependentes.${index}.tipoDocumento`} className="text-sm font-semibold text-gray-700">
                        Tipo de Documento
                      </Label>
                      <select
                        {...register(`dependentes.${index}.tipoDocumento`)}
                        className="flex h-12 w-full rounded-lg border-2 border-gray-200 bg-background px-4 py-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-[#74237F] focus:ring-offset-2 focus:border-[#74237F] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                      >
                        {tiposDocumento.map((tipo) => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </select>
                      {errors.dependentes?.[index]?.tipoDocumento && (
                        <p className="text-sm text-destructive font-medium">{errors.dependentes[index]?.tipoDocumento?.message}</p>
                      )}
                    </div>

                    {/* Número do Documento */}
                    <div className="space-y-3">
                      <Label htmlFor={`dependentes.${index}.numeroDocumento`} className="text-sm font-semibold text-gray-700">
                        Número do Documento
                      </Label>
                      <Input
                        id={`dependentes.${index}.numeroDocumento`}
                        placeholder={getDocumentPlaceholder(watch(`dependentes.${index}.tipoDocumento`))}
                        value={watch(`dependentes.${index}.numeroDocumento`)}
                        onChange={(e) => handleDocumentoChange(e.target.value, watch(`dependentes.${index}.tipoDocumento`), index)}
                        className={`h-12 rounded-lg border-2 px-4 py-3 text-sm transition-colors ${
                          errors.dependentes?.[index]?.numeroDocumento 
                            ? "border-destructive focus:ring-destructive" 
                            : "border-gray-200 focus:ring-[#74237F] focus:border-[#74237F]"
                        }`}
                      />
                      {errors.dependentes?.[index]?.numeroDocumento && (
                        <p className="text-sm text-destructive font-medium">{errors.dependentes[index]?.numeroDocumento?.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão de Envio */}
      <div className="text-center pt-8">
        <Button
          type="submit"
          className="bg-gradient-to-r from-[#74237F] to-[#8a49a1] hover:from-[#6a1f6f] hover:to-[#7a3d8a] text-white font-bold py-4 px-12 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Enviando...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Finalizar Cadastro</span>
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}
