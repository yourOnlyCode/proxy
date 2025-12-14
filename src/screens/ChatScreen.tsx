import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";

type ChatScreenNavProp = NativeStackNavigationProp<RootStackParamList, "Chat">;
import { useProxyStore } from "../state/proxyStore";
import { Message } from "../types/proxy";
import { cn } from "../utils/cn";
import { formatDistanceToNow } from "date-fns";

type ChatScreenRouteProp = RouteProp<RootStackParamList, "Chat">;

function MessageBubble({
  message,
  isOwn,
  showAvatar,
  otherUserPhoto,
}: {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  otherUserPhoto: string;
}) {
  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      className={cn(
        "flex-row mb-2 px-4",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      {!isOwn && showAvatar && (
        <Image
          source={{ uri: otherUserPhoto }}
          style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }}
          contentFit="cover"
        />
      )}
      {!isOwn && !showAvatar && <View style={{ width: 40 }} />}

      <View
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3",
          isOwn ? "bg-[#FF6B6B] rounded-br-sm" : "bg-white rounded-bl-sm"
        )}
        style={
          !isOwn
            ? {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
              }
            : undefined
        }
      >
        <Text className={cn("text-base", isOwn ? "text-white" : "text-[#2D2D2D]")}>
          {message.text}
        </Text>
        <Text
          className={cn(
            "text-xs mt-1",
            isOwn ? "text-white/70" : "text-gray-400"
          )}
        >
          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ChatScreenNavProp>();
  const route = useRoute<ChatScreenRouteProp>();
  const { connectionId } = route.params;

  const flatListRef = useRef<FlatList>(null);

  const currentUser = useProxyStore((s) => s.currentUser);
  const connections = useProxyStore((s) => s.connections);
  const conversations = useProxyStore((s) => s.conversations);
  const sendMessage = useProxyStore((s) => s.sendMessage);
  const markMessagesAsRead = useProxyStore((s) => s.markMessagesAsRead);

  const [inputText, setInputText] = useState("");

  const connection = connections.find((c) => c.id === connectionId);
  const conversation = conversations[connectionId];
  const messages = conversation?.messages || [];

  // Mark messages as read when opening chat
  useEffect(() => {
    if (connectionId) {
      markMessagesAsRead(connectionId);
    }
  }, [connectionId, messages.length]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage(connectionId, inputText);
    setInputText("");
  };

  if (!connection || !currentUser) {
    return (
      <View className="flex-1 bg-[#FFF9F5] items-center justify-center">
        <Text className="text-gray-500">Connection not found</Text>
      </View>
    );
  }

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwn = item.senderId === currentUser.id;
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showAvatar = !isOwn && (!prevMessage || prevMessage.senderId !== item.senderId);

    return (
      <MessageBubble
        message={item}
        isOwn={isOwn}
        showAvatar={showAvatar}
        otherUserPhoto={connection.user.photoUrl}
      />
    );
  };

  return (
    <View className="flex-1 bg-[#FFF9F5]">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className="bg-white border-b border-gray-100"
      >
        <View className="flex-row items-center px-4 py-3">
          <Pressable
            onPress={() => navigation.goBack()}
            className="p-2 -ml-2 active:opacity-70"
          >
            <Ionicons name="chevron-back" size={24} color="#2D2D2D" />
          </Pressable>

          <Pressable
            onPress={() =>
              navigation.navigate("UserDetail", { userId: connection.user.id })
            }
            className="flex-1 flex-row items-center ml-2 active:opacity-80"
          >
            <Image
              source={{ uri: connection.user.photoUrl }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
              contentFit="cover"
            />
            <View className="ml-3">
              <Text className="text-[#2D2D2D] text-lg font-semibold">
                {connection.user.name}
              </Text>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-green-400 mr-1" />
                <Text className="text-gray-500 text-sm">Active now</Text>
              </View>
            </View>
          </Pressable>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        {messages.length === 0 ? (
          <Animated.View
            entering={FadeIn.duration(400)}
            className="flex-1 items-center justify-center px-6"
          >
            <Image
              source={{ uri: connection.user.photoUrl }}
              style={{ width: 80, height: 80, borderRadius: 40 }}
              contentFit="cover"
            />
            <Text className="text-[#2D2D2D] text-xl font-semibold mt-4">
              {connection.user.name}
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              You matched! Send a message to{"\n"}start the conversation.
            </Text>
          </Animated.View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 16 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        {/* Input */}
        <View
          style={{ paddingBottom: insets.bottom + 8 }}
          className="px-4 pt-3 pb-2 bg-white border-t border-gray-100"
        >
          <View className="flex-row items-end">
            <View
              className="flex-1 bg-gray-100 rounded-3xl px-4 py-3 mr-3"
              style={{ minHeight: 48, maxHeight: 120 }}
            >
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type a message..."
                placeholderTextColor="#9CA3AF"
                multiline
                className="text-[#2D2D2D] text-base"
                style={{ maxHeight: 100 }}
              />
            </View>

            <Pressable
              onPress={handleSend}
              disabled={!inputText.trim()}
              className={cn(
                "w-12 h-12 rounded-full items-center justify-center",
                inputText.trim() ? "bg-[#FF6B6B] active:bg-[#FF5252]" : "bg-gray-200"
              )}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? "white" : "#9CA3AF"}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
