import api from "../lib/api";

export interface MonthlyProjection {
  month: string;
  income: number;
  expenses: number;
  investments: number;
}

export interface YearlyProjection {
  period: string; // "2025-01" ou "2025-01-15"
  income: number;
  expenses: number;
  investments: number;
}

export const dashboardService = {
  getSummary: async () => {
    const response = await api.get("/dashboard/summary");
    return response.data;
  },

  getMonthlyProjection: async (): Promise<MonthlyProjection[]> => {
    const response = await api.get("/dashboard/projection/month");
    return Array.isArray(response.data) ? response.data : [];
  },

  getYearlyProjection: async (year?: number): Promise<YearlyProjection[]> => {
    const params = year ? { year } : {};
    const response = await api.get("/dashboard/projection/year", { params });
    return Array.isArray(response.data) ? response.data : [];
  },

  getMonthlySummary: async (month: string) => {
    const response = await api.get("/dashboard/summary/monthly", {
      params: { month },
    });
    return response.data;
  },
};
