import { LinkButton } from "@/components/ui";
import { Icon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center justify-center gap-4 py-28 text-center">
      <Icon name="broom" className="h-10 w-10 text-ink-300" />
      <h1 className="text-[26px] font-bold text-ink-900">페이지를 찾을 수 없습니다</h1>
      <p className="max-w-sm text-[14.5px] text-ink-500">
        주소가 바뀌었거나 삭제된 페이지입니다. 홈에서 다시 시작해 주세요.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <LinkButton href="/">홈으로</LinkButton>
        <LinkButton href="/request/new" variant="secondary">견적 요청하기</LinkButton>
      </div>
    </div>
  );
}
