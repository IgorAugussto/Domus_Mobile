import { useState } from "react";
import { Text, Pressable, Modal, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function Select({ value, onValueChange, options, placeholder = "Selecionar", className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className={cn(
          "h-11 w-full flex-row items-center justify-between rounded-lg border border-border dark:border-borderDark px-3 bg-card dark:bg-cardDark",
          className,
        )}
      >
        <Text
          className={
            selected
              ? "text-base text-cardForeground dark:text-cardForegroundDark"
              : "text-base text-mutedForeground dark:text-mutedForegroundDark"
          }
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#94a3b8" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setOpen(false)}
        >
          <Pressable className="max-h-[60%] rounded-t-2xl bg-card dark:bg-cardDark p-2" onPress={(e) => e.stopPropagation()}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onValueChange(item.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "px-4 py-3 rounded-lg",
                    item.value === value && "bg-financial-trustLight dark:bg-financial-trustLightDark",
                  )}
                >
                  <Text className="text-base text-cardForeground dark:text-cardForegroundDark">
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
