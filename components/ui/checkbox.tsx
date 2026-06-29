import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Plain text or JSX (e.g. text containing a Link) */
  label?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id || React.useId();

    return (
      <div className="flex items-start gap-2">
        <input
          id={checkboxId}
          ref={ref}
          type="checkbox"
          className={cn(
            "mt-0.5 h-4 w-4 rounded border-slate-300 text-violet-600",
            "focus:ring-2 focus:ring-violet-500 focus:ring-offset-0",
            "dark:border-slate-600 dark:bg-slate-800",
            className
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={checkboxId}
            className="text-sm text-slate-700 dark:text-slate-200 select-none leading-snug"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";