# Moped Toolbox

Pocket calculators for moped gearing and two-stroke fuel mixing, in imperial or metric units.

Pick your bike and gearing and see what engine RPM you'll be turning at a given speed. Or work out how much two-stroke oil to add to a tank of gas. It's built for vintage moped owners, works well on a phone, and runs entirely in the browser.

**Live site:** https://mkokes.github.io/toolbox/ · **Styleguide:** https://mkokes.github.io/toolbox/#/styleguide

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Testing](#testing)
- [Project layout](#project-layout)
- [Adding a bike](#adding-a-bike)
- [Styleguide](#styleguide)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Features

- **Gearing calculator:**
  - Choose a manufacturer, model and version from presets for Garelli, Laura, Minarelli, Motobecane, Peugeot, Puch, Sachs, Tomos and Vespa.
  - Adjust the front/rear sprockets (belt pulleys on a Vespa), wheel size and tire width.
  - See the crankshaft-to-wheel ratio and the engine RPM at any speed from a slider.
- **Gas mixing calculator:** pick a fuel-to-oil ratio (20:1 to 100:1) and an amount of gas to get the oil to add, in ml (plus fl oz in imperial).
- **Imperial / metric toggle:** switches mph ↔ km/h, gallons ↔ litres and inches ↔ mm. The choice is remembered between visits.
- **Light and dark themes:** follows your device's setting automatically. A Light · Auto · Dark switch in the header overrides it, and your choice is remembered. Both themes meet WCAG AA contrast.
- **RPM gauge:** the gearing results show engine speed on a tachometer dial with a redline zone.
- **Installable and offline:** it's a Progressive Web App. You can add it to your home screen or desktop, and it keeps working with no signal once it has loaded.
- **Styleguide page:** a living reference for both themes' colors (with contrast ratios), type, spacing and components.

## Tech stack

|               |                                                       |
| ------------- | ----------------------------------------------------- |
| UI            | React 18, Ant Design 5, React Router 6 (hash routing) |
| Language      | TypeScript 5.6                                        |
| Build         | Vite 6                                                |
| Styling       | antd design tokens + antd CSS-in-JS (no CSS files)    |
| Tests         | Vitest, React Testing Library, jsdom                  |
| Lint / format | oxlint, oxfmt, husky (pre-push hook)                  |
| PWA           | vite-plugin-pwa (Workbox service worker)              |
| Hosting       | GitHub Pages via GitHub Actions                       |

**Prerequisites:** Node.js 22.22, 24.15 or 26 and up (required by jsdom, which the tests use), and npm. The repo's `.nvmrc` pins Node 26.

## Getting started

```sh
git clone https://github.com/mkokes/toolbox.git
cd toolbox
nvm use 26          # nvm-windows doesn't read .nvmrc, so pass the version
npm install         # also installs the husky git hooks
npm run dev         # http://localhost:5173
```

## Scripts

| Command                | What it does                                    |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Start the Vite dev server                       |
| `npm run build`        | Type-check, then build to `dist/`               |
| `npm run preview`      | Serve the production build locally              |
| `npm run typecheck`    | Run the TypeScript compiler only                |
| `npm test`             | Run the test suite once                         |
| `npm run test:watch`   | Re-run tests as files change                    |
| `npm run icons`        | Regenerate the app icons from `public/icon.svg` |
| `npm run lint`         | Run oxlint. Warnings count as failures          |
| `npm run lint:fix`     | Apply oxlint's automatic fixes                  |
| `npm run format`       | Format all files with oxfmt                     |
| `npm run format:check` | Report unformatted files without changing them  |

## Testing

Tests use [Vitest](https://vitest.dev/) with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) in jsdom. Test files sit next to the code they cover, as `*.test.ts(x)`.

- **Calculators and data** (`src/lib`, `src/data`):
  - The gearing and mixing results are checked against the original site's formulas, so a refactor can't silently change an answer.
  - Unit conversions are checked to round-trip without drift.
  - Every engine preset's defaults are checked to exist in the dropdowns.
- **Pages** (`src/pages`): each tool is driven the way a user would. The tests pick a bike, read the RPM, flip to metric and enter an amount of gas.
- **Helpers** (`src/test/`): `setup.ts` fills in browser APIs jsdom lacks, `render.tsx` mounts the real app at a route, and `antd.ts` picks options from antd dropdowns.

```sh
npm test                               # whole suite
npx vitest run src/pages/Gearing       # one file
npm run test:watch                     # watch mode
```

The pre-push hook and the deploy workflow both run the suite, so a failing test blocks a push and a deploy.

## Project layout

```
src/
  data/engines.json   engine presets (ratios, default sprockets, wheel and tire)
  data/engines.ts     typed lookups over the presets
  lib/                pure calculator functions, unit conversions and select options
  context/            the shared imperial/metric setting
  components/         small shared UI pieces (results, headings, unit toggle)
  pages/              one page per tool, plus the styleguide
  theme/              design tokens (every style value), antd theme config, app styles
  test/               test setup and shared test helpers
src/pwa.ts            web app manifest (name, colors, icons)
public/               icon.svg (logo source) and the icons generated from it, copied as-is into the build
```

## Adding a bike

Add a record to `src/data/engines.json`. Records with the same `manufacturer` and `model` show up as versions you pick from, so each one needs a distinct `version`.

```json
{
  "manufacturer": "Puch",
  "model": "E50",
  "type": "1 Speed",
  "finaldriveratio": 0.1980198019802,
  "defaultfront": 16,
  "defaultrear": 45,
  "defaultwheel": 17,
  "defaulttire": 2.25
}
```

`finaldriveratio` is the engine's internal reduction, crankshaft to output sprocket. The defaults must be values that appear in the dropdowns: sprockets 9–31 / 20–78 teeth, wheels 10–19 in, and tires 2.00–4.00 in in steps of 0.25. Vespas use pulleys instead: 50 or 60 mm in front, 55–105 mm in steps of 5 at the rear.

## Styleguide

The styleguide lives at **https://mkokes.github.io/toolbox/#/styleguide**, or `http://localhost:5173/#/styleguide` when running `npm run dev`. The app doesn't link to it, so use the URL. It previews the light and dark palettes side by side with contrast ratios, and shows the resolved type, spacing and radius tokens, all straight from `src/theme/tokens.ts`.

All styling is antd design tokens: colors, fonts, sizes, spacing and borders are defined once in `tokens.ts` and read by components through `theme.useToken()`. To change the look, edit the tokens, not individual components.

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to `master`, and can also be run by hand from the Actions tab. In the repo's **Settings → Pages**, **Source** must be set to **GitHub Actions**.

- The workflow passes the Pages base path to the build as `BASE_PATH`, so assets resolve under `/toolbox/`.
- The app uses hash URLs (`/#/gearing`) because GitHub Pages has no single-page-app fallback.
- **Offline caching:** the build generates a service worker that caches the whole app. After a deploy, returning visitors get the new version on their next visit. It downloads in the background and takes over without a prompt.

### Installing the app

Open the site in a browser, then use **Install** (Chrome or Edge: the icon in the address bar) or **Add to Home Screen** (iOS Safari: the Share menu). It opens in its own window and works offline.

### App icons

`public/icon.svg` is the logo: a gear with the Lobster "M", drawn as plain vector paths so it renders without the font installed. `npm run icons` uses `pwa-assets.config.ts` to generate the favicon, the 64/192/512px PWA icons, a maskable icon and the Apple touch icon from it. Commit the regenerated files.

To try a production build under the same sub-path locally:

```sh
BASE_PATH=/toolbox npm run build
npx vite preview --base /toolbox/
```

## Contributing

1. Branch off `master` and make your change.
2. Add or update tests for the change, run `npm test` and `npm run build`, and check the affected pages in `npm run dev`.
3. Push. A husky `pre-push` hook runs `npm run lint`, `npm run format:check` and `npm test`, and blocks the push if any of them fails. Fix with `npm run format` / `npm run lint:fix`, commit, and push again.
4. Open a pull request against `master`. Merging deploys the site.

Record notable changes under `Unreleased` in [CHANGELOG.md](CHANGELOG.md). Guidance for AI coding agents is in [AGENTS.md](AGENTS.md).
