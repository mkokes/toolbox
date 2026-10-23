# Moped Toolbox

Calculators for moped gearing (RPM ↔ MPH), carburetor sizing and two-stroke oil mixing.

Built with Vite, React, TypeScript and Ant Design.

## Development

```sh
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm run build      # outputs to dist/
npm run preview
```

Requires Node 18 or newer.

## Project layout

- `src/data/engines.json`: engine records (ratios, default sprockets, stroke). Add new bikes here.
- `src/lib/`: the calculators, written as pure functions (gearing, carb, mix) plus the select options.
- `src/pages/`: one page per tool, plus `/styleguide`.
- `src/theme/`:
  - `tokens.ts` holds the brand tokens.
  - `antdTheme.ts` maps those tokens onto the antd theme.
  - `global.css` holds the few styles antd can't express, such as the gradient pill buttons.

## Styleguide

Open `/#/styleguide` in the running app (there's also a link in the footer). It renders the colors, type, spacing and components directly from `src/theme/`. To change the look, edit `tokens.ts`, not individual components.

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds the app and deploys `dist/` to GitHub Pages on every push to `master`. You can also run it by hand from the Actions tab.

One-time setup: in the repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.

- **Base path:** the workflow passes the Pages base path (e.g. `/toolbox`) to `vite.config.ts` as `BASE_PATH`, so assets resolve under `https://<user>.github.io/<repo>/` and on custom domains.
- **Routing:** the app uses hash routing (`/#/gearing`) because GitHub Pages has no single-page-app fallback.

To test a sub-path build locally:

```sh
BASE_PATH=/toolbox npm run build
npx vite preview --base /toolbox/
```
