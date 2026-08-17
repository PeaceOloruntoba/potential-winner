import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-action-500 text-white hover:bg-action-600 active:bg-action-700 shadow-sm",
  secondary: "bg-navy-700 text-white hover:bg-navy-800 active:bg-navy-900 shadow-sm",
  outline: "border border-navy-200 text-navy-700 hover:bg-surface-muted bg-white",
  ghost: "text-navy-700 hover:bg-surface-muted",
  danger: "bg-danger-500 text-white hover:bg-danger-600 shadow-sm",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 rounded-lg gap-1.5",
  md: "text-sm px-4 py-2.5 rounded-xl gap-2",
  lg: "text-base px-5 py-3.5 rounded-xl gap-2",
};

/**
 * Every button in the app routes through here so loading/disabled states
 * are automatically consistent: isLoading swaps in a spinner AND disables
 * the button, so nobody can double-submit a form by tapping twice.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, fullWidth, disabled, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          "inline-flex items-center justify-center font-medium transition-colors duration-150",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          "active:scale-[0.98] transition-transform",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
