import { useState, useEffect } from "react";
import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/TextArea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const EXPENSE_CATEGORY_OPTIONS = [
  { label: "Alimentação", value: "Food & Dining" },
  { label: "Transporte", value: "Transportation" },
  { label: "Compras", value: "Shopping" },
  { label: "Entretenimento", value: "Entertainment" },
  { label: "Contas e Serviços", value: "Bills & Utilities" },
  { label: "Saúde", value: "Healthcare" },
  { label: "Educação", value: "Education" },
  { label: "Outro", value: "Other" },
];

const INCOME_CATEGORY_OPTIONS = [
  { label: "Salário", value: "Salary" },
  { label: "Freelance", value: "Freelance" },
  { label: "Bônus", value: "Bonus" },
  { label: "Investimento", value: "Investment" },
  { label: "Outro", value: "Other" },
];

const FREQUENCY_OPTIONS = [
  { label: "Único", value: "One-time" },
  { label: "Mensal", value: "Monthly" },
];

const INVESTMENT_TYPE_OPTIONS = [
  { label: "Ações", value: "Stocks" },
  { label: "Renda Fixa", value: "Bonds" },
  { label: "Imóveis", value: "Real Estate" },
  { label: "Criptomoedas", value: "Crypto" },
  { label: "Fundos de Investimento", value: "Mutual Funds" },
  { label: "ETF", value: "ETF" },
  { label: "Poupança", value: "Savings" },
  { label: "Outros", value: "Other" },
];

type EditFormData = {
  amount: string;
  startDate: string;
  endDate: string;
  category: string;
  frequency: string;
  description: string;
  durationInMonths: string;
  expectedReturn: string;
  typeInvestments: string;
};

const emptyForm: EditFormData = {
  amount: "",
  startDate: "",
  endDate: "",
  category: "",
  frequency: "",
  description: "",
  durationInMonths: "",
  expectedReturn: "",
  typeInvestments: "",
};

interface EditEntityModalProps {
  open: boolean;
  title: string;
  initialData: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  showDurationInMonths?: boolean;
  showExpenseCategories?: boolean;
  showFieldsInvestments?: boolean;
}

export function EditEntityModal({
  open,
  title,
  initialData,
  onSave,
  onCancel,
  showDurationInMonths = false,
  showExpenseCategories = false,
  showFieldsInvestments = false,
}: EditEntityModalProps) {
  const [formData, setFormData] = useState<EditFormData>(emptyForm);

  useEffect(() => {
    if (!initialData) return;

    setFormData({
      amount: String(initialData.value ?? initialData.amount ?? ""),
      startDate: String(initialData.startDate ?? ""),
      endDate: String(initialData.endDate ?? ""),
      category: String(initialData.category ?? ""),
      frequency: String(initialData.frequency ?? ""),
      description: String(initialData.description ?? ""),
      durationInMonths: String(initialData.durationInMonths ?? ""),
      expectedReturn: String(initialData.expectedReturn ?? ""),
      typeInvestments: String(initialData.typeInvestments ?? ""),
    });
  }, [initialData]);

  const handleChange = (field: keyof EditFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave({
      ...formData,
      amount: Number(formData.amount),
      durationInMonths: showDurationInMonths ? Number(formData.durationInMonths) : undefined,
      expectedReturn: showFieldsInvestments ? Number(formData.expectedReturn) : undefined,
      typeInvestments: showFieldsInvestments ? formData.typeInvestments : undefined,
    });
  };

  const categoryOptions = showExpenseCategories ? EXPENSE_CATEGORY_OPTIONS : INCOME_CATEGORY_OPTIONS;

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable className="flex-1 items-center justify-center bg-black/60 px-6" onPress={onCancel}>
        <Pressable
          className="w-full max-w-xl max-h-[85%] rounded-xl bg-card dark:bg-cardDark"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="border-b border-border dark:border-borderDark px-6 py-4">
            <Text className="text-lg font-bold text-cardForeground dark:text-cardForegroundDark">
              {title}
            </Text>
          </View>

          <ScrollView className="px-6 py-4" contentContainerClassName="gap-4">
            <View>
              <Label>Valor</Label>
              <Input
                keyboardType="decimal-pad"
                value={formData.amount}
                onChangeText={(v) => handleChange("amount", v)}
              />
            </View>

            <View>
              <Label>Data de Início (AAAA-MM-DD)</Label>
              <Input
                value={formData.startDate}
                onChangeText={(v) => handleChange("startDate", v)}
                placeholder="2026-01-31"
              />
            </View>

            {showFieldsInvestments ? (
              <>
                <View>
                  <Label>Tipo de Investimento</Label>
                  <Select
                    value={formData.typeInvestments}
                    onValueChange={(v) => handleChange("typeInvestments", v)}
                    options={INVESTMENT_TYPE_OPTIONS}
                    placeholder="Selecionar tipo"
                  />
                </View>

                <View>
                  <Label>Rentabilidade Esperada (%)</Label>
                  <Input
                    keyboardType="decimal-pad"
                    value={formData.expectedReturn}
                    onChangeText={(v) => handleChange("expectedReturn", v)}
                  />
                </View>

                <View>
                  <Label>Data de Término (AAAA-MM-DD)</Label>
                  <Input
                    value={formData.endDate}
                    onChangeText={(v) => handleChange("endDate", v)}
                    placeholder="2026-12-31"
                  />
                </View>
              </>
            ) : (
              <>
                <View>
                  <Label>Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => handleChange("category", v)}
                    options={categoryOptions}
                    placeholder="Selecionar categoria"
                  />
                </View>

                <View>
                  <Label>Frequência</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(v) => handleChange("frequency", v)}
                    options={FREQUENCY_OPTIONS}
                    placeholder="Selecionar frequência"
                  />
                </View>
              </>
            )}

            {showDurationInMonths && (
              <View>
                <Label>Duração (meses)</Label>
                <Input
                  keyboardType="number-pad"
                  value={formData.durationInMonths}
                  onChangeText={(v) => handleChange("durationInMonths", v)}
                />
              </View>
            )}

            <View>
              <Label>Descrição</Label>
              <Textarea
                rows={3}
                value={formData.description}
                onChangeText={(v) => handleChange("description", v)}
              />
            </View>

            <View className="flex-row justify-end gap-3 pt-2 pb-2">
              <Button variant="outline" onPress={onCancel}>
                Cancelar
              </Button>
              <Button onPress={handleSave}>Salvar alterações</Button>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
