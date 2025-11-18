/**
 * Banner Read Operations
 * 
 * This file contains all READ operations related to banners
 */

import { collection, doc, getDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

export type BannerImage =
  | string
  | {
      url?: string;
      link?: string;
      downloadURL?: string;
      src?: string;
      imageUrl?: string;
    };

export interface Banner {
  id: string;
  title: string;
  img: string;
  images?: BannerImage[] | Record<string, BannerImage>;
  redirect_url?: string;
  start_date: number; // milliseconds
  end_date: number; // milliseconds
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// BANNER READ OPERATIONS
// ============================================

/**
 * Get all banners ordered by created_at desc
 */
export const getBanners = async (): Promise<Banner[]> => {
  try {
    const bannersRef = collection(db, 'T_banners');
    const q = query(bannersRef, orderBy('created_at', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      return {
        id: doc.id,
        title: data.title,
        img: data.img,
        images: data.images || [],
        redirect_url: data.redirect_url,
        start_date: data.start_date || Date.now(),
        end_date: data.end_date || Date.now(),
        is_active: data.is_active || false,
        created_at: data.created_at?.toDate() || new Date(),
        updated_at: data.updated_at?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    throw new Error('Failed to fetch banners');
  }
};

/**
 * Get banner by ID
 */
export const getBannerById = async (id: string): Promise<Banner | null> => {
  try {
    const docRef = doc(db, 'T_banners', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title,
        img: data.img,
        images: data.images || [],
        redirect_url: data.redirect_url,
        start_date: data.start_date || Date.now(),
        end_date: data.end_date || Date.now(),
        is_active: data.is_active || false,
        created_at: data.created_at?.toDate() || new Date(),
        updated_at: data.updated_at?.toDate() || new Date(),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching banner by ID:', error);
    throw new Error('Failed to fetch banner');
  }
};

/**
 * Get active banners (for frontend display)
 */
export const getActiveBanners = async (): Promise<Banner[]> => {
  try {
    const now = Date.now();
    const bannersRef = collection(db, 'T_banners');
    const q = query(
      bannersRef,
      where('is_active', '==', true),
      where('start_date', '<=', now),
      where('end_date', '>=', now),
      orderBy('created_at', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        img: data.img,
        images: data.images || [],
        redirect_url: data.redirect_url,
        start_date: data.start_date || Date.now(),
        end_date: data.end_date || Date.now(),
        is_active: data.is_active || false,
        created_at: data.created_at?.toDate() || new Date(),
        updated_at: data.updated_at?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error('Error fetching active banners:', error);
    throw new Error('Failed to fetch active banners');
  }
};

