import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type Variant = "primary" | "secondary" | "text";

type CommonProps = {
  variant?: Variant;
  fullWidthOnMobile?: boolean;
  className?: string;
};

const base = "inline-flex items-center justify-center text-15 transition-[opacity,border-color] duration-150 disabled:opacity-40 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white px-6 py-4 hover:opacity-85",
  secondary: "bg-transparent border border-ink text-ink px-6 py-4 hover:opacity-70",
  text: "underline underline-offset-[3px] hover:opacity-70",
};

function classes(variant: Variant, fullWidthOnMobile: boolean, className?: string) {
  return [
    base,
    variants[variant],
    fullWidthOnMobile ? "w-full sm:w-auto" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

type ButtonProps = CommonProps &
  ComponentPropsWithoutRef<"button"> & { href?: undefined };

type LinkButtonProps = CommonProps &
  ComponentPropsWithoutRef<typeof Link> & { href: string };

export function Button(props: ButtonProps | LinkButtonProps) {
  const { variant = "primary", fullWidthOnMobile = false, className, ...rest } = props;

  if ("href" in props && props.href !== undefined) {
    const { href, ...linkRest } = rest as ComponentPropsWithoutRef<typeof Link>;
    return (
      <Link
        href={href}
        className={classes(variant, fullWidthOnMobile, className)}
        {...linkRest}
      />
    );
  }

  return (
    <button
      className={classes(variant, fullWidthOnMobile, className)}
      {...(rest as ComponentPropsWithoutRef<"button">)}
    />
  );
}
