import React from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useProxyStore } from "../state/proxyStore";

function SocialLink({
  icon,
  label,
  username,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  username: string;
  color: string;
}) {
  return (
    <Pressable
      className="bg-white rounded-2xl p-4 flex-row items-center active:opacity-90"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View
        style={{ backgroundColor: color }}
        className="w-10 h-10 rounded-xl items-center justify-center"
      >
        <Ionicons name={icon} size={20} color="white" />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-gray-500 text-xs">{label}</Text>
        <Text className="text-[#2D2D2D] font-medium">@{username}</Text>
      </View>
      <Ionicons name="open-outline" size={20} color="#9CA3AF" />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const currentUser = useProxyStore((s) => s.currentUser);
  const isProxyActive = useProxyStore((s) => s.isProxyActive);
  const connections = useProxyStore((s) => s.connections);
  const reset = useProxyStore((s) => s.reset);

  const acceptedCount = connections.filter((c) => c.status === "accepted").length;

  const handleLogout = () => {
    Alert.alert(
      "Reset Profile",
      "This will reset your profile and all data. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            reset();
          },
        },
      ]
    );
  };

  if (!currentUser) {
    return (
      <View className="flex-1 bg-[#FFF9F5] items-center justify-center">
        <Text className="text-gray-500">No profile found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FFF9F5]">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <Animated.View entering={FadeIn.duration(600)}>
          <LinearGradient
            colors={["#FF6B6B", "#FF8E72", "#FFB4A2"]}
            style={{ paddingTop: 24, paddingBottom: 60, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
          >
            <View className="items-center px-6">
              <View className="relative">
                <Image
                  source={{ uri: currentUser.photoUrl }}
                  style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: "white" }}
                  contentFit="cover"
                />
                {isProxyActive && (
                  <View className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-400 border-3 border-white items-center justify-center">
                    <Ionicons name="radio" size={14} color="white" />
                  </View>
                )}
              </View>

              <Text className="text-white text-2xl font-bold mt-4">
                {currentUser.name}, {currentUser.age}
              </Text>
              <Text className="text-white/80 text-base text-center mt-1 px-8">
                {currentUser.bio}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(200)}
          className="mx-6 -mt-10"
        >
          <View
            className="bg-white rounded-3xl p-5 flex-row"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="flex-1 items-center">
              <Text className="text-[#FF6B6B] text-2xl font-bold">
                {acceptedCount}
              </Text>
              <Text className="text-gray-500 text-sm">Connections</Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="flex-1 items-center">
              <Text className="text-[#FF6B6B] text-2xl font-bold">
                {connections.length}
              </Text>
              <Text className="text-gray-500 text-sm">Interests Sent</Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="flex-1 items-center">
              <View className="flex-row items-center">
                <View
                  className={`w-3 h-3 rounded-full ${isProxyActive ? "bg-green-400" : "bg-gray-400"} mr-1`}
                />
                <Text className="text-[#2D2D2D] text-sm font-medium">
                  {isProxyActive ? "Active" : "Off"}
                </Text>
              </View>
              <Text className="text-gray-500 text-sm">Status</Text>
            </View>
          </View>
        </Animated.View>

        {/* Linked Socials */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(400)}
          className="px-6 mt-8"
        >
          <Text className="text-[#2D2D2D] text-lg font-semibold mb-4">
            Linked Socials
          </Text>

          <View className="space-y-3">
            {currentUser.socials.instagram && (
              <View className="mb-3">
                <SocialLink
                  icon="logo-instagram"
                  label="Instagram"
                  username={currentUser.socials.instagram}
                  color="#E1306C"
                />
              </View>
            )}
            {currentUser.socials.twitter && (
              <View className="mb-3">
                <SocialLink
                  icon="logo-twitter"
                  label="X (Twitter)"
                  username={currentUser.socials.twitter}
                  color="#1DA1F2"
                />
              </View>
            )}
            {currentUser.socials.snapchat && (
              <View className="mb-3">
                <SocialLink
                  icon="logo-snapchat"
                  label="Snapchat"
                  username={currentUser.socials.snapchat}
                  color="#FFFC00"
                />
              </View>
            )}
            {currentUser.socials.tiktok && (
              <View className="mb-3">
                <SocialLink
                  icon="logo-tiktok"
                  label="TikTok"
                  username={currentUser.socials.tiktok}
                  color="#000000"
                />
              </View>
            )}

            {!currentUser.socials.instagram &&
              !currentUser.socials.twitter &&
              !currentUser.socials.snapchat &&
              !currentUser.socials.tiktok && (
                <View className="bg-gray-100 rounded-2xl p-6 items-center">
                  <Ionicons name="link-outline" size={32} color="#9CA3AF" />
                  <Text className="text-gray-500 text-center mt-2">
                    No socials linked yet
                  </Text>
                </View>
              )}
          </View>
        </Animated.View>

        {/* Settings */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(600)}
          className="px-6 mt-8"
        >
          <Text className="text-[#2D2D2D] text-lg font-semibold mb-4">
            Settings
          </Text>

          <Pressable
            onPress={handleLogout}
            className="bg-white rounded-2xl p-4 flex-row items-center active:opacity-90"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View className="w-10 h-10 rounded-xl bg-red-100 items-center justify-center">
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <Text className="text-red-500 font-medium ml-3 flex-1">
              Reset Profile
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
