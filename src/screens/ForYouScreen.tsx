import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Dimensions,
  FlatList,
  ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
  SlideInRight,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useProxyStore } from "../state/proxyStore";
import { NearbyUser } from "../types/proxy";
import { cn } from "../utils/cn";

type ForYouNavProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface UserCardProps {
  user: NearbyUser;
  isActive: boolean;
  onSendInterest: () => void;
  hasSentInterest: boolean;
  connectionStatus?: string;
}

function UserCard({ user, isActive, onSendInterest, hasSentInterest, connectionStatus }: UserCardProps) {
  const insets = useSafeAreaInsets();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const heartScale = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  const photos = user.photos && user.photos.length > 0 ? user.photos : [user.photoUrl];

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartScale.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleNextPhoto = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePrevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const triggerSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleInterestPress = () => {
    if (hasSentInterest || connectionStatus) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    buttonScale.value = withSequence(
      withSpring(0.8),
      withSpring(1.2),
      withSpring(1)
    );

    heartScale.value = withSequence(
      withTiming(1.5, { duration: 300 }),
      withTiming(0, { duration: 300 }, () => {
        runOnJS(triggerSuccess)();
      })
    );

    onSendInterest();
  };

  return (
    <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
      {/* Background Image */}
      <Image
        source={{ uri: photos[currentPhotoIndex] }}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
      />

      {/* Photo navigation zones - tap left/right to switch photos */}
      <View className="absolute inset-0 flex-row">
        <Pressable
          className="flex-1"
          onPress={handlePrevPhoto}
        />
        <Pressable
          className="flex-1"
          onPress={handleNextPhoto}
        />
      </View>

      {/* Photo indicators at top */}
      {photos.length > 1 && (
        <View
          className="absolute left-0 right-0 flex-row justify-center px-4"
          style={{ top: insets.top + 12 }}
        >
          <View className="flex-row flex-1 gap-1">
            {photos.map((_, index) => (
              <View
                key={index}
                className={cn(
                  "flex-1 h-1 rounded-full",
                  index === currentPhotoIndex ? "bg-white" : "bg-white/40"
                )}
              />
            ))}
          </View>
        </View>
      )}

      {/* Gradient overlays */}
      <LinearGradient
        colors={["rgba(0,0,0,0.4)", "transparent"]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 150,
        }}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 350,
        }}
      />

      {/* Floating Heart Animation */}
      <Animated.View
        style={[
          heartAnimatedStyle,
          {
            position: "absolute",
            top: "40%",
            left: "50%",
            marginLeft: -50,
            marginTop: -50,
          },
        ]}
      >
        <View className="w-24 h-24 rounded-full bg-[#FF6B6B] items-center justify-center">
          <Ionicons name="heart" size={50} color="white" />
        </View>
      </Animated.View>

      {/* Success toast */}
      {showSuccess && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="absolute top-1/3 left-0 right-0 items-center"
        >
          <View className="bg-green-500 rounded-full px-6 py-3 flex-row items-center">
            <Ionicons name="checkmark-circle" size={24} color="white" />
            <Text className="text-white text-lg font-semibold ml-2">
              Interest Sent!
            </Text>
          </View>
        </Animated.View>
      )}

      {/* User info at bottom */}
      <View
        className="absolute left-0 right-0 px-4"
        style={{ bottom: insets.bottom + 100 }}
      >
        <View className="flex-row items-end justify-between">
          {/* User details */}
          <View className="flex-1 mr-4">
            <View className="flex-row items-center mb-2">
              <Text className="text-white text-3xl font-bold">
                {user.name}, {user.age}
              </Text>
              {user.isActive && (
                <View className="ml-2 w-3 h-3 rounded-full bg-green-400" />
              )}
            </View>

            <View className="flex-row items-center mb-3">
              <Ionicons name="location" size={16} color="#FF8E72" />
              <Text className="text-white/90 text-base ml-1">
                {user.distance}m away
              </Text>
              {user.venue && (
                <>
                  <Text className="text-white/60 mx-2">•</Text>
                  <Text className="text-white/80 text-base">{user.venue}</Text>
                </>
              )}
            </View>

            <Text
              className="text-white/90 text-base leading-5"
              numberOfLines={2}
            >
              {user.bio}
            </Text>
          </View>

          {/* Action buttons on right side */}
          <Animated.View
            entering={SlideInRight.duration(400).delay(200)}
            className="items-center"
          >
            {/* Send Interest Button */}
            <Animated.View style={buttonAnimatedStyle}>
              <Pressable
                onPress={handleInterestPress}
                disabled={hasSentInterest || !!connectionStatus}
                className={cn(
                  "w-14 h-14 rounded-full items-center justify-center mb-4",
                  connectionStatus === "accepted"
                    ? "bg-green-500"
                    : connectionStatus === "pending"
                    ? "bg-amber-400"
                    : connectionStatus === "declined"
                    ? "bg-gray-400"
                    : hasSentInterest
                    ? "bg-gray-400"
                    : "bg-[#FF6B6B]"
                )}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Ionicons
                  name={
                    connectionStatus === "accepted"
                      ? "checkmark"
                      : connectionStatus === "pending"
                      ? "time"
                      : "heart"
                  }
                  size={28}
                  color="white"
                />
              </Pressable>
            </Animated.View>

            {/* Status label */}
            {connectionStatus && (
              <Text className="text-white/80 text-xs text-center">
                {connectionStatus === "accepted"
                  ? "Connected"
                  : connectionStatus === "pending"
                  ? "Pending"
                  : "Declined"}
              </Text>
            )}
          </Animated.View>
        </View>
      </View>

      {/* Swipe hint */}
      {isActive && (
        <View
          className="absolute left-0 right-0 items-center"
          style={{ bottom: insets.bottom + 60 }}
        >
          <View className="flex-row items-center">
            <Ionicons name="chevron-up" size={20} color="white" />
            <Text className="text-white/60 text-sm ml-1">Swipe up for next</Text>
          </View>
        </View>
      )}
    </View>
  );
}

export default function ForYouScreen() {
  const navigation = useNavigation<ForYouNavProp>();
  const insets = useSafeAreaInsets();

  const nearbyUsers = useProxyStore((s) => s.nearbyUsers);
  const connections = useProxyStore((s) => s.connections);
  const sendInterest = useProxyStore((s) => s.sendInterest);

  const [activeIndex, setActiveIndex] = useState(0);

  // Shuffle users for algorithmic feed effect
  const shuffledUsers = useRef(
    [...nearbyUsers].sort(() => Math.random() - 0.5)
  ).current;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  const getConnectionStatus = (userId: string) => {
    const connection = connections.find((c) => c.user.id === userId);
    return connection?.status;
  };

  const hasInterest = (userId: string) => {
    return connections.some((c) => c.user.id === userId);
  };

  const handleSendInterest = (userId: string) => {
    sendInterest(userId);
  };

  return (
    <View className="flex-1 bg-black">
      <FlatList
        data={shuffledUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <UserCard
            user={item}
            isActive={index === activeIndex}
            onSendInterest={() => handleSendInterest(item.id)}
            hasSentInterest={hasInterest(item.id)}
            connectionStatus={getConnectionStatus(item.id)}
          />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
      />

      {/* Header */}
      <View
        className="absolute left-0 right-0 flex-row justify-center"
        style={{ top: insets.top + 16 }}
      >
        <Text className="text-white text-lg font-semibold">For You</Text>
      </View>
    </View>
  );
}
