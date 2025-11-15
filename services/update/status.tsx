/**
 * Status Update Operations
 * 
 * This file contains all UPDATE operations related to status collections
 */

import { doc, updateDoc, getDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
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
// STATUS UPDATE OPERATIONS
// ============================================

/**
 * Update status
 */
export const updateStatus = async (id: string, params: Partial<Omit<Status, 'id' | 'created_at'>>) => {
  const docRef = doc(db, 'T_Status', id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return { success: false, error: `Status with ID ${id} not found` };
  }
  
  // If this is being set as default, unset all other defaults
  if (params.default_key) {
    await unsetAllDefaults();
  }
  
  // Clean groups to remove undefined default_value fields if groups are being updated
  let cleanedParams = { ...params };
  if (params.groups) {
    const cleanedGroups: { [groupName: string]: { values: string[]; default_value?: string } } = {};
    Object.entries(params.groups).forEach(([groupName, group]) => {
      cleanedGroups[groupName] = {
        values: group.values,
        ...(group.default_value !== undefined && { default_value: group.default_value })
      };
    });
    cleanedParams.groups = cleanedGroups;
  }
  
  const updateData = {
    ...cleanedParams,
    updated_at: Timestamp.now().toMillis(),
  };
  
  try {
    await updateDoc(docRef, updateData);
    return { success: true, id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

