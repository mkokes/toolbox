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
- **Page tests** mount the real routes with `renderRoute(path)` from `src/test/render.tsx` (theme + `UnitsProvider` + memory router). It returns `{ user, router }`.
  - Find controls by their label: every `Form.Item` has `htmlFor` matching its control's `id`. Keep that pairing when you add fields.
  - Pick antd Select options with `choose(user, /label/, 'Option text')` from `src/test/antd.ts`.
- **To start in metric,** set `localStorage.setItem('toolbox.units', 'metric')` before rendering. `setup.ts` clears storage and unmounts after each test.
- **antd-in-jsdom quirks** (already handled; don't remove these):
  - `setup.ts` stubs `matchMedia` and strips the pseudo-element argument from `getComputedStyle`.
  - `renderRoute` disables user-event's pointer-events check, because dropdowns animate.
  - antd keeps closed dropdowns in the DOM, so assert on what the field shows (selected title or placeholder), not on whether an option exists.
  - The Slider reads the legacy `keyCode`. Drive it with `fireEvent.keyDown(slider, { key: 'ArrowRight', keyCode: 39, which: 39 })`, not `user.keyboard`.

## Layout

```
src/
  main.tsx              ConfigProvider (antd theme) → UnitsProvider → RouterProvider; injects CSS vars from tokens
  App.tsx               layout shell; exports `routes` (/, /gearing, /mix, /styleguide [lazy]) and the hash `router`
  data/engines.json     engine presets; data/engines.ts = Engine type + lookups (manufacturers/models/versions/findEngine)
  lib/                  pure, framework-free logic
    gearing.ts          tireCircumference, calcRpm, calcMph, finalRatio
    mix.ts              oilMl(litres, ratio), mlToFlOz
    units.ts            UnitSystem, conversion constants and helpers, unitLabels
    options.ts          dropdown option generators (wheel, tire, ratio, sprockets/pulleys)
  context/UnitsContext.tsx   useUnits(): shared imperial/metric choice, persisted to localStorage ("toolbox.units")
  components/           PageHeader, ResultStat, BackButton, UnitToggle
  pages/                Home, Gearing, MixGas, Styleguide
  theme/                tokens.ts (source of truth) → antdTheme.ts + cssVars → global.css
  test/                 setup.ts (jsdom shims), render.tsx (renderRoute), antd.ts (choose)
```

## Conventions

- **Keep logic in `src/lib`, as pure functions.** Pages hold state (`useState`) and call into `lib`. There's no global store. The only context is the units setting.
- **Canonical units internally, convert only at the edges.**
  - Speed is stored in mph and gearing math runs in mph. Convert with `speedFromMph`/`speedToMph` for display and input.
  - Fuel volume goes through litres (`volumeToLitres`/`volumeFromLitres`).
  - Wheel and tire option _values_ are always inches, because that's what `engines.json` uses. Only the labels change with the unit system.
  - Don't round the canonical value. Round only what you display, so toggling units doesn't drift results.
- **Styling comes from tokens.** Colors, fonts, spacing and button metrics live in `src/theme/tokens.ts`.
  - `antdTheme.ts` maps them onto antd tokens.
  - `cssVars` exposes them as `--tb-*` custom properties for `global.css`.
  - Don't hard-code hex values in components. The `/styleguide` page renders straight from these files, so it updates itself.
- **Use antd components** (`Form`, `Select`, `InputNumber`, `Slider`, `Segmented`, `Button`) before writing custom controls. Primary buttons are `type="primary" size="large" block`.
- **Formatting is owned by oxfmt** (`.oxfmtrc.json`: no semicolons, single quotes, 120 cols, trailing commas). Don't hand-format against it. Run `npm run format`.
- **Lint warnings fail the push.** If a rule is wrong for a specific line, use `// oxlint-disable-next-line <rule>` with a comment explaining why.

## Gotchas

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
  - The Workbox service worker precaches every built asset, using `registerType: 'autoUpdate'`.
  - Google Fonts (Lobster) are cached at runtime.
  - If you add a new kind of static file, make sure its extension is in `workbox.globPatterns`, or it won't work offline.
  - A stale service worker can serve old code while you debug a production build. Use a private window or unregister it in DevTools → Application. `npm run dev` doesn't register one.
- **Icons are generated, not hand-made.**
  - Edit `public/icon.svg`, run `npm run icons` (config in `pwa-assets.config.ts`), and commit the PNG/ICO output.
  - The "M" in the SVG is the Lobster glyph converted to a path. Don't replace it with `<text>`: the icon renderer has no Lobster font.
  - `tsconfig.node.json` lists `src/pwa.ts` and `src/theme/tokens.ts` because `vite.config.ts` imports them, and composite projects must list every file.
- **Bundle chunks:** `react` and `antd` are split into vendor chunks in `vite.config.ts`, and the styleguide route is lazy-loaded. Keep heavy, rarely used pages lazy.

## Workflow

- Branch off `master`, and land changes through a pull request. A push or merge to `master` deploys via `.github/workflows/deploy.yml`.
- Add a line under `## [Unreleased]` in [CHANGELOG.md](CHANGELOG.md) for user-visible changes ([Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format). Don't create tags or bump versions unless asked.
