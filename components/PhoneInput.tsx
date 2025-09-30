"use client";

import React, { forwardRef, useEffect, useState } from "react";
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
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

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

    if (!isMounted) {
      return (
        <input
          className={cn("flex h-12 w-full rounded-lg border-2 border-gray-200 bg-background px-4 py-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-[#74237F] focus:ring-offset-2 focus:border-[#74237F] disabled:cursor-not-allowed disabled:opacity-50 transition-colors", className)}
          placeholder={placeholder}
          disabled
        />
      );
    }

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
