import React from "react";
import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Welcome">;
};

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const insets = useSafeAreaInsets();
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#FF6B6B", "#FF8E72", "#FFB4A2"]}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View
          style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
          className="flex-1 px-6"
        >
          {/* Logo and Title */}
          <View className="flex-1 items-center justify-center">
            <Animated.View
              entering={FadeInDown.duration(800).delay(200)}
              style={pulseStyle}
              className="mb-8"
            >
              <View className="w-32 h-32 rounded-full bg-white/20 items-center justify-center">
                <View className="w-24 h-24 rounded-full bg-white/30 items-center justify-center">
                  <Ionicons name="location" size={48} color="white" />
                </View>
              </View>
            </Animated.View>

            <Animated.Text
              entering={FadeInUp.duration(800).delay(400)}
              className="text-white text-5xl font-bold tracking-tight"
            >
              Proxy
            </Animated.Text>

            <Animated.Text
              entering={FadeInUp.duration(800).delay(600)}
              className="text-white/90 text-lg text-center mt-4 px-4"
            >
              Discover the people around you.{"\n"}Connect when the moment feels right.
            </Animated.Text>
          </View>

          {/* Bottom Section */}
          <Animated.View
            entering={FadeInUp.duration(800).delay(800)}
            className="pb-8"
          >
            <Pressable
              onPress={() => navigation.navigate("ProfileSetup")}
              className="bg-white rounded-full py-4 px-8 items-center active:opacity-90"
            >
              <Text className="text-[#FF6B6B] text-lg font-semibold">
                Get Started
              </Text>
            </Pressable>

            <Text className="text-white/70 text-center text-sm mt-6">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
}
