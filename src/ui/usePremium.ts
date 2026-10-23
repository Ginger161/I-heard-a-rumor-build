import { useSyncExternalStore } from 'react';
import { Entitlement, getEntitlement, subscribePremium } from '../engine/premium';

export const usePremium = (): Entitlement | null => useSyncExternalStore(subscribePremium, getEntitlement, () => null);
