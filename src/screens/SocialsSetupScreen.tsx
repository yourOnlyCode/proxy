import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useProxyStore } from "../state/proxyStore";
import { SocialLinks } from "../types/proxy";

type SocialsSetupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "SocialsSetup">;
};

interface SocialInputProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  color: string;
  delay: number;
}

function SocialInput({
  icon,
  label,
  placeholder,
  value,
  onChangeText,
  color,
  delay,
}: SocialInputProps) {
  return (
    <Animated.View
      entering={FadeInUp.duration(500).delay(delay)}
      className="mb-4"
    >
      <View className="flex-row items-center mb-2">
        <View
          style={{ backgroundColor: color }}
          className="w-8 h-8 rounded-lg items-center justify-center mr-2"
        >
          <Ionicons name={icon} size={18} color="white" />
        </View>
        <Text className="text-[#2D2D2D] font-medium">{label}</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        autoCorrect={false}
        className="bg-white rounded-2xl px-4 py-4 text-[#2D2D2D] text-base"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      />
    </Animated.View>
  );
}

export default function SocialsSetupScreen({
  navigation,
}: SocialsSetupScreenProps) {
  const insets = useSafeAreaInsets();
  const updateSocials = useProxyStore((s) => s.updateSocials);
  const completeOnboarding = useProxyStore((s) => s.completeOnboarding);

  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [snapchat, setSnapchat] = useState("");
  const [tiktok, setTiktok] = useState("");

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const socials: SocialLinks = {};
    if (instagram.trim()) socials.instagram = instagram.trim();
    if (twitter.trim()) socials.twitter = twitter.trim();
    if (snapchat.trim()) socials.snapchat = snapchat.trim();
    if (tiktok.trim()) socials.tiktok = tiktok.trim();

    updateSocials(socials);
    completeOnboarding();
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    completeOnboarding();
  };

  return (
    <View className="flex-1 bg-[#FFF9F5]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 20,
          }}
          className="flex-1 px-6"
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(600)}>
            <Text className="text-[#2D2D2D] text-3xl font-bold">
              Link your socials
            </Text>
            <Text className="text-gray-500 text-base mt-2">
              Let connections find you elsewhere (optional)
            </Text>
          </Animated.View>

          {/* Social Inputs */}
          <View className="mt-8">
            <SocialInput
              icon="logo-instagram"
              label="Instagram"
              placeholder="@yourusername"
              value={instagram}
              onChangeText={setInstagram}
              color="#E1306C"
              delay={200}
            />

            <SocialInput
              icon="logo-twitter"
              label="X (Twitter)"
              placeholder="@yourusername"
              value={twitter}
              onChangeText={setTwitter}
              color="#1DA1F2"
              delay={300}
            />

            <SocialInput
              icon="logo-snapchat"
              label="Snapchat"
              placeholder="yourusername"
              value={snapchat}
              onChangeText={setSnapchat}
              color="#FFFC00"
              delay={400}
            />

            <SocialInput
              icon="logo-tiktok"
              label="TikTok"
              placeholder="@yourusername"
              value={tiktok}
              onChangeText={setTiktok}
              color="#000000"
              delay={500}
            />
          </View>

          {/* Info Box */}
          <Animated.View
            entering={FadeInUp.duration(500).delay(600)}
            className="bg-[#FF6B6B]/10 rounded-2xl p-4 mt-6"
          >
            <View className="flex-row items-start">
              <Ionicons
                name="information-circle"
                size={24}
                color="#FF6B6B"
                style={{ marginRight: 12 }}
              />
              <Text className="text-[#2D2D2D] text-sm flex-1">
                Your linked socials will only be shared with people you connect
                with. You can always update these later in settings.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Buttons */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(700)}
          style={{ paddingBottom: insets.bottom + 16 }}
          className="px-6"
        >
          <Pressable
            onPress={handleComplete}
            className="bg-[#FF6B6B] rounded-full py-4 items-center active:bg-[#FF5252]"
          >
            <Text className="text-white text-lg font-semibold">
              Complete Setup
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSkip}
            className="py-4 items-center active:opacity-70"
          >
            <Text className="text-gray-500 text-base">Skip for now</Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}
