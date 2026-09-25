# 이미지 생성 프롬프트

`scripts/generate-images.mjs` 가 쓰는 프롬프트를 그대로 옮긴 것입니다.
**스크립트를 쓰면 이 문서는 볼 필요가 없습니다.**

```bash
OPENAI_API_KEY=sk-... npm run images
```

ChatGPT 웹에 직접 붙여넣고 싶을 때만 아래를 쓰세요.
받은 이미지는 **표의 파일명 그대로** `public/images/` 에 저장하면 자동으로 적용됩니다.

## 먼저 알아둘 것

- **`after` 를 먼저 만드세요.** 그 다음 그 이미지를 ChatGPT에 다시 올리고
  "같은 방, 같은 카메라 위치에서 청소 전 상태로 바꿔줘" 라고 요청하면
  `before` 와 구도가 맞습니다. 슬라이더는 구도가 같아야 효과가 납니다.
- 생성 이미지에는 화면에 **"예시 이미지"** 표기가 붙습니다
  (`public/images/generated.json` 에 키를 적으면 됩니다).
  나중에 실제 시공 사진으로 바꾸고 그 키를 지우면 표기가 사라집니다.
- 사람 얼굴이 크게 나온 이미지는 쓰지 마세요.

---

## `hero` — 청소 직후 밝은 거실

크기 1536x1024 · 저장 파일명 `hero.webp` (또는 `.jpg` / `.png`)

```
A freshly cleaned Korean apartment living room. Sunlight streams through a large window onto a spotless floor. A simple low sofa and one potted plant, everything neatly arranged. Photorealistic interior photograph. Bright natural daylight, no people, minimal and tidy composition. Bright off-white and pale blue palette with one or two clear blue accents. Eye-level 35mm lens, soft realistic shadows. No text, no logos, no watermark, no wide-angle distortion, no over-processed HDR.
```

## `move-in` — 입주청소 — 가구 없는 빈집

크기 1024x1024 · 저장 파일명 `move-in.webp` (또는 `.jpg` / `.png`)

```
An empty Korean apartment room with no furniture at all, immaculate flooring, spotless window frames and sills, just after a move-in cleaning. Photorealistic interior photograph. Bright natural daylight, no people, minimal and tidy composition. Bright off-white and pale blue palette with one or two clear blue accents. Eye-level 35mm lens, soft realistic shadows. No text, no logos, no watermark, no wide-angle distortion, no over-processed HDR.
```

## `stairs` — 계단청소 — 공동주택 계단·복도

크기 1024x1024 · 저장 파일명 `stairs.webp` (또는 `.jpg` / `.png`)

```
A clean stairwell and corridor of a Korean low-rise residential building. Spotless steps and handrail, dry floor, daylight from a corridor window. Photorealistic interior photograph. Bright natural daylight, no people, minimal and tidy composition. Bright off-white and pale blue palette with one or two clear blue accents. Eye-level 35mm lens, soft realistic shadows. No text, no logos, no watermark, no wide-angle distortion, no over-processed HDR.
```

## `office` — 상가·사무실청소 — 정돈된 업무 공간

크기 1024x1024 · 저장 파일명 `office.webp` (또는 `.jpg` / `.png`)

```
A tidy Korean commercial interior just after cleaning: a row of clean office desks with monitors on the left and a bright cafe-style counter area on the right, polished floor, large windows. No people. Photorealistic interior photograph. Bright natural daylight, no people, minimal and tidy composition. Bright off-white and pale blue palette with one or two clear blue accents. Eye-level 35mm lens, soft realistic shadows. No text, no logos, no watermark, no wide-angle distortion, no over-processed HDR.
```

## `after` — 청소 후 (먼저 생성할 것)

크기 1536x1024 · 저장 파일명 `after.webp` (또는 `.jpg` / `.png`)

```
A Korean apartment room, spotless and bright after a deep cleaning. Clean floor, clean walls, sunlight from a window on the right. Viewed from the room corner at eye level. Photorealistic interior photograph. Bright natural daylight, no people, minimal and tidy composition. Bright off-white and pale blue palette with one or two clear blue accents. Eye-level 35mm lens, soft realistic shadows. No text, no logos, no watermark, no wide-angle distortion, no over-processed HDR.
```

## `before` — 청소 전 (after 와 같은 구도여야 함)

크기 1536x1024 · 저장 파일명 `before.webp` (또는 `.jpg` / `.png`)

```
The SAME Korean apartment room as a matching 'after' photo, but before cleaning: dusty floor, smudges and marks on the walls, dull flat lighting, some scattered debris in the corner. Identical camera position, identical composition and framing, viewed from the room corner at eye level with a window on the right. Photorealistic interior photograph. Bright natural daylight, no people, minimal and tidy composition. Bright off-white and pale blue palette with one or two clear blue accents. Eye-level 35mm lens, soft realistic shadows. No text, no logos, no watermark, no wide-angle distortion, no over-processed HDR.
```
