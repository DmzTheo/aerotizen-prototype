# AeroTizen prototype v1

A playable version of [AeroTizen](https://github.com/helalaou/AeroTizen) with the themes, Home layouts and backgrounds discussed in [helalaou/AeroTizen#161](https://github.com/helalaou/AeroTizen/issues/161), to try them before any change to the real code.

**Try it:** https://dmztheo.github.io/aerotizen-prototype/

## What is real, what is new

- **Real:** the TV screen is AeroTizen launcher 2.7.0, built from its source (`app/`) and shown in the app's own browser preview: Home, All apps and Settings, the sample apps, Continue Watching and inputs, the translations, the icons and the remote navigation.
- **New (proposals, names not final):**
  - the Pop, Frost, Gloss, Amethyst, Mint and Halo interface themes (Settings → Appearance → Interface appearance). Each one is one file of CSS variables (`app/launcher/css/themes/`) and comes with its own font (five families for six themes, Halo and Pop sharing Nunito), Latin, Central European and Cyrillic letters included, and Arabic letters from Google Sans in Gloss or from an Arabic family in the other themes (Baloo Bhaijaan 2, Alan Sans, Tajawal, Changa, Alexandria): 571 KB in all, a page loading only the letters it shows;
  - the Lounge, Moment, Diptych, Billboard and Quay Home layouts, the apps at 2.7.0's sizes in every layout and a Very small app size (six a row in the Grid);
  - Themes (Settings → Appearance → Themes, "presets" in the code): one choice sets the interface theme, the background, the Home layout and the clock together, each shown as a miniature of the Home screen it gives, AeroTizen's own first, then one per proposed layout, each with its own background and interface theme. The Settings list the interface themes, the layouts and the backgrounds in the same order;
  - the Prism, Pastel, Coral, Twilight Peaks and Borealis backgrounds (pure CSS gradients), and Stage (WebGL), made in `backgrounds/`.

  An interface theme only changes the interface, and a theme from the Themes section never changes the card size: the rest stays the user's choice.

- **Not reproduced:** Samsung's app artwork (the fallback cards are shown, as in the app's browser preview), and anything that needs a TV. The weather is live, as in the app's preview: the location comes from the IP address.

## How to use it

Click the TV, then use the arrow keys like the remote, Enter for OK, and Esc or Backspace for Back.

Everything the app lets you change is in its own Settings (the gear at the top left): themes, interface appearance, Home layout, backgrounds, card size, Continue Watching, clock, language…

The handle on the right edge opens a small panel that simulates the TV itself:

- its language, which drives "Use TV language" and the date format;
- how many programmes Continue Watching has;
- how many HDMI ports the TV has.

The address bar always holds the current setup, so sharing the link shares what you see.

## Run it locally

Serve this folder with any static server (for example `npx serve`) and open the address it prints. `tv/` holds the built TV page.

## Rebuild the TV page

`app/` is AeroTizen launcher 2.7.0 (`launcher/`, `package.json` and the build and lint configurations) with the proposals applied. Every change to the real code is marked "Theme proposal". With the dependencies of AeroTizen 2.7.0 installed (`npm ci` in `app/`):

```sh
cd app
node tools/proposal-scenes.mjs                # backgrounds/*.js → launcher/src/backgrounds/proposalScenes.ts
npx vite build --config vite.prototype.mts    # → ../tv
```

The checks are AeroTizen's own, run from `app/`: `npx prettier --check`, `npx eslint`, `npx stylelint` and `npx tsc -p tsconfig.json --noEmit`.

## Licence

- AeroTizen is under the MIT licence (`app/LICENSE`, copied to `tv/licenses/` with the licences of Preact, i18next and Lucide).
- The theme fonts are under the SIL Open Font License 1.1, with the licence next to each family in `app/launcher/fonts/`.
- The rest of this prototype is MIT as well (`LICENSE`).
