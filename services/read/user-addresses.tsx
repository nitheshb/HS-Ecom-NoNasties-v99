import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/db';
import { v4 as uuidv4 } from 'uuid';

const USERS_COLLECTION = 'T_users';

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

/**
 * Get all addresses for a user
 */
export const getUserAddresses = async (uid: string): Promise<Address[]> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return [];
    }
    
    const data = userSnap.data();
    return (data.addresses || []) as Address[];
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    throw error;
  }
};

/**
 * Add a new address for a user
 */
export const addUserAddress = async (uid: string, address: Omit<Address, 'id'>): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);
    
    const newAddress: Address = {
      id: uuidv4(),
      ...address,
    };
    
    // Get existing addresses
    const existingAddresses = (userSnap.data()?.addresses || []) as Address[];
    
    // If this is set as default, unset all other defaults
    const updatedAddresses = existingAddresses.map((addr) => ({
      ...addr,
      isDefault: newAddress.isDefault ? false : addr.isDefault,
    }));
    
    // Add the new address
    updatedAddresses.push(newAddress);
    
    await updateDoc(userRef, {
      addresses: updatedAddresses,
    });
  } catch (error) {
    console.error('Error adding user address:', error);
    throw error;
  }
};

/**
 * Delete an address for a user
 */
export const deleteUserAddress = async (uid: string, addressId: string): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('User not found');
    }
    
    const addresses = (userSnap.data().addresses || []) as Address[];
    const updatedAddresses = addresses.filter((addr) => addr.id !== addressId);
    
    await updateDoc(userRef, {
      addresses: updatedAddresses,
    });
  } catch (error) {
    console.error('Error deleting user address:', error);
    throw error;
  }
};

/**
 * Update an address for a user
 */
export const updateUserAddress = async (uid: string, addressId: string, updates: Partial<Address>): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('User not found');
    }
    
    const addresses = (userSnap.data().addresses || []) as Address[];
    const updatedAddresses = addresses.map((addr) => {
      if (addr.id === addressId) {
        return { ...addr, ...updates };
      }
      // If setting this as default, unset others
      if (updates.isDefault && addr.isDefault && addr.id !== addressId) {
        return { ...addr, isDefault: false };
      }
      return addr;
    });
    
    await updateDoc(userRef, {
      addresses: updatedAddresses,
    });
  } catch (error) {
    console.error('Error updating user address:', error);
    throw error;
  }
};

