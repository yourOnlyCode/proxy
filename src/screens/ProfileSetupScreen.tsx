import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useProxyStore } from "../state/proxyStore";
import { cn } from "../utils/cn";

type ProfileSetupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ProfileSetup">;
};

export default function ProfileSetupScreen({ navigation }: ProfileSetupScreenProps) {
  const insets = useSafeAreaInsets();
  const setCurrentUser = useProxyStore((s) => s.setCurrentUser);
  const completeOnboarding = useProxyStore((s) => s.completeOnboarding);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string>("");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUrl(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleContinue = () => {
    if (!name.trim()) {
      Alert.alert("Name Required", "Please enter your name to continue.");
      return;
    }

    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      Alert.alert("Valid Age Required", "Please enter a valid age (18+).");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setCurrentUser({
      id: `user_${Date.now()}`,
      name: name.trim(),
      age: ageNum,
      bio: bio.trim() || "Hey there! I'm new to Proxy.",
      photoUrl: photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop&crop=face",
      socials: {},
      isActive: false,
      lastSeen: new Date(),
    });

    navigation.navigate("SocialsSetup");
  };

  const isValid = name.trim() && age && parseInt(age) >= 18;

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
              Create your profile
            </Text>
            <Text className="text-gray-500 text-base mt-2">
              Let others know who you are
            </Text>
          </Animated.View>

          {/* Photo Picker */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(200)}
            className="items-center mt-8"
          >
            <Pressable
              onPress={pickImage}
              className="relative active:opacity-80"
            >
              <View className="w-32 h-32 rounded-full bg-[#FFB4A2]/30 items-center justify-center overflow-hidden">
                {photoUrl ? (
                  <Image
                    source={{ uri: photoUrl }}
                    style={{ width: 128, height: 128 }}
                    contentFit="cover"
                  />
                ) : (
                  <Ionicons name="person" size={48} color="#FF8E72" />
                )}
              </View>
              <View className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[#FF6B6B] items-center justify-center">
                <Ionicons name="camera" size={20} color="white" />
              </View>
            </Pressable>
            <Text className="text-gray-500 text-sm mt-3">Add a photo</Text>
          </Animated.View>

          {/* Form Fields */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(400)}
            className="mt-8 space-y-5"
          >
            {/* Name Input */}
            <View className="mb-5">
              <Text className="text-[#2D2D2D] font-medium mb-2">Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your first name"
                placeholderTextColor="#9CA3AF"
                className="bg-white rounded-2xl px-4 py-4 text-[#2D2D2D] text-base"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              />
            </View>

            {/* Age Input */}
            <View className="mb-5">
              <Text className="text-[#2D2D2D] font-medium mb-2">Age</Text>
              <TextInput
                value={age}
                onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ""))}
                placeholder="Your age"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                maxLength={2}
                className="bg-white rounded-2xl px-4 py-4 text-[#2D2D2D] text-base"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              />
            </View>

            {/* Bio Input */}
            <View className="mb-5">
              <Text className="text-[#2D2D2D] font-medium mb-2">
                Bio{" "}
                <Text className="text-gray-400 font-normal">(optional)</Text>
              </Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Tell others about yourself..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                maxLength={150}
                className="bg-white rounded-2xl px-4 py-4 text-[#2D2D2D] text-base min-h-[100px]"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                  textAlignVertical: "top",
                }}
              />
              <Text className="text-gray-400 text-xs text-right mt-1">
                {bio.length}/150
              </Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Continue Button */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(600)}
          style={{ paddingBottom: insets.bottom + 16 }}
          className="px-6"
        >
          <Pressable
            onPress={handleContinue}
            disabled={!isValid}
            className={cn(
              "rounded-full py-4 items-center",
              isValid ? "bg-[#FF6B6B] active:bg-[#FF5252]" : "bg-gray-300"
            )}
          >
            <Text
              className={cn(
                "text-lg font-semibold",
                isValid ? "text-white" : "text-gray-500"
              )}
            >
              Continue
            </Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}
