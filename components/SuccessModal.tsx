"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Clock } from "lucide-react";

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  redirectUrl?: string;
}

export default function SuccessModal({ open, onClose, redirectUrl }: SuccessModalProps) {
  const handleOk = () => {
    onClose();
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Sucesso!
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-600 mt-2">
            Seus dependentes foram adicionados com sucesso
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-6">
          <div className="flex items-start space-x-3">
            <Mail className="w-5 h-5 text-[#74237F] mt-1 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              Aguarde alguns instantes que você receberá um e-mail com o login e a senha para eles acessarem.
            </p>
          </div>
          
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-[#74237F] mt-1 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              O e-mail pode levar alguns minutos para chegar na sua caixa de entrada.
            </p>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button
            onClick={handleOk}
            className="bg-gradient-to-r from-[#74237F] to-[#8a49a1] hover:from-[#6a1f6f] hover:to-[#7a3d8a] text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg"
          >
            Entendi, continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
