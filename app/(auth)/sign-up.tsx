import AuthBrandBlock from "@/components/auth/AuthBrandBlock";
import AuthField from "@/components/auth/AuthField";
import {
  finalizeAndNavigate,
  isValidEmail,
  isValidPassword,
  passwordsMatch,
} from "@/lib/auth";
import { useAuth, useSignUp } from "@clerk/expo";
import clsx from "clsx";
import { Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function SignUp() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [clientErrors, setClientErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const isSubmitting = fetchStatus === "fetching";

  const isAwaitingVerification =
    isLoaded &&
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  const canSubmit =
    isLoaded &&
    emailAddress.trim().length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    isValidEmail(emailAddress) &&
    isValidPassword(password) &&
    passwordsMatch(password, confirmPassword) &&
    !isSubmitting;

  const validateRegistration = () => {
    const nextErrors: typeof clientErrors = {};

    if (!isValidEmail(emailAddress)) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!isValidPassword(password)) {
      nextErrors.password = "Password must be at least 8 characters";
    }

    if (!passwordsMatch(password, confirmPassword)) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setClientErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!isLoaded) return;

    if (!validateRegistration()) {
      return;
    }

    const { error } = await signUp.password({
      emailAddress: emailAddress.trim(),
      password,
    });

    if (error) {
      return;
    }

    await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    if (!isLoaded) return;

    await signUp.verifications.verifyEmailCode({ code });

    if (signUp.status === "complete") {
      await finalizeAndNavigate(signUp, router);
    }
  };

  if (!isLoaded) {
    return (
      <SafeAreaView className="auth-safe-area">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#081126" />
        </View>
      </SafeAreaView>
    );
  }

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  if (isAwaitingVerification) {
    return (
      <SafeAreaView className="auth-safe-area">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <ScrollView
            className="auth-scroll"
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="grow"
          >
            <View className="auth-content">
              <AuthBrandBlock
                title="Check your email"
                subtitle={`We sent a code to ${emailAddress.trim()}`}
              />

              <View className="auth-card">
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Verification code</Text>
                    <TextInput
                      className={clsx(
                        "auth-input",
                        errors.fields.code && "auth-input-error",
                      )}
                      value={code}
                      onChangeText={setCode}
                      placeholder="Enter your code"
                      placeholderTextColor="rgba(0, 0, 0, 0.6)"
                      keyboardType="number-pad"
                      autoComplete="one-time-code"
                      textContentType="oneTimeCode"
                    />
                    {errors.fields.code ? (
                      <Text className="auth-error">
                        {errors.fields.code.message}
                      </Text>
                    ) : null}
                  </View>

                  <Pressable
                    className={clsx(
                      "auth-button",
                      (!code || isSubmitting) && "auth-button-disabled",
                    )}
                    onPress={handleVerify}
                    disabled={!code || isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#081126" />
                    ) : (
                      <Text className="auth-button-text">Verify email</Text>
                    )}
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => {
                      if (!isLoaded) return;
                      void signUp.verifications.sendEmailCode();
                    }}
                    disabled={isSubmitting}
                  >
                    <Text className="auth-secondary-button-text">
                      Resend code
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="auth-scroll"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="grow"
        >
          <View className="auth-content">
            <AuthBrandBlock
              title="Create your account"
              subtitle="Start tracking your subscriptions in one place"
            />

            <View className="auth-card">
              <View className="auth-form">
                <AuthField
                  label="Email"
                  value={emailAddress}
                  onChangeText={(value) => {
                    setEmailAddress(value);
                    if (clientErrors.email) {
                      setClientErrors((prev) => ({
                        ...prev,
                        email: undefined,
                      }));
                    }
                  }}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  error={
                    clientErrors.email ?? errors.fields.emailAddress?.message
                  }
                />

                <AuthField
                  label="Password"
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    if (clientErrors.password || clientErrors.confirmPassword) {
                      setClientErrors((prev) => ({
                        ...prev,
                        password: undefined,
                        confirmPassword: undefined,
                      }));
                    }
                  }}
                  placeholder="Enter your password"
                  secureTextEntry
                  autoComplete="new-password"
                  textContentType="newPassword"
                  error={
                    clientErrors.password ?? errors.fields.password?.message
                  }
                />

                <AuthField
                  label="Confirm password"
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    if (clientErrors.confirmPassword) {
                      setClientErrors((prev) => ({
                        ...prev,
                        confirmPassword: undefined,
                      }));
                    }
                  }}
                  placeholder="Confirm your password"
                  secureTextEntry
                  autoComplete="new-password"
                  textContentType="newPassword"
                  error={clientErrors.confirmPassword}
                />

                <Pressable
                  className={clsx(
                    "auth-button",
                    !canSubmit && "auth-button-disabled",
                  )}
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Create account</Text>
                  )}
                </Pressable>
              </View>
            </View>

            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account?</Text>
              <Link href="/(auth)/sign-in" className="auth-link">
                Sign in
              </Link>
            </View>

            <View nativeID="clerk-captcha" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
