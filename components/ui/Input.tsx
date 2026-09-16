import type { ComponentPropsWithoutRef } from "react";

type InputProps = ComponentPropsWithoutRef<"input"> & { label: string };

export function Input({ label, id, className, ...rest }: InputProps) {
  const inputId = id ?? rest.name;
  return (
    <label htmlFor={inputId} className="block">
      <span className="block text-11 uppercase tracking-[0.06em] text-ink-muted mb-2 font-mono">
        {label}
      </span>
      <input
        id={inputId}
        className={[
          "w-full bg-transparent border-0 border-b border-ink px-0 py-2 text-15",
          "focus-visible:outline-none focus-visible:border-b-2",
          "transition-[border-color] duration-150",
          className ?? "",
        ].join(" ")}
        {...rest}
      />
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
