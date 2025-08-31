import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";

export type WebVitalsReporter = (metric: Metric) => void;

export default function reportWebVitals(report?: WebVitalsReporter) {
  if (!report) return;
  onCLS(report);
  onFCP(report);
  onINP(report);
  onLCP(report);
  onTTFB(report);
}
