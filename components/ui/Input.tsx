import type { ComponentPropsWithoutRef } from "react";

// suffix = text vpravo v poli (napr. mena „€“ / „Kč“), nie je súčasťou hodnoty.
type InputProps = ComponentPropsWithoutRef<"input"> & { label: string; suffix?: string };

export function Input({ label, id, className, suffix, ...rest }: InputProps) {
  const inputId = id ?? rest.name;
  return (
    <label htmlFor={inputId} className="block">
      <span className="block text-11 uppercase tracking-[0.06em] text-ink-muted mb-2 font-mono">
        {label}
      </span>
      <span className="relative block">
        <input
          id={inputId}
          className={[
            "w-full bg-transparent border-0 border-b border-ink px-0 py-2 text-15",
            "focus-visible:outline-none focus-visible:border-b-2",
            "transition-[border-color] duration-150",
            suffix ? "pr-10" : "",
            className ?? "",
          ].join(" ")}
          {...rest}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-15 text-ink-muted">
            {suffix}
          </span>
        )}
      </span>
    </label>
  );
}

type TextareaProps = ComponentPropsWithoutRef<"textarea"> & { label: string };

export function Textarea({ label, id, className, ...rest }: TextareaProps) {
  const inputId = id ?? rest.name;
  return (
    <label htmlFor={inputId} className="block">
      <span className="block text-11 uppercase tracking-[0.06em] text-ink-muted mb-2 font-mono">
        {label}
      </span>
      <textarea
        id={inputId}
        className={[
          "w-full bg-transparent border-0 border-b border-ink px-0 py-2 text-15 resize-none",
          "focus-visible:outline-none focus-visible:border-b-2",
          "transition-[border-color] duration-150",
          className ?? "",
        ].join(" ")}
        {...rest}
      />
    </label>
  );
}
