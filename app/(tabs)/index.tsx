import { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, useWindowDimensions } from "react-native";
import dayjs from "dayjs";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LineChart, PieChart } from "react-native-gifted-charts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SpendingGoalModal } from "@/components/SpendingGoalModal";
import { costService, type Cost } from "@/services/costService";
import { incomeService, type Income } from "@/services/incomeService";
import { investmentService, type Investment } from "@/services/investmentService";
import {
  dashboardService,
  type MonthlyProjection,
  type YearlyProjection,
} from "@/services/dashboardService";
import { investmentTypeLabels } from "@/utils/labels/investmentTypeLabels";
import { expenseCategoryLabels } from "@/utils/labels/expenseCategoryLabels";

const SPENDING_GOAL_KEY = "domus.spendingGoal";

const currency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const PIE_PALETTE = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#94a3b8"];
const INVESTMENT_PALETTE = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981"];

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const chartWidth = width - 32 - 48; // padding da tela + padding do card

  const [costs, setCosts] = useState<Cost[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyProjection[]>([]);
  const [yearlyData, setYearlyData] = useState<YearlyProjection[]>([]);
  const [activeTab, setActiveTab] = useState<"ANUAL" | "MENSAL">("ANUAL");

  const [selectedMonth, setSelectedMonth] = useState(() => dayjs().format("YYYY-MM"));
  const [selectedYear] = useState(() => dayjs().year());

  const [kpiIncome, setKpiIncome] = useState(0);
  const [kpiExpenses, setKpiExpenses] = useState(0);
  const [kpiInvestments, setKpiInvestments] = useState(0);
  const [kpiNetWorth, setKpiNetWorth] = useState(0);
  const [kpiSavingsRate, setKpiSavingsRate] = useState(0);

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [spendingGoal, setSpendingGoal] = useState(0);
  const [showGoalLine, setShowGoalLine] = useState(false);

  const totalInvestments = useMemo(
    () => investments.reduce((acc, inv) => acc + Number(inv.value), 0),
    [investments],
  );

  const loadMonthlySummary = useCallback(async (month: string) => {
    try {
      const data = await dashboardService.getMonthlySummary(month);
      setKpiIncome(Number(data.income));
      setKpiExpenses(Number(data.expenses));
      setKpiInvestments(Number(data.investments));
      setKpiNetWorth(Number(data.netWorth));
      setKpiSavingsRate(Number(data.savingsRate));
    } catch (err) {
      console.error("Erro ao carregar resumo mensal", err);
    }
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [costData, incomeData, investmentData, monthlyProjectionData, yearlyProjectionData] =
          await Promise.all([
            costService.getAll(),
            incomeService.getAll(),
            investmentService.getAll(),
            dashboardService.getMonthlyProjection(),
            dashboardService.getYearlyProjection(selectedYear),
          ]);

        setCosts(costData);
        setIncomes(incomeData);
        setInvestments(investmentData);
        setMonthlyData(monthlyProjectionData);
        setYearlyData(yearlyProjectionData);

        await loadMonthlySummary(selectedMonth);

        const savedGoal = await AsyncStorage.getItem(SPENDING_GOAL_KEY);
        if (savedGoal) {
          setSpendingGoal(Number(savedGoal));
          setShowGoalLine(true);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  useEffect(() => {
    loadMonthlySummary(selectedMonth);
  }, [selectedMonth, loadMonthlySummary]);

  const handleSaveGoal = async (goal: number) => {
    setSpendingGoal(goal);
    setShowGoalLine(true);
    setShowGoalModal(false);
    await AsyncStorage.setItem(SPENDING_GOAL_KEY, goal.toString());
  };

  const handleToggleGoal = async () => {
    if (showGoalLine) {
      setShowGoalLine(false);
      setSpendingGoal(0);
      await AsyncStorage.removeItem(SPENDING_GOAL_KEY);
    } else {
      setShowGoalModal(true);
    }
  };

  const expectedReturnAverage = useMemo(() => {
    if (totalInvestments === 0) return 0;
    const weightedReturn = investments.reduce((acc, inv) => {
      const value = Number(inv.value);
      const rate = Number(inv.expectedReturn) || 0;
      return acc + value * (rate / 100);
    }, 0);
    return (weightedReturn / totalInvestments) * 100;
  }, [investments, totalInvestments]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-mutedForeground dark:text-mutedForegroundDark">
          Carregando seu dashboard financeiro...
        </Text>
      </View>
    );
  }

  const categoryTotals: Record<string, number> = {};
  costs.forEach((c) => {
    if (!c.category) return;
    categoryTotals[c.category] = (categoryTotals[c.category] || 0) + Number(c.value);
  });

  const expenseCategoryPie = Object.entries(categoryTotals).map(([name, value], i) => ({
    value,
    color: PIE_PALETTE[i % PIE_PALETTE.length],
    text: expenseCategoryLabels[name] ?? name,
  }));

  const investmentTypeTotals: Record<string, number> = {};
  investments.forEach((inv) => {
    if (!inv.typeInvestments) return;
    investmentTypeTotals[inv.typeInvestments] =
      (investmentTypeTotals[inv.typeInvestments] || 0) + Number(inv.value);
  });

  const investmentPie = Object.entries(investmentTypeTotals).map(([name, value], i) => ({
    value,
    color: INVESTMENT_PALETTE[i % INVESTMENT_PALETTE.length],
    text: investmentTypeLabels[name] ?? name,
  }));

  const chartSource = activeTab === "ANUAL" ? yearlyData : monthlyData;
  const xLabels = chartSource.map((d) => ("period" in d ? d.period : d.month));

  const incomeLine = chartSource.map((d, i) => ({ value: d.income, label: xLabels[i] }));
  const expensesLine = chartSource.map((d) => ({ value: d.expenses }));
  const investmentsLine = chartSource.map((d) => ({ value: d.investments }));

  return (
    <View className="flex-1 bg-white dark:bg-slate-900">
      <ScrollView contentContainerClassName="p-4 gap-4">
        <View className="flex-row items-center gap-2">
          <View className="p-2 rounded-lg bg-financial-trustLight dark:bg-financial-trustLightDark">
            <Ionicons name="pie-chart" size={22} color="#3b82f6" />
          </View>
          <Text className="text-2xl font-bold text-financial-trust dark:text-financial-trustDark">
            Dashboard Financeiro
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-3">
          <KpiCard
            label="Renda Total"
            value={currency(kpiIncome)}
            icon="wallet"
            colorClass="text-financial-success dark:text-financial-successDark"
            bgClass="bg-financial-successLight dark:bg-financial-successLightDark"
            hint={`${incomes.length} lançamentos`}
          />
          <KpiCard
            label="Despesas Totais"
            value={currency(kpiExpenses)}
            icon="cash"
            colorClass="text-financial-danger dark:text-financial-dangerDark"
            bgClass="bg-financial-dangerLight dark:bg-financial-dangerLightDark"
            hint={`${costs.length} lançamentos`}
          />
          <KpiCard
            label="Carteira de Investimentos"
            value={currency(kpiInvestments)}
            icon="trending-up"
            colorClass="text-financial-investment dark:text-financial-investmentDark"
            bgClass="bg-financial-investmentLight dark:bg-financial-investmentLightDark"
            hint={`+${expectedReturnAverage.toFixed(2)}% retorno esperado`}
          />
          <KpiCard
            label="Patrimônio Líquido"
            value={currency(kpiNetWorth)}
            icon="trophy"
            colorClass="text-financial-trust dark:text-financial-trustDark"
            bgClass="bg-financial-trustLight dark:bg-financial-trustLightDark"
            hint={`Economizou: ${kpiSavingsRate}%`}
          />
        </View>

        <View className="flex-row gap-2">
          <Pressable
            onPress={() => setActiveTab("ANUAL")}
            className={`flex-1 items-center rounded-lg py-2 ${activeTab === "ANUAL" ? "bg-financial-trust dark:bg-financial-trustDark" : "bg-card dark:bg-cardDark border border-border dark:border-borderDark"}`}
          >
            <Text className={activeTab === "ANUAL" ? "text-white font-semibold" : "text-cardForeground dark:text-cardForegroundDark"}>
              Anual
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("MENSAL")}
            className={`flex-1 items-center rounded-lg py-2 ${activeTab === "MENSAL" ? "bg-financial-trust dark:bg-financial-trustDark" : "bg-card dark:bg-cardDark border border-border dark:border-borderDark"}`}
          >
            <Text className={activeTab === "MENSAL" ? "text-white font-semibold" : "text-cardForeground dark:text-cardForegroundDark"}>
              Mensal
            </Text>
          </Pressable>
        </View>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{activeTab === "ANUAL" ? "Visão Anual" : "Visão Mensal"}</CardTitle>
            <Button
              size="sm"
              variant={showGoalLine ? "default" : "outline"}
              onPress={handleToggleGoal}
              className={showGoalLine ? "bg-cyan-500" : undefined}
            >
              {showGoalLine ? "Meta Ativa" : "Definir Meta"}
            </Button>
          </CardHeader>
          <CardContent>
            {showGoalLine && spendingGoal > 0 && (
              <Text className="text-xs mb-2 text-cyan-600 dark:text-cyan-400">
                Meta mensal de gastos: {currency(spendingGoal)}
              </Text>
            )}

            {chartSource.length === 0 ? (
              <View className="items-center py-10">
                <Text className="text-lg font-medium text-cardForeground dark:text-cardForegroundDark">
                  Ainda não há histórico
                </Text>
                <Text className="text-sm text-mutedForeground dark:text-mutedForegroundDark">
                  Cadastre rendas e despesas para ver o gráfico crescer
                </Text>
              </View>
            ) : (
              <LineChart
                data={incomeLine}
                data2={expensesLine}
                data3={investmentsLine}
                areaChart
                areaChart2
                areaChart3
                color="#10b981"
                color2="#ef4444"
                color3="#f59e0b"
                startFillColor="#10b981"
                startFillColor2="#ef4444"
                startFillColor3="#f59e0b"
                endFillColor="#10b981"
                endFillColor2="#ef4444"
                endFillColor3="#f59e0b"
                startOpacity={0.3}
                endOpacity={0.02}
                thickness={2}
                hideDataPoints
                curved
                width={chartWidth}
                height={220}
                yAxisTextStyle={{ color: "#94a3b8", fontSize: 10 }}
                xAxisLabelTextStyle={{ color: "#94a3b8", fontSize: 9 }}
                noOfSections={4}
                rulesColor="#e2e8f0"
              />
            )}

            {activeTab === "ANUAL" && chartSource.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
                <View className="flex-row gap-2">
                  {xLabels.map((label) => (
                    <Pressable
                      key={label}
                      onPress={() => setSelectedMonth(label)}
                      className={`px-3 py-1.5 rounded-lg border ${selectedMonth === label ? "bg-financial-trust border-financial-trust" : "border-border dark:border-borderDark"}`}
                    >
                      <Text className={selectedMonth === label ? "text-white text-xs font-semibold" : "text-xs text-cardForeground dark:text-cardForegroundDark"}>
                        {label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            )}
          </CardContent>
        </Card>

        {expenseCategoryPie.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Despesas por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="items-center">
              <PieChart data={expenseCategoryPie} radius={90} showText textColor="#fff" textSize={11} />
              <PieLegend items={expenseCategoryPie} />
            </CardContent>
          </Card>
        )}

        {investmentPie.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Alocação de Investimentos</CardTitle>
            </CardHeader>
            <CardContent className="items-center">
              <PieChart data={investmentPie} radius={90} showText textColor="#fff" textSize={11} />
              <PieLegend items={investmentPie} />
            </CardContent>
          </Card>
        )}
      </ScrollView>

      <SpendingGoalModal
        open={showGoalModal}
        currentGoal={spendingGoal}
        onSave={handleSaveGoal}
        onCancel={() => setShowGoalModal(false)}
      />
    </View>
  );
}

function KpiCard({
  label,
  value,
  icon,
  colorClass,
  bgClass,
  hint,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  colorClass: string;
  bgClass: string;
  hint: string;
}) {
  return (
    <Card className="flex-1 min-w-[45%]">
      <CardContent className="pt-4 gap-1">
        <View className="flex-row items-center justify-between">
          <Text className={`text-xs font-medium ${colorClass}`}>{label}</Text>
          <View className={`p-1.5 rounded-md ${bgClass}`}>
            <Ionicons name={icon} size={14} />
          </View>
        </View>
        <Text className={`text-lg font-bold ${colorClass}`}>{value}</Text>
        <Text className={`text-[10px] ${colorClass}`}>{hint}</Text>
      </CardContent>
    </Card>
  );
}

function PieLegend({ items }: { items: { color?: string; text?: string; value: number }[] }) {
  return (
    <View className="flex-row flex-wrap justify-center gap-x-4 gap-y-1 mt-3">
      {items.map((item) => (
        <View key={item.text} className="flex-row items-center gap-1.5">
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} />
          <Text className="text-xs text-cardForeground dark:text-cardForegroundDark">
            {item.text}: {currency(item.value)}
          </Text>
        </View>
      ))}
    </View>
  );
}
