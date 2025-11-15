/**
 * Banner Delete Operations
 * 
 * This file contains all DELETE operations related to banners
 */

import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../app/db';
import { deleteFromS3 } from '../awsS3';

// ============================================
// BANNER DELETE OPERATIONS
// ============================================

/**
 * Delete a banner and its associated images
 */
export const deleteBanner = async (id: string, imageUrls: string[]): Promise<void> => {
  try {
    // Delete the banner document
    const bannerRef = doc(db, 'T_banners', id);
    await deleteDoc(bannerRef);
    
    // Delete the images from S3 if they exist
    if (imageUrls && imageUrls.length > 0) {
      try {
        await deleteFromS3({ urls: imageUrls });
      } catch (storageError) {
        console.warn('Failed to delete images from S3:', storageError);
        // Don't throw error for storage deletion failure
      }
    }
  } catch (error) {
    console.error('Error deleting banner:', error);
    throw new Error('Failed to delete banner');
  }
};

