"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

export default function TermsModal({ open, onOpenChange, onAccept }: TermsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Termos de Uso</DialogTitle>
          <DialogDescription>
            Por favor, leia e aceite os termos para continuar.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            <strong>1. Aceitação dos Termos</strong>
          </p>
          <p>
            Ao utilizar nossos serviços, você concorda em cumprir e estar vinculado a estes Termos de Uso.
          </p>
          
          <p>
            <strong>2. Descrição do Serviço</strong>
          </p>
          <p>
            Nossa plataforma oferece planos de telemedicina com diferentes níveis de cobertura e duração.
          </p>
          
          <p>
            <strong>3. Pagamentos e Cobrança</strong>
          </p>
          <p>
            Os pagamentos são processados através do Stripe. Os valores são cobrados conforme o plano selecionado.
          </p>
          
          <p>
            <strong>4. Cancelamento</strong>
          </p>
          <p>
            Você pode cancelar seu plano a qualquer momento através da sua conta.
          </p>
          
          <p>
            <strong>5. Limitação de Responsabilidade</strong>
          </p>
          <p>
            Nossa responsabilidade é limitada ao valor pago pelo serviço no período em questão.
          </p>
          
          <p>
            <em>Este é um placeholder. Os termos reais serão inseridos posteriormente.</em>
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={onAccept}>
            Aceitar Termos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



