import { Text, View } from "react-native";

type AuthBrandBlockProps = {
  title: string;
  subtitle: string;
};

export default function AuthBrandBlock({ title, subtitle }: AuthBrandBlockProps) {
  return (
    <View className="auth-brand-block">
      <View className="auth-logo-wrap">
        <View className="auth-logo-mark">
          <Text className="auth-logo-mark-text">R</Text>
        </View>
        <View>
          <Text className="auth-wordmark">Recurrly</Text>
          <Text className="auth-wordmark-sub">Smart billing</Text>
        </View>
      </View>
      <Text className="auth-title">{title}</Text>
      <Text className="auth-subtitle">{subtitle}</Text>
    </View>
  );
}
