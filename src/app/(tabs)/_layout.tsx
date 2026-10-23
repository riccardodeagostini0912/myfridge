import { Tabs } from "expo-router/js-tabs";

import { TabIcon } from "@/components/tab-icon";
import { colors, fontSize } from "@/constants/tokens";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTitleAlign: "left",
        headerTitleStyle: { fontSize: fontSize.xl, fontWeight: "700", color: colors.text },
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: fontSize.xs, fontWeight: "600" },
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
