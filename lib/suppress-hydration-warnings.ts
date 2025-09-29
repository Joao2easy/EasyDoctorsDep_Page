// Suprimir warnings de hidratação causados por extensões do navegador
import React from "react";

export const suppressHydrationWarning = (element: React.ReactElement) => {
  return React.cloneElement(element, {
    suppressHydrationWarning: true,
  });
};
