import { SelectHTMLAttributes, forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, placeholder, className, id, children, ...props }, ref) => {
    const autoId = useId();
    const selectId = id || autoId;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-ink-700">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            className={clsx(
              "w-full appearance-none rounded-xl border bg-white px-3.5 py-2.5 pr-10 text-[15px] text-ink-900",
              "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-action-500 focus-visible:ring-offset-1",
              "disabled:bg-surface-muted disabled:text-ink-400 disabled:cursor-not-allowed",
              error ? "border-danger-500" : "border-navy-100 focus:border-action-500",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        </div>
        {error && <p className="mt-1.5 text-sm text-danger-600">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
