# AeroTizen prototype v1

A playable version of [AeroTizen](https://github.com/helalaou/AeroTizen) with the Home layouts and the Themes section discussed in [helalaou/AeroTizen#161](https://github.com/helalaou/AeroTizen/issues/161), to try them before any change to the real code.

**Try it:** https://dmztheo.github.io/aerotizen-prototype/

## What is real, what is new

- **Real:** the TV screen is AeroTizen's main branch at commit `59d00af`, with the Cinema layout and the Cover art option that are under review upstream, built from its source (`app/`) and shown in the app's own browser preview: Home, All apps and Settings, the eight interface themes with their fonts, the wallpapers, the sample apps, Continue Watching and inputs, the translations, the icons and the remote navigation.
- **New (proposals, names not final):**
  - the Lounge, Moment, Diptych, Billboard and Quay Home layouts (Settings → Appearance → Launcher layout, next to Standard and Cinema). Each one works with Continue Watching on, off or empty, with or without Cover art, with inputs shown or all hidden, with one app or many, at every app size and with every clock: without programmes the apps and the inputs sit at the bottom of the screen, and without inputs the apps take the whole width. With Cover art (Settings → Apps → Continue Watching), each layout shows posters: three at a time beside the greeting or the clock in Moment and Quay, five in the Diptych, a row as tall as the top area beside the Billboard's main picture;
  - three smaller app sizes, Small, Very small and Tiny (six, seven and eight apps a row in the Grid; Tiny is the size of Cinema's apps), with the whole scale named from Tiny to Very large. The app size set in Settings is the same in every layout and with every clock; a layout that no longer fits scrolls, like the Grid. The Moment and Quay band shows whole apps only, the others scrolling in;
  - Themes (Settings → Appearance → Themes, "presets" in the code): one choice sets the interface theme, the wallpaper, the Home layout and the clock together, each shown as a miniature of the Home screen it gives, AeroTizen's own first, then one per proposed layout.

  A theme from the Themes section never changes the app size: the rest stays the user's choice.

- **Not reproduced:** Samsung's app artwork (the app's browser preview shows its neutral cards), the posters a catalogue returns (the prototype draws its own for the sample programmes), and anything that needs a TV. The weather is live, as in the app's preview.

## How to use it

Click the TV, then use the arrow keys like the remote, Enter for OK, and Esc or Backspace for Back.

Everything the app lets you change is in its own Settings (the gear at the top left): themes, launcher layout, interface appearance, app size, wallpapers, Continue Watching, inputs, clock, language…

The handle on the right edge opens a small panel that simulates the TV itself:

- its language, which drives "Use TV language" and the date format;
- how many programmes Continue Watching has;
- how many HDMI ports the TV has, and how many devices are switched on. For a Home without inputs, switch every device off there, then hide the disconnected ports and Live TV in Settings → Inputs.

The address bar always holds the current setup, so sharing the link shares what you see.

## Run it locally

Serve this folder with any static server (for example `npx serve`) and open the address it prints. `tv/` holds the built TV page.

## Rebuild the TV page

`app/` is AeroTizen's main branch at commit `59d00af` (`launcher/`, `package.json` and the build and lint configurations) with the Cinema layout and Cover art changes under review, then the proposals applied. With the dependencies installed (`npm ci` in `app/`):

```sh
cd app
npx vite build --config vite.prototype.mts    # → ../tv
```

The checks are AeroTizen's own, run from `app/`: `npm run format:check`, `npm run lint`, `npm run typecheck` and `npm run test:components`.

## Licence

- AeroTizen is under the MIT licence (`app/LICENSE`, copied to `tv/licenses/` with the licences of Preact, i18next and Lucide).
- The theme fonts are under the SIL Open Font License 1.1, with the licence next to each family in `app/launcher/fonts/`.
- The rest of this prototype is MIT as well (`LICENSE`).
