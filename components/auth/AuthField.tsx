import { colors } from "@/constants/theme";
import clsx from "clsx";
import { Text, TextInput, View, type TextInputProps } from "react-native";

type AuthFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
} & Pick<
  TextInputProps,
  | "placeholder"
  | "secureTextEntry"
  | "keyboardType"
  | "autoCapitalize"
  | "autoComplete"
  | "textContentType"
>;

export default function AuthField({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoComplete,
  textContentType,
}: AuthFieldProps) {
  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>
      <TextInput
        className={clsx("auth-input", "p-3", error && "auth-input-error")}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        textContentType={textContentType}
      />
      {error ? <Text className="auth-error">{error}</Text> : null}
    </View>
  );
}
