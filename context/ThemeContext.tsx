import { createContext, useState, useEffect, type ReactNode } from "react";
import { Appearance } from "react-native";
import { colorScheme as nativewindColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = "domus.theme";

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(
    Appearance.getColorScheme() === "dark" ? "dark" : "light",
  );

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      const initial = (saved as Theme | null) ?? (Appearance.getColorScheme() === "dark" ? "dark" : "light");
      setTheme(initial);
      nativewindColorScheme.set(initial);
    });
  }, []);

  const toggleTheme = () => {
    const newTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    nativewindColorScheme.set(newTheme);
    AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
  );
}
