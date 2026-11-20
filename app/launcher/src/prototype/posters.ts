// Portrait posters for the preview's programmes, drawn from the colours of their landscape pictures, standing in for
// the posters a catalogue returns on a TV.
import type { ContinueItem } from "../contracts/launcher";

const FALLBACK_COLOURS = ["#20345b", "#7baad9"] as const;
const LINE_CHARACTERS = 12;
const MAX_LINES = 4;
const ELLIPSIS = "…";
const MOON_POSITIONS = 5;

const colours = (image: string | undefined) => {
  const found = image ? decodeURIComponent(image).match(/stop-color="(#[0-9a-fA-F]{6})"/g) : null;
  const values = found ? found.map((stop) => stop.slice(12, 19)) : [];
  return values.length >= 2 ? [values[0], values[1]] : FALLBACK_COLOURS;
};

const lines = (title: string) => {
  const result: string[] = [];
  for (const word of title.toUpperCase().split(/\s+/)) {
    const last = result[result.length - 1];
    if (last && last.length + word.length + 1 <= LINE_CHARACTERS) {
      result[result.length - 1] = last + " " + word;
    } else {
      result.push(word);
    }
  }
  return result.length > MAX_LINES ? [...result.slice(0, MAX_LINES - 1), result[MAX_LINES - 1] + ELLIPSIS] : result;
};

const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const cache = new Map<string, string>();

export const posterFor = (item: ContinueItem) => {
  const known = cache.get(item.key);
  if (known) {
    return known;
  }
  const [dark, light] = colours(item.image);
  const index = Number(item.key.replace(/\D/g, "")) || 0;
  const position = index % MOON_POSITIONS;
  const titleLines = lines(item.title);
  const longest = Math.max(...titleLines.map((line) => line.length));
  const size = Math.min(50, Math.round(330 / (longest * 0.8)));
  const top = 560 - titleLines.length * size * 1.08;
  const text = titleLines
    .map(
      (line, row) =>
        `<text x="200" y="${Math.round(top + row * size * 1.08)}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${size}" font-weight="700" letter-spacing="2" fill="#fff">${escape(line)}</text>`,
    )
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
    <defs>
      <linearGradient id="sky" x2="0" y2="1"><stop stop-color="${dark}"/><stop offset=".7" stop-color="${light}"/></linearGradient>
      <linearGradient id="shade" x2="0" y2="1"><stop offset=".5" stop-opacity="0"/><stop offset="1" stop-opacity=".72"/></linearGradient>
    </defs>
    <path fill="url(#sky)" d="M0 0h400v600H0z"/>
    <circle cx="${90 + 55 * position}" cy="${150 - 10 * position}" r="${40 + 6 * position}" fill="#fff5d8" opacity=".85"/>
    <path fill="${dark}" opacity=".55" d="M0 330 90 268 190 340 300 252 400 318V600H0Z"/>
    <path fill="${dark}" d="M0 398 110 348 232 420 332 356 400 388V600H0Z"/>
    <path fill="url(#shade)" d="M0 0h400v600H0z"/>
    ${text}
  </svg>`;
  const url = "data:image/svg+xml," + encodeURIComponent(svg);
  cache.set(item.key, url);
  return url;
};
