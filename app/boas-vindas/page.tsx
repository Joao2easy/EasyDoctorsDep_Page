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
