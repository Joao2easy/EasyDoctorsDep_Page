"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

export default function TermsModal({ open, onOpenChange, onAccept }: TermsModalProps) {
  const handleDownloadTerms = () => {
    // Criar link para download do PDF
    const link = document.createElement('a');
    link.href = '/Easy Doctors - TERMS OF USES.pdf';
    link.download = 'Easy Doctors - Termos de Uso.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#74237F] flex items-center space-x-2">
            <FileText className="w-6 h-6" />
            <span>Termos de Uso - EasyDoctors</span>
          </DialogTitle>
          <DialogDescription className="text-lg">
            Leia nossos termos de uso antes de continuar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Botão de Download */}
          <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                Para uma versão completa e detalhada dos nossos termos de uso:
              </p>
              <Button
                onClick={handleDownloadTerms}
                className="bg-[#74237F] hover:bg-[#6a1f6f] text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 shadow-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Termos Completos (PDF)
              </Button>
            </div>
          </div>

          {/* Resumo dos Termos */}
          <div className="prose prose-gray max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo dos Termos de Uso</h3>
            
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900">1. Aceitação dos Termos</h4>
                <p>Ao utilizar os serviços da EasyDoctors, você concorda com estes termos de uso.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900">2. Serviços de Telemedicina</h4>
                <p>Nossos serviços incluem consultas médicas online, prescrições digitais e acompanhamento de saúde.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900">3. Responsabilidades do Usuário</h4>
                <p>Você é responsável por fornecer informações precisas e atualizadas sobre sua saúde.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900">4. Privacidade e Segurança</h4>
                <p>Protegemos suas informações pessoais de acordo com a LGPD e boas práticas de segurança.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900">5. Limitações de Responsabilidade</h4>
                <p>Nossos serviços são complementares e não substituem consultas presenciais quando necessário.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900">6. Modificações</h4>
                <p>Reservamo-nos o direito de modificar estes termos a qualquer momento.</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Este é apenas um resumo. Para informações completas, 
                  baixe o documento PDF acima.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
          <Button
            onClick={onAccept}
            className="bg-[#74237F] hover:bg-[#6a1f6f] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg flex-1"
          >
            Li e Aceito os Termos
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg transition-colors duration-200 flex-1"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}



