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
import { investmentService, type Investment } from "@/services/investmentService";
import { investmentTypeLabels } from "@/utils/labels/investmentTypeLabels";
import { investmentDescriptionLabel } from "@/utils/labels/investmentDescriptionLabel";

const TYPE_OPTIONS = [
  { label: "Ações", value: "Stocks" },
  { label: "Renda Fixa", value: "Bonds" },
  { label: "Imóveis", value: "Real Estate" },
  { label: "Criptomoedas", value: "Crypto" },
  { label: "Fundos de Investimento", value: "Mutual Funds" },
  { label: "ETF", value: "ETF" },
  { label: "Poupança", value: "Savings" },
  { label: "Outros", value: "Other" },
];

export default function InvestmentsScreen() {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [investments, setInvestments] = useState<Investment[]>([]);

  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [deletingInvestment, setDeletingInvestment] = useState<Investment | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    loadInvestments();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const loadInvestments = async () => {
    try {
      const data = await investmentService.getAll();
      setInvestments(data);
    } catch (err) {
      console.error("Erro ao carregar investments:", err);
    }
  };

  const handleSubmit = async () => {
    if (!amount || !type || !expectedReturn || !startDate || !endDate) {
      setToast({ message: "Preencha todos os campos", type: "error" });
      return;
    }

    try {
      await investmentService.create({
        description: description || type,
        amount: Number(amount),
        startDate,
        endDate,
        type,
        expectedReturn: Number(expectedReturn),
      });

      await loadInvestments();
      setToast({ message: "Investimento salvo com sucesso", type: "success" });

      setAmount("");
      setType("");
      setExpectedReturn("");
      setDescription("");
      setStartDate(dayjs().format("YYYY-MM-DD"));
      setEndDate(dayjs().format("YYYY-MM-DD"));
    } catch (err) {
      console.error("Erro ao salvar investimento:", err);
      setToast({ message: "Erro ao salvar investimento. Tente novamente.", type: "error" });
    }
  };

  const handleDeleteInvestment = async () => {
    if (!selectedInvestment) return;
    try {
      await investmentService.delete(Number(selectedInvestment.id));
      await loadInvestments();
      setShowDelete(false);
    } catch (error) {
      console.error("Erro ao deletar investment:", error);
      setToast({ message: "Erro ao deletar investimento.", type: "error" });
    }
  };

  const handleEditInvestment = async (data: Record<string, unknown>) => {
    if (!editingInvestment) return;
    try {
      await investmentService.update(Number(editingInvestment.id), data);
      await loadInvestments();
      setShowEdit(false);
      setEditingInvestment(null);
    } catch (error) {
      console.error("Erro ao editar investment:", error);
      setToast({ message: "Erro ao editar investimento.", type: "error" });
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-slate-900">
      <ScrollView contentContainerClassName="p-4 gap-4">
        <View className="flex-row items-center gap-2">
          <View className="p-2 rounded-lg bg-financial-investmentLight dark:bg-financial-investmentLightDark">
            <Ionicons name="trending-up" size={22} color="#f59e0b" />
          </View>
          <Text className="text-2xl font-bold text-financial-investment dark:text-financial-investmentDark">
            Adicionar Investimento
          </Text>
        </View>

        <Card>
          <CardHeader>
            <CardTitle>Novo Investimento</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View>
              <Label>Valor</Label>
              <Input keyboardType="decimal-pad" placeholder="0.00" value={amount} onChangeText={setAmount} />
            </View>

            <View>
              <Label>Data de Início (AAAA-MM-DD)</Label>
              <Input value={startDate} onChangeText={setStartDate} placeholder="2026-01-31" />
            </View>

            <View>
              <Label>Tipo de Investimento</Label>
              <Select value={type} onValueChange={setType} options={TYPE_OPTIONS} placeholder="Selecione o tipo" />
            </View>

            <View>
              <Label>Rentabilidade Esperada (%)</Label>
              <Input keyboardType="decimal-pad" placeholder="5.7" value={expectedReturn} onChangeText={setExpectedReturn} />
            </View>

            <View>
              <Label>Data Final (AAAA-MM-DD)</Label>
              <Input value={endDate} onChangeText={setEndDate} placeholder="2026-12-31" />
            </View>

            <View>
              <Label>Descrição (opcional)</Label>
              <Textarea placeholder="Detalhes sobre este investimento" value={description} onChangeText={setDescription} />
            </View>

            <Button
              onPress={handleSubmit}
              disabled={!amount || !type || !expectedReturn}
              className="bg-financial-investment dark:bg-financial-investmentDark"
            >
              Adicionar Investimento
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investimentos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {investments.length === 0 ? (
              <Text className="text-center py-4 text-mutedForeground dark:text-mutedForegroundDark">
                Nenhum investimento cadastrado ainda
              </Text>
            ) : (
              <FlatList
                data={investments}
                keyExtractor={(item) => String(item.id)}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View className="h-3" />}
                renderItem={({ item }) => (
                  <View className="p-3 rounded-lg border border-border dark:border-borderDark">
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1 pr-2">
                        <Text className="text-cardForeground dark:text-cardForegroundDark">
                          {item.description && item.description.trim() !== ""
                            ? (investmentDescriptionLabel[item.description] ?? item.description)
                            : (investmentTypeLabels[item.typeInvestments] ?? item.typeInvestments)}
                          {" - "}
                          {item.expectedReturn}%
                        </Text>
                      </View>

                      <View className="flex-row items-center gap-4">
                        <Text className="font-bold text-financial-investment dark:text-financial-investmentDark">
                          R$ {item.value}
                        </Text>

                        <Pressable
                          onPress={() => {
                            setEditingInvestment(item);
                            setShowEdit(true);
                          }}
                        >
                          <Ionicons name="create-outline" size={20} color="#3b82f6" />
                        </Pressable>

                        <Pressable
                          onPress={() => {
                            setDeletingInvestment(item);
                            setSelectedInvestment(item);
                            setShowDelete(true);
                          }}
                        >
                          <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </Pressable>
                      </View>
                    </View>
                    {item.startDate && (
                      <Text className="text-xs mt-1 text-mutedForeground dark:text-mutedForegroundDark">
                        {item.startDate}
                      </Text>
                    )}
                  </View>
                )}
              />
            )}
          </CardContent>
        </Card>
      </ScrollView>

      {editingInvestment && (
        <EditEntityModal
          open={showEdit}
          title="Editar investimento"
          initialData={editingInvestment as unknown as Record<string, unknown>}
          showFieldsInvestments
          onSave={handleEditInvestment}
          onCancel={() => {
            setShowEdit(false);
            setEditingInvestment(null);
          }}
        />
      )}

      {deletingInvestment && (
        <DeleteConfirmModal
          open={showDelete}
          title="Excluir investimento?"
          description="Esta ação não pode ser desfeita. Este investimento será removido permanentemente."
          onConfirm={handleDeleteInvestment}
          onCancel={() => {
            setShowDelete(false);
            setDeletingInvestment(null);
            setSelectedInvestment(null);
          }}
        />
      )}

      {toast && <FeedbackToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </View>
  );
}
