/**
 * User Create Operations
 * 
 * This file contains all CREATE operations related to users:
 * - User profile creation
 * - Address location creation
 */

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../app/db';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// INTERFACES
// ============================================

export interface User {
  id: string;
  uuid: string;
  birthday: string;
  email: string;
  firstname: string;
  gender: string;
  images: string[];
  lastname: string;
  password: string;
  password_confirmation: string;
  phone: string;
  mobile: string;
  name: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface AddressLocation {
  id: string;
  uuid: string;
  addresstype: string;
  city: string;
  defaultaddress: boolean;
  landmark?: string;
  pincode: string;
  state: string;
  deliveryLocation: string;
  active: boolean;
  created_at?: number;
  updated_at?: number;
  [key: string]: unknown;
}

// ============================================
// USER CREATE OPERATIONS
// ============================================

/**
 * Create a new User
 */
export const createUsersDb = async (payload: { params: Partial<User> }) => {
  try {
    const usersCollectionRef = collection(db, 'users');
    const { params } = payload;
    const docRef = await addDoc(usersCollectionRef, { ...params });
    return docRef.id;
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
    throw error;
  }
};

// ============================================
// ADDRESS LOCATION CREATE OPERATIONS
// ============================================

/**
 * Create address location
 */
export const createAddressLocation = async (orgId: string, payload: { params: Record<string, unknown> }) => {
  const addressCollectionRef = collection(db, 'delivery-addresses');
  const myId = uuidv4();
  const params = payload.params;
  
  const input = {
    id: myId,
    addresstype: params.addresstype as string || 'Apartment',
    city: params.city as string || '',
    defaultaddress: (params.defaultaddress === true || params.defaultaddress === 1 || params.defaultaddress === '1') ? true : false,
    landmark: params.landmark as string || '',
    pincode: params.pincode as string || '',
    state: params.state as string || '',
    deliveryLocation: params.deliveryLocation as string || '',
    active: true,
    created_at: Timestamp.now().toMillis(),
    updated_at: Timestamp.now().toMillis(),
  };
  
  const docRef = await addDoc(addressCollectionRef, input);
  return docRef.id;
};

