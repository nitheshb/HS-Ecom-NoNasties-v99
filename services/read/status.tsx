/**
 * Status Read Operations
 * 
 * This file contains all READ operations related to statuses
 */

import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// CONSTANTS
// ============================================

const STATUS_COLLECTIONS_COLLECTION = 'status_collections';

// ============================================
// INTERFACES
// ============================================

export interface Status {
  id?: string;
  value: string;
  label: string;
  default_key?: boolean;
  created_at: number;
  updated_at: number;
  [key: string]: unknown;
}

export interface StatusCollection {
  id: string;
  value: string;
  groups: Record<string, {
    default_value: string;
    values: string[];
  }>;
  created_at: number;
  updated_at: number;
}

// ============================================
// STATUS READ OPERATIONS
// ============================================

/**
 * Get all statuses
 */
export const getAllStatuses = async () => {
  try {
    const statusesQuery = collection(db, 'T_Status');
    const querySnapshot = await getDocs(statusesQuery);
    const statuses: Status[] = querySnapshot.docs.map((docSnap) => docSnap.data() as Status);
    
    // Sort by created_at descending
    statuses.sort((a, b) => b.created_at - a.created_at);
    
    return { success: true, data: statuses };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Get status by ID
 */
export const getStatusById = async (id: string) => {
  try {
    const docRef = doc(db, 'T_Status', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() as Status };
    } else {
      return { success: false, error: 'Status not found' };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Get the default status
 */
export const getDefaultStatus = async () => {
  try {
    const statusesQuery = query(collection(db, 'T_Status'), where('default_key', '==', true));
    const querySnapshot = await getDocs(statusesQuery);
    
    if (querySnapshot.empty) {
      return { success: true, data: null };
    }
    
    const defaultStatus = querySnapshot.docs[0].data() as Status;
    return { success: true, data: defaultStatus };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Get status collection by status value
 */
export const getStatusCollection = async (statusValue: string): Promise<StatusCollection | null> => {
  try {
    const statusQuery = query(
      collection(db, STATUS_COLLECTIONS_COLLECTION),
      where('value', '==', statusValue)
    );
    const snapshot = await getDocs(statusQuery);
    
    if (snapshot.empty) {
      console.warn(`Status collection not found for value: ${statusValue}`);
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as StatusCollection;
  } catch (error) {
    console.error('Error fetching status collection:', error);
    return null;
  }
};

/**
 * Get the default substatus for a given status value
 */
export const getDefaultSubstatus = async (statusValue: string): Promise<string> => {
  const statusCollection = await getStatusCollection(statusValue);
  if (!statusCollection) {
    return 'Pending Confirmation'; // Default fallback
  }
  
  // Find the first group and return its default_value
  const groups = statusCollection.groups;
  const firstGroupKey = Object.keys(groups)[0];
  if (firstGroupKey && groups[firstGroupKey]) {
    return groups[firstGroupKey].default_value;
  }
  
  return 'Pending Confirmation'; // Default fallback
};

/**
 * Get all possible substatus values for a given status value
 */
export const getSubstatusValues = async (statusValue: string): Promise<string[]> => {
  const statusCollection = await getStatusCollection(statusValue);
  if (!statusCollection) {
    return ['Pending Confirmation']; // Default fallback
  }
  
  // Get all values from all groups
  const allValues: string[] = [];
  Object.values(statusCollection.groups).forEach(group => {
    if (Array.isArray(group.values)) {
      allValues.push(...group.values);
    }
  });
  
  // Remove duplicates and return
  return Array.from(new Set(allValues));
};

