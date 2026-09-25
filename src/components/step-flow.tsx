import { Icon, type IconName } from "./icons";
import { cn } from "@/lib/cn";

export interface Step {
  icon: IconName;
  title: string;
  note: string;
}

/** 단계를 화살표로 이어 흐름이 보이게 한다. 설명은 한 줄로 줄인다. */
export function StepFlow({ steps, className }: { steps: Step[]; className?: string }) {
  return (
    <ol className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4", className)}>
      {steps.map((s, i) => (
        <li key={s.title} className="relative flex flex-col items-center text-center">
          {/* 다음 단계로 가는 화살표 — 넓은 화면에서만 */}
          {i < steps.length - 1 && (
            <Icon
              name="arrowRight"
              aria-hidden
              className="absolute -right-4 top-7 hidden h-4 w-4 text-brand-200 lg:block"
            />
          )}
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand-600 text-white shadow-soft">
            <Icon name={s.icon} className="h-6 w-6" />
          </span>
          <span className="tnum mt-4 text-[13px] font-bold text-brand-600">0{i + 1}</span>
          <p className="mt-1 text-[16px] font-bold text-ink-900">{s.title}</p>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-500">{s.note}</p>
        </li>
      ))}
    </ol>
  );
}
