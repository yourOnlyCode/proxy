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
import { CrossedPath } from "../types/proxy";
import { formatDistanceToNow } from "date-fns";

type HistoryScreenNavProp = NativeStackNavigationProp<RootStackParamList>;

function HistoryCard({
  path,
  index,
  onPress,
}: {
  path: CrossedPath;
  index: number;
  onPress: () => void;
}) {
  const timeAgo = formatDistanceToNow(new Date(path.timestamp), {
    addSuffix: true,
  });

  return (
    <Animated.View entering={FadeInDown.duration(500).delay(index * 80)}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        className="bg-white rounded-3xl p-4 mb-3 flex-row items-center active:opacity-90"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <Image
          source={{ uri: path.user.photoUrl }}
          style={{ width: 56, height: 56, borderRadius: 28 }}
          contentFit="cover"
        />

        <View className="flex-1 ml-4">
          <Text className="text-[#2D2D2D] text-lg font-semibold">
            {path.user.name}, {path.user.age}
          </Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="time-outline" size={14} color="#9CA3AF" />
            <Text className="text-gray-500 text-sm ml-1">{timeAgo}</Text>
            <View className="mx-2 w-1 h-1 rounded-full bg-gray-400" />
            <Ionicons name="location-outline" size={14} color="#9CA3AF" />
            <Text className="text-gray-500 text-sm ml-1">{path.distance}m</Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
      </Pressable>
    </Animated.View>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<HistoryScreenNavProp>();
  const crossedPaths = useProxyStore((s) => s.crossedPaths);
  const clearHistory = useProxyStore((s) => s.clearHistory);

  const handleClearHistory = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    clearHistory();
  };

  return (
    <View className="flex-1 bg-[#FFF9F5]">
      <View style={{ paddingTop: insets.top }} className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
          <View>
            <Text className="text-[#2D2D2D] text-3xl font-bold">History</Text>
            <Text className="text-gray-500 text-base mt-1">
              People you crossed paths with
            </Text>
          </View>

          {crossedPaths.length > 0 && (
            <Pressable
              onPress={handleClearHistory}
              className="p-2 active:opacity-70"
            >
              <Ionicons name="trash-outline" size={24} color="#9CA3AF" />
            </Pressable>
          )}
        </View>

        {crossedPaths.length === 0 ? (
          <Animated.View
            entering={FadeIn.duration(400)}
            className="flex-1 items-center justify-center px-6"
          >
            <View className="w-24 h-24 rounded-full bg-[#FFB4A2]/30 items-center justify-center mb-4">
              <Ionicons name="footsteps-outline" size={48} color="#FF8E72" />
            </View>
            <Text className="text-[#2D2D2D] text-xl font-semibold text-center">
              No crossed paths yet
            </Text>
            <Text className="text-gray-500 text-base text-center mt-2">
              When you come across other Proxy{"\n"}users, they will appear here
            </Text>
          </Animated.View>
        ) : (
          <ScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
          >
            <View className="flex-row items-center mb-4">
              <Ionicons name="footsteps" size={18} color="#FF8E72" />
              <Text className="text-gray-500 text-sm ml-2">
                {crossedPaths.length} people crossed your path
              </Text>
            </View>

            {crossedPaths.map((path, index) => (
              <HistoryCard
                key={path.id}
                path={path}
                index={index}
                onPress={() =>
                  navigation.navigate("UserDetail", { userId: path.user.id })
                }
              />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
