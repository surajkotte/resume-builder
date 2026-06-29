import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Shown below the input in red; also sets aria-invalid */
  error?: string;
  /** Shown below the input when there is no error */
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, helperText, leftIcon, rightIcon, id, ...props },
    ref
  ) => {
    const inputId = id || React.useId();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              {leftIcon}
            </span>
          )}

          <input
            id={inputId}
            ref={ref}
            aria-invalid={!!error}
            className={cn(
              "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900",
              "placeholder:text-slate-400 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500",
              "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
              "dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              error &&
                "border-red-500 focus:ring-red-500 focus:border-red-500",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
              {rightIcon}
            </span>
          )}
        </div>

        {error ? (
          <p className="mt-1.5 text-sm text-red-600">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";
