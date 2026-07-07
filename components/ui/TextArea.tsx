import { TextInput, type TextInputProps } from "react-native";

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Textarea({
  className,
  rows = 3,
  ...props
}: TextInputProps & { className?: string; rows?: number }) {
  return (
    <TextInput
      multiline
      numberOfLines={rows}
      textAlignVertical="top"
      placeholderTextColor="#94a3b8"
      className={cn(
        "w-full rounded-lg border border-border dark:border-borderDark px-3 py-2 text-base text-cardForeground dark:text-cardForegroundDark bg-card dark:bg-cardDark",
        className,
      )}
      style={{ minHeight: rows * 20 + 16 }}
      {...props}
    />
  );
}
