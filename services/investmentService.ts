import api from "../lib/api";

export interface Investment {
  id?: string;
  description: string;
  value: number;
  startDate: string;
  endDate: string;
  typeInvestments: string;
  expectedReturn: number;
}

export interface InvestmentCreateInput {
  amount: number;
  description: string;
  startDate: string;
  endDate: string;
  type: string;
  expectedReturn: number;
}

export interface InvestmentUpdateInput {
  amount?: number;
  description?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  typeInvestments?: string;
  expectedReturn?: number;
}

export const investmentService = {
  create: async (data: InvestmentCreateInput) => {
    return api.post("/investments", {
      value: data.amount,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      typeInvestments: data.type,
      expectedReturn: data.expectedReturn,
    });
  },

  getAll: async (): Promise<Investment[]> => {
    const response = await api.get("/investments?size=9999");
    return response.data.content ?? [];
  },

  getTotal: async () => {
    const response = await api.get("/investments/total");
    return response.data;
  },

  update: async (id: number, data: InvestmentUpdateInput) => {
    return api.put(`/investments/${id}`, {
      value: data.amount,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      category: data.category,
      typeInvestments: data.typeInvestments,
      expectedReturn: data.expectedReturn,
    });
  },

  delete: async (id: number) => {
    return api.delete(`/investments/${id}`);
  },
};
