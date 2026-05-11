import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const baseClass =
  "w-full rounded-md border border-slate-gray/40 bg-white px-3.5 py-2.5 text-sm text-navy-dark placeholder:text-slate-gray focus:border-ashas-blue focus:outline-none focus:ring-2 focus:ring-ashas-blue/20 transition-colors";

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold uppercase tracking-wider text-navy-dark mb-1.5">
        {label}
      </span>
      {children}
      {hint && (
        <span className="block text-xs text-slate-gray mt-1.5">{hint}</span>
      )}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} className={`${baseClass} ${props.className ?? ""}`} />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${baseClass} min-h-[80px] ${props.className ?? ""}`}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${baseClass} ${props.className ?? ""}`} />
  );
}
