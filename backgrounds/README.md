# AeroTizen backgrounds (prototype)

Six wallpapers for the theme proposal:

- **Five pure CSS gradients**, like the launcher's existing static scenes: Borealis, Twilight Peaks, Pastel, Coral and Prism. No images anywhere: no PNG, no SVG, no filter.
- **Stage**, an animated WebGL 1 background.

Each one was designed alongside a theme (below), but choosing a theme does not change the wallpaper.

| Wallpaper      | Theme    | Kind  |
| -------------- | -------- | ----- |
| Borealis       | Halo     | CSS   |
| Twilight Peaks | Amethyst | CSS   |
| Coral          | Gloss    | CSS   |
| Pastel         | Frost    | CSS   |
| Prism          | Pop      | CSS   |
| Stage          | Mint     | WebGL |

| File            | What it is                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `gradients.css` | `.bg-borealis`, `.bg-twilightpeaks`, `.bg-pastel`, `.bg-coral`, `.bg-prism`: layered linear, radial and conic gradients. |
| `gradients.js`  | `window.AEROTIZEN_GRADIENTS`: the same values as strings, for swatches and previews.                                     |
| `stage.js`      | `window.StageBackground`: the animated Stage wallpaper (WebGL 1, plain script).                                          |
| `test.html`     | Full-screen demo: switch backgrounds (keys 1 to 6), Stage speed slider, FPS readout.                                     |

Everything is a plain script or stylesheet with relative paths. It works from `file://` and on GitHub Pages, with no build step and no dependency.

## Quick start

```html
<link rel="stylesheet" href="backgrounds/gradients.css" />
<script src="backgrounds/gradients.js"></script>
<script src="backgrounds/stage.js"></script>

<!-- A static wallpaper: any 1920x1080 (or other 16:9) element -->
<div class="bg-coral" style="width:1920px;height:1080px"></div>

<script>
  // The same wallpaper as a string, e.g. for a small swatch
  swatch.style.background = window.AEROTIZEN_GRADIENTS.prism;

  // Stage: fills a positioned, sized container
  var stage = window.StageBackground.mount(
    document.getElementById("wallpaper"),
    { speed: 1 },
  );
  stage.setSpeed(0.5); // 0 pauses
  stage.destroy(); // stops, frees the GL context, removes its layers
</script>
```

`test.html` checks on load that `gradients.css` and `gradients.js` compute the same backgrounds. If they ever drift apart, it shows a warning and sets `data-gradients-in-sync="false"`.

URL parameters: `?bg=borealis|twilightpeaks|pastel|coral|prism|stage`, `&speed=0.5`, `&ui=0` (no panel, for screenshots). Press `H` to hide the panel.

## The CSS wallpapers

Every wallpaper is a short stack of soft layers, first layer on top, and the last layer is opaque. Sizes and positions are percentages, so the same value renders the same composition on the 1920x1080 TV layer and on a 16:9 Settings swatch. The only exceptions are the star tiles of Borealis and Twilight Peaks, which are sized in px so the stars stay screen-pixel sharp.

| Wallpaper      | Layers | Composition                                                                                                                                                                                                                                                                                                                                 | GPU per full repaint |
| -------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Borealis       | 16     | The aurora over mountains. The main curtain is four elliptical ring segments, and the brightest one makes the mint fold on the right. The rays are concentric arcs around a centre far to the upper left, so they lean right near the curtains and straighten upwards. Three mountain ranges stand in mist, and a star tile covers the sky. | about 2.9 ms         |
| Twilight Peaks | 12     | A starry plum sky and a pink glow behind a jagged lavender ridge, then valley mist and a violet ridge. A pine treeline runs along the bottom: three rows of thin conic teeth of different periods, so the pattern never visibly repeats.                                                                                                    | not measured         |
| Pastel         | 11     | A pastel haze (ivory, mint, sky blue, violet, pink, apricot), lit by a morning sun at the top left, with five big, barely visible circles of colour.                                                                                                                                                                                        | about 1.2 ms         |
| Coral          | 15     | The night sits on the left, under the text column. Diagonal bands of smoke (night, electric blue, violet, hot pink, coral) lead to the peach afterglow on the right. The blue band dissolves into the night through eight soft smoke lobes and two long wisps.                                                                              | about 1.2 ms         |
| Prism          | 11     | Rounded colour masses only, with no linear or conic layer, so nothing reads as rays: crimson on the left, violet in the centre, cobalt and teal at the top, and warm orange along the right edge. Soft lilac and pink cores add depth.                                                                                                      | about 1.4 ms         |

The repaint cost is the GPU time of a forced full 1920x1080 repaint, measured on a desktop AMD integrated GPU (Chrome, ANGLE/D3D11, median of repeated runs). The wallpapers are static, so this cost is only paid when the background is painted: on load, or when its tiles are invalidated.

### Readability budget

| Text                                                                   | Where it sits                             | Minimum contrast                       |
| ---------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------- |
| Large text: section headings, header clock and date, tabs              | directly on the wallpaper                 | 3:1 (WCAG AA, large text)              |
| Small text: card titles, episode lines, input sub-labels, status pills | on the cards' and the dock's own surfaces | 4.5:1, measured with the real surfaces |

Each wallpaper was measured with its paired theme, at the worst pixel: the text is hidden, the backdrop captured, then the text's real colour is composited back. The states measured are the grid with 4 and 5 inputs, Billboard and Lounge, in English and in Arabic.

| Wallpaper (theme)         | Large text                                                 | Small text         | Note                                                                                                          |
| ------------------------- | ---------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------- |
| Borealis (Halo)           | ≥ 3.34:1                                                   | ≥ 6.26:1           | The rays are calmer behind the Continue Watching heading.                                                     |
| Twilight Peaks (Amethyst) | ≥ 3.20:1 (Billboard); 4.57:1 in the grid, 4.75:1 in Lounge | ≥ 4.78:1           | Amethyst's headings are weight 500, so under strict WCAG they would need 4.5:1. Only Billboard is below that. |
| Pastel (Frost)            | headings ≥ 4.79:1, header ≥ 10.9:1, tabs ≥ 6.4:1           | ≥ 4.97:1           | Light wallpaper: it pairs with Frost's dark text.                                                             |
| Coral (Gloss)             | ≥ 3.41:1 (clock)                                           | ≥ 5.05:1           | Icons ≥ 3.47:1.                                                                                               |
| Prism (Pop)               | ≥ 3.71:1                                                   | "Live TV" ≥ 4.55:1 | The orange deepens slightly in the bottom-right corner so "Live TV" keeps 4.5:1.                              |

Pastel and Coral were measured with a grain tile that has since been removed. Their figures can only move by a few hundredths.

### Right-to-left

In right-to-left layouts the prototype draws these wallpapers mirrored, on a layer above the root element (`BackgroundSceneView`, `[data-proposal-mirror]`, `scaleX(-1)`). UI and light keep the same relation as in English, so the budget holds in Arabic too. Because the last layer of every value is opaque, the unmirrored base never shows through. Real scenes are painted exactly as the real app paints them.

## Scene objects for `launcher/src/backgrounds/scenes.ts`

The five CSS wallpapers fit the existing static scene format, `{ id, base }`, as they are. For static scenes `preview()` returns `base`, and the percentage-based values also render correctly on Settings swatches.

<!-- scenes -->

```ts
// static
  {
    id: "borealis",
    base:
      "conic-gradient(at 34% 0%, rgba(1,5,6,0) 0deg, rgba(1,5,6,0) 95.45deg, rgb(1,5,6) 96.45deg, rgb(1,5,6) 258.06deg, rgba(1,5,6,0) 259.06deg) 10.737% 100% / 27.24% 8.333% repeat-x, " +
      "conic-gradient(at 38% 0%, rgba(3,12,14,0) 0deg, rgba(3,12,14,0) 102.77deg, rgb(3,12,14) 103.97deg, rgb(3,12,14) 248.21deg, rgba(3,12,14,0) 249.41deg) 12.763% 100% / 18.385% 20.185% repeat-x, " +
      "conic-gradient(at 61% 0%, rgba(3,12,14,0) 0deg, rgba(3,12,14,0) 114.51deg, rgb(3,12,14) 115.71deg, rgb(3,12,14) 252.72deg, rgba(3,12,14,0) 253.92deg) 5.223% 100% / 10.26% 19.259% repeat-x, " +
      "linear-gradient(180deg, rgba(3,12,14,0) 63.9%, rgba(3,12,14,.3) 67.6%, rgba(3,12,14,.58) 73.1%, rgba(3,12,14,.5) 76.9%, rgba(12,42,42,.2) 78.7%, rgba(14,50,50,.4) 81.5%, rgba(12,46,46,.5) 88%, rgba(8,30,32,.5) 100%), " +
      "conic-gradient(at 44% 0%, rgba(15,42,43,0) 0deg, rgba(15,42,43,0) 101.7deg, rgb(15,42,43) 104.5deg, rgb(15,42,43) 252.1deg, rgba(15,42,43,0) 254.9deg) 5.58% 100% / 15.99% 34.074% repeat-x, " +
      "conic-gradient(at 58% 0%, rgba(15,42,43,0) 0deg, rgba(15,42,43,0) 110.35deg, rgb(15,42,43) 113.15deg, rgb(15,42,43) 252.48deg, rgba(15,42,43,0) 255.28deg) 2.298% 100% / 9.323% 33.148% repeat-x, " +
      "radial-gradient(circle at 200px 20px, rgba(235,255,248,.85) 0, rgba(235,255,248,.468) 0.8px, rgba(235,255,248,0) 1.6px) 0 0 / 271px 223px, " +
      "radial-gradient(244.127% 434.003% at -135.417% 0%, rgba(2,9,13,.97) 56.527%, rgba(2,9,13,.945) 57.532%, rgba(2,9,13,.823) 58.035%, rgba(2,9,13,.795) 58.286%, rgba(2,9,13,.821) 58.538%, rgba(2,9,13,.701) 59.293%, rgba(2,9,13,.618) 59.545%, rgba(2,9,13,.474) 59.796%, rgba(2,9,13,.416) 60.048%, rgba(2,9,13,.409) 60.552%, rgba(2,9,13,.486) 60.803%, rgba(2,9,13,.631) 61.055%, rgba(2,9,13,.424) 61.307%, rgba(2,9,13,.409) 61.559%, rgba(2,9,13,.591) 61.811%, rgba(2,9,13,.611) 62.063%, rgba(2,9,13,.593) 62.82%, rgba(2,9,13,.624) 63.072%, rgba(2,9,13,.524) 63.576%, rgba(2,9,13,.633) 63.828%, rgba(2,9,13,.591) 64.081%, rgba(2,9,13,.274) 64.333%, rgba(2,9,13,.292) 64.585%, rgba(2,9,13,.463) 64.838%, rgba(2,9,13,.533) 65.595%, rgba(2,9,13,.603) 65.848%, rgba(2,9,13,.681) 66.858%, rgba(2,9,13,.689) 67.363%, rgba(2,9,13,.748) 67.616%, rgba(2,9,13,.766) 67.868%, rgba(2,9,13,.734) 68.121%, rgba(2,9,13,.618) 68.374%, rgba(2,9,13,.653) 68.879%, rgba(2,9,13,.711) 69.132%, rgba(2,9,13,.628) 69.638%, rgba(2,9,13,.76) 69.891%, rgba(2,9,13,.797) 70.144%, rgba(2,9,13,.778) 70.397%, rgba(2,9,13,.902) 70.902%, rgba(2,9,13,.856) 71.408%, rgba(2,9,13,.97) 71.915%, rgba(2,9,13,.969) 72.927%, rgba(2,9,13,.845) 73.433%, rgba(2,9,13,.78) 73.94%, rgba(2,9,13,.792) 74.193%, rgba(2,9,13,.691) 74.446%, rgba(2,9,13,.54) 74.7%, rgba(2,9,13,.567) 74.953%, rgba(2,9,13,.514) 75.206%, rgba(2,9,13,.25) 75.713%, rgba(2,9,13,0) 75.966%, rgba(2,9,13,.31) 76.22%, rgba(2,9,13,.374) 76.473%, rgba(2,9,13,.31) 76.726%, rgba(2,9,13,.635) 77.487%, rgba(2,9,13,.614) 77.74%, rgba(2,9,13,.786) 78.247%, rgba(2,9,13,.837) 78.501%, rgba(2,9,13,.848) 78.754%, rgba(2,9,13,.701) 79.515%, rgba(2,9,13,.967) 79.769%, rgba(2,9,13,.97) 81.291%, rgba(2,9,13,.908) 81.544%, rgba(2,9,13,.683) 81.798%, rgba(2,9,13,.658) 82.052%, rgba(2,9,13,.511) 82.559%, rgba(2,9,13,.442) 83.067%, rgba(2,9,13,.235) 83.321%, rgba(2,9,13,.31) 83.575%, rgba(2,9,13,.46) 83.828%, rgba(2,9,13,.582) 84.336%, rgba(2,9,13,.755) 84.59%, rgba(2,9,13,.764) 85.098%, rgba(2,9,13,.696) 85.606%, rgba(2,9,13,.798) 85.86%, rgba(2,9,13,.74) 86.368%, rgba(2,9,13,.57) 86.622%, rgba(2,9,13,.511) 86.876%, rgba(2,9,13,.606) 87.13%, rgba(2,9,13,.633) 87.384%, rgba(2,9,13,.581) 87.638%, rgba(2,9,13,.641) 87.892%, rgba(2,9,13,.535) 88.4%, rgba(2,9,13,.351) 88.654%, rgba(2,9,13,.367) 88.908%, rgba(2,9,13,.728) 89.67%, rgba(2,9,13,.802) 89.924%, rgba(2,9,13,.823) 90.179%, rgba(2,9,13,.65) 90.941%, rgba(2,9,13,.664) 91.195%, rgba(2,9,13,.745) 91.449%, rgba(2,9,13,.97) 91.704%, rgba(2,9,13,.957) 92.975%, rgba(2,9,13,.896) 93.229%, rgba(2,9,13,.794) 93.483%, rgba(2,9,13,.763) 93.738%, rgba(2,9,13,.529) 93.992%, rgba(2,9,13,.148) 94.246%, rgba(2,9,13,.153) 94.755%, rgba(2,9,13,.053) 95.009%, rgba(2,9,13,0) 95.263%, rgba(2,9,13,0) 96.026%, rgba(2,9,13,.264) 96.281%, rgba(2,9,13,.47) 96.535%, rgba(2,9,13,.555) 96.79%, rgba(2,9,13,.527) 97.044%), " +
      "radial-gradient(228.95% 138.889% at 82.422% 127.407%, rgba(30,232,146,0) 0%, rgba(30,232,146,0) 55.733%, rgba(30,232,146,.125) 58%, rgba(70,230,165,.525) 59.2%, rgb(150,255,205) 60%, rgb(110,252,186) 60.8%, rgba(30,232,146,.775) 63%, rgba(26,214,152,.562) 67.333%, rgba(22,150,168,.35) 74.667%, rgba(40,110,180,.2) 82%, rgba(110,60,200,.1) 90.667%, rgba(110,60,200,0) 100%) 0% 0% / 40% 100% no-repeat, " +
      "radial-gradient(843.224% 117.037% at -294.986% -59.352%, rgba(110,60,200,0) 0%, rgba(110,60,200,0) 47.468%, rgba(110,60,200,.08) 58.544%, rgba(40,110,180,.16) 68.829%, rgba(22,150,168,.28) 77.532%, rgba(26,214,152,.45) 86.234%, rgba(30,232,146,.62) 91.377%, rgba(110,252,186,.8) 93.987%, rgba(150,255,205,.8) 94.937%, rgba(70,230,165,.42) 95.886%, rgba(30,232,146,.1) 97.31%, rgba(30,232,146,0) 100%) 49.838% 0% / 19.74% 100% no-repeat, " +
      "radial-gradient(308.102% 194.444% at 45.161% 173.056%, rgba(30,232,146,0) 0%, rgba(30,232,146,0) 68.381%, rgba(30,232,146,.1) 70%, rgba(70,230,165,.42) 70.857%, rgba(150,255,205,.8) 71.429%, rgba(110,252,186,.8) 72%, rgba(30,232,146,.62) 73.571%, rgba(26,214,152,.45) 76.667%, rgba(22,150,168,.28) 81.905%, rgba(40,110,180,.16) 87.143%, rgba(110,60,200,.08) 93.333%, rgba(110,60,200,0) 100%) 84.214% 0% / 29.063% 100% no-repeat, " +
      "radial-gradient(508.121% 99.074% at 51.161% -54.352%, rgba(110,60,200,0) 0%, rgba(110,60,200,0) 37.383%, rgba(110,60,200,.08) 50.467%, rgba(40,110,180,.17) 62.617%, rgba(22,150,168,.3) 72.897%, rgba(26,214,152,.48) 82.243%, rgba(40,238,160,.66) 87.85%, rgba(130,252,200,.82) 91.028%, rgba(185,255,230,.92) 92.897%, rgba(175,255,225,.8) 94.206%, rgba(120,250,200,.38) 95.701%, rgba(60,230,165,.12) 97.57%, rgba(30,232,146,0) 100%) 100% 0% / 11.198% 100% no-repeat, " +
      "radial-gradient(244.127% 434.003% at -135.417% 0%, rgba(2,9,13,.784) 57.126%, rgba(2,9,13,.65) 57.457%, rgba(2,9,13,.617) 57.789%, rgba(2,9,13,.424) 58.452%, rgba(2,9,13,.383) 58.784%, rgba(2,9,13,.555) 60.113%, rgba(2,9,13,.564) 60.446%, rgba(2,9,13,.38) 60.778%, rgba(2,9,13,.525) 61.111%, rgba(2,9,13,.522) 61.777%, rgba(2,9,13,.466) 62.11%, rgba(2,9,13,.508) 62.443%, rgba(2,9,13,.429) 62.776%, rgba(2,9,13,.494) 63.442%, rgba(2,9,13,.408) 63.776%, rgba(2,9,13,.163) 64.109%, rgba(2,9,13,.386) 64.443%, rgba(2,9,13,.054) 64.776%, rgba(2,9,13,.059) 65.11%, rgba(2,9,13,.308) 65.444%, rgba(2,9,13,.513) 65.778%, rgba(2,9,13,.426) 66.112%, rgba(2,9,13,.532) 66.446%, rgba(2,9,13,.304) 67.448%, rgba(2,9,13,.167) 67.783%, rgba(2,9,13,.447) 68.451%, rgba(2,9,13,.42) 68.786%, rgba(2,9,13,.205) 69.121%, rgba(2,9,13,.332) 69.455%, rgba(2,9,13,.377) 69.79%, rgba(2,9,13,.47) 70.125%, rgba(2,9,13,.329) 70.46%, rgba(2,9,13,.457) 71.129%, rgba(2,9,13,.476) 71.464%, rgba(2,9,13,0) 71.8%, rgba(2,9,13,0) 72.135%, rgba(2,9,13,.242) 72.47%, rgba(2,9,13,.263) 72.805%, rgba(2,9,13,0) 73.141%, rgba(2,9,13,.255) 73.476%, rgba(2,9,13,.411) 73.811%, rgba(2,9,13,.452) 74.147%, rgba(2,9,13,.445) 74.818%, rgba(2,9,13,.69) 75.154%, rgba(2,9,13,.718) 75.489%, rgba(2,9,13,.856) 76.161%, rgba(2,9,13,.872) 77.841%, rgba(2,9,13,.841) 78.177%, rgba(2,9,13,.747) 78.513%, rgba(2,9,13,.742) 79.185%, rgba(2,9,13,.781) 79.521%, rgba(2,9,13,.771) 80.194%, rgba(2,9,13,.876) 80.867%, rgba(2,9,13,.847) 83.897%, rgba(2,9,13,.818) 84.233%, rgba(2,9,13,.511) 85.244%, rgba(2,9,13,.562) 85.581%, rgba(2,9,13,.514) 85.918%, rgba(2,9,13,.513) 86.592%, rgba(2,9,13,.35) 86.929%, rgba(2,9,13,.395) 87.266%, rgba(2,9,13,.677) 87.604%, rgba(2,9,13,.748) 87.941%, rgba(2,9,13,.863) 88.278%, rgba(2,9,13,.876) 90.302%, rgba(2,9,13,.745) 91.314%, rgba(2,9,13,.577) 91.652%, rgba(2,9,13,.269) 91.989%, rgba(2,9,13,.057) 92.327%, rgba(2,9,13,.084) 92.665%, rgba(2,9,13,.161) 93.002%, rgba(2,9,13,.174) 93.34%, rgba(2,9,13,.418) 93.678%, rgba(2,9,13,.431) 94.015%, rgba(2,9,13,.369) 94.353%, rgba(2,9,13,.205) 94.691%, rgba(2,9,13,0) 95.029%, rgba(2,9,13,.023) 95.704%, rgba(2,9,13,0) 96.042%, rgba(2,9,13,.099) 96.38%, rgba(2,9,13,.557) 97.056%, rgba(2,9,13,.663) 97.394%), " +
      "radial-gradient(254.326% 117.778% at 68.702% 140.463%, rgba(30,232,146,0) 0%, rgba(30,232,146,0) 65.723%, rgba(30,232,146,.085) 68.396%, rgba(70,230,165,.357) 69.811%, rgba(150,255,205,.68) 70.755%, rgba(110,252,186,.68) 71.698%, rgba(30,232,146,.527) 72.948%, rgba(26,214,152,.383) 76.116%, rgba(22,150,168,.238) 81.478%, rgba(40,110,180,.136) 86.84%, rgba(110,60,200,.068) 93.176%, rgba(110,60,200,0) 100%) 0% 0% / 59.74% 100% no-repeat, " +
      "radial-gradient(333.745% 201.111% at 130.659% 204.537%, rgba(30,232,146,0) 0%, rgba(30,232,146,0) 79.926%, rgba(30,232,146,.085) 81.492%, rgba(70,230,165,.357) 82.32%, rgba(150,255,205,.68) 82.873%, rgba(110,252,186,.68) 83.425%, rgba(30,232,146,.527) 84.157%, rgba(26,214,152,.383) 86.013%, rgba(22,150,168,.238) 89.153%, rgba(40,110,180,.136) 92.293%, rgba(110,60,200,.068) 96.004%, rgba(110,60,200,0) 100%) 100% 0% / 40.26% 100% no-repeat, " +
      "linear-gradient(180deg, rgb(2,9,13) 0%, rgb(2,9,13) 70%, rgb(3,14,17) 100%)",
  },
  {
    id: "twilightpeaks",
    base:
      "conic-gradient(from 163deg at 50% 0%, rgba(11,5,20,0) 0deg, rgb(11,5,20) 0.6deg, rgb(11,5,20) 33.4deg, rgba(11,5,20,0) 34deg) 0.603% 100% / 0.677% 8.519% repeat-x, " +
      "conic-gradient(from 167deg at 50% 0%, rgba(11,5,20,0) 0deg, rgb(11,5,20) 0.6deg, rgb(11,5,20) 25.4deg, rgba(11,5,20,0) 26deg) 1.186% 100% / 1.198% 10.37% repeat-x, " +
      "conic-gradient(from 170deg at 50% 0%, rgba(11,5,20,0) 0deg, rgb(11,5,20) 0.6deg, rgb(11,5,20) 19.4deg, rgba(11,5,20,0) 20deg) 0.453% 100% / 2.24% 12.222% repeat-x, " +
      "linear-gradient(180deg, rgba(194,122,174,0) 0%, rgba(194,122,174,0) 24.074%, rgba(200,100,154,0.14) 40.741%, rgba(207,114,166,0.2) 50%, rgba(184,138,189,0.3) 55.556%, rgba(173,142,196,0.36) 59.259%, rgba(171,141,196,0.28) 62.963%, rgba(169,140,196,0.2) 66.204%, rgba(157,127,189,0.1) 68.981%, rgba(90,64,128,0) 71.296%, rgba(28,15,51,0.3) 74.074%, rgba(28,15,51,0.3) 81.481%, rgba(106,74,144,0.22) 84.722%, rgba(122,88,160,0.45) 88.426%, rgba(124,90,162,0.58) 92.593%, rgba(124,90,162,0.6) 100%), " +
      "conic-gradient(from 105deg at 42.4% 0%, rgba(67,40,104,0) 0deg, rgb(67,40,104) 0.5deg, rgb(67,40,104) 144.5deg, rgba(67,40,104,0) 145deg) 32.705% 100% / 33.333% 35.926% repeat-x, " +
      "conic-gradient(from 112deg at 43.18% 0%, rgba(67,40,104,0) 0deg, rgb(67,40,104) 0.5deg, rgb(67,40,104) 129.5deg, rgba(67,40,104,0) 130deg) 8.085% 100% / 12.135% 31.667% repeat-x, " +
      "conic-gradient(from 121deg at 55.2% 0%, rgba(128,89,156,0) 0deg, rgb(128,89,156) 0.5deg, rgb(128,89,156) 122.5deg, rgba(128,89,156,0) 123deg) 11.282% 100% / 18.073% 52.593% repeat-x, " +
      "conic-gradient(from 117deg at 43.03% 0%, rgba(128,89,156,0) 0deg, rgb(128,89,156) 0.5deg, rgb(128,89,156) 118.5deg, rgba(128,89,156,0) 119deg) 3.815% 100% / 10.99% 50% repeat-x, " +
      "radial-gradient(52.083% 31.481% at 66.146% 54.63%, rgba(255,198,212,0.97) 0%, rgba(255,178,200,0.94) 10%, rgba(247,151,190,0.82) 22%, rgba(228,123,176,0.6) 36%, rgba(201,98,159,0.36) 52%, rgba(168,80,143,0.14) 70%, rgba(138,67,132,0.04) 86%, rgba(138,67,132,0) 100%), " +
      "radial-gradient(circle at 37px 97px, rgba(255,244,251,0.78) 0px, rgba(255,244,251,0.78) 0.55px, rgba(255,244,251,0) 1.5px) 0 0 / 211px 157px, " +
      "radial-gradient(circle at 251px 170px, rgba(228,216,255,0.62) 0px, rgba(228,216,255,0.62) 0.5px, rgba(228,216,255,0) 1.4px) 0 0 / 337px 229px, " +
      "linear-gradient(180deg, rgb(14,7,34) 0%, rgb(23,11,46) 12.963%, rgb(35,17,62) 24.074%, rgb(50,26,82) 33.333%, rgb(71,35,95) 39.815%, rgb(102,48,110) 45.37%, rgb(134,64,124) 50%, rgb(154,76,132) 55.556%, rgb(154,76,132) 100%)",
  },
  {
    id: "pastel",
    base:
      "radial-gradient(10.42% 18.52% at 89.58% 26.85%, rgba(255,222,236,.18) 0%, rgba(255,222,236,.18) 70%, rgba(255,222,236,.202) 78%, rgba(255,222,236,.157) 85%, rgba(255,222,236,.076) 90%, rgba(255,222,236,.022) 95%, rgba(255,222,236,0) 100%), " +
      "radial-gradient(5.47% 9.72% at 41.67% 27.78%, rgba(220,226,255,.19) 0%, rgba(220,226,255,.19) 70%, rgba(220,226,255,.213) 78%, rgba(220,226,255,.166) 85%, rgba(220,226,255,.08) 90%, rgba(220,226,255,.023) 95%, rgba(220,226,255,0) 100%), " +
      "radial-gradient(9.64% 17.13% at 47.92% 70.37%, rgba(255,236,250,.18) 0%, rgba(255,236,250,.18) 70%, rgba(255,236,250,.202) 78%, rgba(255,236,250,.157) 85%, rgba(255,236,250,.076) 90%, rgba(255,236,250,.022) 95%, rgba(255,236,250,0) 100%), " +
      "radial-gradient(6.77% 12.04% at 85.42% 73.15%, rgba(255,232,214,.19) 0%, rgba(255,232,214,.19) 70%, rgba(255,232,214,.213) 78%, rgba(255,232,214,.166) 85%, rgba(255,232,214,.08) 90%, rgba(255,232,214,.023) 95%, rgba(255,232,214,0) 100%), " +
      "radial-gradient(7.29% 12.96% at 14.06% 24.07%, rgba(255,232,222,.1) 0%, rgba(255,232,222,.1) 70%, rgba(255,232,222,.112) 78%, rgba(255,232,222,.087) 85%, rgba(255,232,222,.042) 90%, rgba(255,232,222,.012) 95%, rgba(255,232,222,0) 100%), " +
      "radial-gradient(46% 74% at 8% -10%, rgba(255,252,244,.92) 0%, rgba(255,252,244,.89) 14.29%, rgba(255,252,244,.803) 28.57%, rgba(255,252,244,.665) 42.86%, rgba(255,252,244,.489) 57.14%, rgba(255,252,244,.294) 71.43%, rgba(255,252,244,.11) 85.71%, rgba(255,252,244,0) 100%), " +
      "radial-gradient(62% 104% at 12% 103.6%, rgba(255,178,140,.6) 0%, rgba(255,178,140,.554) 14.29%, rgba(255,178,140,.43) 28.57%, rgba(255,178,140,.272) 42.86%, rgba(255,178,140,.128) 57.14%, rgba(255,178,140,.037) 71.43%, rgba(255,178,140,.003) 85.71%, rgba(255,178,140,0) 100%), " +
      "radial-gradient(62% 69.5% at 86.9% 12.9%, rgba(164,211,255,.78) 0%, rgba(164,211,255,.715) 14.29%, rgba(164,211,255,.543) 28.57%, rgba(164,211,255,.329) 42.86%, rgba(164,211,255,.145) 57.14%, rgba(164,211,255,.038) 71.43%, rgba(164,211,255,.003) 85.71%, rgba(164,211,255,0) 100%), " +
      "radial-gradient(78% 92% at 61.5% 71.8%, rgba(178,104,252,.32) 0%, rgba(178,104,252,.287) 14.29%, rgba(178,104,252,.205) 28.57%, rgba(178,104,252,.11) 42.86%, rgba(178,104,252,.04) 57.14%, rgba(178,104,252,.008) 71.43%, rgba(178,104,252,0) 85.71%, rgba(178,104,252,0) 100%), " +
      "radial-gradient(51.4% 51.8% at 41.1% 34.3%, rgba(156,246,200,.44) 0%, rgba(156,246,200,.399) 14.29%, rgba(156,246,200,.292) 28.57%, rgba(156,246,200,.166) 42.86%, rgba(156,246,200,.066) 57.14%, rgba(156,246,200,.014) 71.43%, rgba(156,246,200,.001) 85.71%, rgba(156,246,200,0) 100%), " +
      "linear-gradient(149.3deg, #fef7f1 0%, #eff0f1 33.3%, #dfe7fd 66.7%, #ffc6dd 100%)",
  },
  {
    id: "coral",
    base:
      "linear-gradient(180deg, rgba(60,12,72,.6) 0%, rgba(60,12,72,.46) 5%, rgba(60,12,72,.25) 10%, rgba(60,12,72,.08) 16%, rgba(60,12,72,0) 22%, rgba(22,8,30,0) 60%, rgba(22,8,30,.15) 75%, rgba(22,8,30,.32) 88%, rgba(18,6,24,.48) 100%), " +
      "radial-gradient(closest-side, rgba(44,63,160,.22) 0%, rgba(44,63,160,.207) 15%, rgba(44,63,160,.176) 30%, rgba(44,63,160,.132) 45%, rgba(44,63,160,.084) 60%, rgba(44,63,160,.04) 75%, rgba(44,63,160,.013) 88%, rgba(44,63,160,0) 100%) 12.61% -4.84% / 5.83% 42.59% no-repeat, " +
      "radial-gradient(closest-side, rgba(38,56,140,.2) 0%, rgba(38,56,140,.188) 15%, rgba(38,56,140,.16) 30%, rgba(38,56,140,.12) 45%, rgba(38,56,140,.076) 60%, rgba(38,56,140,.036) 75%, rgba(38,56,140,.012) 88%, rgba(38,56,140,0) 100%) 21.19% 84.38% / 5.62% 40.74% no-repeat, " +
      "radial-gradient(closest-side, rgba(51,82,214,.5) 0%, rgba(51,82,214,.465) 25%, rgba(51,82,214,.38) 45%, rgba(51,82,214,.275) 60%, rgba(51,82,214,.15) 75%, rgba(51,82,214,.05) 88%, rgba(51,82,214,0) 100%) 14.13% -12.2% / 13.75% 22.59% no-repeat, " +
      "radial-gradient(closest-side, rgba(51,82,214,.46) 0%, rgba(51,82,214,.428) 25%, rgba(51,82,214,.35) 45%, rgba(51,82,214,.253) 60%, rgba(51,82,214,.138) 75%, rgba(51,82,214,.046) 88%, rgba(51,82,214,0) 100%) 13.83% 6.62% / 10% 18.89% no-repeat, " +
      "radial-gradient(closest-side, rgba(51,82,214,.48) 0%, rgba(51,82,214,.446) 25%, rgba(51,82,214,.365) 45%, rgba(51,82,214,.264) 60%, rgba(51,82,214,.144) 75%, rgba(51,82,214,.048) 88%, rgba(51,82,214,0) 100%) 18.24% 21.7% / 13.12% 21.48% no-repeat, " +
      "radial-gradient(closest-side, rgba(51,82,214,.44) 0%, rgba(51,82,214,.409) 25%, rgba(51,82,214,.334) 45%, rgba(51,82,214,.242) 60%, rgba(51,82,214,.132) 75%, rgba(51,82,214,.044) 88%, rgba(51,82,214,0) 100%) 20.57% 38.74% / 9.38% 17.78% no-repeat, " +
      "radial-gradient(closest-side, rgba(51,82,214,.48) 0%, rgba(51,82,214,.446) 25%, rgba(51,82,214,.365) 45%, rgba(51,82,214,.264) 60%, rgba(51,82,214,.144) 75%, rgba(51,82,214,.048) 88%, rgba(51,82,214,0) 100%) 21.87% 55.95% / 13.75% 22.22% no-repeat, " +
      "radial-gradient(closest-side, rgba(51,82,214,.44) 0%, rgba(51,82,214,.409) 25%, rgba(51,82,214,.334) 45%, rgba(51,82,214,.242) 60%, rgba(51,82,214,.132) 75%, rgba(51,82,214,.044) 88%, rgba(51,82,214,0) 100%) 24.03% 72.83% / 10% 18.89% no-repeat, " +
      "radial-gradient(closest-side, rgba(51,82,214,.44) 0%, rgba(51,82,214,.409) 25%, rgba(51,82,214,.334) 45%, rgba(51,82,214,.242) 60%, rgba(51,82,214,.132) 75%, rgba(51,82,214,.044) 88%, rgba(51,82,214,0) 100%) 30.79% 89.91% / 13.12% 21.11% no-repeat, " +
      "radial-gradient(closest-side, rgba(51,82,214,.4) 0%, rgba(51,82,214,.372) 25%, rgba(51,82,214,.304) 45%, rgba(51,82,214,.22) 60%, rgba(51,82,214,.12) 75%, rgba(51,82,214,.04) 88%, rgba(51,82,214,0) 100%) 39.77% 106.45% / 12.71% 19.63% no-repeat, " +
      "radial-gradient(closest-side, rgba(74,109,255,.3) 0%, rgba(74,109,255,.282) 15%, rgba(74,109,255,.24) 30%, rgba(74,109,255,.18) 45%, rgba(74,109,255,.114) 60%, rgba(74,109,255,.054) 75%, rgba(74,109,255,.018) 88%, rgba(74,109,255,0) 100%) 30.33% -325% / 21.88% 96.3% no-repeat, " +
      "radial-gradient(closest-side, rgba(148,72,226,.15) 0%, rgba(148,72,226,.141) 15%, rgba(148,72,226,.12) 30%, rgba(148,72,226,.09) 45%, rgba(148,72,226,.057) 60%, rgba(148,72,226,.027) 75%, rgba(148,72,226,.009) 88%, rgba(148,72,226,0) 100%) 54.55% 325% / 31.25% 103.7% no-repeat, " +
      "radial-gradient(closest-side, rgba(255,192,138,.76) 0%, rgba(255,192,138,.714) 15%, rgba(255,192,138,.608) 30%, rgba(255,192,138,.456) 45%, rgba(255,192,138,.289) 60%, rgba(255,192,138,.137) 75%, rgba(255,192,138,.046) 88%, rgba(255,192,138,0) 100%) 147.96% -52.5% / 48.96% 62.96% no-repeat, " +
      "linear-gradient(256deg, rgb(244,102,86) 0%, rgb(250,102,88) 5.7%, rgb(248,94,96) 11.2%, rgb(255,92,119) 16.7%, rgb(255,85,142) 22.1%, rgb(253,75,143) 27.6%, rgb(228,70,159) 33.1%, rgb(194,68,190) 38.6%, rgb(161,67,221) 44.1%, rgb(143,68,231) 49.5%, rgb(110,81,244) 55%, rgb(64,101,255) 60.5%, rgb(58,93,240) 64.5%, rgb(47,76,200) 68%, rgb(35,53,144) 71.5%, rgb(27,37,96) 74.5%, rgb(23,29,72) 78%, rgb(19,23,60) 83%, rgb(16,19,50) 89%, rgb(11,14,38) 100%)",
  },
  {
    id: "prism",
    base:
      "radial-gradient(48.26% 63.2% at 101.58% 100%, rgba(122,52,16,.5) 0%, rgba(122,52,16,.48) 12.5%, rgba(122,52,16,.424) 25%, rgba(122,52,16,.343) 37.5%, rgba(122,52,16,.252) 50%, rgba(122,52,16,.166) 62.5%, rgba(122,52,16,.093) 75%, rgba(122,52,16,.038) 87.5%, rgba(122,52,16,0) 100%), " +
      "radial-gradient(24% 34% at 46% 50%, rgba(210,182,255,.15) 0%, rgba(210,182,255,.144) 12.5%, rgba(210,182,255,.126) 25%, rgba(210,182,255,.102) 37.5%, rgba(210,182,255,.074) 50%, rgba(210,182,255,.048) 62.5%, rgba(210,182,255,.027) 75%, rgba(210,182,255,.011) 87.5%, rgba(210,182,255,0) 100%), " +
      "radial-gradient(24% 38% at 8% 70%, rgba(255,108,158,.11) 0%, rgba(255,108,158,.105) 12.5%, rgba(255,108,158,.093) 25%, rgba(255,108,158,.074) 37.5%, rgba(255,108,158,.054) 50%, rgba(255,108,158,.035) 62.5%, rgba(255,108,158,.02) 75%, rgba(255,108,158,.008) 87.5%, rgba(255,108,158,0) 100%), " +
      "radial-gradient(46.74% 58.64% at 107% 57.65%, rgba(255,133,56,.621) 0%, rgba(255,133,56,.6) 12.5%, rgba(255,133,56,.539) 25%, rgba(255,133,56,.449) 37.5%, rgba(255,133,56,.344) 50%, rgba(255,133,56,.237) 62.5%, rgba(255,133,56,.14) 75%, rgba(255,133,56,.061) 87.5%, rgba(255,133,56,0) 100%), " +
      "radial-gradient(64.72% 64.02% at 102.96% 94.24%, rgba(203,107,50,.36) 0%, rgba(203,107,50,.349) 12.5%, rgba(203,107,50,.317) 25%, rgba(203,107,50,.269) 37.5%, rgba(203,107,50,.211) 50%, rgba(203,107,50,.15) 62.5%, rgba(203,107,50,.092) 75%, rgba(203,107,50,.041) 87.5%, rgba(203,107,50,0) 100%), " +
      "radial-gradient(65.04% 63.59% at 10.35% 67.61%, rgba(208,5,124,.45) 0%, rgba(208,5,124,.432) 12.5%, rgba(208,5,124,.381) 25%, rgba(208,5,124,.309) 37.5%, rgba(208,5,124,.228) 50%, rgba(208,5,124,.15) 62.5%, rgba(208,5,124,.084) 75%, rgba(208,5,124,.034) 87.5%, rgba(208,5,124,0) 100%), " +
      "radial-gradient(74.03% 137.99% at 96.56% -2.14%, rgba(4,128,166,.853) 0%, rgba(4,128,166,.821) 12.5%, rgba(4,128,166,.731) 25%, rgba(4,128,166,.601) 37.5%, rgba(4,128,166,.451) 50%, rgba(4,128,166,.304) 62.5%, rgba(4,128,166,.175) 75%, rgba(4,128,166,.074) 87.5%, rgba(4,128,166,0) 100%), " +
      "radial-gradient(36.39% 85.54% at 48.53% 90.4%, rgba(52,22,176,.399) 0%, rgba(52,22,176,.386) 12.5%, rgba(52,22,176,.351) 25%, rgba(52,22,176,.298) 37.5%, rgba(52,22,176,.234) 50%, rgba(52,22,176,.166) 62.5%, rgba(52,22,176,.102) 75%, rgba(52,22,176,.046) 87.5%, rgba(52,22,176,0) 100%), " +
      "radial-gradient(70.34% 89.53% at 51.83% -5.1%, rgba(16,76,173,.579) 0%, rgba(16,76,173,.561) 12.5%, rgba(16,76,173,.51) 25%, rgba(16,76,173,.433) 37.5%, rgba(16,76,173,.34) 50%, rgba(16,76,173,.242) 62.5%, rgba(16,76,173,.148) 75%, rgba(16,76,173,.067) 87.5%, rgba(16,76,173,0) 100%), " +
      "radial-gradient(36.94% 68.35% at 6.38% 4.27%, rgba(146,19,72,.815) 0%, rgba(146,19,72,.79) 12.5%, rgba(146,19,72,.718) 25%, rgba(146,19,72,.609) 37.5%, rgba(146,19,72,.478) 50%, rgba(146,19,72,.34) 62.5%, rgba(146,19,72,.209) 75%, rgba(146,19,72,.094) 87.5%, rgba(146,19,72,0) 100%), " +
      "radial-gradient(63.75% 83.99% at 58.42% 22.97%, #8a61a7 0%, #715791 50%, #86203a 100%)",
  },
```

<!-- /scenes -->

To add them for real:

- `id` is typed from the i18n keys (`MessageKey = keyof typeof en`). Add `scene.borealis`, `scene.twilightpeaks`, `scene.pastel`, `scene.coral` and `scene.prism` to `en.json`, and translate them in `fr.json`, `ar.json` and `ru.json`. The prototype's provisional names are in `tv/js/proposal-i18n.js`; they avoid clashing with existing names such as "Aurore boréale" and "Crépuscule".
- They belong in the `// static` part of `SCENES`.
- Pastel is a light wallpaper. With the current white UI text, it only reads well with a theme that uses dark text (Frost in the proposal).

Stage does not fit the format, because the existing `anim` kinds are `blobs`, `stars`, `waves` and `particles`. The prototype's TV page (AeroTizen 2.7.0 in `app/`) adds:

- a new kind, `anim: "stage"`, in `contracts/backgrounds.ts` and in `needsWebGL`;
- a `BackgroundSceneView` case that mounts `StageBackground` (`backgrounds/StageBackground/`) the way `WebGLParticleCanvas` mounts its canvas, with `stage.js` loaded before `launcher-ui.js`;
- `base` set to `StageBackground.fallback`, plus the `scene.stage` key.

`app/tools/proposal-scenes.mjs` writes all six scenes to `launcher/src/backgrounds/proposalScenes.ts` from `gradients.js` and `stage.js`, so the TV page always shows these files. Pastel carries `light: true`, which turns the text painted on the wallpaper dark (2.7.0's `data-light-background`), and the six scenes carry `proposal: true` for the "New" mark on their Settings swatch.

The app always paints `base` on the root element, so the fallback automatically shows whenever WebGL is unavailable. Note that the app's `setSpeed` treats `0` as `1` (`value || 1`). The prototype's TV page ports that behaviour, and its speed slider starts at 0.25, so speed 0 only pauses Stage through the `stage.js` API directly (as in `test.html`).

## Stage

`StageBackground.mount(container, { speed })` appends two layers to the container, which must be positioned (`relative`, `absolute` or `fixed`) and sized:

1. **The halftone layer**: a `div` with a dot screen, drawn once at mount.
2. **The WebGL `<canvas>`**: it always stays the container's last child. A non-16:9 container is covered and cropped (`object-fit: cover`).

The call returns:

- `setSpeed(value)`: animation speed multiplier; `0` pauses and keeps the last frame.
- `destroy()`: stops the loop, removes listeners, releases the GL objects and the context, and removes both layers. Safe to call twice.
- `stats()`: diagnostics for demos, `{ fps, webgl, running }`, where `fps` is frames drawn during the last second.

`StageBackground.fallback` is the static CSS version of Stage. Use it for swatches and previews.

### What it draws

- **One soft blue beam** falls from just right of the header tabs. It has a cyan-white core, with lavender, violet and magenta glows beside it, all swaying slowly. A slow swell every two seconds changes the brightness by a few percent.
- **Bubbles** of every size float and pulse in the light. Only the fainter ones rise through the screen; the brightest float near the light (`rising.maxGain`).
- **Fine sparkles** twinkle near the top.
- **The halftone**: round dots on a square lattice rotated about 30°, a 6.7 px period and an exactly periodic 54 px tile, so there is no moiré.
  - It sits on a static layer above the canvas, at full resolution. Drawn inside the 960x540 buffer, it would blur and alias.
  - It only darkens the gaps between the dots, so it never lowers text contrast.
  - While it is on, the canvas grain is halved. `HALFTONE.on = false` removes it.

### Text contrast

Large text sitting on the wallpaper keeps at least 3:1. Small text sits on the Mint theme's opaque surfaces.

- The light is shaped down under the header status (clock, date, weather).
- A soft luminance knee guards the header text and icons.
- The brightest bubbles never cross the screen: a bright bubble rising through the beam would take Billboard's "Inputs" heading down to 2.3:1.

Measured at the worst pixel over 24 minutes of animation (0.25 s steps), in the grid with 4 and 5 inputs, Billboard and Lounge, English and Arabic: text ≥ 3.29:1, with Billboard's "Inputs" as the lowest; icons ≥ 3.5:1. On the real TV page with the shipped file (8 states × 240 s): text ≥ 3.41:1, icons ≥ 3.52:1. Arabic mirrors both the layout and the canvas, so it lands on the same canvas pixels.

### TV constraints and how they are met

- **GLSL ES 1.00 only**: `texture2D`, `gl_FragColor`, no extensions, no loops.
- **mediump-safe maths**: animated values (sway, drift, twinkle and swell phases) are wrapped on the CPU, so the fragment shader never sees a growing time value. Sprite motion uses whole harmonics of 240 s and 60 s loops, so each wrap is seamless.
- **Reduced resolution**: the drawing buffer is 960x540, upscaled by CSS.
- **About 20 fps** (a third less GPU work than 30): driven by rAF, a frame is drawn only when about 50 ms have passed (3 ms of slack, so a 60 Hz display really gets 20 fps). The motion follows the clock, so its speed does not change.
- **Pauses**: while `document.hidden`, while the speed is 0, and when reduced motion is requested. With reduced motion at mount, the first frame stays as a still image. The media query is checked on every frame, so turning reduced motion on while Stage runs freezes the current frame. Turning it off restarts the animation only at the next speed or visibility change (there is no media-query listener).
- **CSS fallback**: shown when there is no WebGL, or only a software one (`failIfMajorPerformanceCaveat`), and while the context is lost. Restoring the context restarts the animation. The halftone layer stays above the fallback.
- **Cost**: about 0.28 ms of GPU per frame (median; p90 0.33 ms), plus about 0.12 ms of compositing for the halftone layer, on a desktop AMD integrated GPU (ANGLE/D3D11). Mounting takes about 57 ms once, including about 9 ms to draw the halftone tile. Per second, on the same kind of GPU: about 6 ms at 20 fps against 9 ms at 30 fps (a 640x360 buffer would save nothing).

### Lifecycle, checked on the shipped file

- 20 fps.
- The halftone `div` comes first and the canvas last.
- In Arabic, the canvas is flipped at mount and on a live English ↔ Arabic switch; the halftone layer is never flipped.
- `WEBGL_lose_context` shows the fallback, and restoring resumes the animation.
- Speed 0 pauses; a double `destroy()` is safe; reduced motion gives a still frame.
- Without WebGL, the fallback shows with the halftone above it, and `destroy()` cleans up.

## Compromises and known gaps

- **No noise in CSS.** Gradients cannot warp shapes with fractal noise as a shader can, so curtains, smoke and ridges are built from many soft radial, conic and linear layers.
  - Borealis's curved rays are concentric arcs.
  - Twilight Peaks's ridges are regular conic teeth, more geometric than noise would draw them.
- **No grain.** The CSS wallpapers stay pure gradients; only Stage has a grain. Chromium dithers CSS gradients itself. Banding on an 8-bit TV panel, most likely on the large dark skies of Borealis and Twilight Peaks, has not been checked on a real TV.
- **Paint cost.** Borealis costs about twice the other CSS wallpapers (about 2.9 ms against 1.2 to 1.4 ms per full repaint), because of its repeated ridge and star layers.
- **Coral keeps its night on the left**: the other way round, the peach corner would fall under the header icons and the left headings (1.7 to 2.5:1).
- **Prism's orange** deepens a little in the bottom-right corner so "Live TV" keeps 4.5:1 (a lighter orange there leaves it at 4.2:1).
- **Mismatched pairs** are allowed but not tuned. For example, with Glass (not Pop) on Prism in Billboard, the small "HDMI 1" label is at 4.37:1.
- **Stage's margin is thin** on Billboard's "Inputs" heading (about 3.3:1). If that heading ever moves, the audit must be redone.
- **Not tested on a real Tizen TV.** The figures come from a desktop browser and integrated GPU.

## Verification

- **Sync**: `test.html` reports `data-gradients-in-sync="true"`. The CSS and JS values compute to the same `background-image`.
- **Readability**: see the tables above. The values are worst pixels with the real UI and its real colours, not estimates.
- **Paint cost**: forced full repaints of a 1920x1080 element, with only the measured page's GPU tasks counted, median of repeated passes.
- **Stage**: 24-minute contrast audit, lifecycle checks above, GPU timer queries over repeated runs.

Reference renders and comparison sheets are kept out of the repository (`backgrounds/shots/` is ignored).
