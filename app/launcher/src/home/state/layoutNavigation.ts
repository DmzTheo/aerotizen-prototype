// Theme proposal: the proposed Home layouts place their items in bands (the Billboard:
// the hero and its side cards, then the apps and the inputs) rather than in rows, so an arrow moves to the nearest
// item that way. Each block of items carries data-layout-block. Boxes are measured without transforms (focus zoom,
// slides in progress): offsets, moved by the sideways offset of their row.

export type Direction = "left" | "right" | "up" | "down";

const OPPOSITE: Readonly<Record<Direction, Direction>> = { up: "down", down: "up", left: "right", right: "left" };

interface Entry {
  band: number;
  readonly block: Element;
  readonly box: { left: number; top: number; right: number; bottom: number };
  readonly clip: { left: number; right: number } | null;
  readonly key: string;
  readonly track: Element | null;
}

const restBox = (node: HTMLElement, root: HTMLElement) => {
  let left = 0;
  let top = 0;
  for (let current: HTMLElement | null = node; current && current !== root;) {
    left += current.offsetLeft;
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }
  return { left, top, right: left + node.offsetWidth, bottom: top + node.offsetHeight };
};

const measure = (nodes: ReadonlyMap<string, HTMLElement>, root: HTMLElement, rtl: boolean) => {
  const entries: Entry[] = [];
  nodes.forEach((node, key) => {
    const block = node.closest("[data-layout-block]");
    if (!block || !root.contains(block) || node.offsetParent === null) {
      return;
    }
    const box = restBox(node, root);
    const track = node.closest("[data-scroller-track]");
    const viewport = track?.parentElement;
    const offset = Number(track?.getAttribute("data-offset")) || 0;
    const shift = rtl ? offset : -offset;
    const frame = viewport ? restBox(viewport, root) : null;
    entries.push({
      key,
      box: { ...box, left: box.left + shift, right: box.right + shift },
      block,
      track,
      clip: frame && { left: frame.left, right: frame.right },
      band: 0,
    });
  });
  return entries;
};

// Blocks whose heights overlap share a band: the hero and its side cards, then the apps and the inputs.
const assignBands = (entries: Entry[]) => {
  const blocks = new Map<Element, { top: number; bottom: number; entries: Entry[] }>();
  for (const entry of entries) {
    const block = blocks.get(entry.block) || { top: entry.box.top, bottom: entry.box.bottom, entries: [] };
    block.top = Math.min(block.top, entry.box.top);
    block.bottom = Math.max(block.bottom, entry.box.bottom);
    block.entries.push(entry);
    blocks.set(entry.block, block);
  }
  const sorted = [...blocks.values()].sort((a, b) => a.top - b.top);
  let band = -1;
  let bottom = -Infinity;
  for (const block of sorted) {
    const startsBand = block.top >= bottom - 2;
    band += startsBand ? 1 : 0;
    bottom = startsBand ? block.bottom : Math.max(bottom, block.bottom);
    for (const entry of block.entries) {
      entry.band = band;
    }
  }
};

// Up and Down go to the current block's other rows first (side cards, inputs), otherwise to the adjacent band. A
// band can also hold blocks stacked in one column beside a taller block: without a band that way, they go to the other
// blocks of the column.
const verticalTargets = (candidates: Entry[], current: Entry, step: number) => {
  const ownRows = candidates.filter((entry) => entry.block === current.block);
  if (ownRows.length) {
    return ownRows;
  }
  const others = candidates.filter((entry) => (step > 0 ? entry.band > current.band : entry.band < current.band));
  if (!others.length) {
    const a = current.box;
    return candidates.filter(
      (entry) =>
        entry.band === current.band && Math.min(a.right, entry.box.right) - Math.max(a.left, entry.box.left) > 0,
    );
  }
  const bands = others.map((entry) => entry.band);
  const adjacent = step > 0 ? Math.min(...bands) : Math.max(...bands);
  return others.filter((entry) => entry.band === adjacent);
};

// Left and Right stay in the band and on the current item's height: the current row's items (the row then scrolls,
// as real rows do) and the band's items that show, whole or, in a row that scrolls, in part (that row then reveals
// them: the apps at the App size end in part before the inputs). Among the candidates, those overlapping the current
// item on the cross axis come first, then the nearest row (or column), then the nearest centre.
export const nearestLayoutKey = (
  nodes: ReadonlyMap<string, HTMLElement>,
  root: HTMLElement,
  selected: string,
  direction: Direction,
  rtl: boolean,
) => {
  const entries = measure(nodes, root, rtl);
  const current = entries.find((entry) => entry.key === selected);
  if (!current) {
    return undefined;
  }
  assignBands(entries);
  const a = current.box;
  const vertical = direction === "up" || direction === "down";
  const gap = (b: Entry["box"]) => {
    if (direction === "down") {
      return b.top - a.bottom;
    }
    if (direction === "up") {
      return a.top - b.bottom;
    }
    return direction === "right" ? b.left - a.right : a.left - b.right;
  };
  // Left or Right from another block aims at what shows of an item cut by its row's window: its hidden part may lie
  // beside the current item (the apps window ends before the inputs).
  const aimed = (entry: Entry) => {
    const alongRow = entry.track !== null && entry.track === current.track;
    if (vertical || alongRow || !entry.clip) {
      return entry.box;
    }
    const { left, right } = entry.clip;
    return { ...entry.box, left: Math.max(entry.box.left, left), right: Math.min(entry.box.right, right) };
  };
  const nearby = entries.filter((entry) => {
    const b = entry.box;
    if (entry.key === selected || gap(aimed(entry)) < -2) {
      return false;
    }
    const hidden = entry.clip !== null && (b.right <= entry.clip.left || b.left >= entry.clip.right);
    const cut = entry.clip !== null && (b.left < entry.clip.left || b.right > entry.clip.right);
    const alongRow = entry.track !== null && entry.track === current.track;
    const showsInScrollingRow = entry.track !== null && !hidden;
    return vertical ? !hidden : entry.band === current.band && (alongRow || showsInScrollingRow || !cut);
  });
  const candidates = vertical ? verticalTargets(nearby, current, direction === "down" ? 1 : -1) : nearby;
  if (!candidates.length) {
    return undefined;
  }
  const overlap = (b: Entry["box"]) =>
    vertical
      ? Math.min(a.right, b.right) - Math.max(a.left, b.left)
      : Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  const overlapping = candidates.filter((entry) => overlap(entry.box) > 0);
  if (!vertical && !overlapping.length) {
    return undefined;
  }
  const pool = overlapping.length ? overlapping : candidates;
  const nearestGap = Math.min(...pool.map((entry) => gap(aimed(entry))));
  const centre = (b: Entry["box"]) => (vertical ? b.left + b.right : b.top + b.bottom);
  const middle = centre(a);
  const [best] = pool
    .filter((entry) => gap(aimed(entry)) <= nearestGap + 8)
    .sort(
      (x, y) =>
        Math.abs(centre(x.box) - middle) - Math.abs(centre(y.box) - middle) ||
        x.box.top - y.box.top ||
        x.box.left - y.box.left,
    );
  return best.key;
};

// A move that the history can replay: back along the last move, or forward again along the move just undone.
export interface Replay {
  readonly kind: "back" | "redo";
  readonly to: string;
}

interface Move {
  readonly direction: Direction;
  readonly from: string;
  readonly to: string;
}

const isVertical = (direction: Direction) => direction === "up" || direction === "down";

// The Up and Down moves made in a proposed layout. Reversing one goes back where it came from, step by step, and
// repeating the move just undone goes forward again (the row below may have scrolled meanwhile). Left and Right are
// not recorded: they always take the nearest item, so a row can be followed past where it was entered.
export const createMoveHistory = (limit = 8) => {
  const moves: Move[] = [];
  let undone: Move | undefined;
  return {
    // Where the arrow goes from what was recorded, if it replays a move to an item that still exists.
    replay(selected: string, direction: Direction, exists: (key: string) => boolean): Replay | undefined {
      if (!isVertical(direction)) {
        return undefined;
      }
      const last = moves[moves.length - 1];
      const reversesLast =
        last !== undefined && last.to === selected && OPPOSITE[last.direction] === direction && exists(last.from);
      if (reversesLast) {
        return { kind: "back", to: last.from };
      }
      const lastUndone = undone;
      const repeatsUndone =
        lastUndone !== undefined &&
        lastUndone.from === selected &&
        lastUndone.direction === direction &&
        exists(lastUndone.to);
      return repeatsUndone ? { kind: "redo", to: lastUndone.to } : undefined;
    },
    // Records the move just made; replay is what replay() returned for it.
    moved(from: string, to: string, direction: Direction, replay?: Replay) {
      if (replay?.kind === "back") {
        undone = moves.pop();
        return;
      }
      if (replay?.kind === "redo" && undone) {
        moves.push(undone);
        undone = undefined;
        return;
      }
      if (isVertical(direction)) {
        undone = undefined;
        moves.push({ from, to, direction });
        moves.splice(0, moves.length - limit);
      }
    },
  };
};
