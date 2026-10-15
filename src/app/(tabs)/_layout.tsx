import { router } from "expo-router";
import { Tabs } from "expo-router/js-tabs";

import { HeaderButton } from "@/components/header-button";
import { TabIcon } from "@/components/tab-icon";
import { colors } from "@/constants/tokens";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Recipes",
          tabBarIcon: (props) => (
            <TabIcon
              {...props}
              name={{ ios: "book", android: "menu_book", web: "menu_book" }}
              activeName={{ ios: "book.fill", android: "menu_book", web: "menu_book" }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="pantry"
        options={{
          title: "Pantry",
          tabBarIcon: (props) => (
            <TabIcon
              {...props}
              name={{ ios: "refrigerator", android: "kitchen", web: "kitchen" }}
              activeName={{ ios: "refrigerator.fill", android: "kitchen", web: "kitchen" }}
            />
          ),
          headerRight: () => (
            <HeaderButton label="Add" onPress={() => router.push("/pantry-add")} />
          ),
        }}
      />
      <Tabs.Screen
        name="groceries"
        options={{
          title: "Groceries",
          tabBarIcon: (props) => (
            <TabIcon
              {...props}
              name={{ ios: "cart", android: "shopping_cart", web: "shopping_cart" }}
              activeName={{ ios: "cart.fill", android: "shopping_cart", web: "shopping_cart" }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
