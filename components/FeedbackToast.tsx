import { View, Text, Pressable } from "react-native";

interface FeedbackToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

export function FeedbackToast({ message, type = "success", onClose }: FeedbackToastProps) {
  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-0 items-center justify-center px-6"
    >
      <View
        className={
          type === "success"
            ? "flex-row items-center gap-4 rounded-xl px-5 py-4 bg-financial-successLight dark:bg-financial-successLightDark"
            : "flex-row items-center gap-4 rounded-xl px-5 py-4 bg-financial-dangerLight dark:bg-financial-dangerLightDark"
        }
      >
        <Text
          className={
            type === "success"
              ? "flex-1 text-sm font-medium text-financial-success dark:text-financial-successDark"
              : "flex-1 text-sm font-medium text-financial-danger dark:text-financial-dangerDark"
          }
        >
          {message}
        </Text>

        <Pressable onPress={onClose}>
          <Text className="text-sm text-mutedForeground dark:text-mutedForegroundDark">✕</Text>
        </Pressable>
      </View>
    </View>
  );
}
