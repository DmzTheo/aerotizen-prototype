import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useClock } from "../../../status/hooks/useClock";
import { useWeather } from "../../../status/hooks/useWeather";
import { WeatherIcon } from "../../../status/WeatherIcon";
import { HomeBand } from "../../components/HomeBand/HomeBand";
import { PictureShelf } from "../../components/PictureShelf/PictureShelf";
import type { HomeLayoutPageProps } from "../types";

import styles from "./MomentLayout.module.css";

// The greeting of the hour: the morning from 5 o'clock, the afternoon from noon, the evening from 6 pm.
const greetingKey = (hour: number) => {
  const morning = hour >= 5 && hour < 12;
  const afternoon = hour >= 12 && hour < 18;
  if (morning) {
    return "home.greetingMorning";
  }
  return afternoon ? "home.greetingAfternoon" : "home.greetingEvening";
};

// The Moment Home layout. The clock leaves the header for the middle of the
// page: the date, a greeting for the hour, the time and the weather on the start side; on the end side what to resume,
// or the weather on a glass card when there is nothing to resume. The apps and the inputs sit in the glass band below.
// The clock settings choose what shows (time, date format, weather, place), not its layout.
export const MomentLayout = ({ env, ids, apps, items, inputs, settings, active }: HomeLayoutPageProps) => {
  const { t } = useTranslation();
  const clock = useClock(env.status.time, env.runtime.clock, settings);
  const weather = useWeather(env.status.weather);
  const weatherShown = settings.showWeather && weather.visible;
  const weatherCard = weatherShown && !items.length;
  const weatherLine = weatherShown && !weatherCard;
  return (
    <div class={styles.layout} data-columns={settings.homeCardColumns}>
      <div class={styles.top}>
        <div class={styles.greeting}>
          <div class={styles.date} hidden={settings.dateFormat === "none"}>
            {clock.date}
          </div>
          <div class={styles.hello}>{t(greetingKey(new Date(clock.timestamp).getHours()))}</div>
          <div class={styles.time} hidden={!settings.showTime}>
            {clock.text}
          </div>
          {weatherLine ? (
            <div class={styles.weather}>
              <WeatherIcon code={weather.code} />
              <b class={styles.lineTemperature}>{weather.text}</b>
              <span class={styles.lineCondition}>{weather.condition}</span>
              {settings.weatherShowLocation ? <span class={styles.lineCity}>{weather.city}</span> : null}
            </div>
          ) : null}
        </div>
        {items.length ? (
          <PictureShelf coverArt={settings.continueWatchingCoverArt} env={env} items={items} className={styles.shelf} />
        ) : null}
        {weatherCard ? (
          <div class={styles.card}>
            <span class={styles.cardIcon}>
              <WeatherIcon code={weather.code} />
            </span>
            <span class={styles.temperature}>{weather.text}</span>
            <span class={styles.cardText}>
              <span class={styles.condition}>{weather.condition}</span>
              {settings.weatherShowLocation ? <span class={styles.city}>{weather.city}</span> : null}
            </span>
          </div>
        ) : null}
      </div>
      <HomeBand env={env} ids={ids} apps={apps} inputs={inputs} settings={settings} active={active} />
    </div>
  );
};
