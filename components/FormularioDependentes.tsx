"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formularioSchema, FormularioData, tiposDocumento, generos } from "@/lib/dependentes-validators";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PhoneInput from "./PhoneInput";
import { HelpCircle, Plus, Trash2, Users, Info, MessageCircle } from "lucide-react";

// NOVA INTERFACE para dados da API
interface DadosDependentesAPI {
  numero_documento_titular: string | null;
  max_dependentes: number;
  dependentes_cadastrados: number;
  dependentes_restantes: number;
  lista_dependentes: any[];
}

interface FormularioDependentesProps {
  dadosAPI: DadosDependentesAPI; // MUDOU: recebe dados da API
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

const applyDocumentMask = (value: string, tipoDocumento: number) => {
  switch (tipoDocumento) {
    case 0: return formatCPF(value);
    case 1: return formatPassaporte(value);
    case 2: return formatSSN(value);
    case 3: return formatITIN(value);
    default: return value;
  }
};

export default function FormularioDependentes({ 
  dadosAPI, // NOVO
  planoNome, 
  customerStripe, 
  onSubmit, 
  isLoading = false 
}: FormularioDependentesProps) {
  console.log('🔍 FormularioDependentes - dadosAPI:', dadosAPI);
  
  // NOVOS ESTADOS baseados na API
  const temCPFCadastrado = !!dadosAPI.numero_documento_titular;
  const cpfTitular = dadosAPI.numero_documento_titular || "";
  
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormularioData>({
    resolver: zodResolver(formularioSchema),
    mode: "onBlur",
    defaultValues: {
      titular: {
        tipoDocumento: 0,
        numeroDocumento: temCPFCadastrado ? formatCPF(cpfTitular) : "",
        genero: "",
      },
      dependentes: [],
      plano: planoNome,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "dependentes",
  });

  // CONTADOR DINÂMICO: soma dependentes da API + cards adicionados no form
  const dependentesNoForm = fields.length;
  const totalDependentes = dadosAPI.dependentes_cadastrados + dependentesNoForm;
  const podeAdicionarMais = dependentesNoForm < dadosAPI.dependentes_restantes;

  const adicionarDependente = () => {
    if (podeAdicionarMais) {
      append({
        nome: "",
        telefone: "",
        codigoPais: "BR",
        email: "",
        genero: "",
        tipoDocumento: 0,
        numeroDocumento: "",
      });
    }
  };

  const removerDependente = (index: number) => {
    remove(index);
  };

  const handleTelefoneChange = (value: string | undefined, index: number) => {
    setValue(`dependentes.${index}.telefone`, value || "", { shouldValidate: true });
  };

  const handleDocumentoChange = (value: string, tipoDocumento: number, index: number, isTitular: boolean = false) => {
    const masked = applyDocumentMask(value, tipoDocumento);
    if (isTitular) {
      setValue("titular.numeroDocumento", masked, { shouldValidate: true });
    } else {
      setValue(`dependentes.${index}.numeroDocumento`, masked, { shouldValidate: true });
    }
  };

  const getDocumentPlaceholder = (tipoDocumento: number) => {
    switch (tipoDocumento) {
      case 0: return "000.000.000-00";
      case 1: return "Número do passaporte";
      case 2: return "000-00-0000";
      case 3: return "00-000-0000";
      default: return "Digite o número";
    }
  };

  const handleFormSubmit = (data: FormularioData) => {
    console.log('📝 FormularioDependentes - onSubmit chamado!', data);
    console.log('📝 Erros de validação:', errors);
    onSubmit(data);
  };

  // Função para abrir WhatsApp
  const abrirWhatsApp = () => {
    window.open('https://wa.me/14072867954', '_blank');
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-10">
      {/* Contador Visual de Dependentes - ATUALIZADO */}
      <div className="bg-gradient-to-r from-[#74237F] to-[#8a49a1] rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-full p-3">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">
                {totalDependentes} / {dadosAPI.max_dependentes}
              </h3>
              <p className="text-white/90 text-sm">
                Dependentes cadastrados
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{dadosAPI.dependentes_restantes - dependentesNoForm}</p>
            <p className="text-white/90 text-sm">Disponíveis</p>
          </div>
        </div>
        
        {/* Barra de Progresso */}
        <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-white h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${dadosAPI.max_dependentes > 0 ? (totalDependentes / dadosAPI.max_dependentes) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Seção Titular - ATUALIZADO COM LÓGICA DE BLOQUEIO */}
      <Card className="shadow-xl border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#74237F] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">Dados do Titular</CardTitle>
                <CardDescription className="text-gray-600">
                  {temCPFCadastrado 
                    ? "Dados já cadastrados (não editável)" 
                    : "Informações do responsável pela assinatura"}
                </CardDescription>
              </div>
            </div>
            {temCPFCadastrado && (
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                ✓ Já cadastrado
              </div>
            )}
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
                disabled={temCPFCadastrado}
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
                disabled={temCPFCadastrado}
                className={`h-12 rounded-lg border-2 px-4 py-3 text-sm transition-colors ${
                  errors.titular?.numeroDocumento 
                    ? "border-destructive focus:ring-destructive" 
                    : "border-gray-200 focus:ring-[#74237F] focus:border-[#74237F]"
                } ${temCPFCadastrado ? "bg-gray-100" : ""}`}
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
                disabled={temCPFCadastrado}
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
      <Card className="shadow-xl border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-[#74237F] to-[#8a49a1] text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-xl text-white">Dependentes</CardTitle>
              <CardDescription className="text-white/90">
                {dadosAPI.max_dependentes === 0 
                  ? "Seu plano não inclui dependentes" 
                  : "Adicione os dependentes que deseja cadastrar"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {/* Mensagem para plano sem dependentes */}
          {dadosAPI.max_dependentes === 0 && (
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Quer adicionar dependentes?</strong>
                <br />
                Faça upgrade para o <strong>Plano Família</strong> por apenas <strong>R$ 49,90</strong> e adicione até 4 dependentes!
              </AlertDescription>
            </Alert>
          )}

          {/* Lista de Dependentes */}
          {dadosAPI.max_dependentes > 0 && (
            <div className="space-y-6">
              {fields.length === 0 && dadosAPI.dependentes_restantes > 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium mb-2">
                    Nenhum dependente adicionado ainda
                  </p>
                  <p className="text-gray-400 text-sm">
                    Clique no botão abaixo para adicionar um dependente
                  </p>
                </div>
              )}

              {/* ALERTA: Limite atingido */}
              {dadosAPI.dependentes_restantes === 0 && fields.length === 0 && (
                <Alert className="bg-amber-50 border-amber-200">
                  <Info className="h-5 w-5 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <div className="space-y-3">
                      <p>
                        <strong>Você atingiu o limite de dependentes para esse plano!</strong>
                      </p>
                      <p className="text-sm">
                        Para adicionar mais dependentes, entre em contato conosco:
                      </p>
                      <Button
                        type="button"
                        onClick={abrirWhatsApp}
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Falar no WhatsApp
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {fields.map((field, index) => (
                <div key={field.id} className="border-2 border-gray-100 rounded-xl p-8 space-y-6 bg-gradient-to-br from-gray-50 to-white relative">
                  {/* Header do Card com Botão Remover */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#74237F] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {dadosAPI.dependentes_cadastrados + index + 1}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Dependente {dadosAPI.dependentes_cadastrados + index + 1}
                      </h4>
                    </div>
                    
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removerDependente(index)}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remover
                    </Button>
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

                    {/* Telefone */}
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

              {/* Botão Adicionar Dependente */}
              {podeAdicionarMais && (
                <div className="flex justify-center pt-4">
                  <Button
                    type="button"
                    onClick={adicionarDependente}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Adicionar Dependente
                  </Button>
                </div>
              )}

              {/* Mensagem quando atingir o limite E já tem cards */}
              {!podeAdicionarMais && dependentesNoForm > 0 && (
                <Alert className="bg-amber-50 border-amber-200">
                  <Info className="h-5 w-5 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <div className="space-y-3">
                      <p>
                        <strong>Você atingiu o limite de dependentes disponíveis para cadastro!</strong>
                      </p>
                      <p className="text-sm">
                        Para adicionar mais dependentes, entre em contato conosco:
                      </p>
                      <Button
                        type="button"
                        onClick={abrirWhatsApp}
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Falar no WhatsApp
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
