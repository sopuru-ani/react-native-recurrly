import AuthField from "@/components/auth/AuthField";
import { subscriptionCreatedProperties } from "@/config/analytics";
import { icons } from "@/constants/icons";
import { colors } from "@/constants/theme";
import { useAnalytics } from "@/lib/analytics";
import clsx from "clsx";
import dayjs from "dayjs";
import { X } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

const SUBSCRIPTION_CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

type SubscriptionCategory = (typeof SUBSCRIPTION_CATEGORIES)[number];
type BillingFrequency = "Monthly" | "Yearly";

const CATEGORY_COLORS: Record<SubscriptionCategory, string> = {
  Entertainment: "#ffb4a2",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#c8e6c9",
  Cloud: "#bbdefb",
  Music: "#f8bbd0",
  Other: "#8fd1bd",
};

type CreateSubscriptionModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Subscription) => void;
};

const initialFormState = () => ({
  name: "",
  price: "",
  frequency: "Monthly" as BillingFrequency,
  category: "Other" as SubscriptionCategory,
});

function CreateSubscriptionModal({
  visible,
  onClose,
  onSubmit,
}: CreateSubscriptionModalProps) {
  const { capture } = useAnalytics();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<BillingFrequency>("Monthly");
  const [category, setCategory] = useState<SubscriptionCategory>("Other");

  const parsedPrice = parseFloat(price);
  const canSubmit =
    name.trim().length > 0 &&
    !Number.isNaN(parsedPrice) &&
    parsedPrice > 0;

  const resetForm = () => {
    const initial = initialFormState();
    setName(initial.name);
    setPrice(initial.price);
    setFrequency(initial.frequency);
    setCategory(initial.category);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    const trimmedName = name.trim();
    const startDate = dayjs().toISOString();
    const renewalDate =
      frequency === "Monthly"
        ? dayjs().add(1, "month").toISOString()
        : dayjs().add(1, "year").toISOString();

    const subscription: Subscription = {
      id: `${trimmedName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      name: trimmedName,
      price: parsedPrice,
      currency: "USD",
      billing: frequency,
      category,
      status: "active",
      startDate,
      renewalDate,
      icon: icons.wallet,
      color: CATEGORY_COLORS[category],
    };

    onSubmit(subscription);
    capture(
      "subscription_created",
      subscriptionCreatedProperties(subscription),
    );
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="modal-overlay">
          <View className="modal-container">
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable
                className="modal-close"
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <X color={colors.primary} size={18} />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="modal-body">
                <AuthField
                  label="Name"
                  value={name}
                  onChangeText={setName}
                  placeholder="Subscription name"
                  autoCapitalize="words"
                />

                <AuthField
                  label="Price"
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />

                <View className="auth-field">
                  <Text className="auth-label">Frequency</Text>
                  <View className="picker-row">
                    {(["Monthly", "Yearly"] as const).map((option) => (
                      <Pressable
                        key={option}
                        className={clsx(
                          "picker-option",
                          frequency === option && "picker-option-active",
                        )}
                        onPress={() => setFrequency(option)}
                      >
                        <Text
                          className={clsx(
                            "picker-option-text",
                            frequency === option &&
                              "picker-option-text-active",
                          )}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Category</Text>
                  <View className="category-scroll">
                    {SUBSCRIPTION_CATEGORIES.map((option) => (
                      <Pressable
                        key={option}
                        className={clsx(
                          "category-chip",
                          category === option && "category-chip-active",
                        )}
                        onPress={() => setCategory(option)}
                      >
                        <Text
                          className={clsx(
                            "category-chip-text",
                            category === option &&
                              "category-chip-text-active",
                          )}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <Pressable
                  className={clsx(
                    "auth-button",
                    !canSubmit && "auth-button-disabled",
                  )}
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                >
                  <Text className="auth-button-text">Add Subscription</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default CreateSubscriptionModal;
