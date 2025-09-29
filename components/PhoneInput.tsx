"use client";

import React, { forwardRef } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  className?: string;
  placeholder?: string;
}

const PhoneInputComponent = forwardRef<any, PhoneInputProps>(
  ({ value, onChange, className, placeholder, ...props }, ref) => {
    const handleChange = (newValue: string | undefined) => {
      if (!newValue) {
        onChange?.(newValue);
        return;
      }

      // Limitar caracteres baseado no país
      let maxLength = 15; // Default
      if (newValue.startsWith('+1')) {
        maxLength = 12; // EUA: +1 (555) 123-4567
      } else if (newValue.startsWith('+55')) {
        maxLength = 15; // Brasil: +55 (11) 99999-9999
      }

      // Se exceder o limite, não atualizar
      if (newValue.length > maxLength) {
        return;
      }

      onChange?.(newValue);
    };

    return (
      <PhoneInput
        value={value}
        onChange={handleChange}
        defaultCountry="BR"
        countries={['BR', 'US']}
        international
        countryCallingCodeEditable={false}
        className={cn("phone-input", className)}
        placeholder={placeholder}
        ref={ref}
        {...props}
      />
    );
  }
);

PhoneInputComponent.displayName = "PhoneInput";

export default PhoneInputComponent;
