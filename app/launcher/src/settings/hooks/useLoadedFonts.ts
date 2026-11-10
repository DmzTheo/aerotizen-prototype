import { useLayoutEffect, useState } from "preact/hooks";

// Theme proposal: counts the web fonts that finished loading. A theme's font can arrive after the theme is chosen
// and move the items, so what depends on their place is updated again.
export const useLoadedFonts = () => {
  const [loaded, setLoaded] = useState(0);
  useLayoutEffect(() => {
    const fonts = document.fonts;
    const count = () => setLoaded((value) => value + 1);
    fonts.addEventListener("loadingdone", count);
    return () => fonts.removeEventListener("loadingdone", count);
  }, []);
  return loaded;
};
