"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TesteFormularioDependentes() {
  const testarFormulario = () => {
    // URLs de teste
    const urls = [
      "http://localhost:3000/cadastro-dependentes?plano=1adf66a5-68a2-4533-a40b-14e149399130&dependentes=4&Custumer_stripe=cus_123456",
      "http://localhost:3000/cadastro-dependentes?plano=fde207d4-fef1-4585-a285-c84507b85449&dependentes=1&Custumer_stripe=cus_789012",
      "http://localhost:3000/cadastro-dependentes?plano=fdff75fe-23c3-47d0-a84c-445532a878ef&dependentes=0&Custumer_stripe=cus_345678"
    ];

    urls.forEach((url, index) => {
      console.log(`Teste ${index + 1}: ${url}`);
    });
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Teste do Formulário</CardTitle>
        <CardDescription>
          URLs de teste para diferentes cenários
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold">Cenários de Teste:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 4 dependentes (plano família)</li>
            <li>• 1 dependente (plano individual)</li>
            <li>• 0 dependentes (plano sem dependentes)</li>
          </ul>
        </div>
        
        <Button 
          onClick={testarFormulario}
          className="w-full bg-[#74237F] hover:bg-[#6a1f6f]"
        >
          Gerar URLs de Teste
        </Button>
        
        <div className="text-xs text-gray-500">
          Abra o console para ver as URLs geradas
        </div>
      </CardContent>
    </Card>
  );
}
