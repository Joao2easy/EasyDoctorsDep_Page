"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { CheckCircle, Smartphone, Globe, Mail } from "lucide-react";
import { track } from "@/lib/fbq";

export default function BoasVindasPage() {
  useEffect(() => {
    // Verificar se veio do Stripe (pagamento aprovado)
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get("payment");
      const sessionId = urlParams.get("session_id");
      
      if (paymentStatus === "success") {
        console.log("🎉 Pagamento confirmado, disparando pixel Purchase");
        
        // Disparar pixel Purchase
        track("Purchase", {
          content_type: "product",
          content_ids: ["plano-49-90"],
          value: 49.90,
          currency: "USD",
          session_id: sessionId || "unknown"
        });
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          
          {/* Card Principal */}
          <Card className="shadow-xl border-0 bg-white mb-8">
            <CardHeader className="text-center pb-8 pt-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                Pagamento confirmado!
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 leading-relaxed">
                Que bom ter você com a gente.
                <br />
                Em instantes, você vai receber as instruções de acesso pelo seu e-mail.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Seção de Apps */}
          <Card className="shadow-xl border-0 bg-white mb-8">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-[#74237F] rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                Baixe nosso aplicativo
              </CardTitle>
              <CardDescription className="text-gray-600">
                Se quiser, já pode ir baixando nosso aplicativo nas lojas:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Botões das lojas */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  className="bg-black hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
                >
                  <a
                    href="https://apps.apple.com/br/app/easy-doctors/id6478969066"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-3"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <span>App Store</span>
                  </a>
                </Button>
                
                <Button
                  asChild
                  className="bg-black hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
                >
                  <a
                    href="https://play.google.com/store/apps/details?id=br.com.easydoctorsapp&hl=pt_BR"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-3"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                    <span>Google Play</span>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Seção de Acesso Web */}
          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                Ou acesse pelo navegador
              </CardTitle>
              <CardDescription className="text-gray-600 mb-6">
                Se preferir, acesse diretamente pelo navegador:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                className="w-full bg-[#74237F] hover:bg-[#6a1f6f] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
              >
                <a
                  href="https://telemedicine.easydoctors.us/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-3"
                >
                  <Globe className="w-5 h-5" />
                  <span>Acessar Plataforma Web</span>
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Informação sobre o email */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <Mail className="w-5 h-5" />
              <p className="text-sm font-medium">
                Verifique sua caixa de entrada (e spam) para as instruções de acesso
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
