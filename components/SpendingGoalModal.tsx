import { useState, useEffect } from "react";
import { Modal, View, Text, Pressable } from "react-native";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

interface SpendingGoalModalProps {
  open: boolean;
  currentGoal: number;
  onSave: (goal: number) => void;
  onCancel: () => void;
}

export function SpendingGoalModal({ open, currentGoal, onSave, onCancel }: SpendingGoalModalProps) {
  const [goalValue, setGoalValue] = useState("");

  useEffect(() => {
    if (open) {
      setGoalValue(currentGoal > 0 ? String(currentGoal) : "");
    }
  }, [open, currentGoal]);

  const handleSave = () => {
    const value = Number(goalValue);
    if (value > 0) {
      onSave(value);
    }
  };

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable className="flex-1 items-center justify-center bg-black/60 px-6" onPress={onCancel}>
        <Pressable onPress={(e) => e.stopPropagation()} className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Definir Meta de Gastos</CardTitle>
            </CardHeader>
            <CardContent className="gap-4">
              <View>
                <Label>Meta de Gastos Mensal (R$)</Label>
                <Input
                  keyboardType="decimal-pad"
                  placeholder="Ex: 5000.00"
                  value={goalValue}
                  onChangeText={setGoalValue}
                />
                <Text className="text-xs mt-1 text-mutedForeground dark:text-mutedForegroundDark">
                  Uma linha será exibida no gráfico mostrando sua meta
                </Text>
              </View>

              <View className="flex-row justify-end gap-3 pt-2">
                <Button variant="outline" onPress={onCancel}>
                  Cancelar
                </Button>
                <Button
                  onPress={handleSave}
                  disabled={!goalValue || Number(goalValue) <= 0}
                  className="bg-financial-income dark:bg-financial-incomeDark"
                >
                  Salvar Meta
                </Button>
              </View>
            </CardContent>
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
