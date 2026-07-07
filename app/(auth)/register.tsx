import { useState } from "react";
import { View, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { FeedbackToast } from "@/components/FeedbackToast";
import { authService } from "@/services/authService";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleRegister = async () => {
    setLoading(true);
    try {
      await authService.register({ name, email, password });
      setToast({ message: "Conta criada com sucesso! Faça login para entrar.", type: "success" });
      setTimeout(() => router.replace("/login"), 1500);
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      setToast({
        message:
          status === 403
            ? "Criação de contas desativada. Este ambiente está em modo demonstração."
            : "Falha ao criar conta. Tente novamente.",
        type: "error",
      });
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
            <CardTitle className="text-2xl text-white">Criar conta</CardTitle>
            <CardDescription className="text-slate-300">
              Preencha os dados para se cadastrar
            </CardDescription>
          </CardHeader>

          <CardContent className="gap-4">
            <View>
              <Label className="text-slate-200">Nome</Label>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="Digite seu nome"
                className="bg-[#0B2238] border-white/10 text-white"
              />
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
                placeholder="Crie uma senha"
                secureTextEntry
                className="bg-[#0B2238] border-white/10 text-white"
              />
            </View>

            <Button
              onPress={handleRegister}
              disabled={loading || !name || !email || !password}
            >
              {loading ? <ActivityIndicator color="#fff" /> : "Criar conta"}
            </Button>
          </CardContent>
        </Card>
      </ScrollView>

      {toast && <FeedbackToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </KeyboardAvoidingView>
  );
}
