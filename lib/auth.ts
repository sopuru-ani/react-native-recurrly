import { type Href, type Router } from "expo-router";
import { Linking, Platform } from "react-native";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ClerkUserLike = {
  firstName?: string | null;
  lastName?: string | null;
  primaryEmailAddress?: { emailAddress: string } | null;
  emailAddresses?: { emailAddress: string }[];
} | null | undefined;

export function getUserEmail(user: ClerkUserLike): string | undefined {
  return (
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress
  );
}

export function getUserDisplayName(user: ClerkUserLike): string {
  if (user?.firstName && user?.lastName) {
    return user.firstName;
  }

  return getUserEmail(user) ?? "Your account";
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function isValidPassword(value: string): boolean {
  return value.length >= 8;
}

export function passwordsMatch(a: string, b: string): boolean {
  return a === b;
}

type FinalizableAttempt = {
  finalize: (options: {
    navigate: (args: {
      session?: { currentTask?: unknown } | null;
      decorateUrl: (url: string) => string;
    }) => void;
  }) => Promise<{ error: unknown } | void>;
};

export async function finalizeAndNavigate(
  attempt: FinalizableAttempt,
  router: Router,
) {
  const result = await attempt.finalize({
    navigate: ({ session, decorateUrl }) => {
      if (session?.currentTask) {
        console.warn("Session task pending:", session.currentTask);
        return;
      }

      const url = decorateUrl("/(tabs)");
      if (url.startsWith("http")) {
        if (Platform.OS === "web") {
          window.location.href = url;
        } else {
          void Linking.openURL(url);
        }
        return;
      }

      router.replace(url as Href);
    },
  });

  if (result && "error" in result && result.error) {
    console.error("Failed to finalize auth session:", result.error);
  }
}
