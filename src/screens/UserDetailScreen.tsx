import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useProxyStore } from "../state/proxyStore";
import { NearbyUser } from "../types/proxy";
import { cn } from "../utils/cn";

type UserDetailRouteProp = RouteProp<RootStackParamList, "UserDetail">;
type UserDetailNavProp = NativeStackNavigationProp<RootStackParamList, "UserDetail">;

function SocialBadge({
  icon,
  username,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  username: string;
  color: string;
}) {
  return (
    <View
      className="flex-row items-center bg-white rounded-full px-4 py-2 mr-2 mb-2"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <Ionicons name={icon} size={18} color={color} />
      <Text className="text-[#2D2D2D] text-sm font-medium ml-2">
        @{username}
      </Text>
    </View>
  );
}

export default function UserDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<UserDetailNavProp>();
  const route = useRoute<UserDetailRouteProp>();
  const { userId } = route.params;

  const nearbyUsers = useProxyStore((s) => s.nearbyUsers);
  const connections = useProxyStore((s) => s.connections);
  const sendInterest = useProxyStore((s) => s.sendInterest);

  const [hasSentInterest, setHasSentInterest] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const buttonScale = useSharedValue(1);
  const heartScale = useSharedValue(0);

  // Find the user
  const user = nearbyUsers.find((u) => u.id === userId);
  const existingConnection = connections.find((c) => c.user.id === userId);

  useEffect(() => {
    if (existingConnection) {
      setHasSentInterest(true);
    }
  }, [existingConnection]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartScale.value,
  }));

  const triggerSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleSendInterest = () => {
    if (hasSentInterest || !user) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    buttonScale.value = withSequence(
      withSpring(0.9),
      withSpring(1.1),
      withSpring(1)
    );

    heartScale.value = withSequence(
      withTiming(1.5, { duration: 300 }),
      withTiming(0, { duration: 300 }, () => {
        runOnJS(triggerSuccess)();
      })
    );

    setHasSentInterest(true);
    sendInterest(userId);
  };

  if (!user) {
    return (
      <View className="flex-1 bg-[#FFF9F5] items-center justify-center">
        <Text className="text-gray-500">User not found</Text>
      </View>
    );
  }

  const connectionStatus = existingConnection?.status;

  return (
    <View className="flex-1 bg-[#FFF9F5]">
      {/* Close Button */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="absolute top-0 right-0 z-10 px-4"
      >
        <Pressable
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-black/20 items-center justify-center active:opacity-70"
        >
          <Ionicons name="close" size={24} color="white" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Image */}
        <Animated.View entering={FadeIn.duration(400)}>
          <Image
            source={{ uri: user.photoUrl }}
            style={{ width: "100%", height: 400 }}
            contentFit="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)"]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 150,
              justifyContent: "flex-end",
              padding: 20,
            }}
          >
            <Text className="text-white text-3xl font-bold">
              {user.name}, {user.age}
            </Text>
            <View className="flex-row items-center mt-2">
              <Ionicons name="location" size={16} color="#FF8E72" />
              <Text className="text-white/90 text-base ml-1">
                {user.distance}m away
              </Text>
              {user.isActive && (
                <>
                  <View className="mx-2 w-1 h-1 rounded-full bg-white/60" />
                  <View className="w-2 h-2 rounded-full bg-green-400 mr-1" />
                  <Text className="text-white/90 text-base">Active now</Text>
                </>
              )}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Bio */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(200)}
          className="px-6 mt-6"
        >
          <Text className="text-[#2D2D2D] text-lg font-semibold mb-2">
            About
          </Text>
          <Text className="text-gray-600 text-base leading-6">{user.bio}</Text>
        </Animated.View>

        {/* Met At Location - Show if connection exists with location */}
        {existingConnection?.location && (
          <Animated.View
            entering={FadeInUp.duration(500).delay(300)}
            className="px-6 mt-6"
          >
            <Text className="text-[#2D2D2D] text-lg font-semibold mb-2">
              Met at
            </Text>
            <View className="bg-[#FF6B6B]/10 rounded-2xl p-4 flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-[#FF6B6B]/20 items-center justify-center">
                <Ionicons name="location" size={20} color="#FF6B6B" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-[#2D2D2D] font-medium">
                  {existingConnection.location.name}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {existingConnection.location.neighborhood
                    ? `${existingConnection.location.neighborhood}, ${existingConnection.location.city}`
                    : existingConnection.location.city}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Socials - Only show if connected */}
        {connectionStatus === "accepted" &&
          (user.socials.instagram ||
            user.socials.twitter ||
            user.socials.snapchat ||
            user.socials.tiktok) && (
            <Animated.View
              entering={FadeInUp.duration(500).delay(400)}
              className="px-6 mt-6"
            >
              <Text className="text-[#2D2D2D] text-lg font-semibold mb-3">
                Socials
              </Text>
              <View className="flex-row flex-wrap">
                {user.socials.instagram && (
                  <SocialBadge
                    icon="logo-instagram"
                    username={user.socials.instagram}
                    color="#E1306C"
                  />
                )}
                {user.socials.twitter && (
                  <SocialBadge
                    icon="logo-twitter"
                    username={user.socials.twitter}
                    color="#1DA1F2"
                  />
                )}
                {user.socials.snapchat && (
                  <SocialBadge
                    icon="logo-snapchat"
                    username={user.socials.snapchat}
                    color="#FFFC00"
                  />
                )}
                {user.socials.tiktok && (
                  <SocialBadge
                    icon="logo-tiktok"
                    username={user.socials.tiktok}
                    color="#000000"
                  />
                )}
              </View>
            </Animated.View>
          )}

        {/* Locked Socials Indicator - Show when not connected */}
        {connectionStatus !== "accepted" &&
          (user.socials.instagram ||
            user.socials.twitter ||
            user.socials.snapchat ||
            user.socials.tiktok) && (
            <Animated.View
              entering={FadeInUp.duration(500).delay(400)}
              className="px-6 mt-6"
            >
              <View className="bg-gray-100 rounded-2xl p-4 flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
                  <Ionicons name="lock-closed" size={20} color="#9CA3AF" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-[#2D2D2D] font-medium">Socials Hidden</Text>
                  <Text className="text-gray-500 text-sm">
                    Connect to see their social profiles
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}

        {/* Connection Status */}
        {connectionStatus && connectionStatus !== "pending" && (
          <Animated.View
            entering={FadeInUp.duration(500).delay(600)}
            className="px-6 mt-6"
          >
            <View
              className={cn(
                "rounded-2xl p-4 flex-row items-center",
                connectionStatus === "accepted"
                  ? "bg-green-100"
                  : "bg-gray-100"
              )}
            >
              <Ionicons
                name={
                  connectionStatus === "accepted"
                    ? "checkmark-circle"
                    : "close-circle"
                }
                size={24}
                color={connectionStatus === "accepted" ? "#22C55E" : "#9CA3AF"}
              />
              <Text
                className={cn(
                  "text-base font-medium ml-3",
                  connectionStatus === "accepted"
                    ? "text-green-700"
                    : "text-gray-600"
                )}
              >
                {connectionStatus === "accepted"
                  ? "You are connected! Check their socials above."
                  : "They are not interested at the moment."}
              </Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Floating Heart Animation */}
      <Animated.View
        style={[
          heartAnimatedStyle,
          {
            position: "absolute",
            top: "40%",
            left: "50%",
            marginLeft: -40,
            marginTop: -40,
          },
        ]}
      >
        <View className="w-20 h-20 rounded-full bg-[#FF6B6B] items-center justify-center">
          <Ionicons name="heart" size={40} color="white" />
        </View>
      </Animated.View>

      {/* Bottom Action */}
      <View
        style={{ paddingBottom: insets.bottom + 16 }}
        className="absolute bottom-0 left-0 right-0 px-6 pt-4 bg-[#FFF9F5]"
      >
        {showSuccess ? (
          <Animated.View
            entering={FadeIn.duration(300)}
            className="bg-green-500 rounded-full py-4 items-center"
          >
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text className="text-white text-lg font-semibold ml-2">
                Interest Sent!
              </Text>
            </View>
          </Animated.View>
        ) : connectionStatus === "accepted" ? (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("Chat", { connectionId: existingConnection!.id });
            }}
            className="bg-[#FF6B6B] rounded-full py-4 items-center active:bg-[#FF5252]"
          >
            <View className="flex-row items-center">
              <Ionicons name="chatbubble" size={24} color="white" />
              <Text className="text-white text-lg font-semibold ml-2">
                Send Message
              </Text>
            </View>
          </Pressable>
        ) : connectionStatus === "declined" ? (
          <View className="bg-gray-300 rounded-full py-4 items-center">
            <Text className="text-gray-600 text-lg font-semibold">
              Not Interested
            </Text>
          </View>
        ) : connectionStatus === "pending" ? (
          <View className="bg-amber-400 rounded-full py-4 items-center">
            <View className="flex-row items-center">
              <Ionicons name="time" size={24} color="white" />
              <Text className="text-white text-lg font-semibold ml-2">
                Waiting for response...
              </Text>
            </View>
          </View>
        ) : (
          <Animated.View style={buttonAnimatedStyle}>
            <Pressable
              onPress={handleSendInterest}
              className="bg-[#FF6B6B] rounded-full py-4 items-center active:bg-[#FF5252]"
            >
              <View className="flex-row items-center">
                <Ionicons name="heart" size={24} color="white" />
                <Text className="text-white text-lg font-semibold ml-2">
                  Send Interest
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </View>
  );
}
