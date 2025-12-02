/**
 * Banner Create Operations
 * 
 * This file contains all CREATE operations related to banners
 */

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

export interface BannerFormData {
  title: string;
  images: (File | string)[];
  redirect_url?: string;
  start_date: number; // milliseconds
  end_date: number; // milliseconds
  is_active: boolean;
}

// ============================================
// BANNER CREATE OPERATIONS
// ============================================

/**
 * Create a new banner
 * Note: This function references uploadToS3 which should be imported from S3 service
 */
export const createBanner = async (
  bannerData: BannerFormData,
  dependencies?: {
    uploadToS3?: (file: File, type: string) => Promise<string>;
  }
): Promise<void> => {
  try {
    // Upload images to S3
    const imageFiles = bannerData.images.filter(img => img instanceof File) as File[];
    const existingImages = bannerData.images.filter(img => typeof img === 'string') as string[];
    
    let uploadedImageUrls: string[] = [];
    const uploadToS3 = dependencies?.uploadToS3;

    if (imageFiles.length > 0 && uploadToS3) {
      uploadedImageUrls = await Promise.all(
        imageFiles.map(file => uploadToS3(file, 'banners'))
      );
    }
    
    const allImageUrls = [...existingImages, ...uploadedImageUrls];
    const primaryImageUrl = allImageUrls[0] || '';
    
    const bannerRef = collection(db, 'T_banners');
    const bannerDoc = {
      title: bannerData.title,
      img: primaryImageUrl,
      images: allImageUrls,
      redirect_url: bannerData.redirect_url || '',
      start_date: bannerData.start_date,
      end_date: bannerData.end_date,
      is_active: bannerData.is_active,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    };
    
    await addDoc(bannerRef, bannerDoc);
  } catch (error) {
    console.error('Error creating banner:', error);
    throw new Error('Failed to create banner');
  }
};

