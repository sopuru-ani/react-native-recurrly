import SubscriptionCard from "@/components/SubscriptionCard";
import { colors } from "@/constants/theme";
import { useSubscriptions } from "@/lib/subscriptions";
import { X } from "lucide-react-native";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

function matchesSearch(subscription: Subscription, query: string): boolean {
  const haystack = [
    subscription.name,
    subscription.plan,
    subscription.category,
    subscription.billing,
    subscription.status,
    subscription.paymentMethod,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export default function Subscriptions() {
  const { subscriptions } = useSubscriptions();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  const filteredSubscriptions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return subscriptions;

    return subscriptions.filter((subscription) =>
      matchesSearch(subscription, normalizedQuery),
    );
  }, [searchQuery, subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="list-title mb-4">Subscriptions</Text>

      <View className="relative mb-5">
        <TextInput
          className="auth-input p-3"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search subscriptions..."
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable
            className="absolute right-3 top-0 bottom-0 justify-center"
            onPress={() => setSearchQuery("")}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            {/* <Text className="text-2xl bg-blue-300 font-sans-bold text-muted-foreground">
              ×
            </Text> */}
            <X color={colors.mutedForeground} size={20} />
          </Pressable>
        )}
      </View>

      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        keyboardDismissMode="on-drag"
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() =>
              setExpandedSubscriptionId(
                item.id === expandedSubscriptionId ? null : item.id,
              )
            }
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text className="home-empty-state">
            {searchQuery.trim()
              ? "No subscriptions match your search."
              : "No subscriptions yet."}
          </Text>
        }
        contentContainerClassName="pb-30"
      />
    </SafeAreaView>
  );
}
