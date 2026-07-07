import { View, Text, type ViewProps, type TextProps } from "react-native";

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

function Card({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn(
        "bg-card dark:bg-cardDark border border-border dark:border-borderDark rounded-xl",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: ViewProps & { className?: string }) {
  return <View className={cn("gap-1.5 px-6 pt-6 pb-4", className)} {...props} />;
}

function CardTitle({ className, ...props }: TextProps & { className?: string }) {
  return (
    <Text
      className={cn(
        "text-lg font-bold text-cardForeground dark:text-cardForegroundDark",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: TextProps & { className?: string }) {
  return (
    <Text
      className={cn("text-sm text-mutedForeground dark:text-mutedForegroundDark", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: ViewProps & { className?: string }) {
  return <View className={cn("px-6 pb-6", className)} {...props} />;
}

function CardFooter({ className, ...props }: ViewProps & { className?: string }) {
  return <View className={cn("flex-row items-center px-6 pb-6", className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
