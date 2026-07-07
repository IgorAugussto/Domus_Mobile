import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";

export function HeaderActions() {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <View className="flex-row items-center gap-4 mr-4">
      <Pressable onPress={toggleTheme} hitSlop={8}>
        <Ionicons name={theme === "light" ? "moon" : "sunny"} size={22} color="#3b82f6" />
      </Pressable>
      <Pressable onPress={logout} hitSlop={8}>
        <Ionicons name="log-out-outline" size={22} color="#ef4444" />
      </Pressable>
    </View>
  );
}
