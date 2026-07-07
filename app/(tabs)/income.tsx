import { useState, useEffect } from "react";
import { View, Text, FlatList, Pressable, ScrollView } from "react-native";
import dayjs from "dayjs";
import { Ionicons } from "@expo/vector-icons";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";
import { EditEntityModal } from "@/components/EditEntityModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { FeedbackToast } from "@/components/FeedbackToast";
import { incomeService, type Income } from "@/services/incomeService";
import { incomeCategoryLabels } from "@/utils/labels/incomeCategoryLabels";
import { incomeDescriptionLabel } from "@/utils/labels/incomeDescriptionLabel";
import { frequencyLabels } from "@/utils/labels/frequencyLabels";

const CATEGORY_OPTIONS = [
  { label: "Salário", value: "Salary" },
  { label: "Freelance", value: "Freelance" },
  { label: "Bônus", value: "Bonus" },
  { label: "Retorno de Investimentos", value: "Investment" },
  { label: "Presente", value: "Gift" },
  { label: "Outros", value: "Other" },
];

const FREQUENCY_OPTIONS = [
  { label: "Única", value: "One-time" },
  { label: "Mensal", value: "Monthly" },
];

export default function IncomeScreen() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [frequency, setFrequency] = useState("");
  const [autoFilled, setAutoFilled] = useState(false);

  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [deletingIncome, setDeletingIncome] = useState<Income | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    loadIncomes();
  }, []);

  useEffect(() => {
    if (category === "Salary" && !autoFilled) {
      setFrequency("Monthly");
      setAutoFilled(true);
    }
    if (category !== "Salary") {
      setAutoFilled(false);
    }
  }, [category, autoFilled]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const loadIncomes = async () => {
    try {
      const data = await incomeService.getAll();
      setIncomes(data);
    } catch (err) {
      console.error("Erro ao carregar incomes:", err);
    }
  };

  const handleSubmit = async () => {
    if (!amount || !category || !date) {
      setToast({ message: "Preencha todos os campos", type: "error" });
      return;
    }

    try {
      await incomeService.create({
        description: description || category,
        amount: Number(amount),
        category,
        frequency,
        startDate: date,
        endDate: date,
        recurring: frequency !== "One-time",
      });

      await loadIncomes();
      setToast({ message: "Receita salva com sucesso", type: "success" });

      setAmount("");
      setCategory("");
      setDescription("");
      setFrequency("");
      setDate(dayjs().format("YYYY-MM-DD"));
    } catch (error) {
      console.error("Erro ao salvar receita:", error);
      setToast({ message: "Erro ao salvar receita. Tente novamente.", type: "error" });
    }
  };

  const handleDeleteIncome = async () => {
    if (!selectedIncome) return;
    try {
      await incomeService.delete(Number(selectedIncome.id));
      await loadIncomes();
      setShowDelete(false);
    } catch (error) {
      console.error("Erro ao deletar income:", error);
      setToast({ message: "Erro ao deletar renda.", type: "error" });
    }
  };

  const handleEditIncome = async (data: Record<string, unknown>) => {
    if (!editingIncome) return;
    try {
      await incomeService.update(Number(editingIncome.id), data);
      await loadIncomes();
      setShowEdit(false);
      setEditingIncome(null);
    } catch (error) {
      console.error("Erro ao editar income:", error);
      setToast({ message: "Erro ao editar renda.", type: "error" });
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-slate-900">
      <ScrollView contentContainerClassName="p-4 gap-4">
        <View className="flex-row items-center gap-2">
          <View className="p-2 rounded-lg bg-financial-incomeLight dark:bg-financial-incomeLightDark">
            <Ionicons name="wallet" size={22} color="#10b981" />
          </View>
          <Text className="text-2xl font-bold text-financial-income dark:text-financial-incomeDark">
            Adicionar Renda
          </Text>
        </View>

        <Card>
          <CardHeader>
            <CardTitle>Nova Renda</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View>
              <Label>Valor</Label>
              <Input keyboardType="decimal-pad" placeholder="0.00" value={amount} onChangeText={setAmount} />
            </View>

            <View>
              <Label>Data (AAAA-MM-DD)</Label>
              <Input value={date} onChangeText={setDate} placeholder="2026-01-31" />
            </View>

            <View>
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory} options={CATEGORY_OPTIONS} placeholder="Selecionar categoria" />
            </View>

            <View>
              <Label>Frequência</Label>
              <Select value={frequency} onValueChange={setFrequency} options={FREQUENCY_OPTIONS} placeholder="Selecionar frequência" />
            </View>

            <View>
              <Label>Descrição (opcional)</Label>
              <Textarea placeholder="Detalhes adicionais sobre a renda" value={description} onChangeText={setDescription} />
            </View>

            <Button
              onPress={handleSubmit}
              disabled={!amount || !category || !date}
              className="bg-financial-income dark:bg-financial-incomeDark"
            >
              Adicionar Renda
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rendas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {incomes.length === 0 ? (
              <Text className="text-center py-4 text-mutedForeground dark:text-mutedForegroundDark">
                Nenhuma renda cadastrada ainda
              </Text>
            ) : (
              <FlatList
                data={incomes}
                keyExtractor={(item) => String(item.id)}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View className="h-3" />}
                renderItem={({ item }) => (
                  <View className="p-3 rounded-lg border border-border dark:border-borderDark flex-row justify-between items-center">
                    <View className="flex-1 pr-2">
                      <Text className="text-cardForeground dark:text-cardForegroundDark">
                        {item.description && item.description.trim() !== ""
                          ? (incomeDescriptionLabel[item.description] ?? item.description)
                          : (incomeCategoryLabels[item.category] ?? item.category)}
                        {" - "}
                        {frequencyLabels[item.frequency] ?? item.frequency}
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-4">
                      <Text className="font-bold text-financial-income dark:text-financial-incomeDark">
                        R$ {item.value}
                      </Text>

                      <Pressable
                        onPress={() => {
                          setEditingIncome(item);
                          setShowEdit(true);
                        }}
                      >
                        <Ionicons name="create-outline" size={20} color="#3b82f6" />
                      </Pressable>

                      <Pressable
                        onPress={() => {
                          setDeletingIncome(item);
                          setSelectedIncome(item);
                          setShowDelete(true);
                        }}
                      >
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                      </Pressable>
                    </View>
                  </View>
                )}
              />
            )}
          </CardContent>
        </Card>
      </ScrollView>

      {editingIncome && (
        <EditEntityModal
          open={showEdit}
          title="Editar renda"
          initialData={editingIncome as unknown as Record<string, unknown>}
          onSave={handleEditIncome}
          onCancel={() => {
            setShowEdit(false);
            setEditingIncome(null);
          }}
        />
      )}

      {deletingIncome && (
        <DeleteConfirmModal
          open={showDelete}
          title="Excluir renda?"
          description="Esta ação não pode ser desfeita. Esta renda será removida permanentemente."
          onConfirm={handleDeleteIncome}
          onCancel={() => {
            setShowDelete(false);
            setDeletingIncome(null);
            setSelectedIncome(null);
          }}
        />
      )}

      {toast && <FeedbackToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </View>
  );
}
