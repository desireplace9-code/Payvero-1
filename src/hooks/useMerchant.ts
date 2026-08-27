import { useState, useCallback } from 'react';
import { Merchant } from '../types';
import { merchantService } from '../services/merchant';

export function useMerchant() {
  const [merchant, setMerchant] = useState<Merchant>(() => merchantService.getMerchant());

  const updateMerchant = useCallback((updates: Partial<Merchant>) => {
    const result = merchantService.updateMerchant(updates);
    if (result.success) {
      setMerchant(result.merchant);
    }
    return result;
  }, []);

  const resetToDefault = useCallback(() => {
    const defaultMerchant = merchantService.resetToDefault();
    setMerchant(defaultMerchant);
  }, []);

  return {
    merchant,
    updateMerchant,
    resetToDefault,
  };
}
