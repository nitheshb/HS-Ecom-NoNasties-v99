/**
 * Wallet Read Operations
 * 
 * This file contains all READ operations related to wallets
 */

import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../app/db';
import { getISTISOString } from '../../utils/dateUtils';

// ============================================
// CONSTANTS
// ============================================

const WALLETS_COLLECTION = 'wallets';

// ============================================
// INTERFACES
// ============================================

export interface WalletRecord {
  user_id: string;
  balance: number;
  lastTransactionId: number;
  transactions: unknown[];
  updatedAt?: string;
}

// ============================================
// WALLET READ OPERATIONS
// ============================================

/**
 * Get all wallets
 */
export async function getAllWallets(): Promise<WalletRecord[]> {
  try {
    const walletsRef = collection(db, WALLETS_COLLECTION);
    const querySnapshot = await getDocs(walletsRef);
    const wallets: WalletRecord[] = [];
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      wallets.push({
        user_id: docSnap.id,
        balance: data.balance || 0,
        lastTransactionId: data.lastTransactionId || 0,
        transactions: data.transactions || [],
        updatedAt: data.updatedAt,
      });
    });
    
    return wallets;
  } catch (error) {
    console.error('Error fetching wallets:', error);
    throw error;
  }
}

/**
 * Get or create wallet for a user
 * Creates wallet if it doesn't exist, otherwise returns existing wallet
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
  return { user_id: userId, ...(snap.data() as any) } as WalletRecord;
}

// Export the function for use in other modules
export { getOrCreateWallet };

