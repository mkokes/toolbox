# Native-app look for Moped Toolbox: design

## Intent

Moped Toolbox works well on a phone but still looks like a website: boxed form inputs, centred red headings on a flat page, standard antd cards. The owner wants it to look like a polished native phone app, in the spirit of **GuitarTuna**: bold, minimal, with the gauge as the star of the screen. This is a **visual restyle only**. Behaviour, routes, URL state, calculations and test-visible labels stay as they are.

The owner picked "direction A" from three mockups: a **dark tuner look** (near-black, huge glowing gauge and number, dark rounded tiles). They also want the existing **Light / Auto / Dark toggle kept**, so the same look must work in a light theme, and **the in-app styleguide (`/styleguide`) updated** to document the new look.

## Goals

- Every screen (Home, Gearing form, Gearing results, Mix Gas, Styleguide) gets the new look in both themes.
- The RPM gauge and the big RPM number are the visual hero of the results screen.
- Controls look native: rounded tiles with a small label above the value, instead of boxed web inputs.
- The theme toggle stays, restyled as a small pill switch in the header.
- Both themes keep passing the contrast checks. The styleguide shows the new palette, components and rules.

## Non-goals

- No functional change: no new screens, no new navigation (no tab bar), no new features, no change to URL params, storage keys, calculations or copy beyond what the restyle needs.
- No change to routing (stays hash-based), the PWA setup, the logo, or the stack (React 18, antd 5, tokens-only styling).
- Not a layout redesign for desktop. The app stays phone-first in a single 400px column.

## Anti-goals (a failure even if it technically works)

- Hard-coded hex, px or font values outside `src/theme/`. All style values stay in antd tokens, `tokens.ts` and `useAppStyles.ts`.
- Light mode treated as an afterthought: it must look intentional, not like an inverted dark theme.
- Any text or control failing WCAG AA contrast in either theme.
- Breaking tests that find controls by label (`Form.Item` `htmlFor` ↔ control `id` pairing must remain).
- A flash of the wrong theme on load (the inline bootstrap in `index.html` must still match the page backgrounds).

## Constraints from the repo (see AGENTS.md)

- Styling comes only from antd tokens: `baseToken`, `palettes.light/dark`, `brand.light/dark` and component tokens in `getAntdTheme`, plus global/`tb-*` rules in `useAppStyles.ts`. No CSS files or variables.
- `tokens.test.ts` enforces contrast per theme and must be extended for any new color role. `theme.test.ts` checks that the hard-coded backgrounds in `index.html` match `tokens.ts` and `ThemeContext`. The `<meta name="theme-color">` tags and PWA manifest colours must follow any change to the page background.
- Before finishing: `npm test`, `npm run build`, `npm run lint`, `npm run format:check` all pass. Add a line under `## [Unreleased]` in `CHANGELOG.md`.
- The work builds on the footer changes (shared `ActionBar`, `ScrollHint`, sticky footer layering), which currently exist only as **uncommitted changes** on branch `footer-scroll-hint`. They must be committed and merged (or the new branch cut from them) before this work starts; see "Calls made while writing this up". Two other pieces of in-flight work overlap: the thicker slider (`sliderToken`) sits in a git stash, not a branch, and is superseded by this restyle, which carries its own slider styling; the hourly update checks (`pwa-update-checks`, also in a stash) are independent.

## What the owner decided

- **Direction:** A, the dark tuner look, applied to the **whole app** (confirmed by "that all sounds great").
- **Themes:** keep Light / Auto / Dark. Auto still follows the device.
- **Styleguide:** update it to reflect all of the changes.

## The look (proposed in the approved mockups; exact values are the builder's)

Reference mockups, by name: dark and light versions of the results screen and the bike form, in `.superpowers/brainstorm/…/content/a-both-themes.html` (kept outside the repo; the description below is the source of truth).

**Dark theme**

- Near-black page background (darker than the current charcoal), flat, full-bleed. Surfaces (tiles, fields, footer) one step lighter.
- Brand green is the hero colour: the large RPM number, the gauge progress arc, the slider track and handle, the results figures. Redline segment stays red. Needle is near-white.
- Page headings stay red, in the lighter red already used on dark. Muted text is a warm grey.

**Light theme**

- Warm off-white page, white surfaces with a very soft shadow instead of borders.
- The darker brand green (already used for readability on light) for the big number and progress arc, charcoal needle, red slider/primary accents. Gauge track is a pale warm grey.

**Results screen (the hero)**

- A larger gauge, about full column width. The progress arc is drawn from the dial's start to the current RPM, in the accent colour, over a dim track, with the redline segment in red. The needle and tick labels stay.
- The RPM number is very large (roughly 44px or the nearest type-scale step) and sits overlapping the lower part of the gauge, with a small letter-spaced "RPM" caption.
- Speed and gear ratio become two side-by-side rounded stat tiles with a big accent value and a small uppercase caption, in place of the current centred text blocks.
- The speed slider becomes a thick rail with a large ring handle, accent-coloured (a green fill on dark, red on light).

**Forms (Gearing step 1, Mix Gas)**

- Select and number inputs look like rounded tiles with a small uppercase label above the value. They keep their real label (`htmlFor`/`id` pairing and accessible names unchanged); only the presentation changes. The step indicator becomes slim segmented bars.
- Large headings: keep the centred red `PageHeader` unless a left-aligned large title proves better in the builder's tests; either is acceptable.

**Chrome**

- Header: the Lobster title plus the theme toggle on one row. The toggle becomes a small pill switch (sun / auto / moon) using muted colours.
- Footer: the existing sticky `ActionBar` stays (raised surface, edge to edge, red pill buttons, scroll hint above it), retinted to the new surfaces. No tab bar.
- Home: tool cards become large rounded tiles with an accent icon, same two links.
- Motion: only the existing transitions. Honour reduced motion. No new animation required.

**Styleguide**

- Show the new palette for both themes with roles, including new surface/tile colours, with contrast tags.
- Show the new components: gauge hero, stat tiles, field tiles, pill theme toggle, slider, footer bar, steps.
- Update the usage notes and any text that describes the old look.

## Left to the builder

- Exact colours, radii, sizes and type scale values (subject to contrast tests); naming of new token roles.
- Whether tiles are built from antd component tokens, `useAppStyles` rules, or small new components.
- Whether the gauge progress arc and larger dial are implemented by extending `Tachometer` and `lib/gauge.ts` (preferred: keep geometry pure and tested).
- The order of work and how to split it into commits.
- Test updates needed because of markup changes, as long as tests still find controls by label.

## Calls made while writing this up (the author's, not the owner's)

- **Delivery:** one pull request for the whole restyle, opened for the owner to review. Do not merge it: a merge to `master` deploys the site. The plan should include a visual check of every screen in both themes before the PR is opened.
- **Stashed slider work:** leave the stash alone. Nothing is ported from it; this work defines its own slider look.
- **Mockups:** plan from the written description above. The mockup file is a reference only.
