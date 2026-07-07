import { useState } from "react";
import { View, Text, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/use-auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Login falhou", "Verifique seu email e senha e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-[#0B1C2D]"
    >
      <ScrollView contentContainerClassName="flex-1 items-center justify-center px-6" keyboardShouldPersistTaps="handled">
        <Card className="w-full max-w-sm bg-[#0F2A44] border border-white/10">
          <CardHeader className="items-center">
            <CardTitle className="text-2xl text-white">Login</CardTitle>
            <CardDescription className="text-slate-300">
              Acesse sua conta para continuar
            </CardDescription>
          </CardHeader>

          <CardContent className="gap-4">
            <View className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
              <Text className="text-blue-300 font-bold text-sm">Conta demo</Text>
              <Text className="text-blue-200 text-sm">Email: demo@domus.app</Text>
              <Text className="text-blue-200 text-sm">Senha: lkjsfg25</Text>
            </View>

            <View>
              <Label className="text-slate-200">Email</Label>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="Digite seu email"
                autoCapitalize="none"
                keyboardType="email-address"
                className="bg-[#0B2238] border-white/10 text-white"
              />
            </View>

            <View>
              <Label className="text-slate-200">Senha</Label>
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="Digite sua senha"
                secureTextEntry
                className="bg-[#0B2238] border-white/10 text-white"
              />
            </View>

            <View className="flex-row justify-center gap-1">
              <Text className="text-sm text-slate-300">Não tem conta?</Text>
              <Text className="text-sm text-blue-400" onPress={() => router.push("/register")}>
                Cadastre-se
              </Text>
            </View>

            <Button onPress={handleLogin} disabled={loading || !email || !password}>
              {loading ? <ActivityIndicator color="#fff" /> : "Login"}
            </Button>
          </CardContent>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
