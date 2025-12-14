import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { signIn, signUp } from "../api/supabase";
import { useProxyStore } from "../state/proxyStore";

type AuthScreenNavProp = NativeStackNavigationProp<RootStackParamList>;

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AuthScreenNavProp>();
  const setAuthUser = useProxyStore((s) => s.setAuthUser);

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async () => {
    setError(null);

    // Validation
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await signUp(email.trim(), password);
        if (signUpError) {
          setError(signUpError.message);
          return;
        }
        if (data?.user) {
          setAuthUser({ id: data.user.id, email: data.user.email });
          // If no session (email confirmation required), show message
          if (!data.session) {
            setError("Check your email to confirm your account, then log in.");
            setMode("login");
            return;
          }
        }
      } else {
        const { data, error: signInError } = await signIn(email.trim(), password);
        if (signInError) {
          setError(signInError.message);
          return;
        }
        if (data?.user) {
          setAuthUser({ id: data.user.id, email: data.user.email });
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(mode === "login" ? "signup" : "login");
    setError(null);
    setConfirmPassword("");
  };

  return (
    <View className="flex-1 bg-[#FFF9F5]">
      <LinearGradient
        colors={["#FF6B6B", "#FF8E72", "#FFB4A2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 280,
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View style={{ paddingTop: insets.top }} className="flex-1 px-6">
          {/* Header */}
          <Animated.View
            entering={FadeIn.duration(600)}
            className="items-center mt-8 mb-6"
          >
            <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center mb-4">
              <Ionicons name="radio" size={40} color="white" />
            </View>
            <Text className="text-white text-3xl font-bold">Proxy</Text>
            <Text className="text-white/80 text-base mt-1">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(200)}
            className="bg-white rounded-3xl p-6 mt-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-gray-600 text-sm font-medium mb-2">Email</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-[#2D2D2D] text-base"
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-gray-600 text-sm font-medium mb-2">Password</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-[#2D2D2D] text-base"
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#9CA3AF"
                  />
                </Pressable>
              </View>
            </View>

            {/* Confirm Password (Signup only) */}
            {mode === "signup" && (
              <Animated.View entering={FadeIn.duration(300)} className="mb-4">
                <Text className="text-gray-600 text-sm font-medium mb-2">
                  Confirm Password
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                  <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-[#2D2D2D] text-base"
                    placeholder="Confirm your password"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
                  />
                </View>
              </Animated.View>
            )}

            {/* Error Message */}
            {error && (
              <Animated.View
                entering={FadeIn.duration(200)}
                className="bg-red-50 rounded-xl p-3 mb-4"
              >
                <Text className="text-red-600 text-sm text-center">{error}</Text>
              </Animated.View>
            )}

            {/* Submit Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              className="mt-2 active:opacity-90"
            >
              <LinearGradient
                colors={["#FF6B6B", "#FF8E72"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 16,
                  paddingVertical: 16,
                  alignItems: "center",
                }}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-lg font-semibold">
                    {mode === "login" ? "Log In" : "Sign Up"}
                  </Text>
                )}
              </LinearGradient>
            </Pressable>

            {/* Toggle Mode */}
            <Pressable onPress={toggleMode} className="mt-5 py-2">
              <Text className="text-gray-500 text-center">
                {mode === "login" ? (
                  <>
                    {"Don't have an account? "}
                    <Text className="text-[#FF6B6B] font-semibold">Sign Up</Text>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <Text className="text-[#FF6B6B] font-semibold">Log In</Text>
                  </>
                )}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
