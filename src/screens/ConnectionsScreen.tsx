import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useProxyStore } from "../state/proxyStore";
import { Connection, Conversation } from "../types/proxy";
import { cn } from "../utils/cn";

type ConnectionsScreenNavProp = NativeStackNavigationProp<RootStackParamList>;

function ConnectionCard({
  connection,
  index,
  onPress,
  conversation,
}: {
  connection: Connection;
  index: number;
  onPress: () => void;
  conversation?: Conversation;
}) {
  const statusColors = {
    pending: { bg: "bg-amber-100", text: "text-amber-600", label: "Pending" },
    accepted: { bg: "bg-green-100", text: "text-green-600", label: "Connected" },
    declined: { bg: "bg-gray-100", text: "text-gray-500", label: "Declined" },
  };

  const status = statusColors[connection.status];
  const unreadCount = conversation?.unreadCount || 0;
  const lastMessage = conversation?.lastMessage;

  return (
    <Animated.View entering={FadeInDown.duration(500).delay(index * 80)}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        className="bg-white rounded-3xl p-4 mb-3 active:opacity-90"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center">
          <View className="relative">
            <Image
              source={{ uri: connection.user.photoUrl }}
              style={{ width: 56, height: 56, borderRadius: 28 }}
              contentFit="cover"
            />
            {unreadCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-[#FF6B6B] rounded-full min-w-[20px] h-5 items-center justify-center px-1">
                <Text className="text-white text-xs font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-1 ml-4">
            <Text className="text-[#2D2D2D] text-lg font-semibold">
              {connection.user.name}, {connection.user.age}
            </Text>
            {connection.status === "accepted" && lastMessage ? (
              <Text
                className={cn(
                  "text-sm mt-0.5",
                  unreadCount > 0 ? "text-[#2D2D2D] font-medium" : "text-gray-500"
                )}
                numberOfLines={1}
              >
                {lastMessage.text}
              </Text>
            ) : connection.location ? (
              <View className="flex-row items-center mt-0.5">
                <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                <Text className="text-gray-500 text-sm ml-1" numberOfLines={1}>
                  {connection.location.name}, {connection.location.city}
                </Text>
              </View>
            ) : (
              <Text className="text-gray-500 text-sm" numberOfLines={1}>
                {connection.user.bio}
              </Text>
            )}
          </View>

          {connection.status === "accepted" ? (
            <View className="items-center">
              <View className="w-10 h-10 rounded-full bg-[#FF6B6B]/10 items-center justify-center">
                <Ionicons name="chatbubble" size={18} color="#FF6B6B" />
              </View>
            </View>
          ) : (
            <View className={cn("rounded-full px-3 py-1", status.bg)}>
              <Text className={cn("text-sm font-medium", status.text)}>
                {status.label}
              </Text>
            </View>
          )}
        </View>

        {connection.status === "accepted" && (
          <View className="flex-row mt-4 pt-4 border-t border-gray-100">
            {connection.user.socials.instagram && (
              <View className="flex-row items-center mr-4">
                <Ionicons name="logo-instagram" size={16} color="#E1306C" />
                <Text className="text-gray-600 text-sm ml-1">
                  @{connection.user.socials.instagram}
                </Text>
              </View>
            )}
            {connection.user.socials.twitter && (
              <View className="flex-row items-center mr-4">
                <Ionicons name="logo-twitter" size={16} color="#1DA1F2" />
                <Text className="text-gray-600 text-sm ml-1">
                  @{connection.user.socials.twitter}
                </Text>
              </View>
            )}
            {connection.user.socials.snapchat && (
              <View className="flex-row items-center">
                <Ionicons name="logo-snapchat" size={16} color="#FFFC00" />
                <Text className="text-gray-600 text-sm ml-1">
                  {connection.user.socials.snapchat}
                </Text>
              </View>
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function ConnectionsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ConnectionsScreenNavProp>();
  const connections = useProxyStore((s) => s.connections);
  const conversations = useProxyStore((s) => s.conversations);

  const acceptedConnections = connections.filter((c) => c.status === "accepted");
  const pendingConnections = connections.filter((c) => c.status === "pending");
  const declinedConnections = connections.filter((c) => c.status === "declined");

  return (
    <View className="flex-1 bg-[#FFF9F5]">
      <View style={{ paddingTop: insets.top }} className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <Text className="text-[#2D2D2D] text-3xl font-bold">Connections</Text>
          <Text className="text-gray-500 text-base mt-1">
            Your interests and matches
          </Text>
        </View>

        {connections.length === 0 ? (
          <Animated.View
            entering={FadeIn.duration(400)}
            className="flex-1 items-center justify-center px-6"
          >
            <View className="w-24 h-24 rounded-full bg-[#FFB4A2]/30 items-center justify-center mb-4">
              <Ionicons name="heart-outline" size={48} color="#FF8E72" />
            </View>
            <Text className="text-[#2D2D2D] text-xl font-semibold text-center">
              No connections yet
            </Text>
            <Text className="text-gray-500 text-base text-center mt-2">
              Send an interest to someone nearby{"\n"}to start connecting
            </Text>
          </Animated.View>
        ) : (
          <ScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
          >
            {/* Accepted */}
            {acceptedConnections.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="chatbubbles" size={20} color="#FF6B6B" />
                  <Text className="text-[#2D2D2D] font-semibold ml-2">
                    Messages ({acceptedConnections.length})
                  </Text>
                </View>
                {acceptedConnections.map((conn, index) => (
                  <ConnectionCard
                    key={conn.id}
                    connection={conn}
                    index={index}
                    conversation={conversations[conn.id]}
                    onPress={() =>
                      navigation.navigate("Chat", { connectionId: conn.id })
                    }
                  />
                ))}
              </View>
            )}

            {/* Pending */}
            {pendingConnections.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="time" size={20} color="#F59E0B" />
                  <Text className="text-[#2D2D2D] font-semibold ml-2">
                    Pending ({pendingConnections.length})
                  </Text>
                </View>
                {pendingConnections.map((conn, index) => (
                  <ConnectionCard
                    key={conn.id}
                    connection={conn}
                    index={index}
                    onPress={() =>
                      navigation.navigate("UserDetail", { userId: conn.user.id })
                    }
                  />
                ))}
              </View>
            )}

            {/* Declined */}
            {declinedConnections.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                  <Text className="text-[#2D2D2D] font-semibold ml-2">
                    Not interested ({declinedConnections.length})
                  </Text>
                </View>
                {declinedConnections.map((conn, index) => (
                  <ConnectionCard
                    key={conn.id}
                    connection={conn}
                    index={index}
                    onPress={() =>
                      navigation.navigate("UserDetail", { userId: conn.user.id })
                    }
                  />
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
