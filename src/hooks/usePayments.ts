import { useState, useEffect, useCallback } from 'react';
import { CreatePaymentInput, Payment, PaymentStatus, RevenueSummary } from '../types';
import { paymentService } from '../services/payment';
import { blockchainService } from '../services/blockchain';

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<RevenueSummary>(() => paymentService.getMerchantRevenueSummary());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refresh = useCallback(() => {
    const list = paymentService.getAllPayments();
    setPayments(list);
    setSummary(paymentService.getMerchantRevenueSummary());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createPayment = useCallback((input: CreatePaymentInput) => {
    const res = paymentService.createPayment(input);
    if (res.success) {
      refresh();
    }
    return res;
  }, [refresh]);

  const getPayment = useCallback((id: string) => {
    return paymentService.getPaymentById(id);
  }, []);

  const updateStatus = useCallback((
    id: string, 
    status: PaymentStatus, 
    data?: { txHash?: string; customerWallet?: string; confirmedAt?: string; errorMessage?: string }
  ) => {
    const updated = paymentService.updatePaymentStatus(id, status, data);
    refresh();
    return updated;
  }, [refresh]);

  const verifyOnChain = useCallback(async (payment: Payment) => {
    if (!payment.txHash) {
      return { isConfirmed: false, status: payment.status, error: 'No transaction hash attached to payment.' };
    }
    const result = await blockchainService.verifyPayment(payment.txHash, payment);
    if (result.isConfirmed) {
      updateStatus(payment.id, 'confirmed', {
        txHash: result.txHash,
        confirmedAt: result.checkedAt,
      });
    } else if (result.status === 'failed') {
      updateStatus(payment.id, 'failed', {
        errorMessage: result.error || 'Transaction reverted on chain.',
      });
    }
    return result;
  }, [updateStatus]);

  return {
    payments,
    summary,
    isLoading,
    refresh,
    createPayment,
    getPayment,
    updateStatus,
    verifyOnChain,
  };
}
