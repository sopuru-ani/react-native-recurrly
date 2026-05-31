import { useGlobalSearchParams, usePathname } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useEffect } from "react";

export function PostHogScreenTracker() {
  const posthog = usePostHog();
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  useEffect(() => {
    if (posthog && pathname) {
      posthog.screen(pathname, params);
    }
  }, [posthog, pathname, params]);

  return null;
}
