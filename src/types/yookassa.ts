export interface YooKassaReceipt {
  customer?: { email?: string };
  items: {
    description: string;
    amount: { value: string; currency: string };
    quantity: number;
    vat_code?: number;
    payment_mode?: string;
    payment_subject?: string;
  }[];
  internet: "true" | "false";
}

export interface YooKassaCreatePayload {
  amount: { value: string; currency: string };
  description?: string;
  receipt?: YooKassaReceipt;
  confirmation: {
    type: "redirect";
    return_url: string;
  };
  capture: true;
  metadata?: Record<string, string | number | boolean>;
}

export interface YooKassaPaymentResponse {
  id: string;
  status: string;
  amount: { value: string; currency: string };
  metadata?: Record<string, string | number | boolean>;
  confirmation?: {
    type: string;
    confirmation_url: string;
    return_url: string;
  };
}
