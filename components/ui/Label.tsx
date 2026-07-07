import { Text, type TextProps } from "react-native";

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Label({ className, ...props }: TextProps & { className?: string }) {
  return (
    <Text
      className={cn(
        "text-sm font-medium text-cardForeground dark:text-cardForegroundDark mb-1",
        className,
      )}
      {...props}
    />
  );
}
