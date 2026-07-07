import api from "../lib/api";

export interface Income {
  id?: string;
  description: string;
  value: number;
  startDate: string;
  endDate: string;
  frequency: string;
  recurring: boolean;
  category: string;
}

export interface IncomeCreateInput {
  amount: number;
  description: string;
  startDate: string;
  endDate: string;
  recurring: boolean;
  category: string;
  frequency: string;
}

export interface IncomeUpdateInput {
  amount?: number;
  description?: string;
  startDate?: string;
  category?: string;
  frequency?: string;
}

export const incomeService = {
  create: async (data: IncomeCreateInput) => {
    return api.post("/income", {
      value: data.amount,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      recurring: data.recurring,
      category: data.category,
      frequency: data.frequency,
    });
  },

  getAll: async () => {
    const response = await api.get("/income?size=9999");
    return response.data.content ?? [];
  },

  getTotal: async () => {
    const response = await api.get("/income/total");
    return response.data;
  },

  update: async (id: number, data: IncomeUpdateInput) => {
    return api.put(`/income/${id}`, {
      value: data.amount,
      description: data.description,
      startDate: data.startDate,
      category: data.category,
      frequency: data.frequency,
    });
  },

  delete: async (id: number) => {
    return api.delete(`/income/${id}`);
  },
};
