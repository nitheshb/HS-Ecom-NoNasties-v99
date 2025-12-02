/**
 * Brand Create Operations
 * 
 * This file contains all CREATE operations related to brands
 */

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../app/db';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// INTERFACES
// ============================================

export interface Brand {
  id: string;
  uuid: string;
  title: string;
  active: boolean;
  img?: string;
  products_count?: number;
  created_at?: number;
  updated_at?: number;
  [key: string]: unknown;
}

// ============================================
// BRAND CREATE OPERATIONS
// ============================================

/**
 * Create brand
 */
export const createBrandDb = async (orgId: string, payload: { params: Record<string, unknown> }) => {
  const { params } = payload;
  const did = uuidv4();
  const brandData = {
    id: did,
    uuid: did,
    title: params.title as string || "",
    active: params.active === undefined ? true : Boolean(params.active),
    img: params.img as string || "",
    created_at: Timestamp.now().toMillis(),
    updated_at: Timestamp.now().toMillis(),
  };
  try {
    await addDoc(collection(db, `P_brands`), brandData);
    return {
      success: true,
      ...brandData,
      _timestamp: new Date().getTime()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

