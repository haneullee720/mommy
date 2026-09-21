import { photoSrc } from "@/lib/media";
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
}: {
  name: IllustrationName;
  alt: string;
  ratio?: string;
  className?: string;
  eager?: boolean;
}) {
  const src = photoSrc(name);
  return (
    <div
      className={cn("relative overflow-hidden bg-ink-50", className)}
      style={{ aspectRatio: ratio }}
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
    </div>
  );
}
