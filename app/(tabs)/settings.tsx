import { getUserEmail } from "@/lib/auth";
import { useClerk, useUser } from "@clerk/expo";
import clsx from "clsx";
import { styled } from "nativewind";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function Settings() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const email = getUserEmail(user);

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-2xl font-sans-bold text-primary">Settings</Text>

      <View className="mt-6 gap-2">
        <Text className="text-sm font-sans-semibold text-muted-foreground">
          Signed in as
        </Text>
        <Text className="text-base font-sans-medium text-primary">
          {email ?? "Your account"}
        </Text>
      </View>

      <Pressable
        className={clsx("auth-button mt-8", isSigningOut && "auth-button-disabled")}
        onPress={handleSignOut}
        disabled={isSigningOut}
      >
        {isSigningOut ? (
          <ActivityIndicator color="#081126" />
        ) : (
          <Text className="auth-button-text">Sign out</Text>
        )}
      </Pressable>
    </SafeAreaView>
  );
}
