export function DemoAccounts() {
  return (
    <div className="mt-6 rounded border border-dashed border-ink-200 bg-ink-50/60 p-5">
      <p className="text-sm font-bold text-ink-800">데모 계정</p>
      <p className="mt-1 text-xs text-ink-500">시드 데이터로 생성된 계정입니다. 비밀번호는 모두 <code className="rounded bg-white px-1.5 py-0.5 font-mono">cheongso1234</code></p>
      <ul className="mt-3 space-y-1.5 text-[13px] text-ink-600">
        <li>
          <span className="font-semibold text-ink-900">고객</span> · customer@demo.kr
        </li>
        <li>
          <span className="font-semibold text-ink-900">업체</span> · partner@demo.kr
        </li>
        <li>
          <span className="font-semibold text-ink-900">운영자</span> · admin@demo.kr
        </li>
      </ul>
    </div>
  );
}
