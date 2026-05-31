import type { AnalyticsEvent, AnalyticsEventMap } from "@/config/analytics";
import { usePostHog } from "posthog-react-native";
import { useCallback } from "react";

export function useAnalytics() {
  const posthog = usePostHog();

  const capture = useCallback(
    <E extends AnalyticsEvent>(
      event: E,
      properties: AnalyticsEventMap[E],
    ) => {
      posthog?.capture(event, properties);
    },
    [posthog],
  );

  return { capture, posthog };
}
