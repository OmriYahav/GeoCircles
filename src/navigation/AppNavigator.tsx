import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  NavigationContainer,
  ParamListBase,
  NavigationProp,
  NavigatorScreenParams,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import MapScreen, { MapScreenParams } from "../screens/MapScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import MessagesScreen from "../screens/MessagesScreen";
import ConversationScreen, {
  ConversationScreenParams,
} from "../screens/ConversationScreen";
import ProfileSettingsScreen from "../screens/ProfileSettingsScreen";
import BusinessOfferScreen, {
  BusinessOfferScreenParams,
} from "../screens/BusinessOfferScreen";
import { Colors } from "../../constants/theme";

export const navigationRef = createNavigationContainerRef();

export type RootTabParamList = {
  Search: NavigatorScreenParams<SearchStackParamList> | undefined;
  Favorites: undefined;
  Messages: NavigatorScreenParams<MessagesStackParamList> | undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export type SearchStackParamList = {
  Map: MapScreenParams;
  Conversation: ConversationScreenParams;
  BusinessOffer: BusinessOfferScreenParams;
};

const SearchStack = createNativeStackNavigator<SearchStackParamList>();

function SearchStackNavigator() {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen name="Map" component={MapScreen} initialParams={{}} />
      <SearchStack.Screen
        name="Conversation"
        component={ConversationScreen}
        options={{ presentation: "fullScreenModal" }}
      />
      <SearchStack.Screen
        name="BusinessOffer"
        component={BusinessOfferScreen}
        options={{ headerShown: true, title: "Business Offer" }}
      />
    </SearchStack.Navigator>
  );
}

export type MessagesStackParamList = {
  Inbox: undefined;
  Conversation: ConversationScreenParams;
};

const MessagesStack = createNativeStackNavigator<MessagesStackParamList>();

function MessagesStackNavigator() {
  return (
    <MessagesStack.Navigator screenOptions={{ headerShown: false }}>
      <MessagesStack.Screen name="Inbox" component={MessagesScreen} />
      <MessagesStack.Screen name="Conversation" component={ConversationScreen} />
    </MessagesStack.Navigator>
  );
}

type TabButtonProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  isFocused: boolean;
  onPress: () => void;
};

function TabButton({ label, icon, isFocused, onPress }: TabButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: withTiming(
      isFocused ? "rgba(37, 99, 235, 0.12)" : "transparent"
    ),
  }));

  return (
    <Animated.View style={[styles.tabButtonContainer, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => {
          scale.value = withTiming(0.9, { duration: 100 }, () => {
            scale.value = withTiming(1, { duration: 160 });
          });
          onPress();
        }}
        style={styles.touchable}
      >
        <Ionicons
          name={icon}
          size={22}
          color={isFocused ? Colors.light.tint : Colors.light.icon}
        />
        <Animated.Text
          style={[styles.tabLabel, isFocused && styles.tabLabelActive]}
        >
          {label}
        </Animated.Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

type TabConfigItem = {
  name: keyof RootTabParamList;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const TAB_ITEMS: TabConfigItem[] = [
  { name: "Search", label: "Search", icon: "search-outline" },
  { name: "Favorites", label: "Favorites", icon: "heart-outline" },
  { name: "Messages", label: "Messages", icon: "chatbubbles-outline" },
  { name: "Profile", label: "Profile", icon: "person-circle-outline" },
];

function CustomTabBar({
  state,
  descriptors,
  navigation,
}: {
  state: any;
  descriptors: Record<string, any>;
  navigation: NavigationProp<ParamListBase>;
}) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const config = TAB_ITEMS.find((item) => item.name === route.name);
        if (!config) {
          return null;
        }

        const onPress = () => {
          if (route.name === "Search") {
            navigation.navigate("Search" as never, {
              screen: "Map",
              params: { trigger: { type: "focusSearch", timestamp: Date.now() } },
            } as never);
            return;
          }

          navigation.navigate(route.name as never);
        };

        return (
          <TabButton
            key={route.key}
            label={config.label}
            icon={config.icon}
            isFocused={isFocused}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tab.Screen name="Search" component={SearchStackNavigator} />
        <Tab.Screen name="Favorites" component={FavoritesScreen} />
        <Tab.Screen name="Messages" component={MessagesStackNavigator} />
        <Tab.Screen name="Profile" component={ProfileSettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.95)",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  tabButtonContainer: {
    flex: 1,
    borderRadius: 18,
    marginHorizontal: 6,
  },
  touchable: {
    paddingVertical: 8,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.light.icon,
  },
  tabLabelActive: {
    color: Colors.light.tint,
    fontWeight: "600",
  },
});
