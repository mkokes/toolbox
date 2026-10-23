# AGENTS.md

Context for AI coding agents working in this repo. The human-facing overview, scripts table and deployment notes are in [README.md](README.md). This file covers what you need to change code safely.

## What this is

Moped Toolbox is a static single-page app with two calculators: moped gearing (engine RPM ↔ road speed) and two-stroke gas/oil mixing. Both support imperial or metric units. There is no backend. It is deployed to GitHub Pages at https://mkokes.github.io/toolbox/.

Stack: React 18, TypeScript 5.6, Vite 6, Ant Design 5 (CSS-in-JS theme), React Router 6. Tests: Vitest 5 + React Testing Library + jsdom. Node `^22.22.2 || ^24.15.0 || >=26` (`.nvmrc` pins 26).

## Commands

```sh
npm install            # also installs husky hooks via "prepare"
npm run dev            # dev server on http://localhost:5173
npm run build          # tsc -b && vite build → dist/
npm run typecheck      # tsc -b only
npm test               # vitest run (whole suite, ~10s)
npx vitest run src/pages/Gearing   # a single file
npm run lint           # oxlint --deny-warnings
npm run lint:fix
npm run format         # oxfmt (writes)
npm run format:check
```

Before you finish, run `npm test`, `npm run build`, `npm run lint` and `npm run format:check`. All four must pass. The pre-push hook runs lint, format check and tests, and the deploy workflow runs the tests before building.

## Testing

- **Colocate tests:** `foo.ts` → `foo.test.ts` in the same folder. Vitest picks up `src/**/*.test.{ts,tsx}`. Import `describe`/`it`/`expect`/`vi` from `vitest` explicitly; globals are off.
- **Logic tests** (`src/lib`, `src/data`) are plain unit tests. `gearing.test.ts` and `mix.test.ts` compare against copies of the **legacy formulas** across a sweep of inputs. If you change the math on purpose, update those expectations deliberately. Don't loosen them to make a refactor pass.
- **`options.test.ts` checks that every preset's defaults exist in its dropdowns,** so a new `engines.json` record with an out-of-range default fails here.
- **Page tests** mount the real routes with `renderRoute(path)` from `src/test/render.tsx` (`ThemeProvider` + `ThemedConfig` + `UnitsProvider` + memory router). It returns `{ user, router }`.
  - Find controls by their label: every `Form.Item` has `htmlFor` matching its control's `id`. Keep that pairing when you add fields.
  - Pick antd Select options with `choose(user, /label/, 'Option text')` from `src/test/antd.ts`.
- **To start in a given state,** set it before rendering. Metric: `localStorage.setItem('toolbox.units', 'metric')`. Dark: `setSystemDark(true)` from `src/test/matchMedia.ts`, or `localStorage.setItem('toolbox.theme', 'dark')`. Saved bikes: write a JSON array to `toolbox.bikes`. Gearing state: pass the query string to `renderRoute('/gearing?make=…&view=results')`.
- `setup.ts` unmounts, clears localStorage, resets the matchMedia stub and removes `data-theme` after each test.
- **antd-in-jsdom quirks** (already handled; don't remove these):
  - `setup.ts` installs the `matchMedia` stub and strips the pseudo-element argument from `getComputedStyle`.
  - `renderRoute` disables user-event's pointer-events check, because dropdowns animate.
  - antd keeps closed dropdowns in the DOM, so assert on what the field shows (selected title or placeholder), not on whether an option exists.
  - The Slider reads the legacy `keyCode`. Drive it with `fireEvent.keyDown(slider, { key: 'ArrowRight', keyCode: 39, which: 39 })`, not `user.keyboard`.

## Layout

```
src/
  main.tsx              ThemeProvider → ThemedConfig (antd ConfigProvider) → UnitsProvider → RouterProvider
  App.tsx               layout shell (calls useAppStyles; header with ThemeToggle + logo); exports `routes` (/, /gearing, /mix, /styleguide [lazy]) and the hash `router`
  data/engines.json     engine presets; data/engines.ts = Engine type + lookups (manufacturers/models/versions/findEngine)
  lib/                  pure, framework-free logic
    gearing.ts          tireCircumference, calcRpm, calcMph, speedAtRpm (unrounded), finalRatio
    compare.ts          compareGearing (current vs what-if), shiftOption
    mix.ts              oilMl(litres, ratio), mlToFlOz
    units.ts            UnitSystem, conversion constants and helpers, unitLabels
    options.ts          dropdown option generators (wheel, tire, ratio, sprockets/pulleys)
    gauge.ts            tachometer geometry (rpmToAngle, polar, arcPath, progressArcPath)
    contrast.ts         WCAG contrast ratio + AA thresholds
    setup.ts            GearingSetup ⇄ URL params (parseSetup/toSearchParams), engineRatio, stock/summary helpers
    scroll.ts           hasMoreBelow (is there more page below the fold?)
    savedBikes.ts       My bikes storage helpers (loadBikes/addBike/storeBikes, "toolbox.bikes")
  context/UnitsContext.tsx   useUnits(): shared imperial/metric choice, persisted to localStorage ("toolbox.units")
  context/ThemeContext.tsx   useTheme() (light/dark/system, "toolbox.theme"), useBrandToken(), ThemedConfig
  hooks/useSavedBikes.ts    React state over lib/savedBikes
  components/           PageHeader, ResultStat (a stat tile), BackButton, UnitToggle, ThemeToggle (pill switch), Tachometer (hero gauge), StepBars, ActionBar, CompareGearing, ScrollHint
  pages/                Home, Gearing, MixGas, Styleguide
  theme/                tokens.ts (every style value) → antdTheme.ts (getAntdTheme) + useAppStyles.ts (CSS-in-JS)
  test/                 setup.ts (jsdom shims), matchMedia.ts (setSystemDark), render.tsx (renderRoute), antd.ts (choose)
```

## Conventions

- **Keep logic in `src/lib`, as pure functions.** Pages hold state (`useState`) and call into `lib`. There's no global store. The only context is the units setting.
- **Canonical units internally, convert only at the edges.**
  - Speed is stored in mph and gearing math runs in mph. Convert with `speedFromMph`/`speedToMph` for display and input.
  - Fuel volume goes through litres (`volumeToLitres`/`volumeFromLitres`).
  - Wheel and tire option _values_ are always inches, because that's what `engines.json` uses. Only the labels change with the unit system.
  - Don't round the canonical value. Round only what you display, so toggling units doesn't drift results.
- **All styling comes from antd design tokens. There are no CSS files, CSS variables or Less.**
  - `src/theme/tokens.ts` is the only place style values are written:
    - `baseToken` holds the shared type, shape and spacing, under antd token names. antd derives `marginXXS…marginXXL` from `sizeUnit`/`sizeStep`.
    - `palettes.light`/`palettes.dark` hold the color tokens.
    - `brand.light`/`brand.dark` hold what antd has no token for: the Lobster display font, the accent green, the page-heading red, the button gradient and the content width.
  - `getAntdTheme(mode)` (`antdTheme.ts`) feeds `ConfigProvider`. Prefer component tokens to CSS overrides.
  - **In components,** read values with `const { token } = theme.useToken()` and `useBrandToken()`. Never write a hex value, `px`/`rem` size or font name outside `src/theme/`. SVG viewBox geometry in `Tachometer` is the one exception.
  - **For styling that isn't a component prop** (global rules, the `tb-*` classes), add it to `useAppStyles.ts`. It uses antd's engine (`useStyleRegister` from `@ant-design/cssinjs`), so it re-themes automatically.
  - **Don't set antd's `colorTextHeading`** to make headings red. It also colors form labels, card titles, table headers and about 15 other components. Page headings use `brand.colorHeading` through `.tb-heading`.
  - **Both themes must pass contrast.** `tokens.test.ts` enforces it, and `/styleguide` shows both palettes side by side.
- **The gearing setup lives in the URL**, not React state: `/#/gearing?make=Puch&model=E50&front=16&rear=45&wheel=17&tire=2.25&view=results`.
  - `Gearing.tsx` reads it with `useSearchParams()` and `parseSetup()`, and writes it with `toSearchParams()`. Form edits use `{ replace: true }`, and only Next pushes a history entry.
  - `parseSetup` validates every value against `engines.json` and the dropdown options, and silently drops anything invalid, so an old or mangled link degrades to a partly filled form instead of an error. Keep it that way when adding fields, and add the key to `toSearchParams` too.
  - A custom engine is `make=custom&reduction=5.05`. Always get the ratio through `engineRatio(setup)` (1 / reduction for custom engines), never from `findEngine` directly.
  - The results page's target RPM is the optional `rpm` param (`parseTargetRpm`, default 8000, whole numbers 1000–15000). It's only written when it isn't the default.
  - Number inputs fed from the URL (`reduction`, `rpm`) are **uncontrolled** (`defaultValue`) and only commit valid values. Otherwise validation would wipe partial input such as "9" on the way to "9500".
  - Transient UI state (the speed slider, the "editing drivetrain" toggle) stays in component state so it doesn't flood the history.
- **The look is a dark "tuner" app, with a matching light theme.** Surfaces are `colorBgLayout` (page), `colorBgContainer` (tiles: fields, stat tiles, cards) and `colorBgElevated` (footer, popups); `colorTextSecondary` is the muted text; the gauge uses `brand.gaugeTrack`/`brand.needle`. `ThemedConfig` sets the `filled` variant for `select`, `input` and `inputNumber`, so controls are tiles without any page changes. Slider and pill-switch (Segmented) tokens are `sliderToken` and `segmentedToken` in `tokens.ts`. Keep the `tb-result`, `tb-result-value` and `tb-result-label` class names on stat tiles and the gauge readout: `Gearing.test.tsx` finds results by them.
- **The Back/Next bar (`.tb-actions`) is a sticky footer.** Its z-index is `zIndexPopupBase - 1`, so it stays above every antd control (some set their own z-index) and below dropdowns and modals. Its negative margins cancel the wrapper's side and bottom padding on purpose: a sticky box can't move past its parent's padding, which would leave a gap with content showing under the bar. `ScrollHint` (rendered by the layout) shows a fade and chevron above it while there is more page below.
- **Use antd components** (`Form`, `Select`, `InputNumber`, `Slider`, `Segmented`, `Button`) before writing custom controls. Primary buttons are `type="primary" size="large" block`.
- **Formatting is owned by oxfmt** (`.oxfmtrc.json`: no semicolons, single quotes, 120 cols, trailing commas). Don't hand-format against it. Run `npm run format`.
- **Lint warnings fail the push.** If a rule is wrong for a specific line, use `// oxlint-disable-next-line <rule>` with a comment explaining why.

## Gotchas

- **Round speeds after converting units.** Use `speedAtRpm` (unrounded) and round in the display unit. `calcMph` rounds in mph, which would make km/h off by one.
- **Keep the legacy math constants.**
  - `tireCircumference` uses `3.14159` rather than `Math.PI`.
  - `LITRES_PER_GALLON` is `3.78541`.
  - Both match the original 2018 site, so results are unchanged. Keep them unless the owner asks otherwise. The `approx-constant` lint rule is deliberately disabled on that line.
- **`engines.json` quirks:**
  - The field name `pistondiamter` is misspelled. Don't rename it without updating the type.
  - `model` must be a string (Sachs `"505"` used to be a number).
  - `pistondiamter`, `strokelength`, `crodlength`, `ratio1` and `type` are not used by the app. They're left over from the removed carb-sizing and port-duration tools.
  - The `version` select appears only when more than one record shares the same manufacturer and model.
- **Every `default*` value in a record must exist in the matching option list** in `lib/options.ts`, or the select shows a raw number.
- **Vespa is special-cased** by manufacturer name in `sprocketOptions`, which returns pulleys in mm instead of sprocket teeth.
- **Routing must stay hash-based** (`createHashRouter`). GitHub Pages has no SPA fallback, so `BrowserRouter` deep links would 404.
- **Base path:** `vite.config.ts` reads `BASE_PATH`, which the deploy workflow sets from `actions/configure-pages`. Reference static files in `public/` with relative paths (`./icon.svg`) or `import.meta.env.BASE_URL`, never with a leading `/`. The same applies to the manifest: `start_url`, `scope`, `id` and icon `src` stay relative, and `src/pwa.test.ts` enforces it.
- **Line endings:** `.gitattributes` forces LF. Windows machines with `core.autocrlf=true` would otherwise check out CRLF and fail `format:check`.
- **TypeScript lib is ES2023** (for `toSorted()`, which the `unicorn/no-array-sort` rule prefers). `tsconfig.node.json` sends its `tsc -b` output to `node_modules/.tmp` so no stray `vite.config.js` appears in the repo.
- **React is pinned to 18.** antd 5 needs an extra compatibility patch to run on React 19, so don't bump React on its own.
- **It's a PWA** (`vite-plugin-pwa`, configured in `vite.config.ts`; the manifest is in `src/pwa.ts`).
  - The Workbox service worker precaches every built asset. It uses `registerType: 'prompt'` with `injectRegister: false`, so a new worker waits instead of taking over. `src/pwaUpdates.ts` registers it and hands the registration to `lib/updateScheduler.ts`, which checks for updates hourly and on returning to the foreground, and applies a waiting one (reloading the page) only after an hour with no user activity. Don't switch back to `autoUpdate`: it reloads under the user as soon as an update is found.
  - Google Fonts (Lobster) are cached at runtime.
  - If you add a new kind of static file, make sure its extension is in `workbox.globPatterns`, or it won't work offline.
  - A stale service worker can serve old code while you debug a production build. Use a private window or unregister it in DevTools → Application. `npm run dev` doesn't register one.
- **Icons are generated, not hand-made.**
  - Edit `public/icon.svg`, run `npm run icons` (config in `pwa-assets.config.ts`), and commit the PNG/ICO output.
  - `public/favicon.svg` is a simplified copy of the logo for tab-size use (the browser's SVG icon link and `favicon.ico`, built by `pwa-assets.favicon.config.ts`). Keep it in step with `icon.svg` when the logo changes.
  - The "M" in the SVG is the Lobster glyph converted to a path. Don't replace it with `<text>`: the icon renderer has no Lobster font.
  - `tsconfig.node.json` lists `src/pwa.ts` and `src/theme/tokens.ts` because `vite.config.ts` imports them, and composite projects must list every file.
- **Theme bootstrapping:** an inline script in `index.html` sets `data-theme` and the page background before React loads, so there's no flash. It hard-codes the two page backgrounds and the `toolbox.theme` key; `theme.test.ts` checks they match `tokens.ts` and `ThemeContext`. The PWA manifest colors are the dark ones (a manifest can't vary by theme), and `<meta name="theme-color">` follows the active theme.
- **Theme in tests:** jsdom has no `prefers-color-scheme`. `src/test/matchMedia.ts` provides the stub: tests default to light, and `setSystemDark(true)` simulates a dark OS, including live change events.
- **Bundle chunks:** `react` and `antd` are split into vendor chunks in `vite.config.ts`, and the styleguide route is lazy-loaded. Keep heavy, rarely used pages lazy.

## Workflow

- Branch off `master`, and land changes through a pull request. A push or merge to `master` deploys via `.github/workflows/deploy.yml`.
- Add a line under `## [Unreleased]` in [CHANGELOG.md](CHANGELOG.md) for user-visible changes ([Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format). Don't create tags or bump versions unless asked.
- **Releases** use semver, with the version in `package.json` (`npm version <x.y.z> --no-git-tag-version` updates the lockfile too). Move the `Unreleased` entries under `## [x.y.z] - YYYY-MM-DD`, update the comparison links at the bottom of the changelog, merge to `master`, then tag that merge commit `vX.Y.Z` (annotated) and publish a GitHub Release from the changelog section.
