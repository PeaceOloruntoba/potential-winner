import { InputHTMLAttributes, forwardRef, useId } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leadingIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leadingIcon, className, id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id || autoId;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leadingIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
              {leadingIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={clsx(
              "w-full rounded-xl border bg-white px-3.5 py-2.5 text-[15px] text-ink-900 placeholder:text-ink-400",
              "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-action-500 focus-visible:ring-offset-1",
              "disabled:bg-surface-muted disabled:text-ink-400 disabled:cursor-not-allowed",
              leadingIcon && "pl-10",
              error ? "border-danger-500" : "border-navy-100 focus:border-action-500",
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="mt-1.5 text-sm text-danger-600">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-sm text-ink-400">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";
