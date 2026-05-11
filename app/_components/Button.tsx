import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent";

const variants: Record<Variant, string> = {
  primary:
    "bg-navy-dark text-off-white hover:bg-ashas-blue disabled:bg-slate-gray disabled:text-off-white/60",
  accent:
    "bg-cyan-accent text-navy-dark hover:bg-cyan-accent/85 disabled:opacity-50",
  secondary:
    "bg-white text-navy-dark border border-slate-gray/40 hover:border-navy-dark hover:bg-off-white",
  ghost: "bg-transparent text-navy-dark hover:bg-slate-gray/15",
  danger: "bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-300",
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2.5 text-sm font-bold transition-colors ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
