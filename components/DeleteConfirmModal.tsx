import { Modal, View, Text, Pressable } from "react-native";
import { Button } from "@/components/ui/Button";

interface DeleteConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ open, title, description, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable className="flex-1 items-center justify-center bg-black/60 px-6" onPress={onCancel}>
        <Pressable
          className="w-full max-w-sm rounded-xl bg-card dark:bg-cardDark p-6 gap-4"
          onPress={(e) => e.stopPropagation()}
        >
          <Text className="text-lg font-bold text-cardForeground dark:text-cardForegroundDark">
            {title}
          </Text>
          <Text className="text-sm text-mutedForeground dark:text-mutedForegroundDark">
            {description}
          </Text>
          <View className="flex-row justify-end gap-3 pt-2">
            <Button variant="outline" onPress={onCancel}>
              Cancelar
            </Button>
            <Button variant="destructive" onPress={onConfirm}>
              Excluir
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
