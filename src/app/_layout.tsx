import { Stack } from "expo-router";

import { PantryProvider } from "@/context/pantry";

export default function RootLayout() {
  return (
    <PantryProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="recipe/[id]" options={{ title: "Recipe", headerBackTitle: "Recipes" }} />
        <Stack.Screen
          name="pantry-add"
          options={{ title: "Add ingredients", presentation: "modal" }}
        />
      </Stack>
    </PantryProvider>
  );
}
