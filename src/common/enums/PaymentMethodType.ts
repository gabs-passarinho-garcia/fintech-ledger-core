/**
 * Payment method types supported by the payment system.
 */
export const PaymentMethodType = {
  BOLETO: 'BOLETO',
  PIX: 'PIX',
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  MANUAL_ENTRY: 'MANUAL_ENTRY',
} as const;

/**
 * Type representing a payment method identifier.
 */
export type PaymentMethodType = (typeof PaymentMethodType)[keyof typeof PaymentMethodType];
