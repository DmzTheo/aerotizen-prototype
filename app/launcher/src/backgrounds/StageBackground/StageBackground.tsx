import { useEffect, useRef } from "preact/hooks";

import styles from "./StageBackground.module.css";

// backgrounds/stage.js, loaded as a plain script: mount() appends its halftone layer and its WebGL canvas.
interface StageHandle {
  destroy(): void;
  setSpeed(speed: number): void;
  stats(): { webgl: boolean };
}
interface StageGlobal {
  mount(container: HTMLElement, options: { speed: number }): StageHandle;
}

interface Props {
  reportWebGL(available: boolean): void;
  speed: number;
}

export const StageBackground = ({ speed, reportWebGL }: Props) => {
  const host = useRef<HTMLDivElement>(null);
  const handle = useRef<StageHandle | null>(null);
  // Mounted once per scene with the speed it starts with; later speeds go through setSpeed, which keeps the WebGL
  // context instead of building a new one.
  const startSpeed = useRef(speed);
  useEffect(() => {
    const stage = (window as unknown as { StageBackground?: StageGlobal }).StageBackground;
    if (!host.current || !stage) {
      reportWebGL(false);
      return undefined;
    }
    const mounted = stage.mount(host.current, { speed: startSpeed.current });
    handle.current = mounted;
    reportWebGL(mounted.stats().webgl);
    return () => {
      handle.current = null;
      mounted.destroy();
    };
  }, [reportWebGL]);
  useEffect(() => {
    handle.current?.setSpeed(speed);
  }, [speed]);
  return <div ref={host} class={styles.host} data-stage-background />;
};
