import React, { useEffect, useState, useMemo } from "react";
import { View, Text, Pressable, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useProxyStore } from "../state/proxyStore";
import { NearbyUser } from "../types/proxy";

type RadarScreenNavProp = NativeStackNavigationProp<RootStackParamList>;

// Same venue threshold in meters (approximately same address/building)
const SAME_VENUE_THRESHOLD = 15;

function NearbyUserCard({
  user,
  index,
  onPress,
}: {
  user: NearbyUser;
  index: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    scale.value = withDelay(
      index * 100,
      withRepeat(
        withSequence(
          withTiming(1.02, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  return (
    <Animated.View
      entering={FadeInDown.duration(500).delay(index * 100)}
      style={animatedStyle}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        className="bg-white rounded-3xl p-4 mb-3 flex-row items-center active:opacity-90"
        style={{
          shadowColor: "#FF6B6B",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <View className="relative">
          <Image
            source={{ uri: user.photoUrl }}
            style={{ width: 60, height: 60, borderRadius: 30 }}
            contentFit="cover"
          />
          <View className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-white" />
        </View>

        <View className="flex-1 ml-4">
          <Text className="text-[#2D2D2D] text-lg font-semibold">
            {user.name}, {user.age}
          </Text>
          <Text className="text-gray-500 text-sm" numberOfLines={1}>
            {user.bio}
          </Text>
        </View>

        <View className="items-end">
          <View className="flex-row items-center bg-[#FF6B6B]/10 rounded-full px-3 py-1">
            <Ionicons name="location" size={14} color="#FF6B6B" />
            <Text className="text-[#FF6B6B] text-sm font-medium ml-1">
              {user.distance}m
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function RadarScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RadarScreenNavProp>();

  const nearbyUsers = useProxyStore((s) => s.nearbyUsers);
  const isProxyActive = useProxyStore((s) => s.isProxyActive);
  const toggleProxyActive = useProxyStore((s) => s.toggleProxyActive);
  const setCurrentLocation = useProxyStore((s) => s.setCurrentLocation);

  const [locationName, setLocationName] = useState<string | null>(null);
  const [venueName, setVenueName] = useState<string | null>(null);

  // Filter users to only show those at the same venue (within threshold)
  const sameVenueUsers = useMemo(() => {
    return nearbyUsers
      .filter((user) => user.distance <= SAME_VENUE_THRESHOLD)
      .sort((a, b) => a.distance - b.distance);
  }, [nearbyUsers]);

  const pulseScale1 = useSharedValue(1);
  const pulseScale2 = useSharedValue(1);
  const pulseScale3 = useSharedValue(1);
  const pulseOpacity1 = useSharedValue(0.3);
  const pulseOpacity2 = useSharedValue(0.2);
  const pulseOpacity3 = useSharedValue(0.1);

  // Fetch location when Proxy is activated
  useEffect(() => {
    const fetchLocation = async () => {
      if (!isProxyActive) return;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setCurrentLocation({
            name: "Unknown Venue",
            city: "Unknown City",
          });
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const [place] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (place) {
          const venue = place.name || place.street || "Unknown Venue";
          const city = place.city || place.region || "Unknown City";
          const neighborhood = place.district || place.subregion || undefined;

          setCurrentLocation({
            name: venue,
            city,
            neighborhood,
          });
          setVenueName(venue);
          setLocationName(neighborhood ? `${venue}, ${neighborhood}` : `${venue}, ${city}`);
        }
      } catch (error) {
        console.log("Location error:", error);
        setCurrentLocation({
          name: "Unknown Venue",
          city: "Unknown City",
        });
      }
    };

    fetchLocation();
  }, [isProxyActive]);

  useEffect(() => {
    if (isProxyActive) {
      pulseScale1.value = withRepeat(
        withTiming(1.5, { duration: 2000 }),
        -1,
        false
      );
      pulseOpacity1.value = withRepeat(
        withTiming(0, { duration: 2000 }),
        -1,
        false
      );

      pulseScale2.value = withDelay(
        700,
        withRepeat(withTiming(1.5, { duration: 2000 }), -1, false)
      );
      pulseOpacity2.value = withDelay(
        700,
        withRepeat(withTiming(0, { duration: 2000 }), -1, false)
      );

      pulseScale3.value = withDelay(
        1400,
        withRepeat(withTiming(1.5, { duration: 2000 }), -1, false)
      );
      pulseOpacity3.value = withDelay(
        1400,
        withRepeat(withTiming(0, { duration: 2000 }), -1, false)
      );
    }
  }, [isProxyActive]);

  const pulse1Style = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale1.value }],
    opacity: pulseOpacity1.value,
  }));

  const pulse2Style = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale2.value }],
    opacity: pulseOpacity2.value,
  }));

  const pulse3Style = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale3.value }],
    opacity: pulseOpacity3.value,
  }));

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleProxyActive();
  };

  return (
    <View className="flex-1 bg-[#FFF9F5]">
      <View style={{ paddingTop: insets.top }} className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <Text className="text-[#2D2D2D] text-3xl font-bold">Discover</Text>
          <Text className="text-gray-500 text-base mt-1">
            People at your location
          </Text>
          {isProxyActive && locationName && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="location" size={14} color="#FF6B6B" />
              <Text className="text-[#FF6B6B] text-sm ml-1">{locationName}</Text>
            </View>
          )}
        </View>

        {/* Proxy Toggle */}
        <Animated.View
          entering={FadeIn.duration(600)}
          className="mx-6 mt-4 mb-4"
        >
          <LinearGradient
            colors={isProxyActive ? ["#FF6B6B", "#FF8E72"] : ["#E5E7EB", "#D1D5DB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 24, padding: 20 }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                {/* Radar Animation */}
                <View className="w-14 h-14 items-center justify-center">
                  {isProxyActive && (
                    <>
                      <Animated.View
                        style={[
                          pulse1Style,
                          {
                            position: "absolute",
                            width: 56,
                            height: 56,
                            borderRadius: 28,
                            backgroundColor: "white",
                          },
                        ]}
                      />
                      <Animated.View
                        style={[
                          pulse2Style,
                          {
                            position: "absolute",
                            width: 56,
                            height: 56,
                            borderRadius: 28,
                            backgroundColor: "white",
                          },
                        ]}
                      />
                      <Animated.View
                        style={[
                          pulse3Style,
                          {
                            position: "absolute",
                            width: 56,
                            height: 56,
                            borderRadius: 28,
                            backgroundColor: "white",
                          },
                        ]}
                      />
                    </>
                  )}
                  <View className="w-10 h-10 rounded-full bg-white/30 items-center justify-center">
                    <Ionicons
                      name="radio"
                      size={24}
                      color="white"
                    />
                  </View>
                </View>

                <View className="ml-4 flex-1">
                  <Text className="text-white text-lg font-semibold">
                    {isProxyActive ? "Proxy Active" : "Proxy Inactive"}
                  </Text>
                  <Text className="text-white/80 text-sm">
                    {isProxyActive
                      ? "Showing people at this venue"
                      : "Turn on to be discovered"}
                  </Text>
                </View>
              </View>

              <Switch
                value={isProxyActive}
                onValueChange={handleToggle}
                trackColor={{ false: "rgba(255,255,255,0.3)", true: "rgba(255,255,255,0.4)" }}
                thumbColor="white"
              />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Same Venue Info Badge */}
        {isProxyActive && (
          <Animated.View
            entering={FadeIn.duration(400)}
            className="mx-6 mb-4"
          >
            <View className="bg-[#FF6B6B]/10 rounded-2xl p-3 flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-[#FF6B6B]/20 items-center justify-center">
                <Ionicons name="business" size={16} color="#FF6B6B" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-[#2D2D2D] text-sm font-medium">
                  {venueName || "Current Location"}
                </Text>
                <Text className="text-gray-500 text-xs">
                  Only showing people at this exact address
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Nearby Users List */}
        <View className="flex-1 px-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[#2D2D2D] text-lg font-semibold">
              People Here
            </Text>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-green-400 mr-2" />
              <Text className="text-gray-500 text-sm">
                {sameVenueUsers.length} here now
              </Text>
            </View>
          </View>

          {isProxyActive ? (
            sameVenueUsers.length > 0 ? (
              <Animated.ScrollView
                entering={FadeIn.duration(400)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {sameVenueUsers.map((user, index) => (
                  <NearbyUserCard
                    key={user.id}
                    user={user}
                    index={index}
                    onPress={() => navigation.navigate("UserDetail", { userId: user.id })}
                  />
                ))}
              </Animated.ScrollView>
            ) : (
              <Animated.View
                entering={FadeIn.duration(400)}
                className="flex-1 items-center justify-center"
              >
                <View className="w-24 h-24 rounded-full bg-[#FFB4A2]/30 items-center justify-center mb-4">
                  <Ionicons name="people-outline" size={48} color="#FF8E72" />
                </View>
                <Text className="text-[#2D2D2D] text-lg font-semibold text-center">
                  No one here yet
                </Text>
                <Text className="text-gray-500 text-base text-center mt-2 px-8">
                  Check the For You tab to{"\n"}discover people across the city
                </Text>
              </Animated.View>
            )
          ) : (
            <Animated.View
              entering={FadeIn.duration(400)}
              className="flex-1 items-center justify-center"
            >
              <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center mb-4">
                <Ionicons name="radio-outline" size={48} color="#9CA3AF" />
              </View>
              <Text className="text-gray-500 text-lg text-center">
                Turn on Proxy to see{"\n"}people at this venue
              </Text>
            </Animated.View>
          )}
        </View>
      </View>
    </View>
  );
}
