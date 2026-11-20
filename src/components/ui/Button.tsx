import type { ComponentProps, ReactElement, ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, LoaderCircle } from "lucide-react";

import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type Tone = "light" | "dark";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  variant?: ButtonVariant;
  /** The surface the button sits on. */
  tone?: Tone;
  size?: Size;
  /** Brand arrow that swaps on hover. */
  arrow?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

type AsLink = BaseProps & { href: string } & Omit<
    ComponentProps<typeof Link>,
    "href" | "className" | "children"
  >;
type AsButton = BaseProps & { href?: undefined } & Omit<
    ComponentProps<"button">,
    "className" | "children"
  >;
export type ButtonProps = AsLink | AsButton;

const variants: Record<ButtonVariant, Record<Tone, string>> = {
  primary: {
    light: "bg-navy-900 text-white",
    dark: "bg-white text-navy-900 hover:text-white focus-visible:text-white",
  },
  secondary: {
    light: "border border-navy-900 text-navy-900 hover:text-white focus-visible:text-white",
    dark: "border border-white text-white hover:text-navy-900 focus-visible:text-navy-900",
  },
  ghost: {
    light: "text-ink hover:bg-mist",
    dark: "text-on-dark hover:bg-white/10",
  },
  danger: {
    light: "border border-error/40 text-error-text hover:bg-error hover:text-white",
    dark: "border border-error text-white hover:bg-error",
  },
};

/** Hover fill layer (the brand gradient for primary, a solid fill for secondary). */
const fills: Partial<Record<ButtonVariant, Record<Tone, string>>> = {
  primary: { light: "bg-gradient-logic", dark: "bg-gradient-logic" },
  secondary: { light: "bg-navy-900", dark: "bg-white" },
};

const sizes: Record<Size, string> = {
  sm: "h-10 min-w-10 px-4 text-small gap-2",
  md: "h-12 px-6 text-body gap-3",
  lg: "h-14 px-7 text-body gap-3",
};

const arrowBase = "absolute inset-0 size-4 transition-transform duration-swap ease-standard";

function Arrow(): ReactElement {
  return (
    <span aria-hidden="true" className="relative block size-4 overflow-hidden">
      <ArrowUpRight
        strokeWidth={1.5}
        className={cn(arrowBase, "group-hover:translate-x-full group-hover:-translate-y-full")}
      />
      <ArrowUpRight
        strokeWidth={1.5}
        className={cn(
          arrowBase,
          "-translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0",
        )}
      />
    </span>
  );
}

/** Pill button from the Reallogixs design system. Renders a Link when given `href`. */
export function Button(props: ButtonProps): ReactElement {
  const {
    variant = "primary",
    tone = "light",
    size = "md",
    arrow = false,
    loading = false,
    icon,
    className,
    children,
    ...rest
  } = props;
  const fill = fills[variant]?.[tone];

  const classes = cn(
    "group relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-pill font-medium whitespace-nowrap",
    "transition-colors duration-swap ease-standard disabled:pointer-events-none disabled:opacity-50",
    variants[variant][tone],
    sizes[size],
    className,
  );

  const inner = (
    <>
      {fill ? (
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 opacity-0 transition-opacity duration-swap group-hover:opacity-100 group-focus-visible:opacity-100",
            fill,
          )}
        />
      ) : null}
      {loading ? (
        <LoaderCircle aria-hidden="true" className="relative size-4 animate-spin" />
      ) : icon ? (
        <span aria-hidden="true" className="relative flex">
          {icon}
        </span>
      ) : null}
      <span className="relative">{children}</span>
      {arrow && !loading ? <Arrow /> : null}
    </>
  );

  if (typeof rest.href === "string") {
    return (
      <Link {...(rest as Omit<AsLink, keyof BaseProps>)} className={classes}>
        {inner}
      </Link>
    );
  }

  const buttonProps = rest as Omit<AsButton, keyof BaseProps>;
  return (
    <button
      type="button"
      {...buttonProps}
      disabled={buttonProps.disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
    >
      {inner}
    </button>
  );
}
