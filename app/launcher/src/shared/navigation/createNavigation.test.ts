import { describe, expect, it } from "vitest";

import { createNavigation } from "./createNavigation";

// jsdom has no layout: each node gets the box a browser would report while the pane is scrolled.
const place = (node: HTMLElement, top: number, left = 0, height = 60) => {
  Object.defineProperty(node, "offsetParent", { configurable: true, get: () => node.parentElement });
  Object.defineProperty(node, "offsetHeight", { configurable: true, get: () => height });
  Object.defineProperty(node, "getBoundingClientRect", {
    configurable: true,
    value: () => ({ top, left, bottom: top + height, right: left + 100 }) as DOMRect,
  });
  return node;
};

describe("createNavigation rows in a scrolled scope", () => {
  const setUp = () => {
    const scope = document.createElement("div");
    const close = place(document.createElement("button"), 150, 900);
    const scroller = document.createElement("div");
    Object.defineProperty(scroller, "scrollTop", { configurable: true, get: () => 400 });
    // Seen 400px up the page: the first row has left the screen, the close button stays where it was.
    const first = place(document.createElement("div"), -70);
    const second = place(document.createElement("div"), 110);
    const third = place(document.createElement("div"), 350);
    scroller.append(first, second, third);
    scope.append(close, scroller);
    document.body.append(scope);
    const navigation = createNavigation(() => undefined);
    navigation.setScope?.(scope);
    navigation.register("close", close);
    navigation.register("first", first);
    navigation.register("second", second);
    navigation.register("third", third);
    return navigation;
  };

  it("moves up from a row to the row above it, not to the close button that does not scroll", () => {
    const navigation = setUp();
    navigation.select("third");
    navigation.move("up");
    expect(navigation.getSnapshot()).toBe("second");
    navigation.move("up");
    expect(navigation.getSnapshot()).toBe("first");
  });

  it("keeps the close button above the first row", () => {
    const navigation = setUp();
    navigation.select("first");
    navigation.move("up");
    expect(navigation.getSnapshot()).toBe("close");
  });
});
