import type { SettingsSnapshot } from "../../../contracts/preferences";
import { Clock } from "../../../status/Clock/Clock";
import { useClock } from "../../../status/hooks/useClock";
import { useWeather } from "../../../status/hooks/useWeather";
import { WeatherStatus } from "../../../status/WeatherStatus/WeatherStatus";
import type { HomeEnvironment } from "../../types";

import styles from "./PageClock.module.css";

// Theme proposal: the custom clock in the page of Quay or the Diptych, in its style and with
// the weather, as the header would show it, lined up on the start edge. The header then keeps its compact height.
export const PageClock = ({
  env,
  settings,
  className,
}: {
  env: HomeEnvironment;
  settings: SettingsSnapshot;
  className: string;
}) => {
  const value = useClock(env.status.time, env.runtime.clock, settings);
  const weather = useWeather(env.status.weather);
  const style = settings.aeroClockStyle;
  return (
    <div class={styles.clock + " " + className}>
      <Clock layout={style} settings={settings} clock={env.runtime.clock} value={value}>
        <WeatherStatus
          layout={style}
          only={!settings.showTime && settings.dateFormat === "none"}
          weather={weather}
          showWeather={settings.showWeather}
          showLocation={settings.weatherShowLocation}
        />
      </Clock>
    </div>
  );
};
