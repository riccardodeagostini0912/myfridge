import { SymbolView, type SymbolViewProps } from "expo-symbols";
import type { ColorValue } from "react-native";

type SymbolName = Exclude<SymbolViewProps["name"], string>;

type Props = {
  /** Outlined symbol, shown when the tab is inactive. */
  name: SymbolName;
  /** Filled symbol, shown when the tab is active (iOS; Material symbols rely on tint). */
  activeName: SymbolName;
  focused: boolean;
  color: ColorValue;
  size: number;
};

export function TabIcon({ name, activeName, focused, color, size }: Props) {
  return <SymbolView name={focused ? activeName : name} tintColor={color} size={size} />;
}
