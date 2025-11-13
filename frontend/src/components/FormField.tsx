/**
 * ASI-GEST Form Field Component
 * © 2025 Enrico Callegaro - Tutti i diritti riservati.
 */

import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
}

export default function FormField({ label, required, error, children, htmlFor }: FormFieldProps) {
  return (
    <div className="mb-3">
      <label htmlFor={htmlFor} className="block text-[11px] font-semibold text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[10px] text-red-600">{error}</p>}
    </div>
  );
}
