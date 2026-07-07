import { TextInput, type TextInputProps } from "react-native";

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Input({ className, ...props }: TextInputProps & { className?: string }) {
  return (
    <TextInput
      placeholderTextColor="#94a3b8"
      className={cn(
        "h-11 w-full rounded-lg border border-border dark:border-borderDark px-3 text-base text-cardForeground dark:text-cardForegroundDark bg-card dark:bg-cardDark",
        className,
      )}
      {...props}
    />
  );
}
