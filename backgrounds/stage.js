/*
 * Stage: animated WebGL 1 wallpaper for the AeroTizen prototype.
 *
 *   var bg = window.StageBackground.mount(containerElement, { speed: 1 });
 *   bg.setSpeed(0.5);   // 0 pauses
 *   bg.destroy();
 *
 * One soft blue beam falls from just right of the header
 * tabs, with a cyan-white core and lavender, violet and magenta glows beside it, all swaying
 * slowly. Bubbles of every size float and pulse in the light, some of them rise, and fine
 * sparkles twinkle near the top. A dot screen lies on a static layer above the
 * canvas (HALFTONE.on turns it off): mount() appends that layer, then the WebGL canvas, which
 * stays the container's last child; destroy() removes both. Large text sitting on the wallpaper
 * keeps at least 3:1: the light is shaped down under the header status, a soft luminance knee
 * guards the header text, and only the fainter bubbles rise through the screen.
 * Built for the Tizen TV browser (Chromium 69, WebGL 1): GLSL ES 1.00, no loops, mediump-safe
 * fragment maths (animated values are wrapped on the CPU), a 960x540 drawing buffer upscaled by
 * CSS, about 20 fps, paused while the page is hidden, a still frame when reduced motion is
 * requested. When WebGL is missing or lost, the canvas shows a CSS gradient of the same look.
 */
(function (global) {
  "use strict";

  var RENDER_WIDTH = 960;
  var RENDER_HEIGHT = 540;
  var ASPECT = RENDER_WIDTH / RENDER_HEIGHT;
  // 20 fps: the motion is slow, and it costs a third less GPU work than 30 fps.
  var FRAME_INTERVAL_MS = 1000 / 20;
  // rAF timestamps jitter by a few ms: without slack, a 60 Hz display would skip to 15 fps.
  var FRAME_SLACK_MS = 3;
  var MAX_STEP_MS = 100;
  var NOISE_SIZE = 256;
  var TAU = Math.PI * 2;
  // Sprite motion repeats a whole number of times per loop, so wrapping the loop phase is seamless.
  var DRIFT_LOOP_SECONDS = 240;
  var TWINKLE_LOOP_SECONDS = 60;
  // A slow swell of the light, about every two seconds, that changes brightness by a few percent.
  var BEAT_HZ = 0.5;
  var SPRITE_FLOATS = 22;
  var CORNERS = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
  // One CSS pixel of the 1920x1080 TV layer in screen units: x from 0 to 16/9, y from 0 (bottom) to 1.
  var PX = 1 / 1080;

  function fract(x) {
    return x - Math.floor(x);
  }

  function lerp(a, b, f) {
    return a + (b - a) * f;
  }

  function seededRandom(seed) {
    var state = seed;
    return function () {
      state = (state * 16807) % 2147483647;
      return state / 2147483647;
    };
  }

  function hex(value) {
    var n = parseInt(value.slice(1), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  function linear(value, gain) {
    return hex(value).map(function (c) {
      return (
        (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)) *
        (gain === undefined ? 1 : gain)
      );
    });
  }

  // ---------------------------------------------------------------- look
  // Positions are in screen units. Beams: src above the frame, rest angle in radians (-PI/2 points
  // down), w0 width at the source, spread width gained per unit of length, fall decay with depth,
  // core weight of the bright axis, two colours mixed over hue[0] seconds, sway terms
  // [amplitude, period, phase]. The six beams blend into one main beam with glows beside it.
  // Bubble rows: [x px, y px from the top of the 1080p layer, radius px, palette index, gain, edge].
  // rising: share of the bubbles that rise (loops: climbs per 240 s), from and to in screen
  // heights, and maxGain, above which a bubble always floats in place.
  var LOOKS = {
    bubbles: {
      white: 2.4,
      navy: linear("#08090f"),
      glows: [
        {
          at: [1.1, 0.62],
          size: [0.62, 0.9],
          colour: linear("#3a4aa8", 0.36),
          pulse: 0.08,
        },
        {
          at: [1.11, 0.99],
          size: [0.09, 0.1],
          colour: linear("#b4dcff", 0.6),
          pulse: 0.12,
        },
        {
          at: [1.4, 0.8],
          size: [0.3, 0.2],
          colour: linear("#a58cff", 0.45),
          pulse: 0.1,
        },
        {
          at: [1.66, 0.5],
          size: [0.16, 0.7],
          colour: linear("#a03aa0", 0.14),
          pulse: 0.1,
        },
      ],
      bottomShade: 0.45,
      leftShade: 0.55,
      beams: [
        // A wide blue wash from just right of the header tabs, leaning left as it falls, with a
        // cyan-white core: the hot spot.
        {
          src: [1.09, 1.3],
          rest: -1.668,
          w0: 0.05,
          spread: 0.11,
          fall: 0.8,
          core: 0.5,
          colors: ["#3d5dff", "#4870ff"],
          hue: [26, 0],
          gain: 3.2,
          sway: [
            [0.1, 9, 0],
            [0.03, 4.1, 1.2],
          ],
        },
        {
          src: [1.075, 1.18],
          rest: -1.62,
          w0: 0.03,
          spread: 0.06,
          fall: 3.5,
          core: 0.5,
          colors: ["#8ae8ff", "#b0d0ff"],
          hue: [17, 1],
          gain: 2.0,
          sway: [
            [0.09, 7, 2.1],
            [0.03, 3.1, 0.4],
          ],
        },
        // Lavender, wide and short; violet; a magenta column down the right; a thinner pink ray.
        {
          src: [1.32, 1.18],
          rest: -1.5,
          w0: 0.06,
          spread: 0.22,
          fall: 2.6,
          core: 0.15,
          colors: ["#a68cff", "#bf9aff"],
          hue: [21, 2],
          gain: 3.2,
          sway: [
            [0.11, 8.5, 4.0],
            [0.03, 3.7, 2.0],
          ],
        },
        {
          src: [1.52, 1.2],
          rest: -1.45,
          w0: 0.03,
          spread: 0.1,
          fall: 2.7,
          core: 0.3,
          colors: ["#7a5cff", "#9a4dff"],
          hue: [19, 3],
          gain: 1.2,
          sway: [
            [0.12, 9.5, 1.0],
            [0.03, 4.3, 3.0],
          ],
        },
        {
          src: [1.66, 1.32],
          rest: -1.585,
          w0: 0.03,
          spread: 0.065,
          fall: 1.2,
          core: 0.35,
          colors: ["#ff3fd0", "#ff4f9a"],
          hue: [23, 4],
          gain: 1.35,
          sway: [
            [0.08, 10.5, 5.0],
            [0.03, 3.9, 1.0],
          ],
        },
        {
          src: [1.58, 1.25],
          rest: -1.75,
          w0: 0.015,
          spread: 0.05,
          fall: 2.8,
          core: 0.5,
          colors: ["#ff7ae0", "#d07aff"],
          hue: [15, 5],
          gain: 1.0,
          sway: [
            [0.1, 7.5, 2.6],
            [0.03, 2.9, 0.7],
          ],
        },
      ],
      haze: { base: 0.62, amount: 0.65 },
      swell: { period: 32, gain: 0.22 },
      palette: [
        "#5c8cff",
        "#7d8cff",
        "#a993ff",
        "#f08cf2",
        "#e95ae0",
        "#62c8ff",
        "#8a6dff",
      ],
      bubbles: [
        [1120, 130, 80, 0, 0.34, 0.22],
        [1238, 186, 52, 2, 0.34, 0.18],
        [1398, 288, 70, 3, 0.3, 0.2],
        [1330, 455, 62, 6, 0.26, 0.2],
        [1428, 186, 28, 3, 0.32, 0.16],
        [1784, 232, 70, 4, 0.36, 0.2],
        [1612, 332, 36, 6, 0.26, 0.18],
        [1556, 384, 32, 6, 0.2, 0.18],
        [1884, 302, 24, 1, 0.2, 0.18],
        [768, 442, 54, 0, 0.22, 0.22],
        [824, 394, 34, 0, 0.26, 0.18],
        [1016, 374, 26, 1, 0.24, 0.18],
        [1255, 302, 26, 5, 0.2, 0.16],
        [1762, 120, 42, 3, 0.18, 0.2],
        [948, 232, 96, 0, 0.13, 0.42],
        [1520, 230, 110, 2, 0.12, 0.45],
        [1700, 505, 84, 4, 0.15, 0.38],
        [1185, 588, 46, 0, 0.18, 0.2],
        [1460, 642, 36, 6, 0.15, 0.2],
        [1845, 662, 58, 3, 0.16, 0.24],
        [672, 612, 30, 0, 0.11, 0.2],
        [1060, 782, 44, 1, 0.09, 0.26],
        [1630, 792, 30, 4, 0.1, 0.2],
        [560, 312, 28, 0, 0.1, 0.2],
        [1310, 862, 120, 0, 0.06, 0.5],
        [1150, 332, 20, 5, 0.24, 0.14],
        [1680, 162, 22, 2, 0.24, 0.14],
        [880, 602, 68, 1, 0.08, 0.45],
        [1500, 962, 76, 4, 0.06, 0.45],
        [420, 202, 44, 0, 0.05, 0.42],
      ],
      bubbleLight: 0.55,
      extraBubbles: {
        count: 8,
        x: [950, 1880],
        y: [80, 560],
        r: [10, 18],
        gain: [0.16, 0.3],
        seed: 61106,
      },
      // The brighter bubbles float near the light; only the fainter ones rise, so no
      // bright bubble crosses the text lower down.
      rising: {
        share: 0.35,
        from: 0.08,
        to: 1.08,
        loops: [3, 5],
        maxGain: 0.19,
      },
      drift: 1.8,
      sparkles: {
        count: 90,
        x: [880, 1920],
        y: [0, 640],
        size: [1.6, 3.2],
        gain: [0.7, 1.2],
        glint: 0.2,
        light: 0.35,
        seed: 1106,
      },
      grain: 0.05,
    },
  };

  var LOOK_NAME = "bubbles";
  var LOOK = LOOKS[LOOK_NAME];

  // A print screen: a square grid of round dots turned about 30 degrees,
  // period 6.7 px of the 1080p layer, whose gaps are darker. It sits on its own layer above the
  // WebGL canvas (drawn at half resolution) so it stays crisp, and it only darkens. Lattice vectors
  // (7, -4) and (4, 7) times 54/65 px give a period of 6.70 px at 29.7 degrees that repeats exactly
  // every 54 px along both axes, so one small tile drawn at mount covers the screen pixel for pixel.
  var HALFTONE = { on: true, tile: 54, radius: 0.5, gap: "rgba(4,5,14,0.42)" };

  // Text on the wallpaper keeps 3:1. The light is shaped down by STATUS_SHADE over the header
  // status (clock, date, weather; Arabic mirrors both the layout and the canvas, so it lands on the
  // same canvas pixels), then a soft knee caps the luminance from GUARD_KNEE towards GUARD_CAP
  // behind the header text and icons.
  var STATUS_SHADE = 0.65;
  var GUARD_KNEE = 0.12;
  var GUARD_CAP = 0.17;

  // Static stand-in for when WebGL is missing or lost, drawn after a frame of the look. The first
  // layer is on top and the last one is opaque.
  var FALLBACKS = {
    bubbles: [
      "radial-gradient(4.2% 7.4% at 58.3% 12%, rgba(120,160,255,.32) 0%, rgba(120,160,255,.36) 80%, rgba(120,160,255,0) 100%)",
      "radial-gradient(2.7% 4.8% at 64.5% 17.2%, rgba(169,147,255,.3) 0%, rgba(169,147,255,.34) 80%, rgba(169,147,255,0) 100%)",
      "radial-gradient(3.6% 6.5% at 72.8% 26.7%, rgba(240,140,242,.28) 0%, rgba(240,140,242,.32) 80%, rgba(240,140,242,0) 100%)",
      "radial-gradient(3.6% 6.5% at 92.9% 21.5%, rgba(233,90,224,.34) 0%, rgba(233,90,224,.38) 80%, rgba(233,90,224,0) 100%)",
      "radial-gradient(3.2% 5.7% at 69.3% 42.1%, rgba(160,130,255,.24) 0%, rgba(160,130,255,.28) 80%, rgba(160,130,255,0) 100%)",
      "radial-gradient(2.8% 5% at 40% 40.9%, rgba(92,140,255,.2) 0%, rgba(92,140,255,.24) 80%, rgba(92,140,255,0) 100%)",
      "radial-gradient(11% 22% at 60% 0%, rgba(190,225,255,.82) 0%, rgba(190,225,255,0) 100%)",
      "radial-gradient(28% 56% at 77% 27%, rgba(175,145,255,.72) 0%, rgba(175,145,255,0) 100%)",
      "radial-gradient(15% 76% at 95% 42%, rgba(225,80,200,.68) 0%, rgba(225,80,200,0) 100%)",
      "linear-gradient(95deg, rgba(70,105,255,0) 45%, rgba(70,105,255,.66) 58%, rgba(70,105,255,0) 71%)",
      "radial-gradient(60% 80% at 62% 45%, rgba(58,74,168,.6) 0%, rgba(58,74,168,0) 100%)",
      "linear-gradient(0deg, rgba(6,7,14,.55) 0%, rgba(6,7,14,0) 50%)",
      "linear-gradient(90deg, #07080d 0%, #0b0d1e 30%, #18183f 100%)",
    ].join(", "),
  };
  var FALLBACK = FALLBACKS[LOOK_NAME];

  // Settings swatch (the wallpaper choice and the Themes miniatures, about 1:8): a still frame of the look over the
  // fallback. The halftone first, as a fine mesh at the screen's 30 degrees (at that size the real 6.7 px dots blur
  // away, and drawn as round dots they read as an LED grid) over its average shade, then sparkles near the light and
  // the bokeh where a frame shows it: [x, y, radius] in px of a 640x360 frame, its colour and its strength.
  var SWATCH_MESH = function (angle) {
    var line = "rgba(4,5,14,0.45)";
    var gap = "rgba(4,5,14,0)";
    return (
      "repeating-linear-gradient(" +
      angle +
      "deg, " +
      line +
      " 0px, " +
      line +
      " 0.8px, " +
      gap +
      " 0.8px, " +
      gap +
      " 2.4px)"
    );
  };
  var SWATCH_SPARKLES = [
    [290, 16],
    [312, 14],
    [470, 40],
    [520, 10],
    [563, 85],
    [610, 75],
  ];
  var SWATCH_BUBBLES = [
    [395, 35, 22, "205,225,255", 0.55],
    [408, 70, 14, "150,170,255", 0.45],
    [458, 105, 20, "185,160,255", 0.5],
    [428, 140, 18, "160,130,255", 0.45],
    [489, 57, 9, "220,170,255", 0.45],
    [505, 120, 10, "185,160,255", 0.4],
    [543, 122, 10, "190,150,255", 0.4],
    [600, 95, 20, "240,110,230", 0.55],
    [600, 25, 12, "240,140,242", 0.4],
    [580, 180, 22, "225,90,210", 0.3],
    [628, 215, 16, "235,120,230", 0.3],
    [410, 198, 14, "120,150,255", 0.35],
    [470, 205, 10, "140,140,255", 0.3],
    [348, 72, 6, "120,160,255", 0.45],
    [395, 107, 6, "130,170,255", 0.45],
    [346, 115, 6, "120,160,255", 0.35],
    [238, 133, 15, "100,130,240", 0.3],
    [268, 137, 10, "100,130,240", 0.3],
    [210, 136, 8, "100,130,240", 0.28],
    [193, 121, 8, "90,120,230", 0.25],
    [145, 80, 12, "80,100,200", 0.2],
    [292, 210, 18, "90,110,220", 0.2],
    [343, 265, 12, "90,110,220", 0.18],
    [533, 258, 10, "190,110,220", 0.2],
    [590, 222, 6, "240,140,242", 0.35],
    [568, 66, 6, "240,150,242", 0.35],
  ];
  var percent = function (value, size) {
    return Math.round((value / size) * 1000) / 10 + "%";
  };
  var SWATCH = [
    SWATCH_MESH(30),
    SWATCH_MESH(120),
    "linear-gradient(rgba(4,5,14,0.09), rgba(4,5,14,0.09))",
  ]
    .concat(
      SWATCH_SPARKLES.map(function (s) {
        return (
          "radial-gradient(1px 1px at " +
          percent(s[0], 640) +
          " " +
          percent(s[1], 360) +
          ", #fff, transparent)"
        );
      }),
      SWATCH_BUBBLES.map(function (b) {
        var colour = function (strength) {
          return (
            "rgba(" + b[3] + "," + Math.round(b[4] * strength * 100) / 100 + ")"
          );
        };
        return (
          "radial-gradient(" +
          percent(b[2], 640) +
          " " +
          percent(b[2], 360) +
          " at " +
          percent(b[0], 640) +
          " " +
          percent(b[1], 360) +
          ", " +
          colour(0.6) +
          " 0%, " +
          colour(0.75) +
          " 80%, " +
          colour(1) +
          " 90%, " +
          colour(0) +
          " 100%)"
        );
      }),
    )
    .join(", ");

  // ---------------------------------------------------------------- choreography
  // Quick rise, slow decay, at most 1.
  function beat(t) {
    var phase = fract(t * BEAT_HZ);
    var attack = Math.min(phase / 0.18, 1);
    return attack * attack * (3 - 2 * attack) * Math.exp(-3 * phase);
  }

  // A soft bump every period seconds, when the light opens up a little.
  function swell(t, period) {
    var s = 0.5 + 0.5 * Math.cos((TAU * (t - period * 0.6)) / period);
    return s * s * s * s;
  }

  // ---------------------------------------------------------------- sprites
  // Every sprite is one quad: 6 vertices of SPRITE_FLOATS floats, moved and lit in the vertex
  // shader. Kinds: 0 bubble, 1 sparkle.
  function makeSprites(look) {
    var list = [];
    var palette = look.palette.map(hex);
    var random = seededRandom(19061106);

    function addBubble(x, y, r, colour, gain, edge, rise, floats) {
      var wobble = (6 + Math.sqrt(r) * 3.2) * PX * look.drift;
      // Drawn even when the bubble floats, so that maxGain leaves the other bubbles as they are.
      var start = rise ? random() : 0;
      list.push({
        x: x * PX,
        y: rise && !floats ? start : 1 - y * PX,
        radius: r,
        quad: 1.4,
        edge: edge,
        rim: 0.18 + 0.12 * random(),
        kind: 0,
        glint: 0,
        wobbleX: wobble,
        wobbleY: wobble * 0.8,
        harmonic: Math.round((5 + Math.floor(random() * 8)) * look.drift),
        phase: random() * TAU,
        rise: floats ? 0 : rise,
        gain: gain,
        twinkle: 3 + Math.floor(random() * 6),
        twinklePhase: random() * TAU,
        tint: colour,
        light: look.bubbleLight,
      });
    }

    look.bubbles.forEach(function (b) {
      var loops = look.rising.loops;
      var rise =
        random() < look.rising.share
          ? loops[0] + Math.floor(random() * (loops[1] - loops[0] + 1))
          : 0;
      var floatsNearTheLight = b[4] > look.rising.maxGain;
      addBubble(
        b[0],
        b[1],
        b[2],
        palette[b[3]],
        b[4],
        b[5],
        rise,
        floatsNearTheLight,
      );
    });
    var extra = look.extraBubbles;
    var extraRandom = seededRandom(extra.seed);
    for (var i = 0; i < extra.count; i++) {
      var ex = lerp(extra.x[0], extra.x[1], extraRandom());
      var ey = lerp(extra.y[0], extra.y[1], extraRandom());
      var er = lerp(extra.r[0], extra.r[1], extraRandom());
      var eg = lerp(extra.gain[0], extra.gain[1], extraRandom());
      var rise = extraRandom() < 0.6 ? 3 + Math.floor(extraRandom() * 4) : 0;
      var extraFloatsNearTheLight = eg > look.rising.maxGain;
      addBubble(
        ex,
        ey,
        er,
        palette[Math.floor(extraRandom() * palette.length)],
        eg,
        0.16 + extraRandom() * 0.1,
        rise,
        extraFloatsNearTheLight,
      );
    }
    var sp = look.sparkles;
    var sparkleRandom = seededRandom(sp.seed);
    for (var j = 0; j < sp.count; j++) {
      var glint = sparkleRandom() < sp.glint;
      list.push({
        x: lerp(sp.x[0], sp.x[1], sparkleRandom()) * PX,
        y: 1 - lerp(sp.y[0], sp.y[1], Math.pow(sparkleRandom(), 1.3)) * PX,
        radius: glint
          ? 7 + sparkleRandom() * 5
          : lerp(sp.size[0], sp.size[1], sparkleRandom()),
        quad: glint ? 1 : 2.2,
        edge: 1,
        rim: 0,
        kind: 1,
        glint: glint ? 0.55 : 0,
        wobbleX: (3 + sparkleRandom() * 8) * PX,
        wobbleY: (3 + sparkleRandom() * 8) * PX,
        harmonic: 8 + Math.floor(sparkleRandom() * 10),
        phase: sparkleRandom() * TAU,
        rise: 0,
        gain: glint ? 1 : lerp(sp.gain[0], sp.gain[1], sparkleRandom()),
        twinkle: 5 + Math.floor(sparkleRandom() * 14),
        twinklePhase: sparkleRandom() * TAU,
        tint: [0.92, 0.92, 1],
        light: sp.light,
      });
    }
    return list;
  }

  function spriteVertices(sprites) {
    var data = new Float32Array(sprites.length * 6 * SPRITE_FLOATS);
    var k = 0;
    sprites.forEach(function (s) {
      for (var c = 0; c < 6; c++) {
        data.set(
          [
            CORNERS[c * 2],
            CORNERS[c * 2 + 1],
            s.x,
            s.y,
            s.radius,
            s.quad,
            s.edge,
            s.rim,
            s.kind,
            s.glint,
            s.wobbleX,
            s.wobbleY,
            s.harmonic,
            s.phase,
            s.rise,
            s.gain,
            s.twinkle,
            s.twinklePhase,
            s.tint[0],
            s.tint[1],
            s.tint[2],
            s.light,
          ],
          k,
        );
        k += SPRITE_FLOATS;
      }
    });
    return data;
  }

  // ---------------------------------------------------------------- shaders
  // Six significant digits: constants such as 1/960 need more than a fixed number of decimals.
  function glslFloat(x) {
    var s = String(Number(x.toPrecision(6)));
    return s.indexOf(".") < 0 && s.indexOf("e") < 0 ? s + ".0" : s;
  }

  function glslVec(v) {
    return "vec" + v.length + "(" + v.map(glslFloat).join(", ") + ")";
  }

  // Light from one beam: a soft gaussian cone with a brighter axis, dimming as it widens and with
  // depth. `a` is clamped before squaring to stay in mediump range.
  var BEAM_FUNCTION = [
    "float beam(vec2 q, vec2 dir, float w0, float spread, float fall, float core) {",
    "  float along = dot(q, dir);",
    "  float across = abs(q.x * dir.y - q.y * dir.x);",
    "  float width = w0 + spread * max(along, 0.0);",
    "  float a = min(across / width, 5.0);",
    "  float a2 = a * a;",
    "  float shape = exp(-a2 * 0.75) + core * exp(-a2 * 5.0);",
    "  return shape * exp(-fall * along) * (0.1 / (0.1 + width)) * smoothstep(-0.05, 0.1, along);",
    "}",
  ].join("\n");

  // Beam directions (two per vec4) and colours (gain included) are uniforms updated every frame.
  function lightAt(look, position) {
    return look.beams
      .map(function (b, i) {
        var dir = "uBeam[" + (i >> 1) + "]." + (i % 2 ? "zw" : "xy");
        var shape = [b.w0, b.spread, b.fall, b.core].map(glslFloat).join(", ");
        return (
          "uColor[" +
          i +
          "] * beam(" +
          position +
          " - " +
          glslVec(b.src) +
          ", " +
          dir +
          ", " +
          shape +
          ")"
        );
      })
      .join("\n    + ");
  }

  function glowSum(look) {
    return look.glows
      .map(function (g) {
        return (
          glslVec(g.colour) +
          " * (1.0 + " +
          glslFloat(g.pulse) +
          " * uFlow.w) * glow(p, " +
          glslVec(g.at) +
          ", " +
          glslVec([1 / g.size[0], 1 / g.size[1]]) +
          ")"
        );
      })
      .join("\n    + ");
  }

  var SCENE_VERTEX =
    "attribute vec2 aPosition;\nvoid main() { gl_Position = vec4(aPosition, 0.0, 1.0); }\n";

  function sceneFragment(look) {
    var vectors = Math.ceil(look.beams.length / 2);
    return [
      "precision mediump float;",
      "uniform sampler2D uNoise;",
      "uniform sampler2D uSprites;",
      "uniform vec4 uBeam[" + vectors + "];",
      "uniform vec3 uColor[" + look.beams.length + "];",
      "uniform vec4 uHaze;",
      "uniform vec4 uFlow;",
      "uniform vec4 uGrain;",
      "const float ASPECT = " + glslFloat(ASPECT) + ";",
      "const vec2 PIXEL = vec2(" +
        glslFloat(1 / RENDER_WIDTH) +
        ", " +
        glslFloat(1 / RENDER_HEIGHT) +
        ");",
      "const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);",
      BEAM_FUNCTION,
      "float glow(vec2 p, vec2 at, vec2 invSize) {",
      "  vec2 d = (p - at) * invSize;",
      "  return exp(-dot(d, d));",
      "}",
      "void main() {",
      "  vec2 uv = gl_FragCoord.xy * PIXEL;",
      "  vec2 p = vec2(uv.x * ASPECT, uv.y);",
      // Haze: two layers at different scales and angles, bent by a slow flow field so the billows
      // roll. Coordinates stay within about +-1.6, a quarter texel in fp16.
      "  vec2 c = p - vec2(" + glslFloat(ASPECT / 2) + ", 0.5);",
      "  vec2 w = c + (texture2D(uNoise, c * 0.17 + uFlow.xy).rg - 0.5) * 0.6;",
      "  float hazeA = texture2D(uNoise, mat2(0.92, 0.39, -0.39, 0.92) * w * 0.42 + uHaze.xy).r;",
      "  float hazeB = texture2D(uNoise, mat2(0.75, -0.66, 0.66, 0.75) * w * 0.95 + uHaze.zw).g;",
      "  float haze = smoothstep(0.2, 0.8, hazeA * 0.65 + hazeB * 0.35) * uFlow.z;",
      "  vec3 light = " + lightAt(look, "p") + ";",
      "  vec3 ambient = " +
        glslVec(look.navy) +
        "\n    + " +
        glowSum(look) +
        ";",
      "  float status = smoothstep(0.8, 0.93, uv.y) * smoothstep(0.615, 0.66, uv.x);",
      "  vec3 hdr = (ambient * (1.0 + 0.5 * haze) + light * (" +
        glslFloat(look.haze.base) +
        " + " +
        glslFloat(look.haze.amount) +
        " * haze)) * (1.0 - " +
        glslFloat(STATUS_SHADE) +
        " * status);",
      "  hdr *= mix(" +
        glslFloat(1 - look.bottomShade) +
        ", 1.0, smoothstep(0.0, 0.5, uv.y));",
      "  hdr *= mix(" +
        glslFloat(1 - look.leftShade) +
        ", 1.0, smoothstep(0.0, 0.6, uv.x));",
      // Per-channel extended Reinhard (white point look.white): bright overlaps bloom towards white.
      "  vec3 col = sqrt(min(hdr * (1.0 + hdr * " +
        glslFloat(1 / (look.white * look.white)) +
        ") / (1.0 + hdr), vec3(1.0)));",
      "  col += texture2D(uSprites, uv).rgb;",
      // Soft luminance knee behind the header text: the status on the right, the icons on the left.
      "  float guard = smoothstep(0.8, 0.93, uv.y) * max(smoothstep(0.615, 0.66, uv.x), 1.0 - smoothstep(0.16, 0.22, uv.x));",
      "  float lum = dot(col * col, LUMA);",
      "  float knee = mix(1.0, " + glslFloat(GUARD_KNEE) + ", guard);",
      "  float range = mix(1.0, " +
        glslFloat(GUARD_CAP - GUARD_KNEE) +
        ", guard);",
      "  float capped = knee + range * (1.0 - exp((knee - max(lum, knee)) / range));",
      "  col *= mix(1.0, sqrt(capped / max(lum, knee)), step(knee, lum));",
      // Fine film grain, stronger in the light, plus a triangular dither against banding.
      "  vec4 n = texture2D(uNoise, (mod(gl_FragCoord.xy, 256.0) + uGrain.xy) * " +
        glslFloat(1 / NOISE_SIZE) +
        ");",
      "  gl_FragColor = vec4(col + (n.b + n.a - 1.0) * (uGrain.z * (0.3 + col) + 1.0 / 255.0), 1.0);",
      "}",
    ].join("\n");
  }

  function spriteVertex(look) {
    var rising = look.rising;
    return [
      "attribute vec2 aCorner;",
      "attribute vec4 aSprite;",
      "attribute vec4 aLook;",
      "attribute vec4 aMotion;",
      "attribute vec4 aShine;",
      "attribute vec4 aTint;",
      "uniform vec4 uBeam[" + Math.ceil(look.beams.length / 2) + "];",
      "uniform vec3 uColor[" + look.beams.length + "];",
      "uniform vec4 uLoop;",
      "varying vec2 vCorner;",
      "varying vec3 vColor;",
      "varying vec4 vLook;",
      "const float ASPECT = " + glslFloat(ASPECT) + ";",
      BEAM_FUNCTION,
      "void main() {",
      "  float wx = aMotion.z * uLoop.x + aMotion.w;",
      "  float wy = (aMotion.z + 1.0) * uLoop.x + aMotion.w * 1.7;",
      "  vec2 centre = aSprite.xy + aMotion.xy * vec2(sin(wx), sin(wy));",
      // Rising bubbles float up a whole number of times per loop, fading in and out.
      "  float moving = step(0.001, aShine.x);",
      "  float progress = fract(aSprite.y + aShine.x * uLoop.x * " +
        glslFloat(1 / TAU) +
        ");",
      "  centre.y = mix(centre.y, " +
        glslFloat(rising.from) +
        " + progress * " +
        glslFloat(rising.to - rising.from) +
        " + aMotion.y * sin(wy), moving);",
      "  float life = mix(1.0, smoothstep(0.0, 0.4, progress) * (1.0 - smoothstep(0.85, 1.0, progress)), moving);",
      // Bubbles take the colour of the light around them and glow brighter inside a beam.
      "  vec3 light = " + lightAt(look, "centre") + ";",
      "  float peak = max(light.r, max(light.g, light.b));",
      "  float lit = min(peak, 1.0);",
      "  vec3 tint = mix(aTint.rgb, light / max(peak, 0.001), aTint.a * lit);",
      "  float wave = 0.5 + 0.5 * sin(aShine.z * uLoop.y + aShine.w);",
      "  float twinkle = mix(0.72 + 0.28 * wave, wave * wave * wave, aLook.z);",
      "  float pulse = 1.0 + 0.18 * uLoop.z * (0.6 + 0.4 * sin(aShine.w * 3.0)) + " +
        glslFloat(look.swell.gain) +
        " * uLoop.w;",
      "  float shine = aShine.y * (1.0 - 0.45 * aTint.a + 0.45 * aTint.a * lit) * twinkle * pulse * life;",
      "  vColor = tint * shine;",
      "  vCorner = aCorner * aSprite.w;",
      "  vLook = aLook;",
      "  vec2 clip = centre * vec2(2.0 / ASPECT, 2.0) - 1.0;",
      "  gl_Position = vec4(clip + aCorner * aSprite.w * aSprite.z * vec2(" +
        glslFloat(2 / 1920) +
        ", " +
        glslFloat(2 / 1080) +
        "), 0.0, 1.0);",
      "}",
    ].join("\n");
  }

  // Bubbles: a soft disc, a little darker in the middle, with a faint rim and a halo. Sparkles: a
  // tiny gaussian core, with a four-point glint on some of them.
  var SPRITE_FRAGMENT = [
    "precision mediump float;",
    "varying vec2 vCorner;",
    "varying vec3 vColor;",
    "varying vec4 vLook;",
    "void main() {",
    "  float r = length(vCorner);",
    "  float edge = vLook.x;",
    "  float disc = 1.0 - smoothstep(1.0 - edge, 1.0, r);",
    "  float body = 0.62 + 0.38 * smoothstep(0.0, 0.92, r);",
    "  float ring = smoothstep(1.0 - 2.6 * edge, 1.0 - 0.8 * edge, r) * disc;",
    "  float halo = 0.08 * (1.0 - smoothstep(0.75, 1.4, r));",
    "  float bubble = disc * body + vLook.y * ring + halo;",
    "  vec2 a = abs(vCorner);",
    "  float sparkle = exp(-r * r * 9.0) + vLook.w * (exp(-a.x * 26.0 - a.y * 2.6) + exp(-a.y * 26.0 - a.x * 2.6));",
    "  gl_FragColor = vec4(vColor * mix(bubble, sparkle, vLook.z), 1.0);",
    "}",
  ].join("\n");

  // Tileable smooth noise without a lattice: white noise box-blurred three times per axis (close
  // to a Gaussian) with wrap-around. R is two scales of haze, G a finer layer of haze; B and A
  // are white noise for the grain and the dither. Generated once, then cached.
  function noiseTexels(size) {
    var state = 20261106;
    function random() {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return (state >>> 0) / 4294967296;
    }
    var mask = size - 1;
    var count = size * size;

    function blurRows(src, dst, radius) {
      var inv = 1 / (2 * radius + 1);
      for (var row = 0; row < count; row += size) {
        var acc = 0;
        for (var k = -radius; k <= radius; k++) {
          acc += src[row + (k & mask)];
        }
        for (var x = 0; x < size; x++) {
          dst[row + x] = acc * inv;
          acc +=
            src[row + ((x + radius + 1) & mask)] -
            src[row + ((x - radius) & mask)];
        }
      }
    }

    function blurColumns(src, dst, radius) {
      var inv = 1 / (2 * radius + 1);
      for (var col = 0; col < size; col++) {
        var acc = 0;
        for (var k = -radius; k <= radius; k++) {
          acc += src[(k & mask) * size + col];
        }
        for (var y = 0; y < size; y++) {
          dst[y * size + col] = acc * inv;
          acc +=
            src[((y + radius + 1) & mask) * size + col] -
            src[((y - radius) & mask) * size + col];
        }
      }
    }

    function normalise(values) {
      var sum = 0;
      for (var i = 0; i < count; i++) {
        sum += values[i] * values[i];
      }
      var k = 1 / Math.sqrt(sum / count);
      for (var j = 0; j < count; j++) {
        values[j] *= k;
      }
      return values;
    }

    function smooth(radius) {
      var a = new Float32Array(count);
      var b = new Float32Array(count);
      for (var i = 0; i < count; i++) {
        a[i] = random() - 0.5;
      }
      for (var pass = 0; pass < 3; pass++) {
        blurRows(a, b, radius);
        blurColumns(b, a, radius);
      }
      return normalise(a);
    }

    function store(texels, channel, values) {
      normalise(values);
      for (var i = 0; i < count; i++) {
        texels[i * 4 + channel] = Math.max(
          0,
          Math.min(255, Math.round((0.5 + 0.18 * values[i]) * 255)),
        );
      }
    }

    var texels = new Uint8Array(count * 4);
    var coarse = smooth(20);
    var detail = smooth(7);
    for (var i = 0; i < count; i++) {
      coarse[i] += 0.5 * detail[i];
    }
    store(texels, 0, coarse);
    store(texels, 1, smooth(6));
    for (var n = 0; n < count; n++) {
      texels[n * 4 + 2] = Math.floor(random() * 256);
      texels[n * 4 + 3] = Math.floor(random() * 256);
    }
    return texels;
  }

  var cachedTexels = null;
  var cachedSprites = null;

  function getContext(canvas) {
    var attributes = {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: true,
    };
    try {
      return (
        canvas.getContext("webgl", attributes) ||
        canvas.getContext("experimental-webgl", attributes)
      );
    } catch (error) {
      return null;
    }
  }

  function compile(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (
      !gl.getShaderParameter(shader, gl.COMPILE_STATUS) &&
      !gl.isContextLost()
    ) {
      var log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error("Stage shader: " + log);
    }
    return shader;
  }

  function link(gl, vertexSource, fragmentSource, attributes) {
    var program = gl.createProgram();
    var vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
    var fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    attributes.forEach(function (name, index) {
      gl.bindAttribLocation(program, index, name);
    });
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (
      !gl.getProgramParameter(program, gl.LINK_STATUS) &&
      !gl.isContextLost()
    ) {
      throw new Error("Stage program: " + gl.getProgramInfoLog(program));
    }
    return program;
  }

  function texture(gl, unit, width, height, data, wrap) {
    var handle = gl.createTexture();
    gl.activeTexture(unit);
    gl.bindTexture(gl.TEXTURE_2D, handle);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      data,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    return handle;
  }

  // Two passes per frame: the bubbles and sparkles are added into an offscreen texture, then one
  // full-screen pass draws the beams and haze, adds that texture, guards the header text and adds
  // the grain.
  function createRenderer(gl) {
    var look = LOOK;
    var beamCount = look.beams.length;
    var scene = link(gl, SCENE_VERTEX, sceneFragment(look), ["aPosition"]);
    var sprites = link(gl, spriteVertex(look), SPRITE_FRAGMENT, [
      "aCorner",
      "aSprite",
      "aLook",
      "aMotion",
      "aShine",
      "aTint",
    ]);

    var triangle = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangle);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );

    if (!cachedSprites) {
      cachedSprites = spriteVertices(makeSprites(look));
    }
    var quads = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quads);
    gl.bufferData(gl.ARRAY_BUFFER, cachedSprites, gl.STATIC_DRAW);
    var spriteVertexCount = cachedSprites.length / SPRITE_FLOATS;

    if (!cachedTexels) {
      cachedTexels = noiseTexels(NOISE_SIZE);
    }
    var noise = texture(
      gl,
      gl.TEXTURE0,
      NOISE_SIZE,
      NOISE_SIZE,
      cachedTexels,
      gl.REPEAT,
    );
    var spriteLayer = texture(
      gl,
      gl.TEXTURE1,
      RENDER_WIDTH,
      RENDER_HEIGHT,
      null,
      gl.CLAMP_TO_EDGE,
    );
    var target = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, target);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      spriteLayer,
      0,
    );
    var targetReady =
      gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (!targetReady && !gl.isContextLost()) {
      throw new Error("Stage: the sprite layer cannot be rendered to");
    }

    var sceneWhere = {
      beam: gl.getUniformLocation(scene, "uBeam"),
      colour: gl.getUniformLocation(scene, "uColor"),
      haze: gl.getUniformLocation(scene, "uHaze"),
      flow: gl.getUniformLocation(scene, "uFlow"),
      grain: gl.getUniformLocation(scene, "uGrain"),
    };
    var spriteWhere = {
      beam: gl.getUniformLocation(sprites, "uBeam"),
      colour: gl.getUniformLocation(sprites, "uColor"),
      loop: gl.getUniformLocation(sprites, "uLoop"),
    };
    gl.useProgram(scene);
    gl.uniform1i(gl.getUniformLocation(scene, "uNoise"), 0);
    gl.uniform1i(gl.getUniformLocation(scene, "uSprites"), 1);
    gl.viewport(0, 0, RENDER_WIDTH, RENDER_HEIGHT);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.clearColor(0, 0, 0, 0);

    var vectors = Math.ceil(beamCount / 2);
    var beamData = new Float32Array(vectors * 4);
    var colourData = new Float32Array(beamCount * 3);
    var stride = SPRITE_FLOATS * 4;
    var colours = look.beams.map(function (b) {
      return [linear(b.colors[0]), linear(b.colors[1])];
    });
    var grainRandom = seededRandom(424242);

    // Every animated value is computed here and wrapped, so the fragment shaders never see a large time.
    function draw(t) {
      var pulse = beat(t);
      var chorus = swell(t, look.swell.period);
      var brightness = (1 + 0.05 * pulse) * (1 + look.swell.gain * chorus);
      for (var i = 0; i < beamCount; i++) {
        var b = look.beams[i];
        var angle = b.rest;
        for (var s = 0; s < b.sway.length; s++) {
          angle +=
            b.sway[s][0] * Math.sin((TAU * t) / b.sway[s][1] + b.sway[s][2]);
        }
        beamData[i * 2] = Math.cos(angle);
        beamData[i * 2 + 1] = Math.sin(angle);
        var f = 0.5 - 0.5 * Math.cos((TAU * t) / b.hue[0] + b.hue[1]);
        for (var c = 0; c < 3; c++) {
          colourData[i * 3 + c] =
            lerp(colours[i][0][c], colours[i][1][c], f) * b.gain * brightness;
        }
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, target);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(sprites);
      gl.uniform4fv(spriteWhere.beam, beamData);
      gl.uniform3fv(spriteWhere.colour, colourData);
      gl.uniform4f(
        spriteWhere.loop,
        TAU * fract(t / DRIFT_LOOP_SECONDS),
        TAU * fract(t / TWINKLE_LOOP_SECONDS),
        pulse,
        chorus,
      );
      gl.bindBuffer(gl.ARRAY_BUFFER, quads);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, stride, 0);
      for (var a = 1; a < 6; a++) {
        gl.enableVertexAttribArray(a);
        gl.vertexAttribPointer(a, 4, gl.FLOAT, false, stride, 8 + (a - 1) * 16);
      }
      gl.enable(gl.BLEND);
      gl.drawArrays(gl.TRIANGLES, 0, spriteVertexCount);
      gl.disable(gl.BLEND);
      for (var d = 1; d < 6; d++) {
        gl.disableVertexAttribArray(d);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      gl.useProgram(scene);
      gl.uniform4fv(sceneWhere.beam, beamData);
      gl.uniform3fv(sceneWhere.colour, colourData);
      gl.uniform4f(
        sceneWhere.haze,
        fract(t * 0.009) - 0.5,
        fract(t * 0.004) - 0.5,
        fract(-t * 0.012) - 0.5,
        fract(t * 0.007) - 0.5,
      );
      gl.uniform4f(
        sceneWhere.flow,
        fract(t * 0.011) - 0.5,
        fract(-t * 0.008) - 0.5,
        1 + 0.1 * pulse,
        pulse + chorus,
      );
      gl.uniform4f(
        sceneWhere.grain,
        Math.floor(grainRandom() * 256),
        Math.floor(grainRandom() * 256),
        look.grain * (HALFTONE.on ? 0.5 : 1),
        0,
      );
      gl.bindBuffer(gl.ARRAY_BUFFER, triangle);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function release() {
      gl.deleteFramebuffer(target);
      gl.deleteTexture(spriteLayer);
      gl.deleteTexture(noise);
      gl.deleteBuffer(triangle);
      gl.deleteBuffer(quads);
      gl.useProgram(null);
      gl.deleteProgram(scene);
      gl.deleteProgram(sprites);
    }

    return { draw: draw, release: release };
  }

  function normaliseSpeed(value) {
    return Math.max(0, Number(value) || 0);
  }

  function reducedMotionQuery() {
    try {
      return global.matchMedia
        ? global.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    } catch (error) {
      return null;
    }
  }

  // A div, not a canvas: the prototype mirrors the first canvas of the layer when the direction
  // changes, and that must stay the WebGL one.
  function halftoneLayer(doc, scale) {
    var size = Math.round(HALFTONE.tile * scale);
    var unit = size / 65;
    var radius = HALFTONE.radius * unit * Math.sqrt(65);
    var tile = doc.createElement("canvas");
    tile.width = size;
    tile.height = size;
    var t = tile.getContext("2d");
    if (!t) {
      return null;
    }
    t.fillStyle = HALFTONE.gap;
    t.fillRect(0, 0, size, size);
    t.globalCompositeOperation = "destination-out";
    t.fillStyle = "#000";
    for (var m = -8; m <= 16; m++) {
      for (var n = -8; n <= 16; n++) {
        var x = (7 * m + 4 * n) * unit;
        var y = (7 * n - 4 * m) * unit;
        if (
          x > -radius &&
          x < size + radius &&
          y > -radius &&
          y < size + radius
        ) {
          t.beginPath();
          t.arc(x, y, radius, 0, TAU);
          t.fill();
        }
      }
    }
    var layer = doc.createElement("div");
    layer.setAttribute("aria-hidden", "true");
    layer.style.cssText =
      "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:1;" +
      "background-image:url(" +
      tile.toDataURL() +
      ");background-size:" +
      HALFTONE.tile +
      "px " +
      HALFTONE.tile +
      "px";
    return layer;
  }

  function mount(container, options) {
    var speed =
      options && options.speed !== undefined
        ? normaliseSpeed(options.speed)
        : 1;
    var doc = container.ownerDocument || document;
    var canvas = doc.createElement("canvas");
    canvas.width = RENDER_WIDTH;
    canvas.height = RENDER_HEIGHT;
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText =
      "position:absolute;left:0;top:0;width:100%;height:100%;display:block;object-fit:cover;pointer-events:none";
    // The halftone layer goes in first and stacks above with z-index: callers take the WebGL
    // canvas as the container's last element right after mount().
    var overlay = null;
    if (HALFTONE.on) {
      try {
        overlay = halftoneLayer(doc, Math.min(global.devicePixelRatio || 1, 2));
      } catch (error) {
        overlay = null;
      }
      if (overlay) {
        container.appendChild(overlay);
      }
    }
    container.appendChild(canvas);

    var gl = getContext(canvas);
    var motionQuery = reducedMotionQuery();
    var renderer = null;
    var lost = false;
    var destroyed = false;
    var rafId = 0;
    var lastFrame = 0;
    var time = 0;
    var frameTimes = [];

    function showFallback(on) {
      canvas.style.background = on ? FALLBACK : "";
    }

    function start() {
      try {
        renderer = createRenderer(gl);
      } catch (error) {
        renderer = null;
        if (global.console) {
          global.console.warn(error);
        }
      }
      showFallback(!renderer);
      if (renderer) {
        renderer.draw(time);
      }
    }

    // With reduced motion requested, the first frame stays as a still image.
    function shouldRun() {
      var reducedMotion = !!(motionQuery && motionQuery.matches);
      return (
        !destroyed &&
        !lost &&
        !!renderer &&
        speed > 0 &&
        !doc.hidden &&
        !reducedMotion
      );
    }

    function frame(now) {
      rafId = 0;
      if (!shouldRun()) {
        return;
      }
      rafId = global.requestAnimationFrame(frame);
      if (lastFrame && now - lastFrame < FRAME_INTERVAL_MS - FRAME_SLACK_MS) {
        return;
      }
      var step = lastFrame ? Math.min(now - lastFrame, MAX_STEP_MS) : 0;
      lastFrame = now;
      time += (step / 1000) * speed;
      renderer.draw(time);
      frameTimes.push(now);
      while (frameTimes.length && now - frameTimes[0] > 1000) {
        frameTimes.shift();
      }
    }

    function update() {
      if (shouldRun()) {
        if (!rafId) {
          lastFrame = 0;
          rafId = global.requestAnimationFrame(frame);
        }
      } else if (rafId) {
        global.cancelAnimationFrame(rafId);
        rafId = 0;
        frameTimes.length = 0;
      }
    }

    function onContextLost(event) {
      event.preventDefault();
      lost = true;
      renderer = null;
      showFallback(true);
      update();
    }

    function onContextRestored() {
      lost = false;
      start();
      update();
    }

    if (gl) {
      start();
      canvas.addEventListener("webglcontextlost", onContextLost, false);
      canvas.addEventListener("webglcontextrestored", onContextRestored, false);
      doc.addEventListener("visibilitychange", update, false);
      update();
    } else {
      showFallback(true);
    }

    return {
      setSpeed: function (value) {
        speed = normaliseSpeed(value);
        update();
      },
      destroy: function () {
        if (destroyed) {
          return;
        }
        destroyed = true;
        update();
        doc.removeEventListener("visibilitychange", update, false);
        canvas.removeEventListener("webglcontextlost", onContextLost, false);
        canvas.removeEventListener(
          "webglcontextrestored",
          onContextRestored,
          false,
        );
        if (renderer && !gl.isContextLost()) {
          renderer.release();
          var loseContext = gl.getExtension("WEBGL_lose_context");
          if (loseContext) {
            loseContext.loseContext();
          }
        }
        renderer = null;
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
        if (overlay && overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      },
      // Diagnostics for demos: frames drawn during the last second and whether WebGL is live.
      stats: function () {
        return { fps: frameTimes.length, webgl: !!renderer, running: !!rafId };
      },
    };
  }

  global.StageBackground = { mount: mount, fallback: FALLBACK, swatch: SWATCH };
})(window);
