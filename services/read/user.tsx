/**
 * User Read Operations
 * 
 * This file contains all READ operations related to users:
 * - User profile retrieval
 * - Address location retrieval
 */

import { collection, doc, getDoc, getDocs, query, orderBy, where, onSnapshot } from 'firebase/firestore';
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

// ============================================
// USER READ OPERATIONS
// ============================================

/**
 * Get all users
 */
export const getAllUsers = async (params?: { params?: { status?: string } }) => {
  const usersQuery = query(collection(db, 'users'));
  const querySnapshot = await getDocs(usersQuery);
  const users: User[] = querySnapshot.docs.map((docSnap) => {
    const x = docSnap.data() as User;
    x.id = docSnap.id;
    x.uuid = docSnap.id;
    return x;
  });
  return {
    data: users,
    meta: {
      current_page: 1,
      from: 1,
      last_page: 1,
      links: [
        { url: null, label: "&laquo; Previous", active: false },
        { url: "#", label: "1", active: true },
        { url: null, label: "Next &raquo;", active: false },
      ],
      path: "#",
      per_page: "1000",
      to: users.length,
      total: users.length,
    },
  };
};

/**
 * Get all Users with real-time snapshot
 */
export const getAllUsersSnap = (params: { params?: { status?: string } }, callback: (response: unknown) => void) => {
  try {
    const usersQuery = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(usersQuery, (querySnapshot) => {
      const users: User[] = querySnapshot.docs.map((docSnap) => {
        const x = docSnap.data() as User;
        x.id = docSnap.id;
        x.uuid = docSnap.id;
        return x;
      });
      const response = {
        data: users,
        meta: {
          current_page: 1,
          from: 1,
          last_page: 1,
          links: [
            { url: null, label: "&laquo; Previous", active: false },
            { url: "#", label: "1", active: true },
            { url: null, label: "Next &raquo;", active: false },
          ],
          path: "#",
          per_page: "10",
          to: users.length,
          total: users.length,
        },
      };
      callback(response);
    });
    return unsubscribe;
  } catch (error) {
    console.error('Error fetching users snapshot:', error);
    return;
  }
};

/**
 * Get User by ID
 */
export const getAllUsersById = async (uid: string) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data()) {
      const x = docSnap.data() as User & { img?: string };
      x.id = docSnap.id;
      x.uuid = docSnap.id;
      // Ensure img is populated from images[0] if it exists
      if (x.images && Array.isArray(x.images) && x.images[0]) {
        x.img = x.images[0];
      } else if (!x.img) {
        x.img = '';
      }
      return { data: x };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

/**
 * Search Users
 */
export const searchUsers = async (params: { params?: { search?: string } }) => {
  const searchTerm = params?.params?.search?.toLowerCase() || '';
  const usersQuery = query(collection(db, 'users'));
  const querySnapshot = await getDocs(usersQuery);
  const allUsers: User[] = querySnapshot.docs.map((docSnap) => {
    const x = docSnap.data() as User;
    x.id = docSnap.id;
    x.uuid = docSnap.id;
    return x;
  });
  
  const filteredUsers = searchTerm
    ? allUsers.filter((user) => {
        const searchFields = [
          user.email,
          user.firstname,
          user.lastname,
          user.phone,
          user.mobile,
        ].filter(Boolean);
        return searchFields.some((field) =>
          field?.toLowerCase().includes(searchTerm)
        );
      })
    : allUsers;
  
  return {
    data: filteredUsers,
    meta: {
      current_page: 1,
      from: 1,
      last_page: 1,
      links: [
        { url: null, label: "&laquo; Previous", active: false },
        { url: "#", label: "1", active: true },
        { url: null, label: "Next &raquo;", active: false },
      ],
      path: "#",
      per_page: "1000",
      to: filteredUsers.length,
      total: filteredUsers.length,
    },
  };
};

// ============================================
// ADDRESS LOCATION READ OPERATIONS
// ============================================

/**
 * Get all address locations
 */
export const getAllAddressLocations = async (orgId: string, params: unknown) => {
  const addressQuery = query(collection(db, 'delivery-addresses'));
  const querySnapshot = await getDocs(addressQuery);
  const addresses: AddressLocation[] = querySnapshot.docs.map((docSnap) => {
    const data = docSnap.data() as AddressLocation;
    data.id = docSnap.id;
    data.uuid = docSnap.id;
    return data;
  });
  
  return {
    data: addresses,
    meta: {
      current_page: 1,
      from: 1,
      last_page: 1,
      links: [
        { url: null, label: "« Previous", active: false },
        { url: "https://api.example.com/api/v1/dashboard/admin/addresses/paginate?page=1", label: "1", active: true },
        { url: null, label: "Next »", active: false }
      ],
      path: "https://api.example.com/api/v1/dashboard/admin/addresses/paginate",
      per_page: "1000",
      to: addresses.length,
      total: addresses.length
    }
  };
};

/**
 * Get address location by ID
 */
export const getAddressLocationById = async (orgId: string, uid: string, payload?: unknown) => {
  const docRef = doc(db, 'delivery-addresses', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists() && docSnap.data()) {
    const x = docSnap.data() as AddressLocation;
    x.id = docSnap.id;
    x.uuid = docSnap.id;
    return { data: x };
  } else {
    return { data: null };
  }
};

