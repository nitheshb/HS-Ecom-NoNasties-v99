/**
 * Transaction Create Operations
 * 
 * This file contains all CREATE operations related to transactions
 */

import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../app/db';
import { getISTISOString } from '../../utils/dateUtils';

// ============================================
// INTERFACES
// ============================================

export interface Transaction {
  docId?: string;
  id?: string;
  userid?: string;
  price?: number;
  status_description?: string;
  perform_time?: string;
  [key: string]: unknown;
}

// ============================================
// TRANSACTION CREATE OPERATIONS
// ============================================

/**
 * Create transaction
 */
export const createTransaction = async (transactionData: {
  id?: string; // Order ID
  userid?: string;
  price?: number;
  status_description?: string;
  perform_time?: string;
  [key: string]: unknown;
}) => {
  try {
    const transactionsRef = collection(db, 'p_transactions');
    const transaction = {
      ...transactionData,
      perform_time: transactionData.perform_time || getISTISOString(),
    };
    const docRef = await addDoc(transactionsRef, transaction);
    return { success: true, docId: docRef.id, transaction };
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

