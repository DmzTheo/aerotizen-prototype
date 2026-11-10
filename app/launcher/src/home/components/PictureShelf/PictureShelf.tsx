import type { ContinueItem } from "../../../contracts/launcher";
import type { HomeEnvironment } from "../../types";
import { ContinueScroller } from "../ContinueScroller";

import styles from "./PictureShelf.module.css";

// Theme proposal: what to resume in the Quay and Moment layouts: pictures with their
// title over them, two at a time in a window that scrolls. The layout places the shelf.
export const PictureShelf = ({
  env,
  items,
  className,
}: {
  env: HomeEnvironment;
  items: readonly ContinueItem[];
  className: string;
}) => (
  <div class={styles.shelf + " " + className} data-layout-block="continue">
    <ContinueScroller env={env} items={items} trackClass={styles.track} />
  </div>
);
