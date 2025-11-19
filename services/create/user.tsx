import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/app/db';
import { User } from 'firebase/auth';

export interface UserData {
  uid: string;
  email: string;
  name: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create or update user document in Firestore
 * This stores additional user data beyond what Firebase Auth provides
 */
export async function createUserDocument(user: User, name: string): Promise<void> {
  const userRef = doc(db, 'users', user.uid);
  
  const userData: UserData = {
    uid: user.uid,
    email: user.email || '',
    name: name,
    emailVerified: user.emailVerified,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Use setDoc with merge to avoid overwriting existing data
  await setDoc(userRef, {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Update user document in Firestore
 */
export async function updateUserDocument(uid: string, updates: Partial<UserData>): Promise<void> {
  const userRef = doc(db, 'users', uid);
  
  await setDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
