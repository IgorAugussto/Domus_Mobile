import api from "../lib/api";

export type PaymentType = "Cartão de Crédito" | "Boleto";

export interface Cost {
  id: number;
  description: string;
  value: number;
  startDate: string;
  category: string;
  frequency: string;
  durationInMonths: number;
  paymentType: PaymentType;
  paid: boolean;
}

export interface CostCreateInput {
  amount: number; // valor que o usuário digita
  description: string;
  startDate: string;
  category: string;
  frequency: string;
  durationInMonths: number;
  paymentType: PaymentType;
  paid?: boolean; // opcional
}

export interface CostUpdateInput {
  amount?: number; // pode vir como amount (novo) ou value (antigo)
  value?: number; // mantemos compatibilidade
  description?: string;
  startDate?: string;
  category?: string;
  frequency?: string;
  durationInMonths?: number;
  paymentType?: PaymentType;
  paid?: boolean;
}

export const costService = {
  create: async (data: CostCreateInput) => {
    return api.post("/costs", {
      value: data.amount,
      description: data.description,
      startDate: data.startDate,
      category: data.category,
      frequency: data.frequency,
      durationInMonths: data.durationInMonths,
      paymentType: data.paymentType,
      paid: data.paid ?? false,
    });
  },

  getAll: async () => {
    const response = await api.get("/costs?size=9999");
    return response.data.content ?? [];
  },

  getTotal: async () => {
    const response = await api.get("/costs/total");
    return response.data;
  },

  update: async (id: number, data: CostUpdateInput) => {
    const payload = {
      value: data.amount ?? data.value, // prioriza amount (novo valor do modal)
      description: data.description,
      startDate: data.startDate,
      category: data.category,
      frequency: data.frequency,
      durationInMonths: data.durationInMonths,
      paymentType: data.paymentType,
      paid: data.paid,
    };
    return api.put(`/costs/${id}`, payload);
  },

  delete: async (id: number) => {
    return api.delete(`/costs/${id}`);
  },
};
