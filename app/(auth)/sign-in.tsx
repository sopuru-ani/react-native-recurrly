import AuthBrandBlock from "@/components/auth/AuthBrandBlock";
import AuthField from "@/components/auth/AuthField";
import { finalizeAndNavigate, isValidEmail } from "@/lib/auth";
import { useAuth, useSignIn } from "@clerk/expo";
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

export default function SignIn() {
  const { isLoaded } = useAuth();
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [mfaMessage, setMfaMessage] = useState<string>();

  const isSubmitting = fetchStatus === "fetching";
  const canSubmit =
    isLoaded &&
    emailAddress.trim().length > 0 &&
    password.length > 0 &&
    isValidEmail(emailAddress) &&
    !isSubmitting;

  const handleSubmit = async () => {
    if (!isLoaded) return;

    setEmailError(undefined);
    setMfaMessage(undefined);

    if (!isValidEmail(emailAddress)) {
      setEmailError("Enter a valid email address");
      return;
    }

    const { error } = await signIn.password({
      emailAddress: emailAddress.trim(),
      password,
    });

    if (error) {
      return;
    }

    if (signIn.status === "complete") {
      await finalizeAndNavigate(signIn, router);
    } else if (signIn.status === "needs_second_factor") {
      setMfaMessage(
        "Additional verification is required on this account. Please contact support to continue.",
      );
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );

      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;

    await signIn.mfa.verifyEmailCode({ code });

    if (signIn.status === "complete") {
      await finalizeAndNavigate(signIn, router);
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

  if (signIn.status === "needs_client_trust") {
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
                title="Verify it's you"
                subtitle="Enter the code we sent to your email"
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
                      <Text className="auth-button-text">Verify</Text>
                    )}
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => {
                      if (!isLoaded) return;
                      void signIn.mfa.sendEmailCode();
                    }}
                    disabled={isSubmitting}
                  >
                    <Text className="auth-secondary-button-text">
                      Send a new code
                    </Text>
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => {
                      if (!isLoaded) return;
                      void signIn.reset();
                    }}
                    disabled={isSubmitting}
                  >
                    <Text className="auth-secondary-button-text">
                      Start over
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
              title="Welcome back"
              subtitle="Sign in to continue managing your subscriptions"
            />

            <View className="auth-card">
              <View className="auth-form">
                <AuthField
                  label="Email"
                  value={emailAddress}
                  onChangeText={(value) => {
                    setEmailAddress(value);
                    if (emailError) setEmailError(undefined);
                  }}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  error={
                    emailError ?? errors.fields.identifier?.message
                  }
                />

                <AuthField
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry
                  autoComplete="password"
                  textContentType="password"
                  error={errors.fields.password?.message}
                />

                {mfaMessage ? (
                  <Text className="auth-error">{mfaMessage}</Text>
                ) : null}

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
                    <Text className="auth-button-text">Sign in</Text>
                  )}
                </Pressable>
              </View>
            </View>

            <View className="auth-link-row">
              <Text className="auth-link-copy">New to Recurrly?</Text>
              <Link href="/(auth)/sign-up" className="auth-link">
                Create an account
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
