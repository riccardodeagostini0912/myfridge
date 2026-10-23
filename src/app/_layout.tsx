import { Stack } from "expo-router";

import { colors } from "@/constants/tokens";
import { GroceryProvider } from "@/context/groceries";
import { PantryProvider } from "@/context/pantry";

export default function RootLayout() {
  return (
    <PantryProvider>
      <GroceryProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerShadowVisible: false,
            headerTintColor: colors.primary,
            headerTitleStyle: { color: colors.text },
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="recipe/[id]" options={{ title: "Recipe", headerBackTitle: "Recipes" }} />
          <Stack.Screen
            name="pantry-add"
            options={{ title: "Add ingredients", presentation: "modal" }}
          />
        </Stack>
      </GroceryProvider>
    </PantryProvider>
  );
}
