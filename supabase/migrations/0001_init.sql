-- 청소모아 초기 스키마
-- 앱의 도메인 모델(src/lib/types.ts)을 그대로 옮긴다.
-- 기존 문자열 ID(usr_…, req_…)를 text PK로 유지해 uid()·makeCode() 를 손대지 않는다.
--
-- 날짜 컬럼 중 preferred_date/available_date/scheduled_date 는 text 로 둔다.
-- 이들은 타임존 의미가 없는 달력 날짜(YYYY-MM-DD)이고, 앱 전체가 문자열로 다루기 때문에
-- date 타입으로 바꾸면 드라이버 왕복에서 타임존 오프셋 버그가 생긴다.

create table if not exists users (
  id            text primary key,
  role          text not null check (role in ('customer', 'partner', 'admin')),
  name          text not null,
  email         text not null unique,
  phone         text not null default '',
  password_hash text not null,
  created_at    timestamptz not null default now()
);

create table if not exists partners (
  id               text primary key,
  user_id          text not null unique references users (id) on delete cascade,
  company_name     text not null,
  biz_no           text not null,
  ceo_name         text not null,
  regions          text[] not null default '{}',
  services         text[] not null default '{}',
  intro            text not null default '',
  since            integer not null,
  crew_size        integer not null default 1,
  has_insurance    boolean not null default false,
  certifications   text[] not null default '{}',
  status           text not null check (status in ('pending', 'approved', 'suspended')),
  tier             text not null check (tier in ('basic', 'good', 'premium')),
  rating           double precision not null default 0,
  review_count     integer not null default 0,
  completed_jobs   integer not null default 0,
  response_minutes integer not null default 60,
  bank_account     jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now()
);

create index if not exists partners_status_idx on partners (status);
create index if not exists partners_services_idx on partners using gin (services);
create index if not exists partners_regions_idx on partners using gin (regions);

create table if not exists cleaning_requests (
  id             text primary key,
  code           text not null,
  customer_id    text not null references users (id) on delete cascade,
  service        text not null,
  property_type  text not null,
  area_pyeong    integer not null,
  region         text not null,
  district       text not null,
  address_detail text not null default '',
  preferred_date text not null,
  date_flexible  boolean not null default false,
  options        text[] not null default '{}',
  description    text not null default '',
  photo_count    integer not null default 0,
  contact_name   text not null,
  contact_phone  text not null,
  estimate_min   integer not null default 0,
  estimate_max   integer not null default 0,
  status         text not null,
  created_at     timestamptz not null default now(),
  expires_at     timestamptz not null
);

create index if not exists requests_status_created_idx on cleaning_requests (status, created_at desc);
create index if not exists requests_customer_idx on cleaning_requests (customer_id, created_at desc);

create table if not exists quotes (
  id             text primary key,
  request_id     text not null references cleaning_requests (id) on delete cascade,
  partner_id     text not null references partners (id) on delete cascade,
  amount         integer not null,
  crew_size      integer not null,
  work_hours     integer not null,
  available_date text not null,
  includes       text[] not null default '{}',
  message        text not null default '',
  warranty_days  integer not null default 7,
  status         text not null check (status in ('submitted', 'accepted', 'rejected', 'withdrawn')),
  created_at     timestamptz not null default now()
);

create index if not exists quotes_request_idx on quotes (request_id);
create index if not exists quotes_partner_created_idx on quotes (partner_id, created_at desc);
-- 한 업체가 같은 요청에 제출 중인 견적은 하나뿐 (service.ts 의 갱신 로직과 일치)
create unique index if not exists quotes_one_open_per_partner_idx
  on quotes (request_id, partner_id) where status = 'submitted';

create table if not exists orders (
  id             text primary key,
  code           text not null,
  request_id     text not null references cleaning_requests (id) on delete cascade,
  quote_id       text not null references quotes (id) on delete cascade,
  customer_id    text not null references users (id) on delete cascade,
  partner_id     text not null references partners (id) on delete cascade,
  amount         integer not null,
  -- 체결 시점의 수수료율을 박제한다. 운영자가 요율을 바꿔도 기존 주문은 변하지 않는다.
  fee_rate       double precision not null,
  fee_amount     integer not null,
  payout_amount  integer not null,
  status         text not null,
  payment_method text not null default '',
  paid_at        timestamptz,
  started_at     timestamptz,
  completed_at   timestamptz,
  settled_at     timestamptz,
  scheduled_date text not null,
  created_at     timestamptz not null default now()
);

create index if not exists orders_customer_idx on orders (customer_id, created_at desc);
create index if not exists orders_partner_idx on orders (partner_id, created_at desc);
create index if not exists orders_request_idx on orders (request_id, created_at desc);
-- 한 요청에 결제 대기 주문은 하나만 (견적 재선택 시 기존 건을 되돌리는 로직과 일치)
create unique index if not exists orders_one_pending_per_request_idx
  on orders (request_id) where status = 'pending_payment';

create table if not exists reviews (
  id          text primary key,
  order_id    text not null unique references orders (id) on delete cascade,
  customer_id text not null references users (id) on delete cascade,
  partner_id  text not null references partners (id) on delete cascade,
  rating      integer not null check (rating between 1 and 5),
  scores      jsonb not null,
  content     text not null,
  reply       text,
  created_at  timestamptz not null default now()
);

create index if not exists reviews_partner_created_idx on reviews (partner_id, created_at desc);

create table if not exists sessions (
  token      text primary key,
  user_id    text not null references users (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists sessions_expires_idx on sessions (expires_at);

create table if not exists settings (
  id                integer primary key default 1 check (id = 1),
  fee_rates         jsonb not null,
  escrow_hold_days  integer not null default 3,
  auto_confirm_days integer not null default 7
);

insert into settings (id, fee_rates, escrow_hold_days, auto_confirm_days)
values (1, '{"basic": 0.15, "good": 0.12, "premium": 0.1}'::jsonb, 3, 7)
on conflict (id) do nothing;

-- 고객 노출용 번호(CM-260920-0001, ORD-…). 카운트 대신 시퀀스를 써서 동시 접수 시 충돌을 막는다.
create sequence if not exists request_code_seq;
create sequence if not exists order_code_seq;
