/* Prototype shell: scales the 1920×1080 TV page into the window. The TV page is the real AeroTizen launcher with
   the proposal applied (built from app/ into tv/). Everything the app lets you change is in the TV's own Settings;
   the side panel only simulates what a given TV would have (its language, programmes, HDMI ports).
   The URL keeps the setup: the settings that differ from a fresh start, plus the simulated TV. */
(() => {
  "use strict";

  const frame = document.getElementById("tv");
  const stage = document.getElementById("stage");
  const panel = document.getElementById("panel");
  const panelBody = document.getElementById("panel-body");
  const panelFoot = document.getElementById("panel-foot");
  const toggle = document.getElementById("panel-toggle");

  /* ---------- Fit the TV into the stage (letterboxed 16:9) ---------- */
  const fit = () => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const k = Math.min(w / 1920, h / 1080);
    frame.style.transform =
      "translate(" +
      (w - 1920 * k) / 2 +
      "px," +
      (h - 1080 * k) / 2 +
      "px) scale(" +
      k +
      ")";
  };
  new ResizeObserver(fit).observe(stage);
  fit();

  /* ---------- The setup in the URL: #key=value&demo.key=value ---------- */
  const DEMO_DEFAULTS = { continueItems: 5, hdmiPorts: 3, tvLanguage: "en-GB" };
  const readHash = () => {
    const out = { settings: {}, demo: Object.assign({}, DEMO_DEFAULTS) };
    location.hash
      .slice(1)
      .split("&")
      .filter(Boolean)
      .forEach((pair) => {
        const at = pair.indexOf("=");
        const key = decodeURIComponent(at === -1 ? pair : pair.slice(0, at));
        const raw = at === -1 ? "" : decodeURIComponent(pair.slice(at + 1));
        if (key.indexOf("demo.") === 0) {
          const name = key.slice(5);
          if (name in DEMO_DEFAULTS)
            out.demo[name] = name === "tvLanguage" ? raw : Number(raw);
        } else {
          out.settings[key] = raw; // typed by the TV page against its defaults
        }
      });
    return out;
  };
  let state = readHash();
  let ownHash = location.hash;
  const writeHash = () => {
    const parts = [];
    Object.keys(state.settings).forEach((key) => {
      const value = state.settings[key];
      parts.push(
        encodeURIComponent(key) +
          "=" +
          encodeURIComponent(
            typeof value === "string" ? value : JSON.stringify(value),
          ),
      );
    });
    Object.keys(DEMO_DEFAULTS).forEach((key) => {
      if (state.demo[key] !== DEMO_DEFAULTS[key])
        parts.push(
          "demo." + key + "=" + encodeURIComponent(String(state.demo[key])),
        );
    });
    ownHash = parts.length ? "#" + parts.join("&") : "";
    try {
      history.replaceState(
        null,
        "",
        ownHash || location.pathname + location.search,
      );
    } catch (err) {
      /* the URL is optional */
    }
  };
  /* A new query on each load makes the iframe really reload (a hash-only change would not), so a pasted link applies. */
  let loads = 0;
  const loadTv = () => {
    loads += 1;
    frame.src =
      "tv/index.html?demo=1&load=" +
      loads +
      "#" +
      encodeURIComponent(
        JSON.stringify({ settings: state.settings, demo: state.demo }),
      );
  };
  window.addEventListener("hashchange", () => {
    if (location.hash === ownHash) return;
    state = readHash();
    ownHash = location.hash;
    loadTv();
  });
  /* The simulated TV changes what the launcher reads at start-up, so the TV page restarts with it. */
  const setDemo = (patch) => {
    Object.assign(state.demo, patch);
    writeHash();
    render();
    loadTv();
  };

  /* ---------- Messages with the TV ---------- */
  /* Only the TV page of this site is talked to and listened to. A file:// page has an opaque origin, which
     postMessage cannot target, so it falls back to "*" there (the source window is still checked). */
  const FILE = location.protocol === "file:";
  const TARGET_ORIGIN = FILE ? "*" : location.origin;
  const fromSameSite = (origin) =>
    FILE
      ? origin === "null" || origin === "file://"
      : origin === location.origin;
  const focusTv = () => {
    frame.focus();
    if (frame.contentWindow)
      frame.contentWindow.postMessage(
        { source: "aerotizen-shell", type: "focus" },
        TARGET_ORIGIN,
      );
  };

  /* The handle fades out while the mouse rests (the TV page reports pointer moves over it). */
  let idleTimer = 0;
  const wake = () => {
    document.body.classList.remove("idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => document.body.classList.add("idle"), 2500);
  };
  ["mousemove", "pointerdown", "keydown"].forEach((type) =>
    document.addEventListener(type, wake, { passive: true }),
  );
  wake();
  let tv = {
    language: "en",
    strings: {
      continueWatching: "Continue Watching",
      languageAuto: "Use TV language",
    },
  };
  window.addEventListener("message", (event) => {
    if (event.source !== frame.contentWindow || !fromSameSite(event.origin))
      return;
    const data = event.data;
    if (!data || data.source !== "aerotizen-tv") return;
    if (data.type === "pointer") {
      wake();
      return;
    }
    if (data.type !== "state") return;
    state.settings = data.settings || {};
    tv = {
      language: data.language || "en",
      strings: data.strings || tv.strings,
    };
    writeHash();
    render();
  });

  /* ---------- Panel strings, in the launcher's language ---------- */
  const credits = {
    en: "AeroTizen, MIT licence. The TV screen is AeroTizen {version} built from its source, with the proposals added to it.",
    fr: "AeroTizen, licence MIT. L’écran de la TV est AeroTizen {version} compilé depuis son code, avec les propositions ajoutées.",
    ru: "AeroTizen, лицензия MIT. Экран телевизора — AeroTizen {version}, собранный из исходного кода, с добавленными предложениями.",
    ar: "AeroTizen، رخصة MIT. شاشة التلفاز هي AeroTizen {version} مبنيًا من شيفرته المصدرية، وأُضيفت إليه المقترحات.",
    it: "AeroTizen, licenza MIT. Lo schermo della TV è AeroTizen {version} compilato dal suo codice sorgente, con le proposte aggiunte.",
  };
  const STRINGS = {
    en: {
      toggle: "Prototype settings",
      title: "Simulated TV",
      intro:
        "Everything else is in the TV's own Settings: the gear at the top left.",
      tvLanguage: "TV language",
      tvLanguageNote: "Used by “{auto}” and for the date format, as on a TV.",
      programmes: "Programmes in “{cw}”",
      hdmi: "HDMI ports on the TV",
      hdmiNote: "HDMI 4 is simulated: an empty port, like HDMI 2.",
      keys: "Click the TV, then use <kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> like the remote, <kbd>Enter</kbd> for OK, <kbd>Esc</kbd> or <kbd>Backspace</kbd> for Back.",
    },
    fr: {
      toggle: "Réglages du prototype",
      title: "TV simulée",
      intro:
        "Tout le reste se règle dans les paramètres de la TV : la roue dentée en haut à gauche.",
      tvLanguage: "Langue de la TV",
      tvLanguageNote:
        "Utilisée par « {auto} » et pour le format de la date, comme sur une TV.",
      programmes: "Programmes dans « {cw} »",
      hdmi: "Ports HDMI de la TV",
      hdmiNote: "HDMI 4 est simulé : un port vide, comme HDMI 2.",
      keys: "Cliquez sur la TV, puis utilisez <kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> comme la télécommande, <kbd>Entrée</kbd> pour OK, <kbd>Échap</kbd> ou <kbd>Retour arrière</kbd> pour Retour.",
    },
    ru: {
      toggle: "Настройки прототипа",
      title: "Имитация телевизора",
      intro:
        "Всё остальное — в настройках телевизора: шестерёнка слева вверху.",
      tvLanguage: "Язык телевизора",
      tvLanguageNote:
        "Используется вариантом «{auto}» и для формата даты, как на телевизоре.",
      programmes: "Программы в разделе «{cw}»",
      hdmi: "Порты HDMI телевизора",
      hdmiNote: "HDMI 4 имитируется: пустой порт, как HDMI 2.",
      keys: "Нажмите на телевизор и используйте <kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> как пульт, <kbd>Enter</kbd> — OK, <kbd>Esc</kbd> или <kbd>Backspace</kbd> — «Назад».",
    },
    ar: {
      toggle: "إعدادات النموذج",
      title: "تلفاز محاكى",
      intro: "كل ما عدا ذلك في إعدادات التلفاز نفسه: رمز الترس في الأعلى.",
      tvLanguage: "لغة التلفاز",
      tvLanguageNote: "يستخدمها خيار «{auto}» وتنسيق التاريخ، كما في التلفاز.",
      programmes: "البرامج في «{cw}»",
      hdmi: "منافذ HDMI في التلفاز",
      hdmiNote: "منفذ HDMI 4 محاكى: منفذ فارغ مثل HDMI 2.",
      keys: "انقر على التلفاز ثم استخدم <kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> مثل جهاز التحكم، و<kbd>Enter</kbd> للتأكيد، و<kbd>Esc</kbd> أو <kbd>Backspace</kbd> للرجوع.",
    },
    it: {
      toggle: "Impostazioni del prototipo",
      title: "TV simulata",
      intro:
        "Tutto il resto si regola nelle impostazioni della TV: l’ingranaggio in alto a sinistra.",
      tvLanguage: "Lingua della TV",
      tvLanguageNote:
        "Usata da «{auto}» e per il formato della data, come su una TV.",
      programmes: "Programmi in «{cw}»",
      hdmi: "Porte HDMI della TV",
      hdmiNote: "HDMI 4 è simulata: una porta vuota, come HDMI 2.",
      keys: "Fai clic sulla TV, poi usa <kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> come il telecomando, <kbd>Invio</kbd> per OK, <kbd>Esc</kbd> o <kbd>Backspace</kbd> per Indietro.",
    },
  };
  const TV_LANGUAGES = [
    ["en-GB", "English (UK)"],
    ["en-US", "English (US)"],
    ["fr-FR", "Français"],
    ["it-IT", "Italiano"],
    ["ru-RU", "Русский"],
    ["ar", "العربية"],
  ];
  const esc = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  const VERSION = "2.7.0";

  /* ---------- Render the panel from the state ---------- */
  let renderedKey = "";
  function render() {
    const lang = STRINGS[tv.language] ? tv.language : "en";
    const s = STRINGS[lang];
    const key =
      lang + "|" + tv.strings.continueWatching + "|" + tv.strings.languageAuto;
    if (key !== renderedKey) {
      renderedKey = key;
      panel.lang = lang;
      panel.dir = lang === "ar" ? "rtl" : "ltr";
      document.getElementById("panel-toggle-label").textContent = s.toggle;
      toggle.title = s.toggle;
      panelBody.innerHTML =
        '<section class="group"><h2 id="panel-title">' +
        esc(s.title) +
        '</h2><p class="note">' +
        esc(s.intro) +
        "</p>" +
        '<div class="ctrl"><span class="ctrl-label" id="lbl-tv">' +
        esc(s.tvLanguage) +
        '</span><div class="seg" role="group" aria-labelledby="lbl-tv">' +
        TV_LANGUAGES.map(
          ([value, name]) =>
            '<button type="button" data-tv-language="' +
            value +
            '" lang="' +
            value +
            '" aria-pressed="false">' +
            esc(name) +
            "</button>",
        ).join("") +
        '</div><p class="note">' +
        esc(s.tvLanguageNote.replace("{auto}", tv.strings.languageAuto)) +
        "</p></div>" +
        '<label class="ctrl"><span class="ctrl-label">' +
        esc(s.programmes.replace("{cw}", tv.strings.continueWatching)) +
        ' <output id="out-programmes"></output></span>' +
        '<input type="range" id="in-programmes" min="0" max="5" step="1"></label>' +
        '<label class="ctrl"><span class="ctrl-label">' +
        esc(s.hdmi) +
        ' <output id="out-hdmi"></output></span>' +
        '<input type="range" id="in-hdmi" min="1" max="4" step="1"><p class="note" id="note-hdmi" hidden>' +
        esc(s.hdmiNote) +
        "</p></label></section>";
      panelFoot.innerHTML =
        "<p>" +
        s.keys +
        "</p><p>" +
        credits[lang].replace("{version}", VERSION) +
        "</p>";
    }
    panelBody
      .querySelectorAll("[data-tv-language]")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String(b.dataset.tvLanguage === state.demo.tvLanguage),
        ),
      );
    const programmes = document.getElementById("in-programmes");
    const hdmi = document.getElementById("in-hdmi");
    if (document.activeElement !== programmes)
      programmes.value = String(state.demo.continueItems);
    if (document.activeElement !== hdmi)
      hdmi.value = String(state.demo.hdmiPorts);
    document.getElementById("out-programmes").textContent = String(
      state.demo.continueItems,
    );
    document.getElementById("out-hdmi").textContent = String(
      state.demo.hdmiPorts,
    );
    document.getElementById("note-hdmi").hidden = state.demo.hdmiPorts !== 4;
  }

  panelBody.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tv-language]");
    if (!button) return;
    setDemo({ tvLanguage: button.dataset.tvLanguage });
  });
  /* Sliders apply when released, so the TV restarts once per change. */
  panelBody.addEventListener("change", (event) => {
    if (event.target.id === "in-programmes")
      setDemo({ continueItems: Number(event.target.value) });
    if (event.target.id === "in-hdmi")
      setDemo({ hdmiPorts: Number(event.target.value) });
  });
  panelBody.addEventListener("input", (event) => {
    if (event.target.id === "in-programmes")
      document.getElementById("out-programmes").textContent =
        event.target.value;
    if (event.target.id === "in-hdmi")
      document.getElementById("out-hdmi").textContent = event.target.value;
  });

  /* ---------- Open and close the panel (remembered per viewer) ---------- */
  const store = {
    get: (key) => {
      try {
        return localStorage.getItem(key);
      } catch (err) {
        return null;
      }
    },
    set: (key, value) => {
      try {
        localStorage.setItem(key, value);
      } catch (err) {
        /* private mode */
      }
    },
  };
  const setPanel = (open) => {
    panel.hidden = !open;
    document.body.classList.toggle("panel-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    store.set("aerotizen-proto-panel", open ? "open" : "closed");
    if (!open) focusTv();
  };
  toggle.addEventListener("click", () => setPanel(panel.hidden));
  if (store.get("aerotizen-proto-panel") === "open") setPanel(true);

  render();
  loadTv();
  frame.addEventListener("load", () => {
    focusTv();
    fit();
  });
})();
