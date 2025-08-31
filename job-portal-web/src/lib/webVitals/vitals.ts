import { onCLS, onFID, onLCP, onINP, onTTFB, onFCP, type Metric } from "web-vitals";

export type WebVitalsReporter = (metric: Metric) => void;

export function reportWebVitals(reporter?: WebVitalsReporter) {
  const fn = reporter || ((m) => console.log("[web-vitals]", m.name, Math.round(m.value)));
  try {
    onCLS(fn);
    onFID(fn);
    onLCP(fn);
    onINP(fn);
    onTTFB(fn);
    onFCP(fn);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("web-vitals not available", e);
  }
}
