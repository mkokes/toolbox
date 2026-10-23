# Native-app look Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle every screen of Moped Toolbox to the "dark tuner" look (GuitarTuna-like), in both themes, and update the in-app styleguide. Visual only.

**Architecture:** All style values stay in antd tokens: new palette and brand tokens in `src/theme/tokens.ts`, component tokens in `getAntdTheme`, global and `tb-*` rules in `useAppStyles.ts`. The gauge progress arc is pure geometry in `lib/gauge.ts`, consumed by `Tachometer`. Controls become filled tiles through antd's `variant="filled"` set once in `ThemedConfig`, so pages keep their markup and label pairing.

**Tech Stack:** React 18, TypeScript 5.6, antd 5.29, Vite 6, Vitest 5 + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-23-native-app-look-design.md`

## Global Constraints

- Branch `native-look`, cut from `footer-scroll-hint` (PR #9, unmerged). One PR for the whole restyle; open it, do not merge it (a merge to `master` deploys).
- No hex, px or font value outside `src/theme/`; in components read `theme.useToken()` / `useBrandToken()`. SVG viewBox geometry in `Tachometer` is the one exception.
- No new CSS files, CSS variables or Less. No functional change: routes, URL params, storage keys, calculations and copy stay. Number formats stay (`6958`, `≈ 36 mph at 8,000 RPM`).
- Keep the `Form.Item` `htmlFor` ↔ control `id` pairing. Keep `role="img"` + `aria-label="Engine speed N RPM"` on the gauge.
- Both themes pass WCAG AA (`tokens.test.ts`); `index.html` backgrounds and `<meta name="theme-color">` match `tokens.ts` (`theme.test.ts`); PWA manifest colours follow `pageBackground('dark')`.
- Honour reduced motion; add no new animation.
- Done means `npm test`, `npm run build`, `npm run lint`, `npm run format:check` all pass, plus a `CHANGELOG.md` line under `## [Unreleased]`.

## Review Focus

- RPM at 0, below 0 or above the dial maximum: the progress arc is empty or pinned to the end, never an invalid SVG path.
- A large RPM figure (e.g. `14999`) in the big readout at a 320px-wide screen: no overflow or overlap with the dial.
- Header at 320px: title and theme toggle share one row without wrapping or overlap.
- Keyboard focus is visible on filled tiles, the pill toggle and the slider handle in both themes (filled variants have no border to carry focus).
- Switching theme (and the OS scheme in Auto) re-themes gauge, tiles, footer and scroll hint with no stale colours.

---

### Task 1: Branch, commit the docs, and the palette

**Files:**

- Modify: `src/theme/tokens.ts`, `index.html` (inline bootstrap colour + two theme-color metas)
- Test: `src/theme/tokens.test.ts`, `src/theme/theme.test.ts` (unchanged, must pass)

**Interfaces:**

- Produces: new values in `palettes.dark/light` (`colorBgLayout`, `colorBgContainer` = tile surface, `colorBgElevated` = footer/popup surface, `colorTextSecondary` = muted text) and new `BrandToken` fields `gaugeTrack: string` and `needle: string` (dim dial track; needle colour). `pageBackground(mode)` unchanged in shape.

- [ ] **Step 1:** `git checkout footer-scroll-hint && git checkout -b native-look`; commit the two `docs/superpowers` files (`docs: native-app look spec and plan`).
- [ ] **Step 2: Write failing tests** in `tokens.test.ts` inside the existing `describe.each`: `'has readable muted text on the page and on tiles'` (`contrast(p.colorTextSecondary, bg)` and against `p.colorBgContainer`, ≥ `AA_TEXT`), `'has the accent green readable on tiles'` (`brand[mode].colorAccent` vs `p.colorBgContainer`), `'keeps the gauge needle and track distinct from the dial'` (`needle` vs `bg` ≥ `AA_LARGE_TEXT`).
- [ ] **Step 3:** Run `npx vitest run src/theme` → the new tests fail (fields/values missing).
- [ ] **Step 4: Implement** the palette in `tokens.ts`. Proposed from the approved mockups (adjust until the tests pass): dark `colorBgLayout #151513`, `colorBgContainer #22211E`, `colorBgElevated #2A2926`, muted `#8D8B84`, gauge track `#2C2B28`, needle `#EBEBEB`; light `colorBgLayout #F7F6F2`, `colorBgContainer #FFFFFF`, `colorBgElevated #FFFFFF`, muted `#6B6961`, gauge track `#E4E2DA`, needle `#2B2A27`. Update `index.html` to the new dark background and theme-color.
- [ ] **Step 5:** `npx vitest run src/theme` → PASS (incl. `theme.test.ts`).
- [ ] **Step 6:** Commit `feat(theme): dark tuner palette and surfaces`.

### Task 2: Gauge progress arc geometry

**Files:**

- Modify: `src/lib/gauge.ts`
- Test: `src/lib/gauge.test.ts`

**Interfaces:**

- Produces: `export function progressArcPath(cx: number, cy: number, r: number, rpm: number, max: number): string | null` — the clockwise arc from `GAUGE_START` to `rpmToAngle(rpm, max)`, or `null` when the arc would have no length (`rpm <= 0`).

- [ ] **Step 1: Write failing tests:** returns `null` for `rpm` 0 and −500; for `rpm` = `max` the path ends at `polar(cx,cy,r,GAUGE_START+GAUGE_SWEEP)` and uses the large-arc flag (`' 1 1 '`); for `rpm` > `max` equals the `max` path; for a mid value starts at `polar(...,GAUGE_START)`; no `NaN` in any result.
- [ ] **Step 2:** `npx vitest run src/lib/gauge` → FAIL (not defined).
- [ ] **Step 3: Implement** by delegating to `arcPath` with the clamped end angle (`rpmToAngle` already clamps).
- [ ] **Step 4:** Run → PASS. Commit `feat(gauge): progress arc path`.

### Task 3: Tachometer as the hero

**Files:**

- Modify: `src/components/Tachometer.tsx`, `src/theme/useAppStyles.ts` (`.tb-gauge-readout`)
- Test: `src/components/Tachometer.test.tsx` (new)

**Interfaces:**

- Consumes: `progressArcPath`, `brand.gaugeTrack`, `brand.needle`, `brand.colorAccent`, `token.colorError`.
- Produces: same props (`rpm`, `max`, `redline`); same accessible name `Engine speed ${rpm} RPM`; the figcaption keeps the number and the text "RPM".

- [ ] **Step 1: Write failing tests** (render inside `ThemeProvider` + `ThemedConfig`, as `src/test/render.tsx` does): `getByRole('img', { name: 'Engine speed 6662 RPM' })`; one progress path with `data-testid="gauge-progress"` when `rpm=6662`, none when `rpm=0`; the readout shows `6662` and `RPM`; a value above `max` (`15000`) renders without throwing and the readout shows `15000`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: Implement:** drop the 260px max width so the dial fills the column; track in `brand.gaugeTrack`; draw the progress arc in `brand.colorAccent` over it; redline stays `token.colorError`; needle and hub in `brand.needle`; the readout number is the largest type step in `brand.colorAccent`, pulled up to overlap the lower dial via `.tb-gauge-readout` in `useAppStyles.ts`, with a letter-spaced uppercase "RPM" caption in `colorTextSecondary`. Size the readout so five digits fit at 320px (clamp with a token-based `fontSize` and `fontVariantNumeric: 'tabular-nums'`).
- [ ] **Step 4:** `npx vitest run src/components src/pages/GearingResults` → PASS (existing results tests still find the gauge by name). Commit `feat(gauge): hero tachometer`.

### Task 4: Stat tiles, results layout and slider

**Files:**

- Modify: `src/components/ResultStat.tsx`, `src/pages/Gearing.tsx` (results stats row, slider style prop), `src/theme/tokens.ts` (`sliderToken`), `src/theme/antdTheme.ts`, `src/theme/useAppStyles.ts` (`.tb-result*`)
- Test: `src/components/ResultStat.test.tsx` (new), `src/theme/antdTheme.test.ts`

**Interfaces:**

- Produces: `ResultStat` keeps `{ label: ReactNode; value: ReactNode }` and `aria-live="polite"` on the value; now rendered as a rounded surface tile (`colorBgContainer`) with a large accent value over a small uppercase muted label. `sliderToken: Record<ThemeMode, SliderToken>` exported from `tokens.ts` and applied as `components.Slider` in `getAntdTheme`.

- [ ] **Step 1: Write failing tests:** `ResultStat` renders the label and value and the value element has `aria-live="polite"`; `getAntdTheme(mode).components?.Slider?.railSize` is 10 for both modes and `trackBg` is `brand[mode]`-appropriate (accent green on dark, `colorPrimary` red on light).
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: Implement:** restyle `.tb-result*` as tiles; in `Gearing.tsx` replace the `Row/Col` pair with a two-column `Flex` of tiles and remove the inline slider margin in favour of tokens; slider tokens: `railSize 10`, `handleSize 24`, `handleSizeHover 28`, `handleLineWidth 5`, `handleLineWidthHover 6`, rail `gaugeTrack`-like grey, track/handle accent green (dark) or red (light).
- [ ] **Step 4:** Run `npx vitest run src` → PASS. Commit `feat: stat tiles and bolder slider`.

### Task 5: Filled control tiles and segmented steps

**Files:**

- Modify: `src/context/ThemeContext.tsx` (`ThemedConfig`: `select`, `input`, `inputNumber` `variant: 'filled'`), `src/theme/antdTheme.ts` (`Form` label tokens, `Select`/`InputNumber` heights/radius), `src/theme/useAppStyles.ts` (uppercase small labels, focus ring), `src/pages/Gearing.tsx` (`GearingSteps`)
- Create: `src/components/StepBars.tsx`
- Test: `src/components/StepBars.test.tsx` (new); existing page tests must still pass unchanged

**Interfaces:**

- Produces: `export default function StepBars({ current, steps }: { current: number; steps: string[] })` — an ordered list of slim bars; the bar at `current` has `aria-current="step"`; each item has visually hidden text `Step N of M: <title>`; filled bars up to and including `current` use `colorPrimary`. `GearingSteps` renders `StepBars` with `['Bike', 'RPM & Speed']`.

- [ ] **Step 1: Write failing tests:** `StepBars current={1}` marks exactly the second item `aria-current="step"` and exposes "Step 2 of 2: RPM & Speed" by text; `renderRoute('/gearing')` still finds `getByLabelText('Select a Manufacturer')`.
- [ ] **Step 2:** Run → FAIL for `StepBars`.
- [ ] **Step 3: Implement** `StepBars` and the config: filled variants on all three controls (tile fill `colorBgContainer`, no border, radius `borderRadiusLG`), form labels small, uppercase, letter-spaced, `colorTextSecondary`; make the focus state visible (outline or ring using `colorPrimary` with `lineWidthFocus`) and verify it by keyboard in Task 8.
- [ ] **Step 4:** `npx vitest run src` → PASS. Commit `feat: filled tiles for controls, segmented steps`.

### Task 6: Header, theme pill, Home and footer retint

**Files:**

- Modify: `src/App.tsx` (header row), `src/components/ThemeToggle.tsx`, `src/theme/antdTheme.ts` (`Segmented` tokens), `src/theme/useAppStyles.ts` (`.tb-title`, `.tb-tool-card`, `.tb-actions`, `.tb-scroll-hint`), `src/pages/Home.tsx`
- Test: `src/pages/Home.test.tsx` and the existing theme-toggle tests (must pass unchanged); add `src/App.test.tsx` only if no test covers the header

**Interfaces:**

- Consumes: Task 1 surfaces. `ThemeToggle` keeps its three options and labels (`Light theme`, `Match system theme`, `Dark theme`).

- [ ] **Step 1: Write failing test** (extend the existing theme toggle test file, or `App.test.tsx`): the header contains both the link named `Moped Toolbox` and the theme `radiogroup` in the same `header` element; selecting "Dark theme" still sets `data-theme="dark"`.
- [ ] **Step 2:** Run → FAIL only if the structure assertions need it; otherwise note they already pass and proceed.
- [ ] **Step 3: Implement:** one header row, title left (smaller Lobster step) and the toggle right; `Segmented` tokens for the pill (full radius, muted track, raised selected item); Home cards as larger rounded tiles (`colorBgContainer`, no border, accent icon, same two links and text); retint `.tb-actions` and `.tb-scroll-hint` gradient to the new surfaces; keep their layering rules.
- [ ] **Step 4:** `npx vitest run src` → PASS. Commit `feat: header pill toggle, home tiles, footer retint`.

### Task 7: Styleguide

**Files:**

- Modify: `src/pages/Styleguide.tsx`, `src/theme/tokens.ts` (`colorRoles`), `src/pages/Styleguide.test.tsx`
- Test: `src/pages/Styleguide.test.tsx`

**Interfaces:**

- Produces: `colorRoles` items gain an optional `against?: 'page' | 'surface' | 'none'` so surfaces and muted text are tagged against the right background; new roles for tile surface, muted text and gauge colours.

- [ ] **Step 1: Update tests first:** the hard-coded dark heading-red ratio (`3.68:1`) is replaced by `contrast(brand.dark.colorHeading, palettes.dark.colorBgLayout).toFixed(2) + ':1'`; assert each new role's hex appears in its panel and that no `.ant-tag-error` appears in either palette; assert the page lists the new component sections (headings `Gauge`, `Stat tiles`, `Controls`, `Footer bar` by role).
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: Implement:** palette previews tag each role by its `against`; add component sections showing the hero gauge, stat tiles, filled controls with labels, steps, slider, the pill toggle and a static footer-bar sample; rewrite the Usage and intro text to describe the new look (green = read, red = act still holds; surfaces and muted text added; "single column, phone-first" stays).
- [ ] **Step 4:** `npx vitest run src/pages/Styleguide` → PASS. Commit `docs(styleguide): new palette and components`.

### Task 8: Docs, visual verification and PR

**Files:**

- Modify: `CHANGELOG.md`, `AGENTS.md` (layout list: `StepBars`; the palette/surface notes), `README.md` if it describes the look

- [ ] **Step 1:** Add the changelog line; update the `AGENTS.md` layout and styling notes.
- [ ] **Step 2:** Run `npm run format`, then `npm test`, `npm run build`, `npm run lint`, `npm run format:check` → all pass.
- [ ] **Step 3: Visual check** with `npm run dev` in a 400px and a 320px viewport, **light and dark**, on Home, Gearing form, Gearing results (with Compare open), Mix and Styleguide: confirm each Review Focus item (arc at extremes, long RPM figure, header at 320px, keyboard focus, live theme switch). Fix anything found and re-run Step 2.
- [ ] **Step 4:** Push `native-look` and open one PR against `master` (`gh` via `zsh -ic`), describing the restyle with a test plan; do not merge.
