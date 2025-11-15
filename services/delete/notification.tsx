/**
 * Notification Delete Operations
 * 
 * This file contains all DELETE operations related to notifications
 */

import { doc, deleteDoc, writeBatch, collection } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// NOTIFICATION DELETE OPERATIONS
// ============================================

/**
 * Delete a single notification by ID
 */
export async function deleteNotification(id: string) {
  await deleteDoc(doc(db, "webNotifications", id));
}

/**
 * Delete multiple notifications in bulk
 */
export async function deleteNotificationsBulk(ids: string[]) {
  if (!ids || ids.length === 0) return;
  const batch = writeBatch(db);
  ids.forEach((id) => batch.delete(doc(db, "webNotifications", id)));
  await batch.commit();
}

