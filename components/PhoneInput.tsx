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

const PhoneInputComponent = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, className, placeholder, ...props }, ref) => {
    return (
      <PhoneInput
        value={value}
        onChange={onChange}
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
