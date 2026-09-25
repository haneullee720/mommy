import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { OrderStatus, PartnerTier, RequestStatus } from "@/lib/types";
import { ORDER_STATUS_LABEL, REQUEST_STATUS_LABEL } from "@/lib/format";
import { TIER_LABEL } from "@/lib/fees";
import { Icon } from "./icons";

type ButtonVariant = "primary" | "secondary" | "ghost" | "dark" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white shadow-soft hover:bg-brand-700 hover:shadow-lift",
  secondary: "bg-white text-brand-700 border border-brand-200 hover:border-brand-400 hover:bg-brand-50",
  ghost: "text-ink-600 hover:text-ink-900",
  dark: "bg-ink-900 text-white hover:bg-ink-800",
  danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-11 px-5 text-[14.5px]",
  lg: "h-13 px-7 text-[15px]",
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
    neutral: "bg-ink-50 text-ink-600 ring-ink-200",
    brand: "bg-brand-50 text-brand-700 ring-brand-200",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    red: "bg-red-50 text-red-600 ring-red-200",
    blue: "bg-brand-50 text-brand-700 ring-brand-200",
    dark: "bg-ink-900 text-white ring-ink-900",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
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
  return <Badge tone={tier === "premium" ? "dark" : tier === "good" ? "brand" : "neutral"}>{TIER_LABEL[tier]}</Badge>;
}

export function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
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

/** 별점 + 수치. 수치가 의미를 지고 별은 보조한다. */
export function Rating({ value, count, className }: { value: number; count?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline gap-1.5", className)}>
      <Stars rating={value} />
      <span className="tnum text-[13px] font-semibold text-ink-900">{value.toFixed(1)}</span>
      {count !== undefined && <span className="tnum text-[12px] text-ink-400">({count})</span>}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  desc,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  desc?: ReactNode;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && <p className="t-eyebrow mb-4">{eyebrow}</p>}
      <h2 className="t-h2 text-ink-900">{title}</h2>
      {desc && <p className="t-lead mt-4">{desc}</p>}
    </div>
  );
}

/**
 * 헤어라인 리스트의 한 행.
 * 카드 대신 쓰는 기본 구조 — 테두리 4개 대신 아래쪽 선 하나로 구분한다.
 */
export function Row({
  href,
  leading,
  title,
  meta,
  trailing,
  className,
}: {
  href?: string;
  leading?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}) {
  const inner = (
    <div
      className={cn(
        "group flex items-center gap-5 border-b border-ink-100 py-5 transition-colors",
        href && "hover:bg-white",
        className,
      )}
    >
      {leading && <div className="shrink-0 text-ink-400 transition-colors group-hover:text-brand-600">{leading}</div>}
      <div className="min-w-0 flex-1">
        <div className="t-h3 text-ink-900">{title}</div>
        {meta && <div className="mt-1 text-[13.5px] leading-relaxed text-ink-500">{meta}</div>}
      </div>
      {trailing && <div className="shrink-0 text-right">{trailing}</div>}
      {href && (
        <Icon
          name="arrowRight"
          className="h-4 w-4 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600"
        />
      )}
    </div>
  );
  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
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
      <span className="mb-2 flex items-center gap-1 text-[13px] font-semibold text-ink-700">
        {label}
        {required && <span className="text-brand-600">*</span>}
      </span>
      {children}
      {hint && <span className="mt-2 block text-[12.5px] leading-relaxed text-ink-400">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-[15px] text-ink-900 placeholder:text-ink-300 outline-none transition-colors focus:border-brand-500 focus:ring-4 focus:ring-brand-50";

export function Alert({ tone = "info", children }: { tone?: "info" | "warn" | "error" | "success"; children: ReactNode }) {
  const tones = {
    info: "border-brand-100 bg-brand-50/70 text-ink-700",
    warn: "border-amber-300 bg-amber-50/60 text-amber-900",
    error: "border-red-200 bg-red-50/60 text-red-700",
    success: "border-emerald-200 bg-emerald-50/70 text-emerald-800",
  } as const;
  return <div className={cn("rounded-xl border px-4 py-3.5 text-[14px] leading-relaxed", tones[tone])}>{children}</div>;
}

export function EmptyState({ icon, title, desc, action }: { icon?: ReactNode; title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-20 text-center shadow-soft">
      {icon && <div className="text-ink-300">{icon}</div>}
      <p className="t-h3 text-ink-900">{title}</p>
      {desc && <p className="max-w-sm text-[14px] leading-relaxed text-ink-500">{desc}</p>}
      {action}
    </div>
  );
}
