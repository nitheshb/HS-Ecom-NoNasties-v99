/**
 * Notification Create Operations
 * 
 * This file contains all CREATE operations related to notifications
 */

import { collection, addDoc, doc, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

export interface NotificationData {
  title: string;
  body?: string;
  type?: string;
  source?: string;
  orderId?: string;
}

// ============================================
// NOTIFICATION CREATE OPERATIONS
// ============================================

/**
 * Add notification (generic)
 */
export async function addNotification(docIn: NotificationData) {
  const colRef = collection(db, "webNotifications");
  await addDoc(colRef, {
    ...docIn,
    status: "unread",
    createdAt: serverTimestamp(),
  });
}

/**
 * Add notification with deterministic id to prevent duplicates
 * (e.g., same orderId/type from multiple sources)
 */
export async function addNotificationOnce(docIn: NotificationData & { 
  type?: string; // e.g., 'order_created' | 'order_cancelled'
  orderId?: string; // when provided with type, forms the id: `${type}_${orderId}`
}) {
  const colRef = collection(db, "webNotifications");
  const payload = {
    ...docIn,
    status: "unread",
    createdAt: serverTimestamp(),
  };
  
  if (docIn.type && docIn.orderId) {
    const dedupeId = `${docIn.type}_${docIn.orderId}`;
    await setDoc(doc(colRef, dedupeId), payload, { merge: false });
  } else {
    await addDoc(colRef, payload);
  }
}

/**
 * Save FCM token to user document
 */
export async function saveFcmToken(token: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user || !token) {
      return;
    }
    await setDoc(
      doc(db, "users", user.uid),
      { fcmWebTokens: arrayUnion(token), updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (error) {
    console.error('[FCM] saveFcmToken error', error);
  }
}

