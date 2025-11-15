/**
 * Payment Read Operations
 * 
 * This file contains all READ operations related to payments:
 * - QR code settings and data
 * - Razorpay settings
 * - COD settings
 * - Facebook catalog access
 */

import { collection, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../app/db';
import { FirestoreError } from 'firebase/firestore';

// ============================================
// CONSTANTS
// ============================================

const QR_SETTINGS_COLLECTION = 'upi_id';
const QR_SETTINGS_DOC_ID = 'upi';
const QR_CODES_COLLECTION = 'qr_codes';
const RAZORPAY_SETTINGS_COLLECTION = 'razorpay_settings';
const RAZORPAY_SETTINGS_DOC_ID = 'settings';
const SETTINGS_COLLECTION = 'settings';
const FACEBOOK_CATALOG_COLLECTION = 'facebook_catalog';
const FACEBOOK_CONFIG_DOC_ID = 'config';

// ============================================
// INTERFACES
// ============================================

export interface QRCodeSettings {
  enabled: boolean;
  upi_id?: string;
  qr_code_image?: string;
  merchant_name?: string;
  created_at: string;
  updated_at: string;
}

export interface QRCodeData {
  qr_id: string;
  order_id: string;
  upi_id: string;
  amount: number;
  qr_code_image?: string;
  created_at: string;
  updated_at: string;
}

export interface RazorpaySettings {
  key_id: string;
  created_at: string;
  updated_at: string;
}

export interface CODSettings {
  enabled: boolean;
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

export interface FacebookCatalogSubscriptionPayload {
  accessToken: string;
  updated_at: string;
  catalogs: FacebookCatalogEntry[];
}

// ============================================
// QR CODE READ OPERATIONS
// ============================================

/**
 * Get QR code settings
 */
export const getQRSettings = async (): Promise<QRCodeSettings> => {
  try {
    const qrSettingsRef = doc(db, QR_SETTINGS_COLLECTION, QR_SETTINGS_DOC_ID);
    const qrSettingsSnap = await getDoc(qrSettingsRef);
    
    if (qrSettingsSnap.exists()) {
      return qrSettingsSnap.data() as QRCodeSettings;
    } else {
      // Return default settings if none exist
      const defaultSettings: QRCodeSettings = {
        enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Create default settings
      await setDoc(qrSettingsRef, defaultSettings);
      return defaultSettings;
    }
  } catch (error) {
    console.error('Error getting QR settings:', error);
    throw new Error('Failed to get QR settings');
  }
};

/**
 * Check if QR code payment is enabled
 */
export const isQREnabled = async (): Promise<boolean> => {
  try {
    const settings = await getQRSettings();
    return settings.enabled;
  } catch (error) {
    console.error('Error checking QR enabled status:', error);
    return false;
  }
};

/**
 * Get QR code data by ID
 */
export const getQRCodeData = async (qrId: string): Promise<QRCodeData | null> => {
  try {
    const qrCodeRef = doc(db, QR_CODES_COLLECTION, qrId);
    const qrCodeSnap = await getDoc(qrCodeRef);
    
    if (qrCodeSnap.exists()) {
      return qrCodeSnap.data() as QRCodeData;
    }
    return null;
  } catch (error) {
    console.error('Error getting QR code data:', error);
    return null;
  }
};

// ============================================
// RAZORPAY READ OPERATIONS
// ============================================

/**
 * Get Razorpay settings
 */
export const getRazorpaySettings = async (): Promise<RazorpaySettings> => {
  try {
    const razorpaySettingsRef = doc(db, RAZORPAY_SETTINGS_COLLECTION, RAZORPAY_SETTINGS_DOC_ID);
    const razorpaySettingsSnap = await getDoc(razorpaySettingsRef);
    
    if (razorpaySettingsSnap.exists()) {
      const existing = razorpaySettingsSnap.data() as RazorpaySettings;
      // Normalize to only allowed fields on read (without writing)
      return {
        key_id: existing.key_id,
        created_at: existing.created_at || new Date().toISOString(),
        updated_at: existing.updated_at || new Date().toISOString(),
      } as RazorpaySettings;
    } else {
      // Return default settings if none exist
      const defaultSettings: RazorpaySettings = {
        key_id: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return defaultSettings;
    }
  } catch (error) {
    console.error('Error getting Razorpay settings:', error);
    throw new Error('Failed to get Razorpay settings');
  }
};

/**
 * Check if Razorpay is enabled
 */
export const isRazorpayEnabled = async (): Promise<boolean> => {
  try {
    // Enabled flag is no longer stored; treat presence of key_id as enabled for legacy callers
    const settings = await getRazorpaySettings();
    return !!settings.key_id;
  } catch (error) {
    console.error('Error checking Razorpay enabled status:', error);
    return false;
  }
};

// ============================================
// COD READ OPERATIONS
// ============================================

/**
 * Get COD settings
 */
export const getCODSettings = async (): Promise<CODSettings> => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, 'cod');
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      return settingsSnap.data() as CODSettings;
    }
    
    // Return default settings if not found
    return {
      enabled: false,
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching COD settings:', error);
    return {
      enabled: false,
      updated_at: new Date().toISOString()
    };
  }
};

/**
 * Check if COD is enabled
 */
export const isCODEnabled = async (): Promise<boolean> => {
  try {
    const settings = await getCODSettings();
    return settings.enabled;
  } catch (error) {
    console.error('Error checking COD status:', error);
    return false;
  }
};

// ============================================
// FACEBOOK CATALOG READ OPERATIONS
// ============================================

/**
 * Get Facebook access token
 */
export const getFacebookAccessToken = async (): Promise<FacebookCatalogConfig | null> => {
  try {
    const configRef = doc(db, FACEBOOK_CATALOG_COLLECTION, FACEBOOK_CONFIG_DOC_ID);
    const configSnap = await getDoc(configRef);

    if (!configSnap.exists()) {
      return null;
    }

    const data = configSnap.data();
    return {
      accessToken: data.accessToken || '',
      updated_at: data.updated_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching Facebook access token:', error);
    throw new Error('Failed to get Facebook Developer API key');
  }
};

/**
 * Get all saved Facebook Catalog entries
 */
export const getFacebookCatalogs = async (): Promise<FacebookCatalogEntry[]> => {
  try {
    const configRef = doc(db, FACEBOOK_CATALOG_COLLECTION, FACEBOOK_CONFIG_DOC_ID);
    const configSnap = await getDoc(configRef);

    if (!configSnap.exists()) {
      return [];
    }

    const data = configSnap.data();
    const catalogs = data.catalogs || {};

    // Convert the catalogs map to an array of FacebookCatalogEntry
    return Object.entries(catalogs).map(([catalogId, catalogData]) => {
      const catalog = catalogData as {
        createdAt?: string;
        numberOfProducts?: number;
        updated_at?: string;
        name?: string;
      } | undefined;
      return {
        docId: catalogId, // Use catalogId as docId since they're stored in a map
        catalogId: catalogId,
        createdAt: catalog?.createdAt || '',
        numberOfProducts: catalog?.numberOfProducts || 0,
        updated_at: catalog?.updated_at || data.updated_at || new Date().toISOString(),
        name: catalog?.name,
      };
    });
  } catch (error) {
    console.error('Error fetching Facebook Catalogs:', error);
    throw new Error('Failed to get Facebook Catalogs');
  }
};

/**
 * Subscribe to Facebook catalogs (real-time updates)
 */
export const subscribeToFacebookCatalogs = (
  onNext: (payload: FacebookCatalogSubscriptionPayload) => void,
  onError?: (error: FirestoreError) => void,
) => {
  const configRef = doc(db, FACEBOOK_CATALOG_COLLECTION, FACEBOOK_CONFIG_DOC_ID);

  return onSnapshot(
    configRef,
    (snapshot) => {
      const data = snapshot.data() || {};
      const catalogsMap = (data.catalogs || {}) as Record<
        string,
        { createdAt?: string; numberOfProducts?: number; updated_at?: string; name?: string }
      >;

      const catalogs: FacebookCatalogEntry[] = Object.entries(catalogsMap).map(([catalogId, catalog]) => ({
        docId: catalogId,
        catalogId,
        createdAt: catalog?.createdAt || "",
        numberOfProducts: catalog?.numberOfProducts || 0,
        updated_at: catalog?.updated_at || data.updated_at || new Date().toISOString(),
        name: catalog?.name,
      }));

      onNext({
        accessToken: data.accessToken || "",
        updated_at: data.updated_at || new Date().toISOString(),
        catalogs,
      });
    },
    onError,
  );
};

/**
 * Get product count from Facebook Catalog
 * This function calls Facebook Graph API to fetch the actual number of products in the catalog
 */
export const getFacebookCatalogProductCount = async (
  catalogId: string,
  accessToken: string
): Promise<number> => {
  try {
    // First, try to get catalog info which might include product count
    const catalogInfoUrl = `https://graph.facebook.com/v24.0/${catalogId}?fields=product_count&access_token=${accessToken}`;
    
    try {
      const catalogInfoResponse = await fetch(catalogInfoUrl);
      const catalogInfo = await catalogInfoResponse.json();
      
      // Check for API errors in response
      if (catalogInfo.error) {
        // If it's a permission error or invalid token, throw it
        if (catalogInfo.error.code === 190 || catalogInfo.error.code === 102) {
          throw new Error(catalogInfo.error.message || 'Invalid access token');
        }
        // For other errors (like field not available), continue to products endpoint
        console.warn('Catalog info endpoint returned error, trying products endpoint:', catalogInfo.error.message);
      } else if (catalogInfo.product_count !== undefined && catalogInfo.product_count !== null) {
        // If product_count is available, return it
        return parseInt(String(catalogInfo.product_count), 10) || 0;
      }
    } catch (error) {
      // Only log if it's not an authentication error (we'll throw those)
      if (error instanceof Error && !error.message.includes('Invalid access token')) {
        console.warn('Could not fetch catalog info with product_count, trying products endpoint:', error);
      } else {
        throw error;
      }
    }

    // If product_count is not available, fetch products and count them
    // We'll use pagination to count all products
    let totalCount = 0;
    let nextUrl: string | null = `https://graph.facebook.com/v24.0/${catalogId}/products?access_token=${accessToken}&limit=100`;

    while (nextUrl) {
      const response = await fetch(nextUrl);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch products from Facebook');
      }

      if (data.data && Array.isArray(data.data)) {
        totalCount += data.data.length;
      }

      // Check if there's a next page
      nextUrl = data.paging?.next || null;
    }

    return totalCount;
  } catch (error) {
    console.error('Error fetching Facebook catalog product count:', error);
    throw error;
  }
};

