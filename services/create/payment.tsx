/**
 * Payment Create Operations
 * 
 * This file contains all CREATE operations related to payments:
 * - QR code data creation
 * - Facebook catalog token and catalog creation
 */

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

export interface QRCodeData {
  qr_id: string;
  upi?: string;
  qr_image_url?: string;
  merchant_name?: string;
  merchant_id?: string;
  amount?: number;
  order_id?: string;
  created_at: string;
  updated_at: string;
}

export interface FacebookCatalogConfig {
  accessToken: string;
  updated_at: string;
}

export interface FacebookCatalogEntry {
  docId: string;
  catalogId: string;
  createdAt: string;
  numberOfProducts: number;
  updated_at: string;
  name?: string;
}

// ============================================
// CONSTANTS
// ============================================

const FACEBOOK_CATALOG_COLLECTION = 'p_facebook_catalog';
const FACEBOOK_CONFIG_DOC_ID = 'config';

// ============================================
// QR CODE CREATE OPERATIONS
// ============================================

/**
 * Save QR code data for an order
 */
export const saveQRCodeData = async (qrData: Omit<QRCodeData, 'qr_id' | 'created_at' | 'updated_at'>): Promise<string> => {
  try {
    const qrId = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const qrCodeRef = doc(db, 'qr_codes', qrId);
    
    const qrCodeData: QRCodeData = {
      qr_id: qrId,
      ...qrData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await setDoc(qrCodeRef, qrCodeData);
    return qrId;
  } catch (error) {
    console.error('Error saving QR code data:', error);
    throw new Error('Failed to save QR code data');
  }
};

// ============================================
// FACEBOOK CATALOG CREATE OPERATIONS
// ============================================

/**
 * Save Facebook Developer API key (access token)
 */
export const saveFacebookAccessToken = async (accessToken: string): Promise<void> => {
  try {
    const configRef = doc(db, FACEBOOK_CATALOG_COLLECTION, FACEBOOK_CONFIG_DOC_ID);
    await setDoc(configRef, {
      accessToken,
      updated_at: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving Facebook access token:', error);
    throw new Error('Failed to save Facebook Developer API key');
  }
};

/**
 * Save or update a Facebook Catalog entry
 * Catalogs are stored in the config document under a 'catalogs' map field
 */
export const saveFacebookCatalog = async (entry: {
  catalogId: string;
  createdAt: string;
  numberOfProducts: number;
  name?: string;
  docId?: string;
  previousCatalogId?: string | null;
}): Promise<void> => {
  try {
    const configRef = doc(db, FACEBOOK_CATALOG_COLLECTION, FACEBOOK_CONFIG_DOC_ID);
    const configSnap = await getDoc(configRef);
    const now = new Date().toISOString();

    // Get existing data
    let existingData: { 
      accessToken?: string; 
      catalogs?: Record<string, { createdAt?: string; numberOfProducts?: number; updated_at?: string; name?: string }>; 
      updated_at?: string 
    } = {};
    if (configSnap.exists()) {
      existingData = configSnap.data() as typeof existingData;
    }

    // Get existing catalogs or create new object
    const catalogs = existingData.catalogs || {};

    // If catalog ID changed, remove the old entry
    if (entry.previousCatalogId && entry.previousCatalogId !== entry.catalogId) {
      delete catalogs[entry.previousCatalogId];
    }

    // Update or add the catalog
    catalogs[entry.catalogId] = {
      createdAt: entry.createdAt,
      numberOfProducts: entry.numberOfProducts,
      updated_at: now,
      ...(entry.name ? { name: entry.name } : {}),
    };

    // Save the updated catalogs map
    await setDoc(
      configRef,
      {
        ...existingData,
        catalogs,
        updated_at: now,
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving Facebook Catalog entry:', error);
    throw new Error('Failed to save Facebook Catalog');
  }
};

