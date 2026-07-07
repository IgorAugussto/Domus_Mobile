import api from "../lib/api";

export interface PaymentMonthItem {
  outgoingId: number;
  description: string;
  value: number;
  category: string;
  paymentType: string;
  frequency: string;
  startDate: string;
  yearMonth: string;
  paid: boolean;
}

export const paymentStatusService = {
  getByMonth: async (yearMonth: string): Promise<PaymentMonthItem[]> => {
    const response = await api.get("/payment-status", {
      params: { yearMonth },
    });
    return response.data;
  },

  toggle: async (outgoingId: number, yearMonth: string, paid: boolean): Promise<PaymentMonthItem> => {
    const response = await api.put(`/payment-status/${outgoingId}`, null, {
      params: { yearMonth, paid },
    });
    return response.data;
  },
};
