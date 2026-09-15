import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { OrderStatus, PartnerTier, RequestStatus } from "@/lib/types";
import { ORDER_STATUS_LABEL, REQUEST_STATUS_LABEL } from "@/lib/format";
import { TIER_LABEL } from "@/lib/fees";

type ButtonVariant = "primary" | "secondary" | "ghost" | "dark" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-soft",
  secondary: "bg-white text-ink-900 border border-ink-200 hover:border-ink-300 hover:bg-ink-50",
  ghost: "text-ink-600 hover:text-ink-900 hover:bg-ink-100",
  dark: "bg-ink-900 text-white hover:bg-ink-800",
  danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-11 px-5 text-[15px]",
  lg: "h-14 px-7 text-base",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra?: string) {
  return cn(BASE, VARIANT[variant], SIZE[size], extra);
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...rest
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "green" | "amber" | "red" | "blue" | "dark";
  className?: string;
}) {
  const tones = {
    neutral: "bg-ink-100 text-ink-600",
    brand: "bg-brand-50 text-brand-700 ring-1 ring-brand-200",
    green: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    red: "bg-red-50 text-red-600 ring-1 ring-red-200",
    blue: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    dark: "bg-ink-900 text-white",
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}

const REQUEST_TONE: Record<RequestStatus, "neutral" | "brand" | "green" | "amber" | "red" | "blue"> = {
  open: "brand",
  selected: "amber",
  paid: "blue",
  in_progress: "blue",
  completed: "amber",
  settled: "green",
  canceled: "neutral",
};

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return <Badge tone={REQUEST_TONE[status]}>{REQUEST_STATUS_LABEL[status]}</Badge>;
}

const ORDER_TONE: Record<OrderStatus, "neutral" | "brand" | "green" | "amber" | "red" | "blue"> = {
  pending_payment: "amber",
  escrow: "blue",
  in_progress: "blue",
  completed: "amber",
  settled: "green",
  refunded: "neutral",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={ORDER_TONE[status]}>{ORDER_STATUS_LABEL[status]}</Badge>;
}

export function TierBadge({ tier }: { tier: PartnerTier }) {
  const tone = tier === "premium" ? "dark" : tier === "good" ? "brand" : "neutral";
  return (
    <Badge tone={tone}>
      {tier === "premium" ? "👑 " : tier === "good" ? "⭐ " : ""}
      {TIER_LABEL[tier]}
    </Badge>
  );
}

export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <span className="relative inline-block leading-none" style={{ fontSize: size }} aria-label={`별점 ${rating}점`}>
      <span className="text-ink-200">★★★★★</span>
      <span className="absolute inset-0 overflow-hidden text-lemon-500" style={{ width: `${pct}%` }}>
        ★★★★★
      </span>
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  desc,
  align = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  desc?: ReactNode;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "")}>
      {eyebrow && <p className="mb-3 text-sm font-bold tracking-wide text-brand-600">{eyebrow}</p>}
      <h2 className="text-2xl font-extrabold leading-tight text-ink-900 sm:text-[32px]">{title}</h2>
      {desc && <p className="mt-3 text-[15px] leading-relaxed text-ink-500 sm:text-base">{desc}</p>}
    </div>
  );
}

export function Field({
  label,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-ink-800">
        {label}
        {required && <span className="text-brand-600">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-ink-400">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-3.5 py-3 text-[15px] text-ink-900 placeholder:text-ink-300 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

export function Alert({ tone = "info", children }: { tone?: "info" | "warn" | "error" | "success"; children: ReactNode }) {
  const tones = {
    info: "bg-blue-50 text-blue-800 border-blue-100",
    warn: "bg-amber-50 text-amber-800 border-amber-100",
    error: "bg-red-50 text-red-700 border-red-100",
    success: "bg-emerald-50 text-emerald-800 border-emerald-100",
  } as const;
  return <div className={cn("rounded-xl border px-4 py-3 text-sm font-medium", tones[tone])}>{children}</div>;
}

export function EmptyState({ icon, title, desc, action }: { icon: string; title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="text-4xl">{icon}</div>
      <p className="text-base font-bold text-ink-900">{title}</p>
      {desc && <p className="max-w-sm text-sm text-ink-500">{desc}</p>}
      {action}
    </div>
  );
}
