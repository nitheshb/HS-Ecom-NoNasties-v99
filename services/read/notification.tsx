/**
 * Notification Read Operations
 * 
 * This file contains all READ operations related to notifications:
 * - Real-time notification subscriptions
 * - Notification listening
 */

import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../app/db';
import { getMessaging, onMessage, isSupported, Messaging } from 'firebase/messaging';
import { app } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

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
// MESSAGING INSTANCE
// ============================================

let messagingInstance: Messaging | null = null;

// ============================================
// NOTIFICATION READ OPERATIONS
// ============================================

/**
 * Subscribe to notifications (real-time stream of latest notifications)
 */
export function subscribeToNotifications(
  onAdd: (notif: InAppNotification) => void
): () => void {
  const colRef = collection(db, "webNotifications");
  // Global stream of latest notifications without filters
  const qRef = query(colRef, orderBy("createdAt", "desc"), limit(20));

  const unsubscribe = onSnapshot(
    qRef,
    (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data() as any;
          onAdd({
            id: change.doc.id,
            title: data.title || "New Notification",
            body: data.body || "",
            createdAt: data.createdAt,
            status: data.status || "unread",
            type: data.type,
            source: data.source,
            orderId: data.orderId,
          });
        }
      });
    },
    (error) => {
      console.error("[FirestoreNotif] onSnapshot error", error);
    }
  );
  return unsubscribe;
}

/**
 * Listen to notifications (for Notifications page – get and mark as read)
 */
export function listenNotifications(
  onUpdate: (items: InAppNotification[]) => void,
  limitCount: number = 50
): () => void {
  const colRef = collection(db, "webNotifications");
  const qRef = query(colRef, orderBy("createdAt", "desc"), limit(limitCount));
  
  const unsubscribe = onSnapshot(
    qRef,
    (snap) => {
      const items: InAppNotification[] = [];
      snap.forEach((doc) => {
        const data = doc.data() as any;
        items.push({
          id: doc.id,
          title: data.title || "",
          body: data.body || "",
          createdAt: data.createdAt,
          status: data.status || "unread",
          type: data.type,
          source: data.source,
          orderId: data.orderId,
        });
      });
      onUpdate(items);
    },
    (error) => {
      console.error("[FirestoreNotif] listenNotifications error", error);
    }
  );
  
  return unsubscribe;
}

/**
 * Subscribe to foreground FCM messages
 */
export function subscribeToForegroundMessages(
  callback: (payload: import("firebase/messaging").MessagePayload) => void
): () => void {
  const setup = async () => {
    try {
      const supported = await isSupported();
      if (!supported) {
        return () => {};
      }
      if (!messagingInstance) {
        messagingInstance = getMessaging(app);
      }
      return onMessage(messagingInstance as Messaging, (payload) => {
        callback(payload);
      });
    } catch (e) {
      return () => {};
    }
  };
  let unsubscribe: (() => void) | null = null;
  // Fire and forget; we still return a function that will call unsubscribe when ready
  setup().then((u) => { unsubscribe = u || null; });
  return () => { if (unsubscribe) unsubscribe(); };
}

