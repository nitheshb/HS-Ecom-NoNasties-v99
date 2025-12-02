/**
 * Status Create Operations
 * 
 * This file contains all CREATE operations related to status collections
 */

import { doc, setDoc, collection, getDocs, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

export interface Status {
  id: string;
  label: string;
  value: string;
  groups: {
    [groupName: string]: {
      values: string[];
      default_value?: string;
    };
  };
  default_key: boolean;
  created_at: number;
  updated_at: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Helper function to unset all default statuses
 */
const unsetAllDefaults = async () => {
  try {
    const statusesQuery = collection(db, 'T_Status');
    const querySnapshot = await getDocs(statusesQuery);
    
    const updatePromises = querySnapshot.docs.map(async (docSnap) => {
      const data = docSnap.data() as Status;
      if (data.default_key) {
        await updateDoc(docSnap.ref, { 
          default_key: false,
          updated_at: Timestamp.now().toMillis()
        });
      }
    });
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error unsetting defaults:', error);
  }
};

// ============================================
// STATUS CREATE OPERATIONS
// ============================================

/**
 * Create status
 */
export const createStatus = async (params: Omit<Status, 'id' | 'created_at' | 'updated_at'>) => {
  const id = Date.now().toString();
  
  // If this is being set as default, unset all other defaults
  if (params.default_key) {
    await unsetAllDefaults();
  }
  
  // Clean groups to remove undefined default_value fields
  const cleanedGroups: { [groupName: string]: { values: string[]; default_value?: string } } = {};
  Object.entries(params.groups).forEach(([groupName, group]) => {
    cleanedGroups[groupName] = {
      values: group.values,
      ...(group.default_value !== undefined && { default_value: group.default_value })
    };
  });
  
  const status: Status = {
    id,
    ...params,
    groups: cleanedGroups,
    created_at: Timestamp.now().toMillis(),
    updated_at: Timestamp.now().toMillis(),
  };
  
  try {
    await setDoc(doc(db, 'T_Status', id), status);
    return { success: true, ...status };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

