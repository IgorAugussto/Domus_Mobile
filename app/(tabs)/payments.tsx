import { useState, useEffect, useMemo } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { FeedbackToast } from "@/components/FeedbackToast";
import { paymentStatusService, type PaymentMonthItem } from "@/services/paymentStatusService";

const MONTH_NAMES: Record<string, string> = {
  "01": "Janeiro", "02": "Fevereiro", "03": "Março",
  "04": "Abril", "05": "Maio", "06": "Junho",
  "07": "Julho", "08": "Agosto", "09": "Setembro",
  "10": "Outubro", "11": "Novembro", "12": "Dezembro",
};

const PAYMENT_ACCENT: Record<string, string> = {
  "Cartão de Crédito": "#ef4444",
  Boleto: "#f59e0b",
};

function getCurrentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatYearMonth(ym: string): string {
  const [year, month] = ym.split("-");
  return `${MONTH_NAMES[month] ?? month} ${year}`;
}

function addMonths(ym: string, delta: number): string {
  const [year, month] = ym.split("-").map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

const currency = (value: number) => `R$ ${Number(value).toFixed(2)}`;

type FilterStatus = "ALL" | "PENDING" | "PAID";

const FILTER_OPTIONS: { key: FilterStatus; label: string; color: string }[] = [
  { key: "ALL", label: "Todos", color: "#3b82f6" },
  { key: "PENDING", label: "Pendentes", color: "#ef4444" },
  { key: "PAID", label: "Pagos", color: "#10b981" },
];

export default function PaymentsScreen() {
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonth());
  const [payments, setPayments] = useState<PaymentMonthItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");

  const currentYearMonth = getCurrentYearMonth();
  const isCurrentMonth = yearMonth === currentYearMonth;

  useEffect(() => {
    setLoading(true);
    paymentStatusService
      .getByMonth(yearMonth)
      .then(setPayments)
      .catch(() => setToast({ message: "Erro ao carregar pagamentos.", type: "error" }))
      .finally(() => setLoading(false));
  }, [yearMonth]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleToggle = async (outgoingId: number, paid: boolean) => {
    try {
      const updated = await paymentStatusService.toggle(outgoingId, yearMonth, paid);
      setPayments((prev) => prev.map((p) => (p.outgoingId === outgoingId ? { ...p, paid: updated.paid } : p)));
      setToast({ message: paid ? "Marcado como pago!" : "Marcado como pendente.", type: "success" });
    } catch {
      setToast({ message: "Erro ao atualizar pagamento.", type: "error" });
    }
  };

  const handlePayAll = async () => {
    const pending = payments.filter((p) => !p.paid);
    if (pending.length === 0) return;
    try {
      await Promise.all(pending.map((p) => paymentStatusService.toggle(p.outgoingId, yearMonth, true)));
      setPayments((prev) => prev.map((p) => ({ ...p, paid: true })));
      setToast({ message: "Todos os pagamentos do mês marcados como pagos!", type: "success" });
    } catch {
      setToast({ message: "Erro ao atualizar pagamentos.", type: "error" });
    }
  };

  const filtered = useMemo(() => {
    if (filterStatus === "PENDING") return payments.filter((p) => !p.paid);
    if (filterStatus === "PAID") return payments.filter((p) => p.paid);
    return payments;
  }, [payments, filterStatus]);

  const grandTotal = payments.reduce((acc, p) => acc + Number(p.value), 0);
  const pendingTotal = payments.filter((p) => !p.paid).reduce((acc, p) => acc + Number(p.value), 0);
  const paidTotal = grandTotal - pendingTotal;
  const paidCount = payments.filter((p) => p.paid).length;
  const allPaid = payments.length > 0 && paidCount === payments.length;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-mutedForeground dark:text-mutedForegroundDark">Carregando pagamentos...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-slate-900">
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.outgoingId)}
        contentContainerClassName="p-4 gap-3"
        ListHeaderComponent={
          <View className="gap-4 mb-2">
            <View>
              <Text className="text-xl font-bold text-financial-trust dark:text-financial-trustDark">
                💳 Pagamentos
              </Text>
              <Text className="text-sm text-mutedForeground dark:text-mutedForegroundDark">
                Acompanhe o que ainda precisa ser pago
              </Text>
            </View>

            <View className="flex-row gap-1 p-1 rounded-xl border border-border dark:border-borderDark self-start">
              {FILTER_OPTIONS.map((opt) => {
                const isActive = filterStatus === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => setFilterStatus(opt.key)}
                    className="px-3 py-1.5 rounded-lg"
                    style={isActive ? { backgroundColor: `${opt.color}30` } : undefined}
                  >
                    <Text style={{ color: isActive ? opt.color : "#94a3b8" }} className="text-xs font-medium">
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Card>
              <CardContent className="pt-4 gap-2">
                <View className="flex-row items-center justify-between">
                  <Pressable
                    onPress={() => setYearMonth((ym) => addMonths(ym, -1))}
                    className="px-3 py-1.5 rounded-lg border border-border dark:border-borderDark"
                  >
                    <Text className="text-sm text-mutedForeground dark:text-mutedForegroundDark">← Anterior</Text>
                  </Pressable>

                  <View className="items-center">
                    <Text className="font-semibold text-base text-financial-trust dark:text-financial-trustDark">
                      {formatYearMonth(yearMonth)}
                    </Text>
                    {isCurrentMonth && (
                      <Text className="text-xs text-financial-trust dark:text-financial-trustDark">mês atual</Text>
                    )}
                  </View>

                  <Pressable
                    onPress={() => setYearMonth((ym) => addMonths(ym, 1))}
                    className="px-3 py-1.5 rounded-lg border border-border dark:border-borderDark"
                  >
                    <Text className="text-sm text-mutedForeground dark:text-mutedForegroundDark">Próximo →</Text>
                  </Pressable>
                </View>

                {!isCurrentMonth && (
                  <Pressable onPress={() => setYearMonth(getCurrentYearMonth())} className="items-center">
                    <Text className="text-xs text-financial-trust dark:text-financial-trustDark">
                      Voltar para o mês atual
                    </Text>
                  </Pressable>
                )}
              </CardContent>
            </Card>

            <View className="flex-row gap-3">
              <SummaryTile emoji="📊" label="Total Geral" value={grandTotal} colorClass="text-cardForeground dark:text-cardForegroundDark" />
              <SummaryTile emoji="⏳" label="Pendente" value={pendingTotal} colorClass="text-financial-danger dark:text-financial-dangerDark" />
              <SummaryTile emoji="✅" label="Pago" value={paidTotal} colorClass="text-financial-success dark:text-financial-successDark" />
            </View>

            <Card>
              <CardHeader className="pb-2 gap-2">
                <View className="flex-row items-center justify-between">
                  <CardTitle className="text-base">
                    {formatYearMonth(yearMonth)}{" "}
                    <Text className="text-xs font-normal text-mutedForeground dark:text-mutedForegroundDark">
                      {paidCount}/{payments.length} pago{paidCount !== 1 ? "s" : ""}
                    </Text>
                  </CardTitle>

                  {!allPaid && payments.length > 0 && (
                    <Pressable
                      onPress={handlePayAll}
                      className="px-3 py-1.5 rounded-lg border border-financial-success dark:border-financial-successDark"
                    >
                      <Text className="text-xs font-medium text-financial-success dark:text-financial-successDark">
                        ✅ Pagar todos
                      </Text>
                    </Pressable>
                  )}
                </View>

                <View className="h-1.5 rounded-full overflow-hidden bg-border dark:bg-borderDark">
                  <View
                    className="h-full rounded-full bg-financial-success dark:bg-financial-successDark"
                    style={{ width: `${payments.length > 0 ? (paidCount / payments.length) * 100 : 0}%` }}
                  />
                </View>
              </CardHeader>
            </Card>

            {payments.length === 0 && (
              <View className="items-center py-10">
                <Text className="text-3xl mb-2">📭</Text>
                <Text className="text-mutedForeground dark:text-mutedForegroundDark text-center">
                  Nenhuma despesa encontrada para {formatYearMonth(yearMonth)}.
                </Text>
                <Text className="text-xs mt-1 text-mutedForeground dark:text-mutedForegroundDark">
                  Use ← e → para navegar entre os meses.
                </Text>
              </View>
            )}

            {payments.length > 0 && filtered.length === 0 && (
              <Text className="text-center py-6 text-sm text-mutedForeground dark:text-mutedForegroundDark">
                Nenhuma despesa encontrada para o filtro selecionado.
              </Text>
            )}
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item }) => (
          <PaymentRow item={item} onToggle={handleToggle} />
        )}
      />

      {toast && <FeedbackToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </View>
  );
}

function SummaryTile({
  emoji,
  label,
  value,
  colorClass,
}: {
  emoji: string;
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <View className="flex-1 rounded-xl border border-border dark:border-borderDark p-3 items-center">
      <Text className="text-xl">{emoji}</Text>
      <Text className={`font-bold text-sm mt-1 ${colorClass}`}>{currency(value)}</Text>
      <Text className="text-xs mt-0.5 text-mutedForeground dark:text-mutedForegroundDark">{label}</Text>
    </View>
  );
}

function PaymentRow({
  item,
  onToggle,
}: {
  item: PaymentMonthItem;
  onToggle: (outgoingId: number, paid: boolean) => void;
}) {
  const accent = PAYMENT_ACCENT[item.paymentType] ?? PAYMENT_ACCENT["Cartão de Crédito"];

  return (
    <View
      className="p-3 rounded-lg border border-border dark:border-borderDark flex-row justify-between items-center gap-3"
      style={{ opacity: item.paid ? 0.6 : 1 }}
    >
      <View className="flex-1 gap-0.5">
        <Text
          className="font-medium text-cardForeground dark:text-cardForegroundDark"
          style={item.paid ? { textDecorationLine: "line-through" } : undefined}
        >
          {item.description}
        </Text>
        <Text className="text-xs text-mutedForeground dark:text-mutedForegroundDark">
          {item.frequency === "Monthly" ? "Mensal" : "Único"} ·{" "}
          <Text style={{ color: accent }}>{item.paymentType}</Text>
        </Text>
      </View>

      <Text className="text-sm font-bold" style={{ color: item.paid ? "#94a3b8" : accent }}>
        {currency(item.value)}
      </Text>

      <View
        className="px-2 py-0.5 rounded-full border"
        style={{
          borderColor: item.paid ? "#10b98166" : `${accent}66`,
          backgroundColor: item.paid ? "#10b9811a" : `${accent}1a`,
        }}
      >
        <Text className="text-xs font-medium" style={{ color: item.paid ? "#10b981" : accent }}>
          {item.paid ? "Pago" : "Pendente"}
        </Text>
      </View>

      <Pressable onPress={() => onToggle(item.outgoingId, !item.paid)}>
        <Text className="text-base">{item.paid ? "↩️" : "✅"}</Text>
      </Pressable>
    </View>
  );
}
