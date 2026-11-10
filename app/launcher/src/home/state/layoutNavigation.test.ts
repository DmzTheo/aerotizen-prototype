import { expect, test } from "vitest";

import { createMoveHistory } from "./layoutNavigation";

const everyItem = () => true;

test("the opposite arrow goes back to where an Up or Down move came from", () => {
  const history = createMoveHistory();
  history.moved("app:a", "continue:b", "down");

  expect(history.replay("continue:b", "up", everyItem)).toEqual({ kind: "back", to: "app:a" });
  expect(history.replay("continue:b", "down", everyItem)).toBeUndefined();
});

test("moves back unwind one step at a time", () => {
  const history = createMoveHistory();
  history.moved("app:a", "continue:b", "down");
  history.moved("continue:b", "input:c", "down");

  const first = history.replay("input:c", "up", everyItem);
  history.moved("input:c", "continue:b", "up", first);

  expect(first).toEqual({ kind: "back", to: "continue:b" });
  expect(history.replay("continue:b", "up", everyItem)).toEqual({ kind: "back", to: "app:a" });
});

test("repeating the move just undone goes forward to the same item again", () => {
  const history = createMoveHistory();
  history.moved("app:a", "continue:b", "down");
  const back = history.replay("continue:b", "up", everyItem);
  history.moved("continue:b", "app:a", "up", back);

  expect(history.replay("app:a", "down", everyItem)).toEqual({ kind: "redo", to: "continue:b" });
});

test("a new move forgets the move that was undone", () => {
  const history = createMoveHistory();
  history.moved("app:a", "continue:b", "down");
  history.moved("continue:b", "app:a", "up", history.replay("continue:b", "up", everyItem));
  history.moved("app:a", "home-tab", "up");
  history.moved("home-tab", "app:a", "down");

  expect(history.replay("app:a", "down", everyItem)).toBeUndefined();
});

test("Left and Right are not recorded", () => {
  const history = createMoveHistory();
  history.moved("app:a", "app:b", "right");

  expect(history.replay("app:b", "left", everyItem)).toBeUndefined();
  expect(history.replay("app:b", "up", everyItem)).toBeUndefined();
});

test("no move back is offered to an item that is gone", () => {
  const history = createMoveHistory();
  history.moved("app:a", "continue:b", "down");

  expect(history.replay("continue:b", "up", (key) => key !== "app:a")).toBeUndefined();
});

test("only the last moves are kept", () => {
  const history = createMoveHistory(2);
  history.moved("app:a", "continue:b", "down");
  history.moved("continue:b", "input:c", "down");
  history.moved("input:c", "input:d", "down");
  history.moved("input:d", "input:c", "up", history.replay("input:d", "up", everyItem));
  history.moved("input:c", "continue:b", "up", history.replay("input:c", "up", everyItem));

  expect(history.replay("continue:b", "up", everyItem)).toBeUndefined();
});
