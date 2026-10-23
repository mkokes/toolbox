# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Light and dark themes. The app follows the device setting by default, a Light · Auto · Dark switch in the header overrides it, and the choice is remembered. The page never flashes the wrong theme while loading.
- Tachometer-style RPM gauge with a redline zone on the gearing results.
- Home page tool cards with icons and short descriptions, and the gear logo beside the site title.
- **Top speed at a target RPM** on the gearing results (default 8,000 RPM, saved in the link).
- **Compare gearing:** a what-if card that sets the current sprockets against an alternative, with ±1 buttons, showing the ratio, RPM at the current speed and top speed at the target RPM, plus the change. **Use this gearing** applies it.
- Gearing setups live in the page link, so they can be bookmarked and shared. **Share** (on the results page) uses the phone's share sheet or copies the link, and the link opens straight to the results.
- **My bikes:** save a setup with a name, then reopen or delete it from the gearing page. It's stored on the device.
- **Other / custom** engine: type the engine's reduction ratio for bikes not in the presets.
- The styleguide previews both themes side by side with contrast ratios, plus the resolved type, spacing and radius scales.

### Changed

- All styling now comes from antd design tokens and antd's CSS-in-JS. The hand-written stylesheet and CSS variables are gone.
- Dark-mode headings use a lighter red (`#EA3D6C`) so they meet WCAG contrast. The old red measured 2.61:1.
- The bike setup collapses the four drivetrain dropdowns into a one-line summary marked **Stock** or **Modified**, with an **Edit** button.
- Back/Next (and Save/Share on the results page) sit in a bar that stays at the bottom of the screen on phones.
- Gearing results lead with the RPM gauge, and the ratio sits beside the speed as "Crank To Wheel Ratio".

## [2.0.0] - 2026-10-23

### Added

- Imperial / metric unit toggle on the gearing and gas mixing calculators.
  - Gearing switches between mph and km/h, and labels tire widths in mm and wheel sizes with their mm equivalent.
  - Gas mixing takes gallons or litres, and the imperial result also shows fl oz.
  - The choice is remembered between visits.
- In-app styleguide at `/#/styleguide`. It documents the theme's colors (with contrast ratios), typography, spacing and components, generated from the theme tokens.
- Step indicator on the gearing calculator, and pulley labels for Vespa.
- GitHub Pages deployment through a GitHub Actions workflow on every push to `master`.
- Installable Progressive Web App that works offline, including the Lobster title font. New deploys reach installed copies on their next launch.
- oxlint and oxfmt for linting and formatting, enforced by a husky `pre-push` hook.
- Test suite (Vitest, React Testing Library). It covers the calculators against the original formulas, unit conversions, the engine presets, and each page driven as a user would. The suite runs in the `pre-push` hook and before every deploy.
- Form labels are now linked to their dropdowns and inputs, so screen readers announce them.
- README, AGENTS.md and this changelog.

### Changed

- Rebuilt the toolbox as a React + TypeScript app with Ant Design, built with Vite. It replaces the original jQuery/Zepto and SCSS single page from 2018.
  - The original look carries over as an antd theme: dark background, green Lobster title, red pill buttons.
  - Calculations give the same results as before.
- Pages now have their own URLs (`/#/gearing`, `/#/mix`), so they can be bookmarked and linked.
- Node.js 22.22, 24.15 or 26+ is now required (`.nvmrc` pins Node 26).
- Redrew the gear-and-"M" logo as a scalable SVG. All icons (favicon, PWA, maskable, Apple touch) are now generated from it, replacing the old low-resolution PNGs.

### Fixed

- Sprocket options no longer pile up when switching between manufacturers.
- Removed the "Select a Type" dropdown, which was always empty.

### Removed

- Footer links ("Back to Marty's Garage" and the styleguide link).
- Carburetor sizing calculator.
- The unfinished, hidden port duration calculator.

[Unreleased]: https://github.com/mkokes/toolbox/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/mkokes/toolbox/releases/tag/v2.0.0
