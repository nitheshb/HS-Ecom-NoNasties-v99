/**
 * User Update Operations
 * 
 * This file contains all UPDATE operations related to users:
 * - User profile updates
 * - Address location updates
 * - Notification updates (mark as read)
 */

import { doc, updateDoc, collection, query, getDocs, getDoc, writeBatch, limit } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { db } from '../../app/db';

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

export type InAppNotification = {
  id: string;
  title: string;
  body?: string;
  createdAt?: string | number | Date;
  status?: "unread" | "read";
  type?: string;
  source?: string;
  orderId?: string;
};

// ============================================
// USER PROFILE UPDATE OPERATIONS
// ============================================

/**
 * Update a User profile
 */
export const updateUsers = async (uid: string, params: Partial<User>) => {
  try {
    const updateData: Record<string, unknown> = {};
    if (params.firstname !== undefined) updateData.firstname = params.firstname;
    if (params.lastname !== undefined) updateData.lastname = params.lastname;
    if (params.email !== undefined) updateData.email = params.email;
    if (params.phone !== undefined) updateData.phone = params.phone;
    if (params.birthday !== undefined) updateData.birthday = params.birthday;
    if (params.gender !== undefined) updateData.gender = params.gender;
    if (params.images !== undefined) updateData.images = params.images;
    if (params.password !== undefined) updateData.password = params.password;
    if (params.password_confirmation !== undefined) updateData.password_confirmation = params.password_confirmation;
    await updateDoc(doc(db, 'users', uid), updateData);
  } catch (error) {
    console.error('Failed updating user', error, params);
    throw error;
  }
};

// ============================================
// ADDRESS LOCATION UPDATE OPERATIONS
// ============================================

/**
 * Update address location
 */
export const updateAddressLocation = async (uid: string, params: Record<string, unknown>) => {
  const updateData: Record<string, unknown> = {
    addresstype: params.addresstype as string,
    city: params.city as string,
    defaultaddress: params.defaultaddress === true || params.defaultaddress === 1 || params.defaultaddress === '1' ? true : false,
    landmark: params.landmark as string || '',
    pincode: params.pincode as string,
    state: params.state as string,
    deliveryLocation: params.deliveryLocation as string,
    updated_at: Timestamp.now().toMillis(),
  };
  
  // Only update active if it's provided
  if (params.active !== undefined) {
    updateData.active = params.active === true || params.active === 1 ? true : false;
  }
  
  await updateDoc(doc(db, 'delivery-addresses', uid), updateData);
  return { success: true };
};

/**
 * Set active status for address location
 */
export const setActiveAddressLocation = async (id: string) => {
  const addressId = id.includes('/') ? id.split('/').pop() : id;
  const docRef = doc(db, 'delivery-addresses', addressId!);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error(`Address location with ID ${addressId} not found`);
  }
  
  const addressData = docSnap.data() as AddressLocation;
  const currentActive = addressData.active === true;
  const newActive = !currentActive;
  
  await updateDoc(docRef, {
    active: newActive,
    updated_at: Timestamp.now().toMillis()
  });
  
  return {
    timestamp: new Date().toISOString(),
    status: true,
    data: {
      id: addressId,
      active: newActive,
      addresstype: addressData.addresstype,
      city: addressData.city,
      state: addressData.state,
      deliveryLocation: addressData.deliveryLocation,
      created_at: addressData.created_at,
      updated_at: Timestamp.now().toMillis(),
    }
  };
};

/**
 * Set default address (removes default from all other addresses)
 */
export const setDefaultAddress = async (id: string) => {
  const addressId = id.includes('/') ? id.split('/').pop() : id;
  
  // First, set all addresses to non-default
  const addressQuery = query(collection(db, 'delivery-addresses'));
  const querySnapshot = await getDocs(addressQuery);
  
  const updatePromises = querySnapshot.docs.map(async (docSnap) => {
    if (docSnap.id !== addressId) {
      await updateDoc(docSnap.ref, {
        defaultaddress: false,
        updated_at: Timestamp.now().toMillis()
      });
    }
  });
  
  await Promise.all(updatePromises);
  
  // Then set the selected address as default
  const docRef = doc(db, 'delivery-addresses', addressId!);
  await updateDoc(docRef, {
    defaultaddress: true,
    updated_at: Timestamp.now().toMillis()
  });
  
  return { success: true };
};

// ============================================
// NOTIFICATION UPDATE OPERATIONS
// ============================================

/**
 * Mark a notification as read
 */
export async function markNotificationRead(id: string) {
  await updateDoc(doc(db, "webNotifications", id), { status: "read" });
}

/**
 * Mark all notifications as read (up to 200)
 */
export async function markAllNotificationsRead() {
  const colRef = collection(db, "webNotifications");
  const snap = await getDocs(query(colRef, limit(200)));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { status: "read" }));
  await batch.commit();
}

