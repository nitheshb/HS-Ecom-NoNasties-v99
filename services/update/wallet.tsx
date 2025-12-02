/**
 * Wallet Update Operations
 * 
 * This file contains all UPDATE operations related to wallets:
 * - Deduct from wallet
 * - Add to wallet
 */

import { doc, updateDoc, getDoc, setDoc, collection } from 'firebase/firestore';
import { db } from '../../app/db';
import { getISTISOString } from '../../utils/dateUtils';

// ============================================
// INTERFACES
// ============================================

export interface WalletTransaction {
  id: number;
  type: 'add' | 'deduct' | 'refund' | 'subscription_precheck' | string;
  method: 'wallet' | 'Razorpay' | string;
  amount: number;
  createdAt: string;
  paymentId?: string;
  orderId?: string;
}

export interface WalletRecord {
  user_id: string;
  balance: number;
  lastTransactionId: number;
  transactions: WalletTransaction[];
  updatedAt?: string;
}

// ============================================
// CONSTANTS
// ============================================

const WALLETS_COLLECTION = 'p_wallets';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get or create wallet for a user
 */
async function getOrCreateWallet(userId: string): Promise<WalletRecord> {
  const ref = doc(collection(db, WALLETS_COLLECTION), userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const now = getISTISOString();
    const initial: WalletRecord = { user_id: userId, balance: 0, lastTransactionId: 0, transactions: [], updatedAt: now };
    await setDoc(ref, initial);
    return initial;
  }
  return { ...(snap.data() as WalletRecord), user_id: userId } as WalletRecord;
}

// ============================================
// WALLET UPDATE OPERATIONS
// ============================================

/**
 * Deduct from wallet
 */
export async function deductFromWallet(
  userId: string, 
  amount: number, 
  opts?: Partial<Omit<WalletTransaction, 'id' | 'amount' | 'createdAt'>> & { orderId?: string }
) {
  if (amount <= 0) return { success: true };
  const ref = doc(collection(db, WALLETS_COLLECTION), userId);
  const wallet = await getOrCreateWallet(userId);
  if (wallet.balance < amount) {
    return { success: false, message: 'Insufficient wallet balance' };
  }
  
  const txType = (opts?.type as string) || 'deduct';
  
  // For 'subscription_precheck', only check balance and return - don't record transaction or modify wallet
  if (txType === 'subscription_precheck') {
    return { success: true, data: { balance: wallet.balance } };
  }
  
  // For all other types, deduct the amount and record the transaction
  const nextId = (wallet.lastTransactionId || 0) + 1;
  const tx: WalletTransaction = {
    id: nextId,
    type: txType,
    method: (opts?.method as string) || 'wallet',
    amount,
    createdAt: getISTISOString(),
  };
  
  // Only add optional fields if they are defined
  if (opts?.orderId) {
    tx.orderId = opts.orderId;
  }
  if (opts?.paymentId) {
    tx.paymentId = opts.paymentId;
  }
  
  const newBalance = (wallet.balance || 0) - amount;
  
  // Clean existing transactions to remove any undefined values
  const cleanExistingTransactions = (wallet.transactions || []).map(t => {
    const clean: Record<string, unknown> = {
      id: t.id,
      type: t.type,
      method: t.method,
      amount: t.amount,
      createdAt: t.createdAt,
    };
    if (t.orderId) clean.orderId = t.orderId;
    if (t.paymentId) clean.paymentId = t.paymentId;
    return clean;
  });
  
  const updated = {
    balance: newBalance,
    lastTransactionId: nextId,
    transactions: [...cleanExistingTransactions, tx],
    updatedAt: tx.createdAt,
  };
  await updateDoc(ref, updated);
  return { success: true, data: { balance: newBalance, transaction: tx } };
}

/**
 * Add to wallet (credit)
 */
export async function addToWallet(
  userId: string, 
  amount: number, 
  opts?: Partial<Omit<WalletTransaction, 'id' | 'amount' | 'createdAt'>> & { orderId?: string }
) {
  if (amount <= 0) return { success: false, message: 'Amount must be greater than 0' };
  const ref = doc(collection(db, WALLETS_COLLECTION), userId);
  const wallet = await getOrCreateWallet(userId);
  
  const txType = (opts?.type as string) || 'add';
  const nextId = (wallet.lastTransactionId || 0) + 1;
  const tx: WalletTransaction = {
    id: nextId,
    type: txType,
    method: (opts?.method as string) || 'wallet',
    amount,
    createdAt: getISTISOString(),
  };
  
  // Only add optional fields if they are defined
  if (opts?.orderId) {
    tx.orderId = opts.orderId;
  }
  if (opts?.paymentId) {
    tx.paymentId = opts.paymentId;
  }
  
  const newBalance = (wallet.balance || 0) + amount;
  
  // Clean existing transactions to remove any undefined values
  const cleanExistingTransactions = (wallet.transactions || []).map(t => {
    const clean: Record<string, unknown> = {
      id: t.id,
      type: t.type,
      method: t.method,
      amount: t.amount,
      createdAt: t.createdAt,
    };
    if (t.orderId) clean.orderId = t.orderId;
    if (t.paymentId) clean.paymentId = t.paymentId;
    return clean;
  });
  
  const updated = {
    balance: newBalance,
    lastTransactionId: nextId,
    transactions: [...cleanExistingTransactions, tx],
    updatedAt: tx.createdAt,
  };
  await updateDoc(ref, updated);
  return { success: true, data: { balance: newBalance, transaction: tx } };
}

