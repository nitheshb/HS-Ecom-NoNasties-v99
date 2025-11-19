import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/db';
import { serverTimestamp } from 'firebase/firestore';

const USERS_COLLECTION = 'T_users';

export interface UserData {
  uid: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Get user data from Firestore
 */
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }
    
    const data = userSnap.data();
    return {
      uid,
      email: data.email || '',
      name: data.name || '',
      emailVerified: data.emailVerified || false,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

/**
 * Update user's name
 */
export const updateUserName = async (uid: string, name: string): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      name,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user name:', error);
    throw error;
  }
};
