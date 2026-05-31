import { getUserEmail } from "@/lib/auth";
import { useClerk, useUser } from "@clerk/expo";
import clsx from "clsx";
import { styled } from "nativewind";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function Settings() {
  const { user } = useUser();
  const { signOut } = useClerk();

  const email = getUserEmail(user);

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
        className={clsx("auth-button mt-8")}
        onPress={() => signOut()}
      >
        <Text className="auth-button-text">Sign out</Text>
      </Pressable>
    </SafeAreaView>
  );
}
