import { isGenerated, photoSrc } from "@/lib/media";
import { cn } from "@/lib/cn";
import { Illustration, type IllustrationName } from "./illustrations";

/**
 * 이미지 자리.
 * public/images/<name>.jpg 가 있으면 사진을, 없으면 같은 이름의 일러스트를 그린다.
 */
export function Media({
  name,
  alt,
  ratio = "4 / 3",
  className,
  eager = false,
  fill = false,
  showBadge = true,
}: {
  name: IllustrationName;
  alt: string;
  ratio?: string;
  className?: string;
  eager?: boolean;
  /** 부모를 꽉 채운다 (비율은 부모가 정한다) */
  fill?: boolean;
  /** 바깥에서 따로 표기할 때 끈다 */
  showBadge?: boolean;
}) {
  const src = photoSrc(name);
  const sample = Boolean(src) && isGenerated(name);
  return (
    <div
      className={cn("relative overflow-hidden bg-ink-50", fill && "h-full w-full", className)}
      style={fill ? undefined : { aspectRatio: ratio }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      ) : (
        <>
          <Illustration name={name} />
          <span className="sr-only">{alt}</span>
        </>
      )}
      {sample && showBadge && <SampleBadge className="absolute bottom-2 right-2" />}
    </div>
  );
}

/** AI 생성 이미지임을 밝히는 표기. 실제 시공 결과로 오해하지 않도록 둔다. */
export function SampleBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "rounded bg-ink-900/70 px-1.5 py-0.5 text-[10.5px] font-semibold text-white backdrop-blur-sm",
        className,
      )}
    >
      예시 이미지
    </span>
  );
}
