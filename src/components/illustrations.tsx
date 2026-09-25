import type { ServiceSlug } from "@/lib/types";

/**
 * 장면 일러스트.
 *
 * icons.tsx 의 소형 픽토그램과 달리, 배경과 소품이 있는 4:3 장면이다.
 * 사진이 들어오기 전까지 이미지 자리를 채우고, 사진이 들어오면 media.tsx 가 교체한다.
 * 팔레트는 globals.css 의 토큰 값과 맞춘다.
 */

const C = {
  bg: "#EFF7FF",
  floor: "#DBECFE",
  soft: "#D7DFEB",
  mid: "#B4C0D3",
  line: "#1F2B3D",
  brand: "#1B73E8",
  brandSoft: "#BFDFFE",
  light: "#F7FBFF",
};

function Scene({ children, viewBox = "0 0 400 300" }: { children: React.ReactNode; viewBox?: string }) {
  return (
    <svg viewBox={viewBox} className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="100%" height="100%" fill={C.bg} />
      <g stroke={C.line} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {children}
      </g>
    </svg>
  );
}

/* 창문 + 들어오는 빛 — 여러 장면에서 공통으로 쓰는 요소 */
function Window({ x = 58, y = 48, w = 124, h = 112 }: { x?: number; y?: number; w?: number; h?: number }) {
  return (
    <>
      <rect x={x} y={y} width={w} height={h} fill={C.light} />
      <path d={`M${x + w / 2} ${y}v${h}`} />
      <path d={`M${x} ${y + h / 2}h${w}`} />
    </>
  );
}

const MoveIn = (
  <Scene>
    <rect x={0} y={212} width={400} height={88} fill={C.floor} stroke="none" />
    <path d="M0 212h400" />
    {/* 창으로 들어오는 빛 */}
    <path d="M182 60 300 212H196z" fill={C.light} stroke="none" opacity={0.75} />
    <Window />
    {/* 양동이와 밀대 */}
    <path d="M246 236h44l-6 44h-32z" fill={C.brandSoft} />
    <path d="M244 236h48" />
    <path d="M330 118v146" />
    <path d="M312 264h36v14h-36z" fill={C.brand} stroke={C.line} />
    <path d="M60 212h64" stroke={C.mid} />
  </Scene>
);

const Stairs = (
  <Scene>
    {/* 계단 단면 */}
    <path d="M40 268v-40h62v-40h62v-40h62v-40h62v160z" fill={C.floor} />
    {/* 난간 */}
    <path d="M52 206 300 46" stroke={C.brand} />
    <path d="M78 216v-22M140 176v-22M202 136v-22M264 96V74" stroke={C.brand} />
    {/* 양동이 */}
    <path d="M300 238h40l-5 30h-30z" fill={C.brandSoft} />
    <path d="M298 238h44" />
  </Scene>
);

const Office = (
  <Scene>
    <rect x={0} y={218} width={400} height={82} fill={C.floor} stroke="none" />
    <path d="M0 218h400" />
    {/* 블라인드 창 */}
    <rect x={232} y={44} width={132} height={100} fill={C.light} />
    <path d="M232 68h132M232 90h132M232 112h132" stroke={C.mid} strokeWidth={1.6} />
    {/* 책상 + 모니터 */}
    <path d="M36 176h150v10H36z" fill="#fff" />
    <path d="M52 186v32M170 186v32" />
    <rect x={76} y={126} width={70} height={46} fill={C.brandSoft} />
    <path d="M111 172v8" />
    {/* 의자 */}
    <path d="M214 186h44v8h-44z" fill={C.soft} />
    <path d="M236 194v22M222 216h28" />
    <path d="M254 186v-34h-4" />
    {/* 휴지통 */}
    <path d="M330 194h34l-4 42h-26z" fill="#fff" />
    <path d="M326 194h42" />
  </Scene>
);

const Hero = (
  <Scene viewBox="0 0 480 270">
    <rect x={0} y={196} width={480} height={74} fill={C.floor} stroke="none" />
    <path d="M0 196h480" />
    {/* 빛 */}
    <path d="M330 42 456 196H300z" fill={C.light} stroke="none" opacity={0.8} />
    <rect x={296} y={34} width={126} height={108} fill={C.light} />
    <path d="M359 34v108M296 88h126" />
    {/* 소파 */}
    <path d="M52 136h148v60H52z" fill="#fff" />
    <path d="M52 156h148" />
    <path d="M40 148h12v48H40zM200 148h12v48h-12z" fill={C.brandSoft} />
    {/* 화분 */}
    <path d="M244 196v-30" />
    <path d="M228 166h32l-4 30h-24z" fill={C.brandSoft} />
    <path d="M244 166c0-18 11-27 24-27-2 18-9 27-24 27z" fill={C.brand} stroke={C.line} />
    {/* 반짝임 */}
    <path d="M404 74v18M395 83h18" stroke={C.brand} strokeWidth={2.6} />
    <path d="M436 118v12M430 124h12" stroke={C.brand} strokeWidth={2.2} />
    <path d="M272 58v12M266 64h12" stroke={C.brand} strokeWidth={2.2} />
  </Scene>
);

const Before = (
  <Scene>
    <rect x={0} y={210} width={400} height={90} fill="#DAD6D0" stroke="none" />
    <path d="M0 210h400" />
    <rect x={62} y={52} width={120} height={106} fill="#E3DFD8" />
    <path d="M122 52v106M62 105h120" />
    {/* 얼룩 */}
    <circle cx={248} cy={244} r={20} fill={C.mid} stroke="none" opacity={0.85} />
    <circle cx={298} cy={266} r={12} fill={C.mid} stroke="none" opacity={0.7} />
    <circle cx={96} cy={252} r={14} fill={C.mid} stroke="none" opacity={0.6} />
    <path d="M232 92c14-10 28-4 30 10" stroke={C.mid} />
    <circle cx={286} cy={130} r={9} fill={C.mid} stroke="none" opacity={0.6} />
  </Scene>
);

const After = (
  <Scene>
    <rect x={0} y={210} width={400} height={90} fill={C.floor} stroke="none" />
    <path d="M0 210h400" />
    <path d="M182 64 322 210H196z" fill={C.light} stroke="none" opacity={0.8} />
    <rect x={62} y={52} width={120} height={106} fill={C.light} />
    <path d="M122 52v106M62 105h120" />
    {/* 반짝임 */}
    <path d="M278 108v20M268 118h20" stroke={C.brand} strokeWidth={2.6} />
    <path d="M330 156v12M324 162h12" stroke={C.brand} strokeWidth={2.2} />
    <path d="M240 168v12M234 174h12" stroke={C.brand} strokeWidth={2.2} />
  </Scene>
);

const SERVICE_SCENES: Record<ServiceSlug, React.ReactNode> = {
  "move-in": MoveIn,
  stairs: Stairs,
  office: Office,
};

export type IllustrationName = ServiceSlug | "hero" | "before" | "after";

const SCENES: Record<IllustrationName, React.ReactNode> = {
  ...SERVICE_SCENES,
  hero: Hero,
  before: Before,
  after: After,
};

export function Illustration({ name }: { name: IllustrationName }) {
  return <>{SCENES[name]}</>;
}
