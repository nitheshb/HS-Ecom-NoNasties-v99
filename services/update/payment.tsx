/**
 * Payment Update Operations
 * 
 * This file contains all UPDATE operations related to payments:
 * - QR Code settings and data
 * - UPI settings
 * - Razorpay settings
 */

import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

export interface QRCodeSettings {
  enabled: boolean;
  upi?: string;
  qr_image_url?: string;
  merchant_name?: string;
  merchant_id?: string;
  created_at: string;
  updated_at: string;
}

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

export interface RazorpaySettings {
  key_id?: string;
  key_secret?: string;
  merchant_id?: string;
  webhook_secret?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// QR CODE SETTINGS UPDATE OPERATIONS
// ============================================

/**
 * Update QR code settings
 */
export const updateQRSettings = async (settings: Partial<QRCodeSettings>): Promise<void> => {
  try {
    const qrSettingsRef = doc(db, 'upi_id', 'upi');
    const updateData = {
      ...settings,
      updated_at: new Date().toISOString(),
    };
    
    await updateDoc(qrSettingsRef, updateData);
  } catch (error) {
    console.error('Error updating QR settings:', error);
    throw new Error('Failed to update QR settings');
  }
};

/**
 * Update QR code data
 */
export const updateQRCodeData = async (qrId: string, updates: Partial<QRCodeData>): Promise<void> => {
  try {
    const qrCodeRef = doc(db, 'qr_codes', qrId);
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    await updateDoc(qrCodeRef, updateData);
  } catch (error) {
    console.error('Error updating QR code data:', error);
    throw new Error('Failed to update QR code data');
  }
};

/**
 * Update UPI ID only
 */
export const updateUPIID = async (newUPI: string): Promise<void> => {
  try {
    const upiSettingsRef = doc(db, 'upi_id', 'upi');
    await updateDoc(upiSettingsRef, {
      upi: newUPI,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating UPI ID:', error);
    throw new Error('Failed to update UPI ID');
  }
};

/**
 * Update merchant name only
 */
export const updateMerchantName = async (newMerchantName: string): Promise<void> => {
  try {
    const upiSettingsRef = doc(db, 'upi_id', 'upi');
    await updateDoc(upiSettingsRef, {
      merchant_name: newMerchantName,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating merchant name:', error);
    throw new Error('Failed to update merchant name');
  }
};

// ============================================
// RAZORPAY SETTINGS UPDATE OPERATIONS
// ============================================

const RAZORPAY_SETTINGS_COLLECTION = 'p_razorpay_settings';
const RAZORPAY_SETTINGS_DOC_ID = 'razorpay';

/**
 * Update Razorpay settings
 */
export const updateRazorpaySettings = async (settings: Partial<RazorpaySettings>): Promise<void> => {
  try {
    const razorpaySettingsRef = doc(db, RAZORPAY_SETTINGS_COLLECTION, RAZORPAY_SETTINGS_DOC_ID);
    const existingDoc = await getDoc(razorpaySettingsRef);
    const base: RazorpaySettings = existingDoc.exists()
      ? (existingDoc.data() as RazorpaySettings)
      : ({ created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as RazorpaySettings);

    const updateData: RazorpaySettings = {
      key_id: (settings.key_id ?? base.key_id) || undefined,
      created_at: base.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as RazorpaySettings;

    // Overwrite the doc to ensure only allowed fields are present
    await setDoc(razorpaySettingsRef, updateData, { merge: false });
  } catch (error) {
    console.error('Error updating Razorpay settings:', error);
    throw new Error('Failed to update Razorpay settings');
  }
};

/**
 * Update only the enabled status (backward compatibility)
 * Note: Enabled status is no longer stored separately
 * @param _enabled - Enabled status (unused, kept for backward compatibility)
 */
export const updateRazorpayEnabled = async (): Promise<void> => {
  // No-op: enabled is no longer stored. Function kept for backward compatibility.
  return;
};

