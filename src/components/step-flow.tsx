import { Icon, type IconName } from "./icons";
import { cn } from "@/lib/cn";

export interface Step {
  icon: IconName;
  title: string;
  note: string;
}

/** 단계를 연결선으로 이어 흐름이 보이게 한다. 설명은 한 줄로 줄인다. */
export function StepFlow({ steps, className }: { steps: Step[]; className?: string }) {
  return (
    <ol className={cn("grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0", className)}>
      {steps.map((s, i) => (
        <li key={s.title} className="relative lg:pr-8">
          {i < steps.length - 1 && (
            <span aria-hidden className="absolute left-0 top-7 hidden h-px w-full bg-ink-200 lg:block" />
          )}
          <div className="relative z-10 flex items-center gap-3">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-ink-200 bg-white text-ink-600">
              <Icon name={s.icon} className="h-6 w-6" />
            </span>
            <span className="tnum text-[13px] font-bold text-ink-300">0{i + 1}</span>
          </div>
          <p className="mt-5 text-[16px] font-semibold text-ink-900">{s.title}</p>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-500">{s.note}</p>
        </li>
      ))}
    </ol>
  );
}
