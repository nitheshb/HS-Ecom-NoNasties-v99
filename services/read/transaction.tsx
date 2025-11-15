/**
 * Transaction Read Operations
 * 
 * This file contains all READ operations related to transactions
 */

import { collection, getDocs, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

export interface Transaction {
  id: string;
  docId: string; // Firestore document ID
  user_id: string;
  amount: number;
  type: 'deduct' | 'credit' | 'subscription_precheck';
  method: string;
  orderId?: string;
  description?: string;
  createdAt: string;
  [key: string]: unknown;
}

// ============================================
// TRANSACTION READ OPERATIONS
// ============================================

/**
 * Get all transactions
 */
export const getAllTransactions = async () => {
  try {
    const transactionsQuery = query(collection(db, 'p_transactions'));
    const querySnapshot = await getDocs(transactionsQuery);
    const transactions: Transaction[] = querySnapshot.docs.map((docSnap) => {
      // Do NOT overwrite the nested `id` field from data; keep Firestore doc id separately
      const data = docSnap.data() as Omit<Transaction, 'docId'>;
      return { ...data, docId: docSnap.id } as Transaction;
    });
    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

/**
 * Get transaction by Firestore document ID
 */
export const getTransactionById = async (transactionDocId: string) => {
  try {
    const transactions = await getAllTransactions();
    return transactions.find(t => t.docId === transactionDocId);
  } catch (error) {
    console.error('Error fetching transaction by ID:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time transaction updates
 */
export const subscribeToTransactions = (callback: (transactions: Transaction[]) => void) => {
  const transactionsQuery = query(collection(db, 'p_transactions'));
  return onSnapshot(transactionsQuery, (querySnapshot) => {
    const transactions: Transaction[] = querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Omit<Transaction, 'docId'>;
      return { ...data, docId: docSnap.id } as Transaction;
    });
    callback(transactions);
  });
};

