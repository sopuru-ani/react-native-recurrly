import type { PostHogOptions } from "posthog-react-native";

export const posthogConfig = {
  apiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? "",
  host: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
  autocapture: {
    captureScreens: false,
    captureTouches: true,
  },
} as const;

export const posthogOptions: PostHogOptions = {
  host: posthogConfig.host,
};
