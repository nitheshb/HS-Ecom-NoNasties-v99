/**
 * Banner Update Operations
 * 
 * This file contains all UPDATE operations related to banners
 */

import { doc, updateDoc, Timestamp } from 'firebase/firestore';
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
// BANNER UPDATE OPERATIONS
// ============================================

/**
 * Update an existing banner
 * Note: This function references uploadToS3 which should be imported from S3 service
 */
export const updateBanner = async (
  id: string, 
  data: Partial<BannerFormData>,
  dependencies?: {
    uploadToS3?: (file: File, type: string) => Promise<string>;
  }
): Promise<void> => {
  try {
    const bannerRef = doc(db, 'T_banners', id);
    const updateData: any = {
      title: data.title,
      redirect_url: data.redirect_url || '',
      start_date: data.start_date,
      end_date: data.end_date,
      is_active: data.is_active,
      updated_at: Timestamp.now(),
    };
    
    // Handle image upload if new images are provided
    if (data.images && data.images.length > 0 && dependencies?.uploadToS3) {
      const imageFiles = data.images.filter(img => img instanceof File) as File[];
      const existingImages = data.images.filter(img => typeof img === 'string') as string[];
      
      let uploadedImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        uploadedImageUrls = await Promise.all(
          imageFiles.map(file => dependencies.uploadToS3(file, 'banners'))
        );
      }
      
      const allImageUrls = [...existingImages, ...uploadedImageUrls];
      updateData.img = allImageUrls[0] || '';
      updateData.images = allImageUrls;
    }
    
    await updateDoc(bannerRef, updateData);
  } catch (error) {
    console.error('Error updating banner:', error);
    throw new Error('Failed to update banner');
  }
};

