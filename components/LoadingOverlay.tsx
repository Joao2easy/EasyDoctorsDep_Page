"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingOverlayProps {
  isVisible: boolean;
}

export default function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-80">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-4xl mb-4">❤️‍🩹</div>
          <h3 className="text-lg font-semibold mb-2">Só um instante...</h3>
          <p className="text-sm text-muted-foreground">
            Estamos processando seu pedido
          </p>
          <div className="mt-4 w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    </div>
  );
}

