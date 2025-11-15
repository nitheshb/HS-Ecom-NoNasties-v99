// /**
//  * All Database Queries
//  * 
//  * This file contains all database query functions for the application.
//  * Centralized location for all database operations.
//  */

// // ============================================
// // FIREBASE IMPORTS
// // ============================================
// import { auth, db, app } from '../app/db';
// import { 
//   signInWithEmailAndPassword, 
//   createUserWithEmailAndPassword, 
//   signOut,
//   onAuthStateChanged
// } from 'firebase/auth';
// import {
//   collection,
//   doc,
//   getDocs,
//   getDoc,
//   addDoc,
//   updateDoc,
//   deleteDoc,
//   setDoc,
//   query,
//   where,
//   orderBy,
//   limit,
//   Timestamp,
//   onSnapshot,
//   serverTimestamp,
//   arrayUnion,
//   writeBatch,
//   runTransaction,
//   DocumentData,
//   QueryDocumentSnapshot,
//   QueryConstraint,
//   CollectionReference,
//   getCountFromServer,
//   FirestoreError
// } from 'firebase/firestore';
// import { 
//   getMessaging, 
//   getToken, 
//   isSupported, 
//   onMessage, 
//   Messaging 
// } from 'firebase/messaging';

// // ============================================
// // AWS SDK IMPORTS
// // ============================================
// import { 
//   S3Client, 
//   PutObjectCommand, 
//   ListObjectsV2Command, 
//   DeleteObjectCommand 
// } from '@aws-sdk/client-s3';

// // ============================================
// // THIRD-PARTY PACKAGES
// // ============================================
// import { v4 as uuidv4 } from 'uuid';
// import * as XLSX from 'xlsx';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import * as QRCode from 'qrcode';
// import { createClient } from '@supabase/supabase-js';
// import { Files } from 'lucide-react';
// import { createContext, useContext, useEffect, useState } from 'react';

// // ============================================
// // LOCAL IMPORTS - Types
// // ============================================
// import { OrderId, isValidOrderId, OrderItemId, isValidOrderItemId } from '../types/order';
// import { DeliverySchedule, DeliveryScheduleFormData, Category, Product } from '../types/deliverySchedule';
// import { 
//   ShippingRule, 
//   SurgeRule, 
//   CreateShippingRuleData, 
//   CreateSurgeRuleData, 
//   UpdateShippingRuleData, 
//   UpdateSurgeRuleData 
// } from '../types/charges';

// // ============================================
// // LOCAL IMPORTS - Utilities
// // ============================================
// import { getISTISOString } from '../utils/dateUtils';

// // ============================================
// // LOCAL IMPORTS - Services (commented out to avoid circular dependencies)
// // These will be imported inline where needed or should be refactored
// // ============================================
// // import { uploadToS3, deleteFromS3 } from './awsS3';
// // import { supabase } from "@/services/supabaseClient";
// // import { getAllCategories } from './q_categories';
// // import { getAllProducts } from './q_products';
// // import { syncSubscriptionsWithDeliverySchedule } from './q_subscriptions';
// // import { addNotificationOnce } from "./firestoreNotifications";
// // import { handleOrderStatusChange } from "./q_orders";
// // import { handleOrderCreated, handleOrderUpdated, handleOrderDeleted } from './analyticsService';
// // import { getAllProductsById, getStocksByProductId, updateStockQuantity } from './q_products';
// // import { generateNextOrderId, generateNextOrderItemId, addOrUpdateOrderItem } from './q_orders';
// // import { deductFromWallet } from './q_wallets';
// // import { getAllCategoriesById } from './q_categories';

// // ============================================
// // SUPABASE CLIENT SETUP
// // ============================================
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Supabase credentials are missing in environment variables');
// }

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// // ============================================
// // CODE STARTS HERE
// // ============================================

// // services/authService.ts


// export const loginWithEmail = async (email: string, password: string) => {
//   try {
//     const userCredential = await signInWithEmailAndPassword(auth, email, password);
//     return { user: userCredential.user, error: null };
//   } catch (error: any) {
//     return { user: null, error: error.message };
//   }
// };

// export const signupWithEmail = async (email: string, password: string) => {
//   try {
//     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//     return { user: userCredential.user, error: null };
//   } catch (error: any) {
//     return { user: null, error: error.message };
//   }
// };

// export const logoutUser = async () => {
//   try {
//     await signOut(auth);
//     return { success: true, error: null };
//   } catch (error: any) {
//     return { success: false, error: error.message };
//   }
// };


// // ----------------------------------------------------------------------------------------------------
// // awsS3 file

// const validateEnv = () => {
//   if (!process.env.NEXT_PUBLIC_AWS_REGION) {
//     throw new Error('AWS region is required in environment variables');
//   }
//   if (!process.env.NEXT_PUBLIC_S3_BUCKET_NAME) {
//     throw new Error('S3 bucket name is required in environment variables');
//   }
// };

// const getS3Client = () => {
//   validateEnv();

//   return new S3Client({
//     region: process.env.NEXT_PUBLIC_AWS_REGION,
//     requestChecksumCalculation: 'WHEN_REQUIRED',
//     credentials: {
//       accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
//       secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ''
//     }
//   });
// };

// export const s3BaseUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/`;

// const MAX_FILE_SIZE = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '', 10) || 2 * 1024 * 1024; // Default to 2MB

// export const uploadToS3 = async (file: File, type = 'users') => {
//   if (file.size > MAX_FILE_SIZE) {
//     throw new Error(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)} MB.`);
//   }

//   const s3Client = getS3Client();
//   const key = `${type}/${uuidv4()}-${file.name}`;

//   const params = {
//     Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
//     Key: key,
//     Body: file,
//     ContentType: file.type,
//   };

//   try {
//     await s3Client.send(new PutObjectCommand(params));
//     return `${s3BaseUrl}${key}`;
//   } catch (error: unknown) {
//     console.error('S3 Upload Error:', error);
//     if (error instanceof Error) {
//       throw new Error(`Failed to upload file: ${error.message}`);
//     }
//     throw new Error('Failed to upload file: Unknown error');
//   }
// };

// // List files from S3
// export const listFromS3 = async (params: { type?: string; prefix?: string }) => {
//   const s3Client = getS3Client();
//   const { type, prefix } = params;
//   const commandParams = {
//     Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
//     Prefix: type || '',
//     MaxKeys: 1000
//   };

//   try {
//     const data = await s3Client.send(new ListObjectsV2Command(commandParams));

//     if (!data.Contents || data.Contents.length === 0) {
//       return [];
//     }

//     return data.Contents.map(item => ({
//       Key: item.Key,
//       LastModified: item.LastModified,
//       Size: item.Size,
//       Url: `${s3BaseUrl}${item.Key}`
//     }));
//   } catch (error) {
//     console.error('Error listing files from S3:', error);
//     throw new Error('Failed to list files from S3.');
//   }
// };

// export const deleteFromS3 = async (params: { urls: string[] }) => {
//   const s3Client = getS3Client();

//   const { urls } = params;

//   if (!Array.isArray(urls)) {
//     throw new Error('Invalid delete parameters. "urls" should be an array.');
//   }

//   const validUrls = urls.filter(url => typeof url === 'string' && url.trim() !== '');

//   if (validUrls.length === 0) {
//     return [];
//   }

//   try {
//     await Promise.all(
//       validUrls.map(async (url) => {
//         if (!url) {
//           return;
//         }
//         const key = url.replace(s3BaseUrl, '');
//         await s3Client.send(new DeleteObjectCommand({
//           Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
//           Key: key,
//         }));
//       })
//     );

//     return validUrls;
//   } catch (error) {
//     console.error('Delete error:', error);
//     throw new Error('Failed to delete files from S3.');
//   }
// }; 



// // ----------------------------------------------------------------------------------------------------

// // Banner Services file
// // Note: uploadToS3 and deleteFromS3 are defined in this file below

// // Type definitions
// export interface Banner {
//   id: string;
//   title: string;
//   img: string;
//   images?: string[];
//   redirect_url?: string;
//   start_date: number; // milliseconds
//   end_date: number; // milliseconds
//   is_active: boolean;
//   created_at: Date;
//   updated_at: Date;
// }

// export interface BannerFormData {
//   title: string;
//   images: (File | string)[];
//   redirect_url?: string;
//   start_date: number; // milliseconds
//   end_date: number; // milliseconds
//   is_active: boolean;
// }

// // Storage is imported from db.ts

// // Get all banners ordered by created_at desc
// export const getBanners = async (): Promise<Banner[]> => {
//   try {
//     const bannersRef = collection(db, 'T_banners');
//     const q = query(bannersRef, orderBy('created_at', 'desc'));
//     const querySnapshot = await getDocs(q);
    
//     return querySnapshot.docs.map(doc => {
//       const data = doc.data();
//       return {
//         id: doc.id,
//         title: data.title,
//         img: data.img,
//         images: data.images || [],
//         redirect_url: data.redirect_url,
//         start_date: data.start_date || Date.now(),
//         end_date: data.end_date || Date.now(),
//         is_active: data.is_active || false,
//         created_at: data.created_at?.toDate() || new Date(),
//         updated_at: data.updated_at?.toDate() || new Date(),
//       };
//     });
//   } catch (error) {
//     console.error('Error fetching banners:', error);
//     throw new Error('Failed to fetch banners');
//   }
// };

// // Create a new banner
// export const createBanner = async (bannerData: BannerFormData): Promise<void> => {
//   try {
//     // Upload images to S3
//     const imageFiles = bannerData.images.filter(img => img instanceof File) as File[];
//     const existingImages = bannerData.images.filter(img => typeof img === 'string') as string[];
    
//     let uploadedImageUrls: string[] = [];
//     if (imageFiles.length > 0) {
//       uploadedImageUrls = await Promise.all(
//         imageFiles.map(file => uploadToS3(file, 'banners'))
//       );
//     }
    
//     const allImageUrls = [...existingImages, ...uploadedImageUrls];
//     const primaryImageUrl = allImageUrls[0] || '';
    
//     const bannerRef = collection(db, 'T_banners');
//     const bannerDoc = {
//       title: bannerData.title,
//       img: primaryImageUrl,
//       images: allImageUrls,
//       redirect_url: bannerData.redirect_url || '',
//       start_date: bannerData.start_date,
//       end_date: bannerData.end_date,
//       is_active: bannerData.is_active,
//       created_at: Timestamp.now(),
//       updated_at: Timestamp.now(),
//     };
    
//     await addDoc(bannerRef, bannerDoc);
//   } catch (error) {
//     console.error('Error creating banner:', error);
//     throw new Error('Failed to create banner');
//   }
// };

// // Update an existing banner
// export const updateBanner = async (id: string, data: Partial<BannerFormData>): Promise<void> => {
//   try {
//     const bannerRef = doc(db, 'T_banners', id);
//     const updateData: any = {
//       title: data.title,
//       redirect_url: data.redirect_url || '',
//       start_date: data.start_date,
//       end_date: data.end_date,
//       is_active: data.is_active,
//       updated_at: Timestamp.now(),
//     };
    
//     // Handle image upload if new images are provided
//     if (data.images && data.images.length > 0) {
//       const imageFiles = data.images.filter(img => img instanceof File) as File[];
//       const existingImages = data.images.filter(img => typeof img === 'string') as string[];
      
//       let uploadedImageUrls: string[] = [];
//       if (imageFiles.length > 0) {
//         uploadedImageUrls = await Promise.all(
//           imageFiles.map(file => uploadToS3(file, 'banners'))
//         );
//       }
      
//       const allImageUrls = [...existingImages, ...uploadedImageUrls];
//       updateData.img = allImageUrls[0] || '';
//       updateData.images = allImageUrls;
//     }
    
//     await updateDoc(bannerRef, updateData);
//   } catch (error) {
//     console.error('Error updating banner:', error);
//     throw new Error('Failed to update banner');
//   }
// };

// // Delete a banner and its associated images
// export const deleteBanner = async (id: string, imageUrls: string[]): Promise<void> => {
//   try {
//     // Delete the banner document
//     const bannerRef = doc(db, 'T_banners', id);
//     await deleteDoc(bannerRef);
    
//     // Delete the images from S3 if they exist
//     if (imageUrls && imageUrls.length > 0) {
//       try {
//         await deleteFromS3({ urls: imageUrls });
//       } catch (storageError) {
//         console.warn('Failed to delete images from S3:', storageError);
//         // Don't throw error for storage deletion failure
//       }
//     }
//   } catch (error) {
//     console.error('Error deleting banner:', error);
//     throw new Error('Failed to delete banner');
//   }
// };

// // Get a single banner by ID
// export const getBannerById = async (id: string): Promise<Banner | null> => {
//   try {
//     const docRef = doc(db, 'T_banners', id);
//     const docSnap = await getDoc(docRef);
    
//     if (docSnap.exists()) {
//       const data = docSnap.data();
//       return {
//         id: docSnap.id,
//         title: data.title,
//         img: data.img,
//         images: data.images || [],
//         redirect_url: data.redirect_url,
//         start_date: data.start_date || Date.now(),
//         end_date: data.end_date || Date.now(),
//         is_active: data.is_active || false,
//         created_at: data.created_at?.toDate() || new Date(),
//         updated_at: data.updated_at?.toDate() || new Date(),
//       };
//     } else {
//       return null;
//     }
//   } catch (error) {
//     console.error('Error fetching banner by ID:', error);
//     throw new Error('Failed to fetch banner');
//   }
// };

// // Get active banners (for frontend display)
// export const getActiveBanners = async (): Promise<Banner[]> => {
//   try {
//     const now = Date.now();
//     const bannersRef = collection(db, 'T_banners');
//     const q = query(
//       bannersRef,
//       where('is_active', '==', true),
//       where('start_date', '<=', now),
//       where('end_date', '>=', now),
//       orderBy('created_at', 'desc')
//     );
    
//     const querySnapshot = await getDocs(q);
    
//   return querySnapshot.docs.map(doc => {
//     const data = doc.data();
//     return {
//       id: doc.id,
//       title: data.title,
//       img: data.img,
//       images: data.images || [],
//       redirect_url: data.redirect_url,
//       start_date: data.start_date || Date.now(),
//       end_date: data.end_date || Date.now(),
//       is_active: data.is_active || false,
//       created_at: data.created_at?.toDate() || new Date(),
//       updated_at: data.updated_at?.toDate() || new Date(),
//     };
//   });
//   } catch (error) {
//     console.error('Error fetching active banners:', error);
//     throw new Error('Failed to fetch active banners');
//   }
// };





// // ----------------------------------------------------------------------------------------------------
// // Charges services file
// type Unsubscribe = () => void;

// // ==================== SHIPPING RULES ====================

// export const createShippingRule = async (params: CreateShippingRuleData) => {
//   const id = Date.now().toString();
//   const now = Date.now();
  
//   const shippingRule: ShippingRule = {
//     id,
//     ...params,
//     created_at: now,
//     updated_at: now,
//   };
  
//   try {
//     await setDoc(doc(db, 'shipping_rules', id), {
//       ...shippingRule,
//       created_at: Timestamp.fromMillis(now),
//       updated_at: Timestamp.fromMillis(now),
//     });
//     return { success: true, id, data: shippingRule };
//   } catch (error) {
//     return { success: false, error: error instanceof Error ? error.message : String(error) };
//   }
// };

// export const updateShippingRule = async (id: string, params: UpdateShippingRuleData) => {
//   const docRef = doc(db, 'shipping_rules', id);
//   const docSnap = await getDoc(docRef);
  
//   if (!docSnap.exists()) {
//     return { success: false, error: `Shipping rule with ID ${id} not found` };
//   }
  
//   const updateData = {
//     ...params,
//     updated_at: Timestamp.fromMillis(Date.now()),
//   };
  
//   try {
//     await updateDoc(docRef, updateData);
//     return { success: true, id };
//   } catch (error) {
//     return { success: false, error: error instanceof Error ? error.message : String(error) };
//   }
// };

// export const getShippingRules = async () => {
//   try {
//     const shippingRulesQuery = query(
//       collection(db, 'shipping_rules'),
//       orderBy('min_price', 'asc')
//     );
//     const querySnapshot = await getDocs(shippingRulesQuery);
//     const shippingRules: ShippingRule[] = querySnapshot.docs.map((docSnap) => {
//       const data = docSnap.data();
//       return {
//         ...data,
//         created_at: data.created_at?.toMillis() || Date.now(),
//         updated_at: data.updated_at?.toMillis() || Date.now(),
//       } as ShippingRule;
//     });
    
//     return { success: true, data: shippingRules };
//   } catch (error) {
//     return { success: false, error: error instanceof Error ? error.message : String(error) };
//   }
// };

// export const getShippingRuleById = async (id: string) => {
//   try {
//     const docRef = doc(db, 'shipping_rules', id);
//     const docSnap = await getDoc(docRef);
//     if (docSnap.exists()) {
//       const data = docSnap.data();
//       return { 
//         success: true, 
//         data: {
//           ...data,
//           created_at: data.created_at?.toMillis() || Date.now(),
//           updated_at: data.updated_at?.toMillis() || Date.now(),
//         } as ShippingRule 
//       };
//     } else {
//       return { success: false, error: 'Shipping rule not found' };
//     }
//   } catch (error) {
//     return { success: false, error: error instanceof Error ? error.message : String(error) };
//   }
// };

// export const deleteShippingRule = async (id: string) => {
//   try {
//     await deleteDoc(doc(db, 'shipping_rules', id));
//     return { success: true };
//   } catch (error) {
//     return { success: false, error: error instanceof Error ? error.message : String(error) };
//   }
// };

// export const getActiveShippingRules = async () => {
//   try {
//     const shippingRulesQuery = query(
//       collection(db, 'shipping_rules'),
//       where('is_active', '==', true),
//       orderBy('min_price', 'asc')
//     );
//     const querySnapshot = await getDocs(shippingRulesQuery);
//     const shippingRules: ShippingRule[] = querySnapshot.docs.map((docSnap) => {
//       const data = docSnap.data();
//       return {
//         ...data,
//         created_at: data.created_at?.toMillis() || Date.now(),
//         updated_at: data.updated_at?.toMillis() || Date.now(),
//       } as ShippingRule;
//     });
    
//     return { success: true, data: shippingRules };
//   } catch (error) {
//     return { success: false, error: error instanceof Error ? error.message : String(error) };
//   }
// };

// // Real-time listener for shipping rules
// export const subscribeToShippingRules = (callback: (rules: ShippingRule[]) => void): Unsubscribe => {
//   const shippingRulesQuery = query(
//     collection(db, 'shipping_rules'),
//     orderBy('min_price', 'asc')
//   );
  
//   return onSnapshot(shippingRulesQuery, (querySnapshot) => {
//     const shippingRules: ShippingRule[] = querySnapshot.docs.map((docSnap) => {
//       const data = docSnap.data();
//       return {
//         ...data,
//         created_at: data.created_at?.toMillis() || Date.now(),
//         updated_at: data.updated_at?.toMillis() || Date.now(),
//       } as ShippingRule;
//     });
//     callback(shippingRules);
//   });
// };

// // ==================== SURGE RULES ====================

// export const createSurgeRule = async (params: CreateSurgeRuleData) => {
//   const id = Date.now().toString();
//   const now = Date.now();
  
//   const surgeRule: SurgeRule = {
//     id,
//     ...params,
//     created_at: now,
//     updated_at: now,
//   };
  
//   try {
//     await setDoc(doc(db, 'surge_rules', id), {
//       ...surgeRule,
//       created_at: Timestamp.fromMillis(now),
//       updated_at: Timestamp.fromMillis(now),
//       start_time: Timestamp.fromMillis(surgeRule.start_time),
//       end_time: Timestamp.fromMillis(surgeRule.end_time),
//     });
//     return { success: true, id, data: surgeRule };
//   } catch (error) {
//     return { success: false, error: error instanceof Error ? error.message : String(error) };
//   }
// };

// export const updateSurgeRule = async (id: string, params: UpdateSurgeRuleData) => {
//   const docRef = doc(db, 'surge_rules', id);
//   const docSnap = await getDoc(docRef);
  
//   if (!docSnap.exists()) {
//     return { success: false, error: `Surge rule with ID ${id} not found` };
//   }
  
//   const updateData: any = {
//     ...params,
//     updated_at: Timestamp.fromMillis(Date.now()),
//   };
  
//   // Convert millisecond timestamps to Firestore Timestamps if they exist
//   if (params.start_time) {
//     updateData.start_time = Timestamp.fromMillis(params.start_time);
//   }
//   if (params.end_time) {
//     updateData.end_time = Timestamp.fromMillis(params.end_time);
//   }
  
//   try {
//     await updateDoc(docRef, updateData);
//     return { success: true, id };
//   } catch (error) {
//     return { success: false, error: error instanceof Error ? error.message : String(error) };
//   }
// };

// export const getSurgeRules = async () => {
//   try {
//     const surgeRulesQuery = query(
//       collection(db, 'surge_rules'),
//       orderBy('created_at', 'desc')
//     );
//     const querySnapshot = await getDocs(surgeRulesQuery);
//     const surgeRules: SurgeRule[] = querySnapshot.docs.map((docSnap) => {
//       const data = docSnap.data();
//       return {
//         ...data,
//         created_at: data.created_at?.toMillis() || Date.now(),
//         updated_at: data.updated_at?.toMillis() || Date.now(),
//         start_time: data.start_time?.toMillis() || Date.now(),
//         end_time: data.end_time?.toMillis() || Date.now(),
//       } as SurgeRule;
//     });
    
//     return { success: true, data: surgeRules };
//   } catch (error) {
//     return { success: false, error: error instanceof Error ? error.message : String(error) };
//   }
// };

// export const getSurgeRuleById = async (id: string) => {
//   try {
//     const docRef = doc(db, 'surge_rules', id);
//     const docSnap = await getDoc(docRef);
//     if (docSnap.exists()) {
//       const data = docSnap.data();
//       return { 
//         success: true, 
//         data: {
//           ...data,
//           created_at: data.created_at?.toMillis() || Date.now(),
//           updated_at: data.updated_at?.toMillis() || Date.now(),
//           start_time: data.start_time?.toMillis() || Date.now(),
//           end_time: data.end_time?.toMillis() || Date.now(),
//         } as SurgeRule 
//       };
//     } else {
//       return { success: false, error: 'Surge rule not found' };
//     }
//   } catch (error) {
//     return { success: false, error: error instanceof Error ? error.message : String(error) };
//   }
// };

// export const deleteSurgeRule = async (id: string) => {
//   try {
//     await deleteDoc(doc(db, 'surge_rules', id));
//     return { success: true };
//   } catch (error) {
//     return { success: false, error: error instanceof Error ? error.message : String(error) };
//   }
// };

// export const getActiveSurgeRules = async () => {
//   try {
//     const now = Date.now();
//     const surgeRulesQuery = query(
//       collection(db, 'surge_rules'),
//       where('is_active', '==', true),
//       where('start_time', '<=', Timestamp.fromMillis(now)),
//       where('end_time', '>=', Timestamp.fromMillis(now))
//     );
//     const querySnapshot = await getDocs(surgeRulesQuery);
//     const surgeRules: SurgeRule[] = querySnapshot.docs.map((docSnap) => {
//       const data = docSnap.data();
//       return {
//         ...data,
//         created_at: data.created_at?.toMillis() || Date.now(),
//         updated_at: data.updated_at?.toMillis() || Date.now(),
//         start_time: data.start_time?.toMillis() || Date.now(),
//         end_time: data.end_time?.toMillis() || Date.now(),
//       } as SurgeRule;
//     });
    
//     return { success: true, data: surgeRules };
//   } catch (error) {
//     return { success: false, error: error instanceof Error ? error.message : String(error) };
//   }
// };

// // Real-time listener for surge rules
// export const subscribeToSurgeRules = (callback: (rules: SurgeRule[]) => void): Unsubscribe => {
//   const surgeRulesQuery = query(
//     collection(db, 'surge_rules'),
//     orderBy('created_at', 'desc')
//   );
  
//   return onSnapshot(surgeRulesQuery, (querySnapshot) => {
//     const surgeRules: SurgeRule[] = querySnapshot.docs.map((docSnap) => {
//       const data = docSnap.data();
//       return {
//         ...data,
//         created_at: data.created_at?.toMillis() || Date.now(),
//         updated_at: data.updated_at?.toMillis() || Date.now(),
//         start_time: data.start_time?.toMillis() || Date.now(),
//         end_time: data.end_time?.toMillis() || Date.now(),
//       } as SurgeRule;
//     });
//     callback(surgeRules);
//   });
// };

// // ==================== UTILITY FUNCTIONS ====================

// export const validateShippingRuleOverlap = async (
//   minPrice: number, 
//   maxPrice: number | null, 
//   location: string, 
//   excludeId?: string
// ) => {
//   try {
//     const shippingRulesQuery = query(
//       collection(db, 'shipping_rules'),
//       where('location', '==', location)
//     );
//     const querySnapshot = await getDocs(shippingRulesQuery);
    
//     for (const docSnap of querySnapshot.docs) {
//       const data = docSnap.data();
//       if (excludeId && data.id === excludeId) continue;
      
//       const existingMin = data.min_price;
//       const existingMax = data.max_price;
      
//       // Check for overlap
//       if (maxPrice === null && existingMax === null) {
//         return { hasOverlap: true, conflictingRule: data };
//       }
      
//       if (maxPrice === null && existingMax !== null) {
//         if (minPrice <= existingMax) {
//           return { hasOverlap: true, conflictingRule: data };
//         }
//       }
      
//       if (maxPrice !== null && existingMax === null) {
//         if (existingMin <= maxPrice) {
//           return { hasOverlap: true, conflictingRule: data };
//         }
//       }
      
//       if (maxPrice !== null && existingMax !== null) {
//         if (minPrice <= existingMax && existingMin <= maxPrice) {
//           return { hasOverlap: true, conflictingRule: data };
//         }
//       }
//     }
    
//     return { hasOverlap: false };
//   } catch (error) {
//     return { hasOverlap: false, error: error instanceof Error ? error.message : String(error) };
//   }
// };


// // ----------------------------------------------------------------------------------------------------

// // Dashboard services file

// const ORDERS_COLLECTION = "p_orders";
// const ORDER_ITEMS_COLLECTION = "p_order_items";

// function getMonthKey(date: Date = new Date()) {
//   const y = date.getFullYear();
//   const m = (`0${date.getMonth() + 1}`).slice(-2);
//   return `${y}-${m}`; // e.g. 2025-07
// }

// export async function fetchMonthStats(monthKey: string) {
//   const { data, error } = await supabase
//     .from("month_stats")
//     .select("orders_value,orders_count,orders_cancelled")
//     .eq("month_key", monthKey)
//     .maybeSingle();
//   if (error) throw error;
//   return data ?? null;
// }

// export async function fetchDailyOrders(lastNDays = 7) {
//   const to = new Date();
//   const from = new Date();
//   from.setDate(to.getDate() - (lastNDays - 1));
//   const fromKey = from.toISOString().slice(0, 10); // YYYY-MM-DD
//   const toKey = to.toISOString().slice(0, 10);

//   console.log('📊 fetchDailyOrders:', {
//     lastNDays,
//     fromKey,
//     toKey,
//     fromDate: from.toISOString(),
//     toDate: to.toISOString()
//   });

//   const { data, error } = await supabase
//     .from("day_stats")
//     .select("day_key,orders_count,orders_cancelled,orders_value")
//     .gte("day_key", fromKey)
//     .lte("day_key", toKey)
//     .order("day_key", { ascending: true });
  
//   if (error) {
//     console.error('❌ Error fetching daily orders:', error);
//     throw error;
//   }
  
//   console.log('📊 Fetched daily orders data:', data);
//   return data ?? [];
// }

// // Fetch daily orders data between specific dates (inclusive)
// export async function fetchDailyOrdersRange(fromDate: Date, toDate: Date) {
//   const from = new Date(fromDate);
//   const to = new Date(toDate);

//   const fromKey = from.toISOString().slice(0, 10); // YYYY-MM-DD
//   const toKey = to.toISOString().slice(0, 10);

//   console.log('📊 fetchDailyOrdersRange:', { fromKey, toKey });

//   const { data, error } = await supabase
//     .from("day_stats")
//     .select("day_key,orders_count,orders_cancelled,orders_value")
//     .gte("day_key", fromKey)
//     .lte("day_key", toKey)
//     .order("day_key", { ascending: true });

//   if (error) {
//     console.error('❌ Error fetching daily orders (range):', error);
//     throw error;
//   }

//   return data ?? [];
// }

// export async function fetchCustomersCount() {
//   const snap = await getDocs(collection(db, ORDERS_COLLECTION));
//   const unique = new Set<string>();
//   snap.forEach(doc => {
//     const d = doc.data() as { user?: { id?: string; email?: string } };
//     const id = d.user?.id || d.user?.email || doc.id;
//     if (id) unique.add(String(id));
//   });
//   return unique.size;
// }

// export async function fetchUniqueProductsCount() {
//   const snap = await getDocs(collection(db, ORDER_ITEMS_COLLECTION));
//   const unique = new Set<string>();
//   snap.forEach(doc => {
//     const d = doc.data() as { product_id?: string };
//     if (d.product_id) unique.add(String(d.product_id));
//   });
//   return unique.size;
// }

// export function getCurrentMonthKey() {
//   return getMonthKey();
// }

// export function getCurrentWeekKey() {
//   const now = new Date();
//   const year = now.getFullYear();
//   const weekNumber = getWeekNumber(now);
//   return `${year}-W${weekNumber}`;
// }

// export function getCurrentYearKey() {
//   return new Date().getFullYear().toString();
// }

// export function getCurrentDayKey() {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, '0');
//   const day = String(now.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// }

// // Function to get the most recent week key from database
// export async function getMostRecentWeekKey() {
//   try {
//     const { data, error } = await supabase
//       .from("week_stats")
//       .select("week_key")
//       .order("week_key", { ascending: false })
//       .limit(1)
//       .single();
    
//     if (error) {
//       console.error('Error getting most recent week key:', error);
//       return getCurrentWeekKey(); // Fallback to current week
//     }
    
//     return data?.week_key || getCurrentWeekKey();
//   } catch (err) {
//     console.error('Exception getting most recent week key:', err);
//     return getCurrentWeekKey(); // Fallback to current week
//   }
// }

// function getWeekNumber(date: Date) {
//   const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
//   const dayNum = d.getUTCDay() || 7;
//   d.setUTCDate(d.getUTCDate() + 4 - dayNum);
//   const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
//   return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
// }

// // src/services/dashboardService.ts or similar
// export async function fetchWeekStats(weekKey: string) {
//   try {
//     const { data, error } = await supabase
//       .from("week_stats")
//       .select("*")
//       .eq("week_key", weekKey)
//       .maybeSingle(); // Use maybeSingle!
//     if (error) {
//       console.error(`Error fetching week stats for ${weekKey}:`, error);
//       throw error;
//     }
    
//     // If week_stats has different column names, map them to the expected format
//     if (data) {
//       return {
//         orders_value: data.orders_value || data.total_value || 0,
//         orders_count: data.orders_count || data.total_orders || 0,
//         orders_cancelled: data.orders_cancelled || data.cancelled_orders || 0,
//       };
//     }
    
//     return data ?? null;
//   } catch (err) {
//     console.error(`Exception fetching week stats for ${weekKey}:`, err);
//     return null;
//   }
// }

// export async function fetchYearStats(yearKey: string) {
//   try {
//     const { data, error } = await supabase
//       .from("year_stats")
//       .select("*")
//       .eq("year", yearKey)
//       .maybeSingle();
//     if (error) {
//       console.error(`Error fetching year stats for ${yearKey}:`, error);
//       throw error;
//     }
    
//     // If year_stats has different column names, map them to the expected format
//     if (data) {
//       return {
//         orders_value: data.orders_value || data.total_value || 0,
//         orders_count: data.orders_count || data.total_orders || 0,
//         orders_cancelled: data.orders_cancelled || data.cancelled_orders || 0,
//       };
//     }
    
//     return data ?? null;
//   } catch (err) {
//     console.error(`Exception fetching year stats for ${yearKey}:`, err);
//     return null;
//   }
// }

// export async function fetchDayStats(dayKey: string) {
//   try {
//     const { data, error } = await supabase
//       .from("day_stats")
//       .select("*")
//       .eq("day_key", dayKey)
//       .maybeSingle();
//     if (error) {
//       console.error(`Error fetching day stats for ${dayKey}:`, error);
//       throw error;
//     }
    
//     // If day_stats has different column names, map them to the expected format
//     if (data) {
//       return {
//         orders_value: data.orders_value || data.total_value || 0,
//         orders_count: data.orders_count || data.total_orders || 0,
//         orders_cancelled: data.orders_cancelled || data.cancelled_orders || 0,
//       };
//     }
    
//     return data ?? null;
//   } catch (err) {
//     console.error(`Exception fetching day stats for ${dayKey}:`, err);
//     return null;
//   }
// }



// // New functions for live analytics data

// /**
//  * Fetch regional sales data based on customer addresses
//  */
// export async function fetchRegionalSales() {
//   try {
//     const snap = await getDocs(collection(db, ORDERS_COLLECTION));
//     const regionalData = new Map<string, number>();
    
//     snap.forEach(doc => {
//       const orderData = doc.data() as { 
//         total_price?: number; 
//         address?: { state?: string };
//         order_status?: string;
//       };
      
//       // Only count completed orders
//       if (orderData.order_status === 'Delivered' || orderData.order_status === 'new') {
//         const state = orderData.address?.state;
//         const amount = orderData.total_price || 0;
        
//         if (state) {
//           const currentAmount = regionalData.get(state) || 0;
//           regionalData.set(state, currentAmount + amount);
//         }
//       }
//     });
    
//     // Convert to chart format and limit to top 4 regions
//     const sortedRegions = Array.from(regionalData.entries())
//       .sort(([,a], [,b]) => b - a)
//       .slice(0, 4);
    
//     const totalSales = sortedRegions.reduce((sum, [, amount]) => sum + amount, 0);
    
//     return sortedRegions.map(([region, amount]) => ({
//       name: region,
//       value: amount,
//       percentage: totalSales > 0 ? (amount / totalSales) * 100 : 0
//     }));
//   } catch (error) {
//     console.error('Error fetching regional sales:', error);
//     return [];
//   }
// }

// /**
//  * Fetch traffic source data based on actual order patterns
//  */
// export async function fetchTrafficSourceData() {
//   try {
//     const snap = await getDocs(collection(db, ORDERS_COLLECTION));
//     const sourceData = new Map<string, number>();
    
//     snap.forEach(doc => {
//       const orderData = doc.data() as { 
//         total_price?: number;
//         created_at?: string;
//         order_status?: string;
//       };
      
//       if (orderData.order_status === 'Delivered' || orderData.order_status === 'new') {
//         const amount = orderData.total_price || 0;
//         const createdAt = orderData.created_at ? new Date(orderData.created_at) : new Date();
//         const hour = createdAt.getHours();
        
//         // More realistic traffic source distribution based on order patterns
//         let source = 'Direct';
        
//         // Time-based traffic source simulation
//         if (hour >= 9 && hour <= 17) {
//           // Business hours - more organic and direct traffic
//           if (amount > 800) source = 'Organic';
//           else if (amount > 400) source = 'Direct';
//           else if (amount > 200) source = 'Referral';
//           else source = 'Email';
//         } else {
//           // Off-hours - more social and direct traffic
//           if (amount > 600) source = 'Social';
//           else if (amount > 300) source = 'Direct';
//           else if (amount > 150) source = 'Referral';
//           else source = 'Email';
//         }
        
//         const currentAmount = sourceData.get(source) || 0;
//         sourceData.set(source, currentAmount + amount);
//       }
//     });
    
//     return [
//       { name: 'Direct', value: sourceData.get('Direct') || 0 },
//       { name: 'Organic', value: sourceData.get('Organic') || 0 },
//       { name: 'Referral', value: sourceData.get('Referral') || 0 },
//       { name: 'Social', value: sourceData.get('Social') || 0 },
//       { name: 'Email', value: sourceData.get('Email') || 0 },
//     ];
//   } catch (error) {
//     console.error('Error fetching traffic source data:', error);
//     return [];
//   }
// }

// /**
//  * Fetch customer retention rate based on actual order patterns
//  */
// export async function fetchCustomerRetention() {
//   try {
//     const snap = await getDocs(collection(db, ORDERS_COLLECTION));
//     const customerOrders = new Map<string, number>();
//     const customerFirstOrder = new Map<string, Date>();
//     const customerLastOrder = new Map<string, Date>();
    
//     snap.forEach(doc => {
//       const orderData = doc.data() as { 
//         user?: { id?: string; email?: string };
//         order_status?: string;
//         created_at?: string;
//       };
      
//       if (orderData.order_status === 'Delivered' || orderData.order_status === 'new') {
//         const customerId = orderData.user?.id || orderData.user?.email || doc.id;
//         if (customerId) {
//           const currentOrders = customerOrders.get(customerId) || 0;
//           customerOrders.set(customerId, currentOrders + 1);
          
//           const orderDate = orderData.created_at ? new Date(orderData.created_at) : new Date();
          
//           // Track first and last order dates
//           if (!customerFirstOrder.has(customerId) || orderDate < customerFirstOrder.get(customerId)!) {
//             customerFirstOrder.set(customerId, orderDate);
//           }
//           if (!customerLastOrder.has(customerId) || orderDate > customerLastOrder.get(customerId)!) {
//             customerLastOrder.set(customerId, orderDate);
//           }
//         }
//       }
//     });
    
//     const totalCustomers = customerOrders.size;
//     const repeatCustomers = Array.from(customerOrders.values()).filter(orders => orders > 1).length;
    
//     // Calculate retention rate with more realistic logic
//     let retentionRate = 0;
//     if (totalCustomers > 0) {
//       // Base retention rate on repeat customers
//       const baseRetention = (repeatCustomers / totalCustomers) * 100;
      
//       // Adjust based on order patterns
//       const avgOrdersPerCustomer = Array.from(customerOrders.values()).reduce((sum, orders) => sum + orders, 0) / totalCustomers;
      
//       // Higher average orders per customer = higher retention
//       const orderMultiplier = Math.min(avgOrdersPerCustomer / 2, 1.5);
      
//       retentionRate = baseRetention * orderMultiplier;
//       retentionRate = Math.min(95, Math.max(0, retentionRate)); // Keep between 0-95%
//     }
    
//     return {
//       retentionRate,
//       totalCustomers,
//       repeatCustomers
//     };
//   } catch (error) {
//     console.error('Error fetching customer retention:', error);
//     return { retentionRate: 0, totalCustomers: 0, repeatCustomers: 0 };
//   }
// }



// /**
//  * Fetch product category sales data based on actual order patterns
//  */
// export async function fetchProductCategoryData() {
//   try {
//     const snap = await getDocs(collection(db, ORDER_ITEMS_COLLECTION));
//     const categoryData = new Map<string, number>();
    
//     snap.forEach(doc => {
//       const itemData = doc.data() as { 
//         product_id?: string;
//         subtotal?: number;
//       };
      
//       if (itemData.subtotal && itemData.product_id) {
//         // More realistic category determination based on product patterns
//         let category = 'Other';
//         const productId = itemData.product_id.toLowerCase();
        
//         // Enhanced category detection
//         if (productId.includes('elec') || productId.includes('tech') || productId.includes('phone') || productId.includes('laptop')) {
//           category = 'Electronics';
//         } else if (productId.includes('cloth') || productId.includes('fashion') || productId.includes('shirt') || productId.includes('dress')) {
//           category = 'Clothing';
//         } else if (productId.includes('home') || productId.includes('kitchen') || productId.includes('furniture') || productId.includes('appliance')) {
//           category = 'Home & Kitchen';
//         } else if (productId.includes('book') || productId.includes('edu') || productId.includes('study')) {
//           category = 'Books';
//         } else if (productId.includes('food') || productId.includes('grocery') || productId.includes('fresh')) {
//           category = 'Food & Grocery';
//         } else if (productId.includes('beauty') || productId.includes('cosmetic') || productId.includes('skincare')) {
//           category = 'Beauty & Personal Care';
//         }
        
//         const currentAmount = categoryData.get(category) || 0;
//         categoryData.set(category, currentAmount + itemData.subtotal);
//       }
//     });
    
//     return Array.from(categoryData.entries())
//       .sort(([,a], [,b]) => b - a) // Sort by value descending
//       .map(([name, value]) => ({
//         name,
//         value
//       }));
//   } catch (error) {
//     console.error('Error fetching product category data:', error);
//     return [];
//   }
// }

// /**
//  * Fetch top selling products data based on actual order patterns
//  */
// export async function fetchTopProductsData() {
//   try {
//     const snap = await getDocs(collection(db, ORDER_ITEMS_COLLECTION));
//     const productData = new Map<string, { sales: number; units: number; orders: number }>();
    
//     snap.forEach(doc => {
//       const itemData = doc.data() as { 
//         product_id?: string;
//         subtotal?: number;
//         quantity?: number;
//       };
      
//       if (itemData.product_id && itemData.subtotal && itemData.quantity) {
//         const current = productData.get(itemData.product_id) || { sales: 0, units: 0, orders: 0 };
//         productData.set(itemData.product_id, {
//           sales: current.sales + itemData.subtotal,
//           units: current.units + itemData.quantity,
//           orders: current.orders + 1
//         });
//       }
//     });
    
//     return Array.from(productData.entries())
//       .sort(([,a], [,b]) => b.sales - a.sales) // Sort by sales descending
//       .slice(0, 5)
//       .map(([productId, data], index) => ({
//         name: `Product ${productId.slice(-4)}`, // Use last 4 chars as name
//         sales: data.sales,
//         units: data.units,
//         orders: data.orders
//       }));
//   } catch (error) {
//     console.error('Error fetching top products data:', error);
//     return [];
//   }
// }

// /**
//  * Fetch sales trend data for the last 12 months
//  */
// export async function fetchSalesTrendData() {
//   try {
//     const { data: monthStats, error } = await supabase
//       .from("month_stats")
//       .select("month_key,orders_value")
//       .order("month_key", { ascending: true })
//       .limit(12);
    
//     if (error) throw error;
    
//     return monthStats?.map(stat => ({
//       name: new Date(stat.month_key + '-01').toLocaleDateString('en-US', { 
//         month: 'short' 
//       }),
//       sales: (stat.orders_value || 0) / 100 // Convert to display format
//     })) || [];
//   } catch (error) {
//     console.error('Error fetching sales trend data:', error);
//     return [];
//   }
// }

// /**
//  * Fetch total revenue from all orders (no filters applied)
//  * This calculates the sum of total_price from all orders
//  */
// export async function fetchTotalRevenue() {
//   try {
//     const snap = await getDocs(collection(db, ORDERS_COLLECTION));
//     let totalRevenue = 0;
    
//     snap.forEach(doc => {
//       const orderData = doc.data() as { 
//         total_price?: number;
//       };
      
//       if (orderData.total_price) {
//         totalRevenue += orderData.total_price;
//       }
//     });
    
//     return totalRevenue;
//   } catch (error) {
//     console.error('Error fetching total revenue:', error);
//     return 0;
//   }
// }

// /**
//  * Fetch total orders count from all orders (no filters applied)
//  * This counts all orders in the database
//  */
// export async function fetchTotalOrdersCount() {
//   try {
//     const snap = await getDocs(collection(db, ORDERS_COLLECTION));
//     return snap.size;
//   } catch (error) {
//     console.error('Error fetching total orders count:', error);
//     return 0;
//   }
// }



// // ----------------------------------------------------------------------------------------------------
// // Delivery schedule services file
// // Note: getAllCategories, getAllProducts, syncSubscriptionsWithDeliverySchedule are imported inline where needed

// const COLLECTION_NAME = 'delivery_schedules';

// export const deliveryScheduleService = {
//   // Get all categories for dropdown
//   async getCategories(): Promise<Category[]> {
//     try {
//       const result = await getAllCategories();
      
//       const allCategories = result.data
//         .map((cat: any) => ({
//           id: cat.id,
//           title: cat.title,
//           active: cat.active,
//           status: cat.status,
//           img: cat.img,
//           translation: cat.translation,
//           translations: cat.translations
//         }))
//         .filter((cat: any) => cat.title && cat.title !== 'Untitled Category'); // Only filter out categories with no title
      
//       return allCategories;
//     } catch (error) {
//       console.error('Error fetching categories:', error);
//       throw new Error('Failed to fetch categories');
//     }
//   },

//   // Get all products for display
//   async getProducts(): Promise<Product[]> {
//     try {
//       const result = await getAllProducts('', { params: {} });
//       console.log('Service: Raw products result:', result);
      
//       // Filter only active products and ensure proper typing
//       const filteredProducts = result.data
//         .filter((prod: any) => prod.active === 1)
//         .map((prod: any) => ({
//           id: prod.id,
//           title: prod.title,
//           category_id: prod.category_id,
//           category: prod.category,
//           active: prod.active,
//           status: prod.status,
//           img: prod.img,
//           price: prod.price,
//           translation: prod.translation,
//           translations: prod.translations
//         })) as Product[];
      
//       console.log('Service: Filtered products:', filteredProducts);
//       return filteredProducts;
//     } catch (error) {
//       console.error('Error fetching products:', error);
//       throw new Error('Failed to fetch products');
//     }
//   },

//   // Get products by category ID
//   async getProductsByCategory(categoryId: string): Promise<Product[]> {
//     try {
//       const result = await getAllProducts('', { params: { category_id: categoryId } });
      
//       // Filter only active products and ensure proper typing
//       return result.data
//         .filter((prod: any) => prod.active === 1)
//         .map((prod: any) => ({
//           id: prod.id,
//           title: prod.title,
//           category_id: prod.category_id,
//           active: prod.active,
//           status: prod.status,
//           img: prod.img,
//           price: prod.price,
//           translation: prod.translation,
//           translations: prod.translations
//         })) as Product[];
//     } catch (error) {
//       console.error('Error fetching products by category:', error);
//       throw new Error('Failed to fetch products');
//     }
//   },

//   // Get all delivery schedules
//   async getAll(): Promise<DeliverySchedule[]> {
//     try {
//       const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      
//       return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
//         id: doc.id,
//         ...doc.data()
//       })) as DeliverySchedule[];
//     } catch (error) {
//       console.error('Error fetching delivery schedules:', error);
//       throw new Error('Failed to fetch delivery schedules');
//     }
//   },

//   // Get delivery schedules by category
//   async getByCategory(categoryId: string): Promise<DeliverySchedule[]> {
//     try {
//       const q = query(
//         collection(db, COLLECTION_NAME),
//         where('category_id', '==', categoryId)
//       );
//       const querySnapshot = await getDocs(q);
      
//       return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
//         id: doc.id,
//         ...doc.data()
//       })) as DeliverySchedule[];
//     } catch (error) {
//       console.error('Error fetching delivery schedules by category:', error);
//       throw new Error('Failed to fetch delivery schedules by category');
//     }
//   },

//   // Add new delivery schedule
//   async create(data: DeliveryScheduleFormData): Promise<string> {
//     try {
//       const docRef = await addDoc(collection(db, COLLECTION_NAME), {
//         ...data,
//         createdAt: Date.now(), // Store as milliseconds
//         updatedAt: Date.now()  // Store as milliseconds
//       });
//       return docRef.id;
//     } catch (error) {
//       console.error('Error creating delivery schedule:', error);
//       throw new Error('Failed to create delivery schedule');
//     }
//   },

//   // Update existing delivery schedule
//   async update(id: string, data: Partial<DeliveryScheduleFormData>): Promise<void> {
//     try {
//       const docRef = doc(db, COLLECTION_NAME, id);
      
//       // Get the existing schedule to check what changed
//       const existingDoc = await getDoc(docRef);
//       const existingData = existingDoc.data() as DeliverySchedule;
      
//       // Update the schedule
//       await updateDoc(docRef, {
//         ...data,
//         updatedAt: Date.now() // Store as milliseconds
//       });
      
//       // If delivery_time_start or delivery_time_end changed, sync subscriptions
//       const deliveryTimeChanged = 
//         (data.delivery_time_start && data.delivery_time_start !== existingData.delivery_time_start) ||
//         (data.delivery_time_end !== undefined && data.delivery_time_end !== existingData.delivery_time_end);
      
//       if (deliveryTimeChanged) {
//         // Get the updated schedule data
//         const updatedData = { ...existingData, ...data } as DeliveryScheduleFormData;
        
//         // Sync subscriptions with the updated delivery times
//         // Note: This runs asynchronously and errors are caught, so it won't block the update
//         syncSubscriptionsWithDeliverySchedule({
//           category_id: updatedData.category_id,
//           product_ids: updatedData.product_ids,
//           delivery_time_start: updatedData.delivery_time_start,
//           delivery_time_end: updatedData.delivery_time_end,
//         }).then(syncResult => {
//           console.log('Subscription sync result:', syncResult);
//         }).catch(syncError => {
//           // Log sync error but don't fail the update
//           console.error('Error syncing subscriptions after schedule update:', syncError);
//         });
//       }
//     } catch (error) {
//       console.error('Error updating delivery schedule:', error);
//       throw new Error('Failed to update delivery schedule');
//     }
//   },

//   // Delete delivery schedule
//   async delete(id: string): Promise<void> {
//     try {
//       const docRef = doc(db, COLLECTION_NAME, id);
//       await deleteDoc(docRef);
//     } catch (error) {
//       console.error('Error deleting delivery schedule:', error);
//       throw new Error('Failed to delete delivery schedule');
//     }
//   }
// };






// // ----------------------------------------------------------------------------------------------------

// // Export services file


// // Extend jsPDF type to include autoTable
// declare module 'jspdf' {
//   interface jsPDF {
//     autoTable: (options: any) => jsPDF;
//   }
// }

// export interface ExportColumn {
//   key: string;
//   label: string;
//   width?: number;
//   align?: 'left' | 'center' | 'right';
// }

// export interface ExportData {
//   [key: string]: any;
// }

// export interface ExportOptions {
//   filename: string;
//   title: string;
//   columns: ExportColumn[];
//   data: ExportData[];
//   includeHeaders?: boolean;
// }

// export class ExportService {
//   /**
//    * Export data to Excel format
//    */
//   static async exportToExcel(options: ExportOptions): Promise<void> {
//     try {

//       // Prepare data for Excel
//       const excelData = options.data.map(row => {
//         const excelRow: { [key: string]: any } = {};
//         options.columns.forEach(column => {
//           excelRow[column.label] = this.formatCellValue(row[column.key], column.key);
//         });
//         return excelRow;
//       });

//       // Create workbook
//       const workbook = XLSX.utils.book_new();
//       const worksheet = XLSX.utils.json_to_sheet(excelData);

//       // Set column widths
//       const columnWidths: { wch: number }[] = [];
//       options.columns.forEach(column => {
//         columnWidths.push({ wch: column.width || 15 });
//       });
//       worksheet['!cols'] = columnWidths;

//       // Add worksheet to workbook
//       XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

//       // Generate and download file
//       XLSX.writeFile(workbook, `${options.filename}.xlsx`);
//     } catch (error) {
//       throw new Error('Failed to export to Excel');
//     }
//   }

//   /**
//    * Export data to PDF format
//    */
//   static async exportToPDF(options: ExportOptions): Promise<void> {
//     try {

//       // Check if jsPDF is available
//       if (typeof jsPDF === 'undefined') {
//         throw new Error('jsPDF library not loaded');
//       }

//       const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation for better table display
      
//       // Add title with better formatting
//       doc.setFontSize(18);
//       doc.setFont('helvetica', 'bold');
//       doc.text(options.title, 10, 20);
      
//       // Add export date
//       doc.setFontSize(10);
//       doc.setFont('helvetica', 'normal');
//       doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 10, 28);

//       // Prepare table data
//       const tableData = options.data.map(row => 
//         options.columns.map(column => this.formatCellValue(row[column.key], column.key))
//       );

//       // Prepare headers
//       const headers = options.columns.map(column => column.label);

//       // Generate table with optimized layout
//       autoTable(doc, {
//         head: [headers],
//         body: tableData,
//         startY: 35,
//         styles: {
//           fontSize: 6,
//           cellPadding: 1.5,
//           overflow: 'linebreak',
//           halign: 'left',
//           valign: 'middle',
//           lineColor: [200, 200, 200],
//           lineWidth: 0.1
//         },
//         headStyles: {
//           fillColor: [41, 128, 185],
//           textColor: 255,
//           fontStyle: 'bold',
//           fontSize: 8,
//           cellPadding: 3
//         },
//         alternateRowStyles: {
//           fillColor: [248, 248, 248]
//         },
//         columnStyles: {
//           // Customer - medium width
//           0: { 
//             halign: 'left', 
//             cellWidth: 25,
//             fontSize: 6
//           },
//           // Order ID - wider for long numbers
//           1: { 
//             halign: 'left', 
//             cellWidth: 30,
//             fontSize: 6
//           },
//           // Email - wider for long emails
//           2: { 
//             halign: 'left', 
//             cellWidth: 40,
//             fontSize: 5
//           },
//           // Created At - reduced width
//           3: { 
//             halign: 'center', 
//             cellWidth: 15,
//             fontSize: 6
//           },
//           // Total Amount - right aligned
//           4: { 
//             halign: 'right', 
//             cellWidth: 20,
//             fontSize: 6
//           },
//           // Status - medium width
//           5: { 
//             halign: 'center', 
//             cellWidth: 25,
//             fontSize: 6
//           },
//           // Delivery Date - narrow
//           6: { 
//             halign: 'center', 
//             cellWidth: 20,
//             fontSize: 6
//           },
//           // Address - increased width for long addresses
//           7: { 
//             halign: 'left', 
//             cellWidth: 70,
//             fontSize: 5
//           },
//           // Items Count - narrow
//           8: { 
//             halign: 'center', 
//             cellWidth: 15,
//             fontSize: 6
//           },
//           // Delivered Count - narrow
//           9: { 
//             halign: 'center', 
//             cellWidth: 15,
//             fontSize: 6
//           }
//         },
//         margin: { top: 30, right: 10, bottom: 10, left: 10 },
//         tableWidth: 'wrap',
//         showHead: 'everyPage',
//         pageBreak: 'auto',
//         rowPageBreak: 'avoid',
//         didDrawPage: (data) => {
//           // Add footer with page numbers
//           const pageCount = doc.getNumberOfPages();
//           const pageSize = doc.internal.pageSize;
//           const pageHeight = pageSize.height || pageSize.getHeight();
          
//           // Add page number
//           doc.setFontSize(8);
//           doc.setFont('helvetica', 'normal');
//           doc.text(
//             `Page ${data.pageNumber} of ${pageCount}`,
//             pageSize.width - 20,
//             pageHeight - 10
//           );
          
//           // Add total records count on first page
//           if (data.pageNumber === 1) {
//             doc.text(
//               `Total Records: ${options.data.length}`,
//               10,
//               pageHeight - 10
//             );
//           }
//         }
//       });

//       // Save the PDF
//       doc.save(`${options.filename}.pdf`);
//     } catch (error) {
//       throw new Error(`Failed to export to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     }
//   }


//   /**
//    * Format cell value based on column type
//    */
//   private static formatCellValue(value: any, key: string): string {
//     if (value === null || value === undefined) return '';
    
//     // Handle different data types
//     if (typeof value === 'number') {
//       // Format currency values with proper formatting
//       if (key.toLowerCase().includes('price') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('total')) {
//         // Ensure proper currency formatting
//         const numValue = parseFloat(value.toString());
//         if (isNaN(numValue)) return 'Rs 0.00';
        
//         // Format with proper decimal places and commas
//         const formatted = numValue.toLocaleString('en-IN', {
//           minimumFractionDigits: 2,
//           maximumFractionDigits: 2
//         });
//         return `Rs ${formatted}`;
//       }
//       return value.toString();
//     }
    
//     if (typeof value === 'boolean') {
//       return value ? 'Yes' : 'No';
//     }
    
//     if (typeof value === 'object') {
//       if (Array.isArray(value)) {
//         return value.join(', ');
//       }
//       if (value instanceof Date) {
//         return value.toLocaleDateString();
//       }
//       return JSON.stringify(value);
//     }
    
//     // Handle long strings for better display
//     const stringValue = String(value);
    
//     // Truncate very long strings for better table display
//     if (key.toLowerCase().includes('address') && stringValue.length > 100) {
//       return stringValue.substring(0, 97) + '...';
//     }
    
//     if (key.toLowerCase().includes('email') && stringValue.length > 50) {
//       return stringValue.substring(0, 47) + '...';
//     }
    
//     if (key.toLowerCase().includes('id') && stringValue.length > 25) {
//       return stringValue.substring(0, 22) + '...';
//     }
    
//     return stringValue;
//   }

// }

// export default ExportService;





// // ----------------------------------------------------------------------------------------------------


// // fcm services file

// let messagingInstance: Messaging | null = null;

// export async function initMessaging(): Promise<Messaging | null> {
// 	try {
// 		const supported = await isSupported();
// 		// console.log("[FCM] isSupported:", supported);
// 		if (!supported) return null;
// 		if (!messagingInstance) {
// 			messagingInstance = getMessaging(app);
// 		}
// 		return messagingInstance;
// 	} catch (error) {
// 		// console.error("[FCM] initMessaging error", error);
// 		return null;
// 	}
// }

// export async function requestFcmPermissionAndToken(): Promise<string | null> {
// 	try {
// 		const permission = await Notification.requestPermission();
// 		// console.log("[FCM] Notification permission:", permission);
// 		if (permission !== "granted") return null;

// 		const messaging = await initMessaging();
// 		if (!messaging) return null;

// 		const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY as string;
// 		if (!vapidKey) {
// 			console.warn("[FCM] Missing VITE_FIREBASE_VAPID_KEY env");
// 		}

// 		const token = await getToken(messaging, { vapidKey });
// 		// console.log("[FCM] FCM token:", token);
// 		return token ?? null;
// 	} catch (error) {
// 		console.error("[FCM] requestFcmPermissionAndToken error", error);
// 		return null;
// 	}
// }

// export function subscribeToForegroundMessages(
//     callback: (payload: import("firebase/messaging").MessagePayload) => void
// ): () => void {
//     const setup = async () => {
//         try {
//             const supported = await isSupported();
//             if (!supported) {
//                 // console.warn("[FCM] Not supported; skipping foreground subscription");
//                 return () => {};
//             }
//             if (!messagingInstance) {
//                 messagingInstance = getMessaging(app);
//             }
//             return onMessage(messagingInstance as Messaging, (payload) => {
//                 // console.log("[FCM] Foreground message:", payload);
//                 callback(payload);
//             });
//         } catch (e) {
//             // console.error("[FCM] subscribeToForegroundMessages error", e);
//             return () => {};
//         }
//     };
//     let unsubscribe: (() => void) | null = null;
//     // Fire and forget; we still return a function that will call unsubscribe when ready
//     setup().then((u) => { unsubscribe = u || null; });
//     return () => { if (unsubscribe) unsubscribe(); };
// }

// export async function registerMessagingServiceWorker(): Promise<ServiceWorkerRegistration | null> {
// 	try {
// 		if (!("serviceWorker" in navigator)) {
// 			// console.warn("[FCM] Service workers not supported in this browser");
// 			return null;
// 		}
//         const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
// 		// console.log("[FCM] SW registered:", registration);

// 		// Pass Firebase config to SW so it can initialize
// 		const firebaseConfig = {
// 			apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
// 			authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
// 			projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
// 			storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
// 			messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
// 			appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
// 			measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
// 		};
//         const postInit = (reg: ServiceWorkerRegistration) => reg.active?.postMessage({ type: "INIT_FIREBASE", payload: firebaseConfig });
//         postInit(registration);
//         if (registration.installing) {
//             registration.installing.addEventListener("statechange", () => postInit(registration));
//         }
//         navigator.serviceWorker.ready.then((reg) => postInit(reg));
//         // Bridge SW -> window messages into a DOM event so UI can show a toast even for background pushes when app is open
//         navigator.serviceWorker.addEventListener('message', (event: MessageEvent) => {
//             if (event.data && event.data.type === 'FCM_PAYLOAD') {
//                 const customEvent = new CustomEvent('FCM_PAYLOAD', { detail: event.data.payload });
//                 window.dispatchEvent(customEvent);
//             }
//         });
// 		return registration;
// 	} catch (error) {
// 		// console.error("[FCM] SW registration error", error);
// 		return null;
// 	}
// }

// export async function saveFcmToken(token: string): Promise<void> {
// 	try {
// 		const user = auth.currentUser;
// 		if (!user || !token) {
// 			// console.warn("[FCM] saveFcmToken skipped; user or token missing");
// 			return;
// 		}
// 		// console.log("[FCM] Appending token into users doc fcmWebTokens:", user.uid, token);
// 		await setDoc(
// 			doc(db, "users", user.uid),
// 			{ fcmWebTokens: arrayUnion(token), updatedAt: serverTimestamp() },
// 			{ merge: true }
// 		);
// 	} catch (error) {
// 		// console.error("[FCM] saveFcmToken error", error);
// 	}
// }

// let authListenerAttached = false;
// export function persistFcmTokenWhenAuthenticated(token: string): void {
// 	if (!token) return;
// 	if (auth.currentUser) {
// 		void saveFcmToken(token);
// 		return;
// 	}
// 	try {
// 		localStorage.setItem("pendingFcmToken", token);
// 		if (!authListenerAttached) {
// 			authListenerAttached = true;
// 			onAuthStateChanged(auth, (user) => {
// 				if (user) {
// 					const pending = localStorage.getItem("pendingFcmToken");
// 					const toSave = pending || token;
// 					if (toSave) {
// 						void saveFcmToken(toSave);
// 						localStorage.removeItem("pendingFcmToken");
// 					}
// 				}
// 			});
// 		}
// 	} catch (e) {
// 		// console.error("[FCM] persistFcmTokenWhenAuthenticated error", e);
// 	}
// }





// // ----------------------------------------------------------------------------------------------------

// // firestore notifications services file


// export type InAppNotification = {
// 	id: string;
// 	title: string;
// 	body?: string;
// 	createdAt?: any;
// 	status?: "unread" | "read";
//     type?: string;
//     source?: string;
//     orderId?: string;
// };

// export function subscribeToNotifications(
//     onAdd: (notif: InAppNotification) => void
// ): () => void {
//     const colRef = collection(db, "webNotifications");
//     // Global stream of latest notifications without filters
//     const qRef = query(colRef, orderBy("createdAt", "desc"), limit(20));

//     const unsubscribe = onSnapshot(
//         qRef,
//         (snap) => {
//             snap.docChanges().forEach((change) => {
//                 if (change.type === "added") {
//                     const data = change.doc.data() as any;
//                     onAdd({
//                         id: change.doc.id,
//                         title: data.title || "New Notification",
//                         body: data.body || "",
//                         createdAt: data.createdAt,
//                         status: data.status || "unread",
//                         type: data.type,
//                         source: data.source,
//                         orderId: data.orderId,
//                     });
//                 }
//             });
//         },
//         (error) => {
//             console.error("[FirestoreNotif] onSnapshot error", error);
//         }
//     );
//     return unsubscribe;
// }



// // Generic add notification used by FCM/orders listeners
// export async function addNotification(docIn: {
//     title: string;
//     body?: string;
//     type?: string;
//     source?: string;
//     orderId?: string;
// }) {
//     const colRef = collection(db, "webNotifications");
//     await addDoc(colRef, {
//         ...docIn,
//         status: "unread",
//         createdAt: serverTimestamp(),
//     });
// }

// // Add notification with deterministic id to prevent duplicates (e.g., same orderId/type from multiple sources)
// export async function addNotificationOnce(docIn: {
//     title: string;
//     body?: string;
//     type?: string; // e.g., 'order_created' | 'order_cancelled'
//     source?: string;
//     orderId?: string; // when provided with type, forms the id: `${type}_${orderId}`
// }) {
//     const colRef = collection(db, "webNotifications");
//     const payload = {
//         ...docIn,
//         status: "unread",
//         createdAt: serverTimestamp(),
//     } as any;
//     if (docIn.type && docIn.orderId) {
//         const dedupeId = `${docIn.type}_${docIn.orderId}`;
//         await setDoc(doc(colRef, dedupeId), payload, { merge: false });
//     } else {
//         await addDoc(colRef, payload);
//     }
// }

// // For the Notifications page – get and mark as read
// export function listenNotifications(
//     onUpdate: (items: InAppNotification[]) => void,
//     limitCount: number = 50
// ): () => void {
//     const colRef = collection(db, "webNotifications");
//     const qRef = query(colRef, orderBy("createdAt", "desc"), limit(limitCount));
//     const unsub = onSnapshot(qRef, (snap) => {
//         const items: InAppNotification[] = snap.docs.map((d) => {
//             const data = d.data() as any;
//             return {
//                 id: d.id,
//                 title: data.title || "New Notification",
//                 body: data.body || "",
//                 createdAt: data.createdAt,
//                 status: data.status || "unread",
//                 type: data.type,
//                 source: data.source,
//                 orderId: data.orderId,
//             };
//         });
//         onUpdate(items);
//     });
//     return unsub;
// }

// export async function markNotificationRead(id: string) {
//     await updateDoc(doc(db, "webNotifications", id), { status: "read" });
// }

// export async function markAllNotificationsRead() {
//     const colRef = collection(db, "webNotifications");
//     const snap = await getDocs(query(colRef, limit(200)));
//     const batch = writeBatch(db);
//     snap.docs.forEach((d) => batch.update(d.ref, { status: "read" }));
//     await batch.commit();
// }

// export async function deleteNotification(id: string) {
//     await deleteDoc(doc(db, "webNotifications", id));
// }

// export async function deleteNotificationsBulk(ids: string[]) {
//     if (!ids || ids.length === 0) return;
//     const batch = writeBatch(db);
//     ids.forEach((id) => batch.delete(doc(db, "webNotifications", id)));
//     await batch.commit();
// }







// // ----------------------------------------------------------------------------------------------------

// // Location services file


// export interface AddressLocation {
//   id: string;
//   uuid: string;
//   addresstype: string;
//   city: string;
//   defaultaddress: boolean;
//   landmark?: string;
//   pincode: string;
//   state: string;
//   deliveryLocation: string;
//   active: boolean;
//   created_at?: number;
//   updated_at?: number;
//   [key: string]: unknown;
// }

// export const createAddressLocation = async (orgId: string, payload: { params: Record<string, unknown> }) => {
//   const addressCollectionRef = collection(db, 'delivery-addresses');
//   const myId = uuidv4();
//   const params = payload.params;
  
//   const input = {
//     id: myId,
//     addresstype: params.addresstype as string || 'Apartment',
//     city: params.city as string || '',
//     defaultaddress: (params.defaultaddress === true || params.defaultaddress === 1 || params.defaultaddress === '1') ? true : false,
//     landmark: params.landmark as string || '',
//     pincode: params.pincode as string || '',
//     state: params.state as string || '',
//     deliveryLocation: params.deliveryLocation as string || '',
//     active: true,
//     created_at: Timestamp.now().toMillis(),
//     updated_at: Timestamp.now().toMillis(),
//   };
  
//   const docRef = await addDoc(addressCollectionRef, input);
//   return docRef.id;
// };

// export const getAllAddressLocations = async (orgId: string, params: unknown) => {
//   const addressQuery = query(collection(db, 'delivery-addresses'));
//   const querySnapshot = await getDocs(addressQuery);
//   const addresses: AddressLocation[] = querySnapshot.docs.map((docSnap) => {
//     const data = docSnap.data() as AddressLocation;
//     data.id = docSnap.id;
//     data.uuid = docSnap.id;
//     return data;
//   });
  
//   return {
//     data: addresses,
//     meta: {
//       current_page: 1,
//       from: 1,
//       last_page: 1,
//       links: [
//         { url: null, label: "« Previous", active: false },
//         { url: "https://api.example.com/api/v1/dashboard/admin/addresses/paginate?page=1", label: "1", active: true },
//         { url: null, label: "Next »", active: false }
//       ],
//       path: "https://api.example.com/api/v1/dashboard/admin/addresses/paginate",
//       per_page: "1000",
//       to: addresses.length,
//       total: addresses.length
//     }
//   };
// };

// export const getAddressLocationById = async (orgId: string, uid: string, payload?: unknown) => {
//   const docRef = doc(db, 'delivery-addresses', uid);
//   const docSnap = await getDoc(docRef);
  
//   if (docSnap.exists() && docSnap.data()) {
//     const addressData = docSnap.data() as AddressLocation;
//     addressData.id = docSnap.id;
//     addressData.uuid = docSnap.id;
//     return { data: addressData };
//   } else {
//     return { data: null };
//   }
// };

// export const updateAddressLocation = async (uid: string, params: Record<string, unknown>) => {
//   const updateData: Record<string, unknown> = {
//     addresstype: params.addresstype as string,
//     city: params.city as string,
//     defaultaddress: params.defaultaddress === true || params.defaultaddress === 1 || params.defaultaddress === '1' ? true : false,
//     landmark: params.landmark as string || '',
//     pincode: params.pincode as string,
//     state: params.state as string,
//     deliveryLocation: params.deliveryLocation as string,
//     updated_at: Timestamp.now().toMillis(),
//   };
  
//   // Only update active if it's provided
//   if (params.active !== undefined) {
//     updateData.active = params.active === true || params.active === 1 ? true : false;
//   }
  
//   await updateDoc(doc(db, 'delivery-addresses', uid), updateData);
//   return { success: true };
// };

// export const deleteAddressLocations = async (params: string[] | Record<string, string | number | boolean>) => {
//   const ids = Array.isArray(params) ? params : Object.values(params);
  
//   if (Array.isArray(ids)) {
//     await Promise.all(
//       ids.map(async (item) => {
//         await deleteDoc(doc(db, 'delivery-addresses', String(item)));
//       })
//     );
//     return true;
//   } else {
//     throw new Error('Invalid parameter format for deletion');
//   }
// };

// export const setActiveAddressLocation = async (id: string) => {
//   const addressId = id.includes('/') ? id.split('/').pop() : id;
//   const docRef = doc(db, 'delivery-addresses', addressId!);
//   const docSnap = await getDoc(docRef);
  
//   if (!docSnap.exists()) {
//     throw new Error(`Address location with ID ${addressId} not found`);
//   }
  
//   const addressData = docSnap.data() as AddressLocation;
//   const currentActive = addressData.active === true;
//   const newActive = !currentActive;
  
//   await updateDoc(docRef, {
//     active: newActive,
//     updated_at: Timestamp.now().toMillis()
//   });
  
//   return {
//     timestamp: new Date().toISOString(),
//     status: true,
//     data: {
//       id: addressId,
//       active: newActive,
//       addresstype: addressData.addresstype,
//       city: addressData.city,
//       state: addressData.state,
//       deliveryLocation: addressData.deliveryLocation,
//       created_at: addressData.created_at,
//       updated_at: Timestamp.now().toMillis(),
//     }
//   };
// };

// export const setDefaultAddress = async (id: string) => {
//   const addressId = id.includes('/') ? id.split('/').pop() : id;
  
//   // First, set all addresses to non-default
//   const addressQuery = query(collection(db, 'delivery-addresses'));
//   const querySnapshot = await getDocs(addressQuery);
  
//   const updatePromises = querySnapshot.docs.map(async (docSnap) => {
//     if (docSnap.id !== addressId) {
//       await updateDoc(docSnap.ref, {
//         defaultaddress: false,
//         updated_at: Timestamp.now().toMillis()
//       });
//     }
//   });
  
//   await Promise.all(updatePromises);
  
//   // Then set the selected address as default
//   const docRef = doc(db, 'delivery-addresses', addressId!);
//   await updateDoc(docRef, {
//     defaultaddress: true,
//     updated_at: Timestamp.now().toMillis()
//   });
  
//   return {
//     timestamp: new Date().toISOString(),
//     status: true,
//     data: {
//       id: addressId,
//       defaultaddress: true,
//       updated_at: Timestamp.now().toMillis(),
//     }
//   };
// };



// // ----------------------------------------------------------------------------------------------------

// // Order realtime notification services file

// import { addNotificationOnce } from "./firestoreNotifications";
// import { handleOrderStatusChange } from "./q_orders";

// type OrderDoc = {
//   id: string;
//   order_status?: string;
//   created_at?: string;
//   updated_at?: string;
// };

// export function subscribeToOrderEvents(
//   onNew: (order: OrderDoc) => void,
//   onCancelled: (order: OrderDoc) => void
// ): () => void {
//   const ordersCol = collection(db, "p_orders");
//   const lastStatusById = new Map<string, string | undefined>();
//   let initialLoaded = false;

//   const unsubscribe = onSnapshot(ordersCol, (snap) => {
//     if (!initialLoaded) {
//       // Seed previous statuses to avoid spamming on initial load
//       snap.docs.forEach((docSnap) => {
//         const data = docSnap.data() as any;
//         lastStatusById.set(docSnap.id, data?.order_status);
//       });
//       initialLoaded = true;
//       return;
//     }

//     snap.docChanges().forEach(async (change) => {
//       const data = change.doc.data() as any;
//       const order: OrderDoc = { id: change.doc.id, order_status: data?.order_status, created_at: data?.created_at, updated_at: data?.updated_at };

//       if (change.type === "added") {
//         console.log("[OrdersRT] New order added:", order.id);
//         onNew(order);
//         void addNotificationOnce({
//           title: "New order placed",
//           body: `Order ${order.id} created`,
//           type: "order_created",
//           source: "orders_listener",
//           orderId: order.id,
//         });
//         lastStatusById.set(order.id, order.order_status);
//       } else if (change.type === "modified") {
//         const prev = lastStatusById.get(order.id);
//         const curr = order.order_status;
        
//         if (prev !== curr) {
//           // Handle status change to cancelled with automatic stock restoration
//           if (curr?.toLowerCase() === "cancelled" && prev?.toLowerCase() !== "cancelled") {
//             console.log("[OrdersRT] Order cancelled:", order.id);
//             onCancelled(order);
            
//             // Trigger automatic stock restoration
//             try {
//               await handleOrderStatusChange(order.id, prev || '', curr);
//               console.log(`[OrdersRT] Stock restoration completed for order ${order.id}`);
//             } catch (error) {
//               console.error(`[OrdersRT] Failed to restore stock for order ${order.id}:`, error);
//             }
            
//             void addNotificationOnce({
//               title: "Order cancelled",
//               body: `Order ${order.id} has been cancelled and inventory restored`,
//               type: "order_cancelled",
//               source: "orders_listener",
//               orderId: order.id,
//             });
//           }
          
//           lastStatusById.set(order.id, curr);
//         }
//       } else if (change.type === "removed") {
//         lastStatusById.delete(order.id);
//       }
//     });
//   }, (error) => {
//     console.error("[OrdersRT] onSnapshot error", error);
//   });

//   return unsubscribe;
// }








// // ----------------------------------------------------------------------------------------------------



// // q_brand.ts file


// export interface Brand {
//   id: string;
//   uuid: string;
//   title: string;
//   active: boolean;
//   img?: string;
//   products_count?: number;
//   created_at?: number;
//   updated_at?: number;
//   [key: string]: unknown;
// }

// export const createBrandDb = async (orgId: string, payload: { params: Record<string, unknown> }) => {
//   const { params } = payload;
//   const did = uuidv4();
//   const brandData = {
//     id: did,
//     uuid: did,
//     title: params.title as string || "",
//     active: params.active === undefined ? true : Boolean(params.active),
//     img: params.img as string || "",
//     created_at: Timestamp.now().toMillis(),
//     updated_at: Timestamp.now().toMillis(),
//   };
//   try {
//     await addDoc(collection(db, `P_brands`), brandData);
//     return {
//       success: true,
//       id: did,
//       ...brandData,
//       _timestamp: new Date().getTime()
//     };
//   } catch (error) {
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : String(error)
//     };
//   }
// };

// export const getAllBrands = async (orgId: string, params: { params?: { status?: string } }) => {
//   const filesQuery = query(collection(db, `P_brands`));
//   const querySnapshot = await getDocs(filesQuery);
//   const files: Brand[] = querySnapshot.docs.map((docSnap) => {
//     const x = docSnap.data() as Brand;
//     x.id = docSnap.id;
//     x.uuid = docSnap.id;
//     return x;
//   });
//   return {
//     data: files,
//     meta: {
//       current_page: 1,
//       from: 1,
//       last_page: 1,
//       links: [
//         { url: null, label: "« Previous", active: false },
//         { url: "https://single-api.foodyman.org/api/v1/dashboard/admin/brands/paginate?page=1", label: "1", active: true },
//         { url: null, label: "Next »", active: false }
//       ],
//       path: "https://single-api.foodyman.org/api/v1/dashboard/admin/brands/paginate",
//       per_page: "1000",
//       to: files.length,
//       total: files.length
//     }
//   };
// };

// export const getAllBrandsById = async (orgId: string, uid: string, payload?: unknown) => {
//   const docRef = doc(db, `P_brands`, uid);
//   const docSnap = await getDoc(docRef);
//   if (docSnap.exists() && docSnap.data()) {
//     const x = docSnap.data() as Brand;
//     x.id = docSnap.id;
//     x.uuid = docSnap.id;
//     x.img = (x as unknown)['images[0]'] || x.img;
//     return { data: x };
//   } else {
//     return { data: null };
//   }
// };

// export const updateBrand = async (uid: string, params: Record<string, unknown>) => {
//   await updateDoc(doc(db, `P_brands`, uid), params);
//   return { success: true };
// };

// export const deleteBrand = async (params: string[] | Record<string, string | number | boolean>) => {
//   const ids = Array.isArray(params) ? params : Object.values(params);
//   if (Array.isArray(ids)) {
//     await Promise.all(
//       ids.map(async (item) => {
//         await deleteDoc(doc(db, 'P_brands', String(item)));
//       })
//     );
//     return true;
//   } else {
//     throw new Error('Invalid parameter format for deletion');
//   }
// };

// export const setActiveBrand = async (id: string) => {
//   const brandId = id.includes('/') ? id.split('/').pop() : id;
//   const docRef = doc(db, `P_brands`, brandId!);
//   const docSnap = await getDoc(docRef);
//   if (!docSnap.exists()) {
//     throw new Error(`Brand with ID ${brandId} not found`);
//   }
//   const brandData = docSnap.data() as Brand;
//   const currentActive = brandData.active === true;
//   const newActive = !currentActive;
//   await updateDoc(docRef, {
//     active: newActive,
//     updated_at: Timestamp.now().toMillis()
//   });
//   return {
//     timestamp: new Date().toISOString(),
//     status: true,
//     data: {
//       id: brandId,
//       uuid: brandId,
//       active: newActive,
//       created_at: brandData.created_at || Timestamp.now().toMillis(),
//       updated_at: Timestamp.now().toMillis(),
//       title: brandData.title,
//     }
//   };
// };

// export const searchByBrand = async (searchTerm: string) => {
//   const brandsQuery = query(
//     collection(db, 'P_brands'),
//     where('title', '>=', searchTerm),
//     where('title', '<=', searchTerm + '\uf8ff')
//   );
//   const querySnapshot = await getDocs(brandsQuery);
//   const brands: Brand[] = querySnapshot.docs.map((docSnap) => {
//     const data = docSnap.data() as Brand;
//     return {
//       id: docSnap.id,
//       uuid: docSnap.id,
//       title: data.title,
//       active: data.active,
//       img: data.img,
//       products_count: data.products_count,
//       created_at: data.created_at,
//       updated_at: data.updated_at,
//     };
//   });
//   return {
//     data: brands,
//     meta: {
//       current_page: 1,
//       from: 1,
//       last_page: 1,
//       links: [
//         { url: null, label: '« Previous', active: false },
//         {
//           url: `https://api.hellostores.in/api/v1/dashboard/admin/brands/search?search=${searchTerm}`,
//           label: '1',
//           active: true,
//         },
//         { url: null, label: 'Next »', active: false },
//       ],
//       path: `https://api.hellostores.in/api/v1/dashboard/admin/brands/search`,
//       per_page: '10',
//       to: brands.length,
//       total: brands.length,
//     },
//   };
// }; 






// // ----------------------------------------------------------------------------------------------------



// // q_catogries.ts file



// // Define translation type
// interface CategoryTranslation {
//   id: string;
//   locale: string;
//   title: string;
//   description: string;
// }

// // Define the params type
// interface CategoryQueryParams {
//   params?: {
//     status?: string;
//     lang?: string;
//     [key: string]: unknown;
//   };
// }

// // Create category with multilingual support
// export const createCategoriesDb = async (orgId: string, payload: { params: Record<string, unknown> }) => {
//   const { params } = payload;
//   const did = uuidv4();
//   const supportedLanguages = ['en', 'fr', 'th'];
//   const translations: CategoryTranslation[] = [];
//   const locales: string[] = [];
//   let primaryTitle = '';
//   let primaryDescription = '';
//   supportedLanguages.forEach(lang => {
//     let title: string | null = null;
//     if (typeof params[`title[${lang}]`] === 'string') {
//       title = params[`title[${lang}]`] as string;
//     } else if (typeof (params.title as Record<string, string> | undefined)?.[lang] === 'string') {
//       title = (params.title as Record<string, string>)[lang];
//     } else if (lang === 'en' && typeof params.title === 'string') {
//       title = params.title as string;
//     }
//     let description: string | null = null;
//     if (typeof params[`description[${lang}]`] === 'string') {
//       description = params[`description[${lang}]`] as string;
//     } else if (typeof (params.description as Record<string, string> | undefined)?.[lang] === 'string') {
//       description = (params.description as Record<string, string>)[lang];
//     } else if (lang === 'en' && typeof params.description === 'string') {
//       description = params.description as string;
//     }
//     if (title) {
//       translations.push({
//         id: did,
//         locale: lang,
//         title: title,
//         description: description || ""
//       });
//       locales.push(lang);
//       if ((!primaryTitle || lang === 'en') && title) {
//         primaryTitle = title;
//         primaryDescription = description || "";
//       }
//     }
//   });
//   if (translations.length === 0) {
//     translations.push({
//       id: did,
//       locale: 'en',
//       title: "",
//       description: ""
//     });
//     locales.push('en');
//     primaryTitle = "";
//     primaryDescription = "";
//   }
//   const imageUrl = (params['images[0]'] as string) || (Array.isArray(params.images) && (params.images as string[])[0]) || "https://cdnimg.webstaurantstore.com/uploads/design/2023/5/Homepage-Categories/category-refrigeration.png";
//   const isActive = params.active === undefined ? false : Boolean(params.active);
//   const categoryData = {
//     id: did,
//     uuid: did,
//     keywords: params?.keywords || "",
//     type: params?.type || "main",
//     input: 32767,
//     img: imageUrl,
//     active: isActive,
//     status: params?.status || "published",
//     created_at: Timestamp.now().toMillis(),
//     updated_at: Timestamp.now().toMillis(),
//     shop: null,
//     children: [],
//     parent: null,
//     title: primaryTitle,
//     description: primaryDescription,
//     translation: translations[0],
//     translations: translations,
//     locales: locales
//   };
//   try {
//     await setDoc(doc(db, `p_category`, did), categoryData);
//     return {
//       success: true,
//       id: did,
//       ...categoryData,
//       _timestamp: new Date().getTime()
//     };
//   } catch (error) {
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : String(error)
//     };
//   }
// };

// // Update category with multilingual support
// export const updateCategory = async (uid: string, params: Record<string, unknown>) => {
//   const docRef = doc(db, `p_category`, uid);
//   const docSnap = await getDoc(docRef);
//   if (!docSnap.exists()) {
//     throw new Error(`Category with ID ${uid} not found`);
//   }
//   const existingData = docSnap.data();
//   const updateData = { ...existingData };
//   const supportedLanguages = ['en', 'fr', 'th'];
//   const translations: CategoryTranslation[] = [...(updateData.translations || [])];
//   const locales: string[] = [...(updateData.locales || [])];
//   let primaryTitle = updateData.title;
//   let primaryDescription = updateData.description;
//   const primaryLocale = updateData.translation?.locale || 'en';
//   supportedLanguages.forEach(lang => {
//     let hasUpdate = false;
//     let title: string | null = null;
//     let description: string | null = null;
//     if (typeof params[`title[${lang}]`] === 'string') {
//       title = params[`title[${lang}]`] as string;
//       hasUpdate = true;
//     } else if (typeof (params.title as Record<string, string> | undefined)?.[lang] === 'string') {
//       title = (params.title as Record<string, string>)[lang];
//       hasUpdate = true;
//     } else if (lang === 'en' && typeof params.title === 'string' && params.title !== undefined) {
//       title = params.title as string;
//       hasUpdate = true;
//     }
//     if (typeof params[`description[${lang}]`] === 'string') {
//       description = params[`description[${lang}]`] as string;
//       hasUpdate = true;
//     } else if (typeof (params.description as Record<string, string> | undefined)?.[lang] === 'string') {
//       description = (params.description as Record<string, string>)[lang];
//       hasUpdate = true;
//     } else if (lang === 'en' && typeof params.description === 'string' && params.description !== undefined) {
//       description = params.description as string;
//       hasUpdate = true;
//     }
//     if (hasUpdate) {
//       const langTranslationIndex = translations.findIndex((t) => t.locale === lang);
//       if (langTranslationIndex >= 0) {
//         const updatedTranslation = { ...translations[langTranslationIndex] };
//         if (title !== null) updatedTranslation.title = title;
//         if (description !== null) updatedTranslation.description = description || updatedTranslation.description;
//         translations[langTranslationIndex] = updatedTranslation;
//       } else {
//         translations.push({
//           id: uid,
//           locale: lang,
//           title: title || "",
//           description: description || ""
//         });
//         if (!locales.includes(lang)) {
//           locales.push(lang);
//         }
//       }
//       if (lang === primaryLocale || (lang === 'en' && !primaryLocale)) {
//         if (title !== null) primaryTitle = title;
//         if (description !== null) primaryDescription = description;
//       }
//     }
//   });
//   if (Array.isArray(params.images) && (params.images as string[])[0]) updateData.img = (params.images as string[])[0];
//   if (typeof params['images[0]'] === 'string') updateData.img = params['images[0]'] as string;
//   if (params.active !== undefined) updateData.active = params.active;
//   if (params.keywords !== undefined) updateData.keywords = params.keywords;
//   if (params.type !== undefined) updateData.type = params.type;
//   if (params.status !== undefined) updateData.status = params.status;
//   updateData.updated_at = Timestamp.now().toMillis();
//   updateData.translations = translations;
//   updateData.locales = locales;
//   updateData.title = primaryTitle;
//   updateData.description = primaryDescription;
//   const primaryTranslation = translations.find((t) => t.locale === primaryLocale) || translations[0];
//   updateData.translation = primaryTranslation;
//   await setDoc(doc(db, `p_category`, uid), updateData, { merge: true });
//   return { success: true, id: uid, data: updateData };
// };

// // Get all categories with multilingual display
// export const getAllCategories = async (orgId = '', params: CategoryQueryParams = {}) => {
//   const filesQuery = query(
//     collection(db, `p_category`),
//     // where('status', '==', params?.params?.status || 'published'),
//   );
//   const querySnapshot = await getDocs(filesQuery);
//   const files = querySnapshot.docs.map((docSnap) => {
//     const x = docSnap.data();
//     x.id = docSnap.id;
//     x.uuid = docSnap.id;
//     if (!x.title && x.translations && x.translations.length > 0) {
//       const preferredLang = params?.params?.lang || 'en';
//       const preferredTranslation = x.translations.find((t: CategoryTranslation) => t.locale === preferredLang);
//       if (preferredTranslation) {
//         x.title = preferredTranslation.title;
//       } else {
//         x.title = x.translations[0].title;
//       }
//     }
//     return x;
//   });
//   return {
    
//     data: files,
//     meta: {
//       current_page: 1,
//       from: 1,
//       last_page: 1,
//       links: [
//         { url: null, label: "« Previous", active: false },
//         { url: "https://single-api.foodyman.org/api/v1/dashboard/admin/brands/paginate?page=1", label: "1", active: true },
//         { url: null, label: "Next »", active: false }
//       ],
//       path: "https://single-api.foodyman.org/api/v1/dashboard/admin/brands/paginate",
//       per_page: "1000",
//       to: files.length,
//       total: files.length
      
//     }
    
//   };
// };


// // Get category by ID with multilingual display
// export const getAllCategoriesById = async (orgId = '', uid: string, payload: CategoryQueryParams = {}) => {
//   const docRef = doc(db, `p_category`, uid);
//   const docSnap = await getDoc(docRef);
//   if (docSnap.exists() && docSnap.data()) {
//     const x = docSnap.data();
//     x.id = docSnap.id;
//     x.uuid = docSnap.id;
//     x.img = x['images[0]'] || x.img;
//     if (!x.title && x.translations && x.translations.length > 0) {
//       const preferredLang = payload?.params?.lang || 'en';
//       const preferredTranslation = x.translations.find((t: CategoryTranslation) => t.locale === preferredLang);
//       if (preferredTranslation) {
//         x.title = preferredTranslation.title;
//       } else {
//         x.title = x.translations[0].title;
//       }
//     }
//     return { data: x };
//   } else {
//     return { data: null };
//   }
// };

// // Delete categories by IDs
// export const deleteCategory = async (params: Record<string, string | number | boolean>) => {
//   const ids = Object.values(params);
//   if (Array.isArray(ids)) {
//     await Promise.all(
//       ids.map(async (item) => {
//         await deleteDoc(doc(db, 'p_category', String(item)));
//       })
//     );
//     return true;
//   } else {
//     throw new Error('Invalid parameter format for deletion');
//   }
// };

// // Toggle active status for a category
// export const setActiveCategory = async (id: string) => {
//   const categoryId = id.includes('/') ? id.split('/').pop() : id;
//   const docRef = doc(db, `p_category`, categoryId!);
//   const docSnap = await getDoc(docRef);
//   if (!docSnap.exists()) {
//     throw new Error(`Category with ID ${categoryId} not found`);
//   }
//   const categoryData = docSnap.data();
//   const currentActive = categoryData.active === true;
//   const newActive = !currentActive;
//   await updateDoc(docRef, {
//     active: newActive,
//     updated_at: Timestamp.now().toMillis()
//   });
//   const title = categoryData.title || (categoryData.translations && categoryData.translations.length > 0 ? categoryData.translations[0].title : "");
//   const response = {
//     timestamp: new Date().toISOString(),
//     status: true,
//     data: {
//       id: categoryId,
//       uuid: categoryId,
//       active: newActive,
//       created_at: categoryData.created_at || Timestamp.now().toMillis(),
//       updated_at: Timestamp.now().toMillis(),
//       title: title,
//       translation: {
//         id: categoryId,
//         locale: "en",
//         title: title
//       },
//       locales: categoryData.locales || ["en"]
//     }
//   };
//   return response;
// }; 





// // ----------------------------------------------------------------------------------------------------


// // q_delivery.ts file



// // Define the warehouse type
// export interface Warehouse {
//   id: string;
//   orgId?: string;
//   name: string;
//   contactPerson: string;
//   mobileNumber: string;
//   address: string;
//   area?: string;
//   pinCode: string;
//   city: string;
//   state: string;
//   gstNumber?: string;
//   created_at: number;
//   updated_at: number;
// }

// // Create a new warehouse
// export const createWarehouse = async (orgId: string, params: Omit<Warehouse, 'id' | 'created_at' | 'updated_at' | 'orgId'>) => {
//   const id = uuidv4();
//   const warehouse: Warehouse = {
//     id,
//     orgId,
//     ...params,
//     created_at: Timestamp.now().toMillis(),
//     updated_at: Timestamp.now().toMillis(),
//   };
//   try {
//     await setDoc(doc(db, 'p_warehouse', id), warehouse);
//     return { success: true, id, ...warehouse };
//   } catch (error) {
//     return { success: false, error: error instanceof Error ? error.message : String(error) };
//   }
// };

// // Update an existing warehouse
// export const updateWarehouse = async (id: string, params: Partial<Omit<Warehouse, 'id' | 'orgId' | 'created_at'>>) => {
//   const docRef = doc(db, 'p_warehouse', id);
//   const docSnap = await getDoc(docRef);
//   if (!docSnap.exists()) {
//     throw new Error(`Warehouse with ID ${id} not found`);
//   }
//   const updateData = {
//     ...params,
//     updated_at: Timestamp.now().toMillis(),
//   };
//   await updateDoc(docRef, updateData);
//   return { success: true, id };
// };

// // Get all warehouses for an org
// export const getAllWarehouses = async (orgId: string) => {
//   const warehousesQuery = collection(db, 'p_warehouse');
//   const querySnapshot = await getDocs(warehousesQuery);
//   const warehouses: Warehouse[] = querySnapshot.docs
//     .map((docSnap) => docSnap.data() as Warehouse)
//     .filter((w) => w.orgId === orgId);
//   return { data: warehouses };
// };

// // Get warehouse by ID
// export const getWarehouseById = async (id: string) => {
//   const docRef = doc(db, 'p_warehouse', id);
//   const docSnap = await getDoc(docRef);
//   if (docSnap.exists()) {
//     return { data: docSnap.data() as Warehouse };
//   } else {
//     return { data: null };
//   }
// };

// // Delete warehouse
// export const deleteWarehouse = async (id: string) => {
//   try {
//     await deleteDoc(doc(db, 'p_warehouse', id));
//     return { success: true };
//   } catch (error) {
//     return { success: false, error: error instanceof Error ? error.message : String(error) };
//   }
// }; 







// // ----------------------------------------------------------------------------------------------------


// // q_extra_groups.ts file


// // Define translation type
// interface ExtraGroupTranslation {
//   id: string;
//   locale: string;
//   title: string;
// }

// interface ExtraGroupQueryParams {
//   params?: {
//     status?: string;
//     lang?: string;
//     [key: string]: unknown;
//   };
// }

// export interface ExtraGroup {
//   id: string;
//   uuid: string;
//   type: string;
//   active: boolean;
//   created_at: number;
//   updated_at: number;
//   shop: unknown;
//   title: string;
//   translation: {
//     id: string;
//     locale: string;
//     title: string;
//   };
//   translations: Array<{
//     id: string;
//     locale: string;
//     title: string;
//   }>;
//   locales: string[];
// }

// export const createExtraGroupsDb = async (orgId: string, payload: { params: Record<string, unknown> }) => {
//   const { params } = payload;
//   const did = uuidv4();
//   const supportedLanguages = ['en', 'fr', 'th'];
//   const translations: ExtraGroupTranslation[] = [];
//   const locales: string[] = [];
//   let primaryTitle = '';
//   supportedLanguages.forEach(lang => {
//     let title: string | null = null;
//     if (typeof params[`title[${lang}]`] === 'string') {
//       title = params[`title[${lang}]`] as string;
//     } else if (typeof (params.title as Record<string, string> | undefined)?.[lang] === 'string') {
//       title = (params.title as Record<string, string>)[lang];
//     } else if (lang === 'en' && typeof params.title === 'string') {
//       title = params.title as string;
//     }
//     if (title) {
//       translations.push({
//         id: did,
//         locale: lang,
//         title: title
//       });
//       locales.push(lang);
//       if ((!primaryTitle || lang === 'en') && title) {
//         primaryTitle = title;
//       }
//     }
//   });
//   if (translations.length === 0) {
//     translations.push({
//       id: did,
//       locale: 'en',
//       title: ""
//     });
//     locales.push('en');
//     primaryTitle = "";
//   }
//   const isActive = params.active === undefined ? true : Boolean(params.active);
//   const groupData = {
//     id: did,
//     uuid: did,
//     type: params?.type || 'text',
//     active: isActive,
//     created_at: Timestamp.now().toMillis(),
//     updated_at: Timestamp.now().toMillis(),
//     shop: null,
//     title: primaryTitle,
//     translation: translations[0],
//     translations: translations,
//     locales: locales
//   };
//   try {
//     await setDoc(doc(db, 'T_extra_groups', did), groupData);
//     return {
//       success: true,
//       id: did,
//       ...groupData,
//       _timestamp: new Date().getTime()
//     };
//   } catch (error) {
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : String(error)
//     };
//   }
// };

// export const updateExtraGroup = async (uid: string, params: Record<string, unknown>) => {
//   const docRef = doc(db, 'T_extra_groups', uid);
//   const docSnap = await getDoc(docRef);
//   if (!docSnap.exists()) {
//     throw new Error(`Extra group with ID ${uid} not found`);
//   }
//   const existingData = docSnap.data();
//   const updateData = { ...existingData };
//   const supportedLanguages = ['en', 'fr', 'th'];
//   const translations: ExtraGroupTranslation[] = [...(updateData.translations || [])];
//   const locales: string[] = [...(updateData.locales || [])];
//   let primaryTitle = updateData.title;
//   const primaryLocale = updateData.translation?.locale || 'en';
//   supportedLanguages.forEach(lang => {
//     let hasUpdate = false;
//     let title: string | null = null;
//     if (typeof params[`title[${lang}]`] === 'string') {
//       title = params[`title[${lang}]`] as string;
//       hasUpdate = true;
//     } else if (typeof (params.title as Record<string, string> | undefined)?.[lang] === 'string') {
//       title = (params.title as Record<string, string>)[lang];
//       hasUpdate = true;
//     } else if (lang === 'en' && typeof params.title === 'string' && params.title !== undefined) {
//       title = params.title as string;
//       hasUpdate = true;
//     }
//     if (hasUpdate) {
//       const langTranslationIndex = translations.findIndex((t) => t.locale === lang);
//       if (langTranslationIndex >= 0) {
//         const updatedTranslation = { ...translations[langTranslationIndex] };
//         if (title !== null) updatedTranslation.title = title;
//         translations[langTranslationIndex] = updatedTranslation;
//       } else {
//         translations.push({
//           id: uid,
//           locale: lang,
//           title: title || ""
//         });
//         if (!locales.includes(lang)) {
//           locales.push(lang);
//         }
//       }
//       if (lang === primaryLocale || (lang === 'en' && !primaryLocale)) {
//         if (title !== null) primaryTitle = title;
//       }
//     }
//   });
//   if (params.active !== undefined) updateData.active = params.active;
//   if (params.type !== undefined) updateData.type = params.type;
//   updateData.updated_at = Timestamp.now().toMillis();
//   updateData.translations = translations;
//   updateData.locales = locales;
//   updateData.title = primaryTitle;
//   const primaryTranslation = translations.find((t) => t.locale === primaryLocale) || translations[0];
//   updateData.translation = primaryTranslation;
//   await setDoc(doc(db, 'T_extra_groups', uid), updateData, { merge: true });
//   return { success: true, id: uid, data: updateData };
// };

// export const getAllExtraGroups = async (orgId = '', params: ExtraGroupQueryParams = {}) => {
//   const filesQuery = query(
//     collection(db, 'T_extra_groups'),
//     // where('status', '==', params?.params?.status || 'published'),
//   );
//   const querySnapshot = await getDocs(filesQuery);
//   const files = querySnapshot.docs.map((docSnap) => {
//     const x = docSnap.data();
//     x.id = docSnap.id;
//     x.uuid = docSnap.id;
//     if (!x.title && x.translations && x.translations.length > 0) {
//       const preferredLang = params?.params?.lang || 'en';
//       const preferredTranslation = x.translations.find((t: ExtraGroupTranslation) => t.locale === preferredLang);
//       if (preferredTranslation) {
//         x.title = preferredTranslation.title;
//       } else {
//         x.title = x.translations[0].title;
//       }
//     }
//     return x;
//   });
//   return {
//     data: files,
//     meta: {
//       current_page: 1,
//       from: 1,
//       last_page: 1,
//       links: [
//         { url: null, label: "« Previous", active: false },
//         { url: "https://single-api.foodyman.org/api/v1/dashboard/admin/T_extra_groups/paginate?page=1", label: "1", active: true },
//         { url: null, label: "Next »", active: false }
//       ],
//       path: "https://single-api.foodyman.org/api/v1/dashboard/admin/T_extra_groups/paginate",
//       per_page: "1000",
//       to: files.length,
//       total: files.length
//     }
//   };
// };

// export const getAllExtraGroupsById = async (orgId = '', uid: string, payload: ExtraGroupQueryParams = {}) => {
//   const docRef = doc(db, 'T_extra_groups', uid);
//   const docSnap = await getDoc(docRef);
//   if (docSnap.exists() && docSnap.data()) {
//     const x = docSnap.data();
//     x.id = docSnap.id;
//     x.uuid = docSnap.id;
//     if (!x.title && x.translations && x.translations.length > 0) {
//       const preferredLang = payload?.params?.lang || 'en';
//       const preferredTranslation = x.translations.find((t: ExtraGroupTranslation) => t.locale === preferredLang);
//       if (preferredTranslation) {
//         x.title = preferredTranslation.title;
//       } else {
//         x.title = x.translations[0].title;
//       }
//     }
//     return { data: x };
//   } else {
//     return { data: null };
//   }
// };

// export const deleteExtraGroup = async (params: Record<string, string | number | boolean>) => {
//   const ids = Object.values(params);
//   if (Array.isArray(ids)) {
//     try {
//       await Promise.all(
//         ids.map(async (item) => {
//           await deleteDoc(doc(db, 'T_extra_groups', String(item)));
//         })
//       );
//       return { success: true };
//     } catch (error) {
//       return { success: false, error };
//     }
//   } else {
//     return { success: false, error: 'Invalid params' };
//   }
// }; 






// // ----------------------------------------------------------------------------------------------------


// // q_extra_values.ts file



// export interface ExtraValue {
//   id: string;
//   uuid: string;
//   extra_group_id: string;
//   value: string;
//   active: boolean;
//   group?: unknown;
//   created_at: number;
//   updated_at: number;
// }

// interface ExtraValueQueryParams {
//   params?: {
//     status?: string;
//     [key: string]: unknown;
//   };
// }

// export const createExtraValuesDb = async (orgId: string, payload: { params: Record<string, unknown> }) => {
//   const { params } = payload;
//   const did = uuidv4();
//   const isActive = params.active === undefined ? true : Boolean(params.active);
//   const extra_group_id = params.extra_group_id as string;
//   const value = params.value as string;
//   const extraValueData: ExtraValue = {
//     id: did,
//     uuid: did,
//     extra_group_id,
//     value,
//     active: isActive,
//     created_at: Timestamp.now().toMillis(),
//     updated_at: Timestamp.now().toMillis(),
//   };
//   try {
//     await setDoc(doc(db, 'T_extra_values', did), extraValueData);
//     return {
//       success: true,
//       id: did,
//       ...extraValueData,
//       _timestamp: new Date().getTime()
//     };
//   } catch (error) {
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : String(error)
//     };
//   }
// };

// export const updateExtraValue = async (uid: string, params: Record<string, unknown>) => {
//   const docRef = doc(db, 'T_extra_values', uid);
//   const docSnap = await getDoc(docRef);
//   if (!docSnap.exists()) {
//     throw new Error(`Extra value with ID ${uid} not found`);
//   }
//   const existingData = docSnap.data();
//   const updateData = { ...existingData };
//   if (params.value !== undefined) updateData.value = params.value;
//   if (params.active !== undefined) updateData.active = params.active;
//   if (params.extra_group_id !== undefined) updateData.extra_group_id = params.extra_group_id;
//   updateData.updated_at = Timestamp.now().toMillis();
//   await setDoc(doc(db, 'T_extra_values', uid), updateData, { merge: true });
//   return { success: true, id: uid, data: updateData };
// };

// export const getAllExtraValues = async (orgId = '', params: ExtraValueQueryParams = {}) => {
//   const filesQuery = query(
//     collection(db, 'T_extra_values'),
//     // where('status', '==', params?.params?.status || 'published'),
//   );
//   const querySnapshot = await getDocs(filesQuery);
//   const files = querySnapshot.docs.map((docSnap) => {
//     const x = docSnap.data();
//     x.id = docSnap.id;
//     x.uuid = docSnap.id;
//     return x;
//   });
//   return {
//     data: files,
//     meta: {
//       current_page: 1,
//       from: 1,
//       last_page: 1,
//       links: [
//         { url: null, label: "« Previous", active: false },
//         { url: "https://single-api.foodyman.org/api/v1/dashboard/admin/T_extra_values/paginate?page=1", label: "1", active: true },
//         { url: null, label: "Next »", active: false }
//       ],
//       path: "https://single-api.foodyman.org/api/v1/dashboard/admin/T_extra_values/paginate",
//       per_page: "1000",
//       to: files.length,
//       total: files.length
//     }
//   };
// };

// export const getAllExtraValuesById = async (orgId = '', uid: string, payload: ExtraValueQueryParams = {}) => {
//   const docRef = doc(db, 'T_extra_values', uid);
//   const docSnap = await getDoc(docRef);
//   if (docSnap.exists() && docSnap.data()) {
//     const x = docSnap.data();
//     x.id = docSnap.id;
//     x.uuid = docSnap.id;
//     return { data: x };
//   } else {
//     return { data: null };
//   }
// };

// export const deleteExtraValue = async (params: Record<string, string | number | boolean>) => {
//   const ids = Object.values(params);
//   if (Array.isArray(ids)) {
//     try {
//       await Promise.all(
//         ids.map(async (item) => {
//           await deleteDoc(doc(db, 'T_extra_values', String(item)));
//         })
//       );
//       return { success: true };
//     } catch (error) {
//       return { success: false, error };
//     }
//   } else {
//     return { success: false, error: 'Invalid params' };
//   }
// }; 




// // ----------------------------------------------------------------------------------------------------



// // q_facebook_catalogue.ts file


// const FACEBOOK_CATALOG_COLLECTION = 'p_facebook_catalog';
// const FACEBOOK_CONFIG_DOC_ID = 'config';

// export interface FacebookCatalogConfig {
//   accessToken: string;
//   updated_at: string;
// }

// export interface FacebookCatalogEntry {
//   docId: string;
//   catalogId: string;
//   createdAt: string;
//   numberOfProducts: number;
//   updated_at: string;
//   name?: string;
// }

// export interface FacebookCatalogSubscriptionPayload {
//   accessToken: string;
//   catalogs: FacebookCatalogEntry[];
//   updated_at: string;
// }

// /**
//  * Get stored Facebook Developer API key (access token)
//  */
// export const getFacebookAccessToken = async (): Promise<FacebookCatalogConfig | null> => {
//   try {
//     const configRef = doc(db, FACEBOOK_CATALOG_COLLECTION, FACEBOOK_CONFIG_DOC_ID);
//     const configSnap = await getDoc(configRef);

//     if (!configSnap.exists()) {
//       return null;
//     }

//     const data = configSnap.data();
//     return {
//       accessToken: data.accessToken || '',
//       updated_at: data.updated_at || new Date().toISOString(),
//     };
//   } catch (error) {
//     console.error('Error fetching Facebook access token:', error);
//     throw new Error('Failed to get Facebook Developer API key');
//   }
// };

// /**
//  * Save Facebook Developer API key (access token)
//  */
// export const saveFacebookAccessToken = async (accessToken: string): Promise<void> => {
//   try {
//     const configRef = doc(db, FACEBOOK_CATALOG_COLLECTION, FACEBOOK_CONFIG_DOC_ID);
//     await setDoc(configRef, {
//       accessToken,
//       updated_at: new Date().toISOString(),
//     }, { merge: true });
//   } catch (error) {
//     console.error('Error saving Facebook access token:', error);
//     throw new Error('Failed to save Facebook Developer API key');
//   }
// };

// /**
//  * Get all saved Facebook Catalog entries
//  * Catalogs are stored in the config document under a 'catalogs' map field
//  */
// export const getFacebookCatalogs = async (): Promise<FacebookCatalogEntry[]> => {
//   try {
//     const configRef = doc(db, FACEBOOK_CATALOG_COLLECTION, FACEBOOK_CONFIG_DOC_ID);
//     const configSnap = await getDoc(configRef);

//     if (!configSnap.exists()) {
//       return [];
//     }

//     const data = configSnap.data();
//     const catalogs = data.catalogs || {};

//     // Convert the catalogs map to an array of FacebookCatalogEntry
//     return Object.entries(catalogs).map(([catalogId, catalogData]) => {
//       const catalog = catalogData as {
//         createdAt?: string;
//         numberOfProducts?: number;
//         updated_at?: string;
//         name?: string;
//       } | undefined;
//       return {
//         docId: catalogId, // Use catalogId as docId since they're stored in a map
//         catalogId: catalogId,
//         createdAt: catalog?.createdAt || '',
//         numberOfProducts: catalog?.numberOfProducts || 0,
//         updated_at: catalog?.updated_at || data.updated_at || new Date().toISOString(),
//         name: catalog?.name,
//       };
//     });
//   } catch (error) {
//     console.error('Error fetching Facebook Catalogs:', error);
//     throw new Error('Failed to get Facebook Catalogs');
//   }
// };

// /**
//  * Save or update a Facebook Catalog entry
//  * Catalogs are stored in the config document under a 'catalogs' map field
//  */
// export const saveFacebookCatalog = async (entry: {
//   catalogId: string;
//   createdAt: string;
//   numberOfProducts: number;
//   name?: string;
//   docId?: string;
//   previousCatalogId?: string | null;
// }): Promise<void> => {
//   try {
//     const configRef = doc(db, FACEBOOK_CATALOG_COLLECTION, FACEBOOK_CONFIG_DOC_ID);
//     const configSnap = await getDoc(configRef);
//     const now = new Date().toISOString();

//     // Get existing data
//     let existingData: { 
//       accessToken?: string; 
//       catalogs?: Record<string, { createdAt?: string; numberOfProducts?: number; updated_at?: string; name?: string }>; 
//       updated_at?: string 
//     } = {};
//     if (configSnap.exists()) {
//       existingData = configSnap.data() as typeof existingData;
//     }

//     // Get existing catalogs or create new object
//     const catalogs = existingData.catalogs || {};

//     // If catalog ID changed, remove the old entry
//     if (entry.previousCatalogId && entry.previousCatalogId !== entry.catalogId) {
//       delete catalogs[entry.previousCatalogId];
//     }

//     // Update or add the catalog
//     catalogs[entry.catalogId] = {
//       createdAt: entry.createdAt,
//       numberOfProducts: entry.numberOfProducts,
//       updated_at: now,
//       ...(entry.name ? { name: entry.name } : {}),
//     };

//     // Save the updated catalogs map
//     await setDoc(
//       configRef,
//       {
//         ...existingData,
//         catalogs,
//         updated_at: now,
//       },
//       { merge: true }
//     );
//   } catch (error) {
//     console.error('Error saving Facebook Catalog entry:', error);
//     throw new Error('Failed to save Facebook Catalog');
//   }
// };

// /**
//  * Delete a Facebook Catalog entry
//  * Catalogs are stored in the config document under a 'catalogs' map field
//  */
// export const deleteFacebookCatalog = async (catalogId: string): Promise<void> => {
//   try {
//     const configRef = doc(db, FACEBOOK_CATALOG_COLLECTION, FACEBOOK_CONFIG_DOC_ID);
//     const configSnap = await getDoc(configRef);
    
//     if (!configSnap.exists()) {
//       return;
//     }

//     const data = configSnap.data();
//     const catalogs = data.catalogs || {};
    
//     // Remove the catalog from the map
//     delete catalogs[catalogId];
    
//     // Update the config document
//     await setDoc(
//       configRef,
//       {
//         catalogs,
//         updated_at: new Date().toISOString(),
//       },
//       { merge: true }
//     );
//   } catch (error) {
//     console.error('Error deleting Facebook Catalog entry:', error);
//     throw new Error('Failed to delete Facebook Catalog');
//   }
// };

// /**
//  * Subscribe to Facebook catalog config document for real-time updates.
//  */
// export const subscribeToFacebookCatalogs = (
//   onNext: (payload: FacebookCatalogSubscriptionPayload) => void,
//   onError?: (error: FirestoreError) => void,
// ) => {
//   const configRef = doc(db, FACEBOOK_CATALOG_COLLECTION, FACEBOOK_CONFIG_DOC_ID);

//   return onSnapshot(
//     configRef,
//     (snapshot) => {
//       const data = snapshot.data() || {};
//       const catalogsMap = (data.catalogs || {}) as Record<
//         string,
//         { createdAt?: string; numberOfProducts?: number; updated_at?: string; name?: string }
//       >;

//       const catalogs: FacebookCatalogEntry[] = Object.entries(catalogsMap).map(([catalogId, catalog]) => ({
//         docId: catalogId,
//         catalogId,
//         createdAt: catalog?.createdAt || "",
//         numberOfProducts: catalog?.numberOfProducts || 0,
//         updated_at: catalog?.updated_at || data.updated_at || new Date().toISOString(),
//         name: catalog?.name,
//       }));

//       onNext({
//         accessToken: data.accessToken || "",
//         updated_at: data.updated_at || new Date().toISOString(),
//         catalogs,
//       });
//     },
//     onError,
//   );
// };

// /**
//  * Get product count from Facebook Catalog
//  * This function calls Facebook Graph API to fetch the actual number of products in the catalog
//  */
// export const getFacebookCatalogProductCount = async (
//   catalogId: string,
//   accessToken: string
// ): Promise<number> => {
//   try {
//     // First, try to get catalog info which might include product count
//     const catalogInfoUrl = `https://graph.facebook.com/v24.0/${catalogId}?fields=product_count&access_token=${accessToken}`;
    
//     try {
//       const catalogInfoResponse = await fetch(catalogInfoUrl);
//       const catalogInfo = await catalogInfoResponse.json();
      
//       // Check for API errors in response
//       if (catalogInfo.error) {
//         // If it's a permission error or invalid token, throw it
//         if (catalogInfo.error.code === 190 || catalogInfo.error.code === 102) {
//           throw new Error(catalogInfo.error.message || 'Invalid access token');
//         }
//         // For other errors (like field not available), continue to products endpoint
//         console.warn('Catalog info endpoint returned error, trying products endpoint:', catalogInfo.error.message);
//       } else if (catalogInfo.product_count !== undefined && catalogInfo.product_count !== null) {
//         // If product_count is available, return it
//         return parseInt(String(catalogInfo.product_count), 10) || 0;
//       }
//     } catch (error) {
//       // Only log if it's not an authentication error (we'll throw those)
//       if (error instanceof Error && !error.message.includes('Invalid access token')) {
//         console.warn('Could not fetch catalog info with product_count, trying products endpoint:', error);
//       } else {
//         throw error;
//       }
//     }

//     // If product_count is not available, fetch products and count them
//     // We'll use pagination to count all products
//     let totalCount = 0;
//     let nextUrl: string | null = `https://graph.facebook.com/v24.0/${catalogId}/products?limit=100&access_token=${accessToken}`;
//     let attempts = 0;
//     const maxAttempts = 100; // Safety limit to prevent infinite loops

//     while (nextUrl && attempts < maxAttempts) {
//       attempts++;
//       const response = await fetch(nextUrl);
//       const data = await response.json();
      
//       // Check for API errors in response
//       if (data.error) {
//         const errorCode = data.error.code;
//         const errorMessage = data.error.message || 'Unknown error';
        
//         // Authentication/permission errors
//         if (errorCode === 190 || errorCode === 102) {
//           throw new Error(`Invalid access token: ${errorMessage}`);
//         }
//         // Catalog not found
//         if (errorCode === 100 || errorMessage.includes('Catalog') || errorMessage.includes('not found')) {
//           throw new Error(`Catalog not found: ${errorMessage}`);
//         }
//         // Permission denied
//         if (errorCode === 10 || errorCode === 200) {
//           throw new Error(`Permission denied: ${errorMessage}. Please check your access token permissions.`);
//         }
//         // Other errors
//         throw new Error(`Facebook API Error: ${errorMessage} (Code: ${errorCode})`);
//       }
      
//       if (!response.ok && !data.data) {
//         throw new Error(`Facebook API Error: ${response.statusText}`);
//       }
      
//       // Count products in current page
//       if (data.data && Array.isArray(data.data)) {
//         totalCount += data.data.length;
//       } else if (!data.data) {
//         // No data field means no products or error
//         break;
//       }

//       // Check for next page
//       if (data.paging && data.paging.next) {
//         nextUrl = data.paging.next;
//       } else {
//         nextUrl = null;
//       }
//     }

//     return totalCount;
//   } catch (error) {
//     console.error('Error fetching Facebook Catalog product count:', error);
    
//     // If it's an API error, throw it with a meaningful message
//     if (error instanceof Error) {
//       // Check if it's an authentication error
//       if (error.message.includes('Invalid OAuth') || error.message.includes('access token')) {
//         throw new Error('Invalid access token. Please check your Facebook Developer API Key.');
//       }
//       // Check if it's a catalog not found error
//       if (error.message.includes('Catalog') || error.message.includes('not found')) {
//         throw new Error('Catalog not found. Please check your Catalog ID.');
//       }
//       throw error;
//     }
    
//     throw new Error('Failed to fetch product count from Facebook Catalog');
//   }
// };





// // ----------------------------------------------------------------------------------------------------


// // q_free_offers.ts file


// import {
//   Timestamp,
//   doc,
//   collection,
//   query,
//   where,
//   setDoc,
//   getDocs,
//   updateDoc,
//   deleteDoc,
//   getDoc,
//   orderBy,
//   QueryConstraint,
//   DocumentData,
//   CollectionReference
// } from 'firebase/firestore';

// // --- Types ---
// export type TargetType = 'single' | 'multiple' | 'all';

// export interface FreeOffer {
//   id: string;
//   title: string;
//   target_type: TargetType;
//   target_product_id?: string; // For backward compatibility and single product
//   target_product_ids?: string[]; // For multiple products
//   target_quantity?: number; // Minimum quantity required for target product(s)
//   target_variant_id?: string; // Specific variant required for target product(s)
//   free_product_id: string;
//   free_variant_id?: string; // New field for selected variant
//   free_quantity: number;
//   max_orders: number;
//   active: boolean;
//   used_orders: string[];
//   start_date?: number; // milliseconds
//   end_date?: number; // milliseconds
//   created_at: number; // milliseconds
//   updated_at: number; // milliseconds
// }

// export interface FreeOfferPayload {
//   title: string;
//   target_type: TargetType;
//   target_product_id?: string;
//   target_product_ids?: string[];
//   target_quantity?: number; // Minimum quantity required for target product(s)
//   target_variant_id?: string; // Specific variant required for target product(s)
//   free_product_id: string;
//   free_variant_id?: string; // New field for selected variant
//   free_quantity: number;
//   max_orders: number;
//   active: boolean;
//   start_date?: Date;
//   end_date?: Date;
//   used_orders?: string[];
// }

// // --- CRUD Operations ---

// const removeUndefinedFields = (obj: Record<string, any>) => {
//   Object.keys(obj).forEach((key) => {
//     const value = obj[key];
//     if (value === undefined) {
//       delete obj[key];
//     } else if (value && typeof value === 'object' && !Array.isArray(value)) {
//       removeUndefinedFields(value);
//     }
//   });
//   return obj;
// };

// export const createFreeOffer = async (payload: FreeOfferPayload) => {
//   const offersCollectionRef = collection(db, 'P_FreeOffers');
//   const offerId = uuidv4();
  
//   const now = Date.now();
  
//   // Build the offer data based on target type
//   const baseOfferData = {
//     id: offerId,
//     title: payload.title,
//     target_type: payload.target_type,
//     target_quantity: payload.target_quantity ?? null,
//     target_variant_id: payload.target_variant_id ?? null,
//     free_product_id: payload.free_product_id,
//     free_variant_id: payload.free_variant_id ?? null,
//     free_quantity: payload.free_quantity,
//     max_orders: payload.max_orders,
//     active: payload.active,
//     used_orders: [],
//     start_date: payload.start_date ? payload.start_date.getTime() : null,
//     end_date: payload.end_date ? payload.end_date.getTime() : null,
//     created_at: now,
//     updated_at: now,
//   };

//   // Add target-specific fields
//   let offerData: FreeOffer;
//   if (payload.target_type === 'single') {
//     offerData = {
//       ...baseOfferData,
//       target_product_id: payload.target_product_id,
//     };
//   } else if (payload.target_type === 'multiple') {
//     offerData = {
//       ...baseOfferData,
//       target_product_ids: payload.target_product_ids,
//     };
//   } else { // 'all'
//     offerData = {
//       ...baseOfferData,
//       // No target fields needed for 'all' type
//     };
//   }

//   try {
//     await setDoc(doc(offersCollectionRef, offerId), offerData);
//     return { 
//       success: true, 
//       data: { id: offerId },
//       message: 'Free offer created successfully' 
//     };
//   } catch (error) {
//     console.error('Error creating free offer:', error);
//     return { 
//       success: false, 
//       error: 'Failed to create free offer' 
//     };
//   }
// };

// export const getAllFreeOffers = async () => {
//   try {
//     const offersQuery = query(
//       collection(db, 'P_FreeOffers'),
//       orderBy('created_at', 'desc')
//     );
//     const querySnapshot = await getDocs(offersQuery);
    
//     const offers = querySnapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data()
//     })) as FreeOffer[];

//     return {
//       success: true,
//       data: offers,
//       meta: {
//         current_page: 1,
//         from: 1,
//         last_page: 1,
//         to: offers.length,
//         total: offers.length,
//       }
//     };
//   } catch (error) {
//     console.error('Error fetching free offers:', error);
//     return { 
//       success: false, 
//       error: 'Failed to fetch free offers',
//       data: [],
//       meta: {
//         current_page: 1,
//         from: 0,
//         last_page: 1,
//         to: 0,
//         total: 0,
//       }
//     };
//   }
// };

// export const getFreeOfferById = async (id: string) => {
//   try {
//     const offerRef = doc(db, 'P_FreeOffers', id);
//     const offerSnap = await getDoc(offerRef);
    
//     if (!offerSnap.exists()) {
//       return { 
//         success: false, 
//         error: 'Free offer not found' 
//       };
//     }
    
//     const offerData = { id: offerSnap.id, ...offerSnap.data() } as FreeOffer;
//     return { 
//       success: true, 
//       data: offerData 
//     };
//   } catch (error) {
//     console.error('Error fetching free offer:', error);
//     return { 
//       success: false, 
//       error: 'Failed to fetch free offer' 
//     };
//   }
// };

// export const updateFreeOffer = async (id: string, updateData: Partial<FreeOfferPayload>) => {
//   try {
//     const offerRef = doc(db, 'P_FreeOffers', id);
    
//     // Build update payload based on target type
//     const baseUpdatePayload: any = {
//       ...updateData,
//       updated_at: Date.now()
//     };

//     // Convert Date objects to milliseconds if present
//     if (updateData.start_date) {
//       baseUpdatePayload.start_date = updateData.start_date.getTime();
//     }
//     if (updateData.end_date) {
//       baseUpdatePayload.end_date = updateData.end_date.getTime();
//     }

//     // Handle target-specific fields
//     let updatePayload: any = { ...baseUpdatePayload };
    
//     if (updateData.target_type === 'single') {
//       updatePayload.target_product_id = updateData.target_product_id;
//       // Remove multiple target fields if switching to single
//       delete updatePayload.target_product_ids;
//     } else if (updateData.target_type === 'multiple') {
//       updatePayload.target_product_ids = updateData.target_product_ids;
//       // Remove single target field if switching to multiple
//       delete updatePayload.target_product_id;
//     } else if (updateData.target_type === 'all') {
//       // Remove both target fields for 'all' type
//       delete updatePayload.target_product_id;
//       delete updatePayload.target_product_ids;
//     }

//     removeUndefinedFields(updatePayload);

//     await updateDoc(offerRef, updatePayload);
//     return { 
//       success: true, 
//       message: 'Free offer updated successfully' 
//     };
//   } catch (error) {
//     console.error('Error updating free offer:', error);
//     return { 
//       success: false, 
//       error: 'Failed to update free offer' 
//     };
//   }
// };

// export const deleteFreeOffer = async (id: string) => {
//   try {
//     const offerRef = doc(db, 'P_FreeOffers', id);
//     await deleteDoc(offerRef);
//     return { 
//       success: true, 
//       message: 'Free offer deleted successfully' 
//     };
//   } catch (error) {
//     console.error('Error deleting free offer:', error);
//     return { 
//       success: false, 
//       error: 'Failed to delete free offer' 
//     };
//   }
// };

// export const toggleFreeOfferActive = async (id: string) => {
//   try {
//     const offerRef = doc(db, 'P_FreeOffers', id);
//     const offerSnap = await getDoc(offerRef);
    
//     if (!offerSnap.exists()) {
//       return { 
//         success: false, 
//         error: 'Free offer not found' 
//       };
//     }
    
//     const currentData = offerSnap.data() as FreeOffer;
//     const newActive = !currentData.active;
    
//     await updateDoc(offerRef, {
//       active: newActive,
//       updated_at: Date.now()
//     });
    
//     return { 
//       success: true, 
//       data: { active: newActive },
//       message: `Free offer ${newActive ? 'activated' : 'deactivated'} successfully` 
//     };
//   } catch (error) {
//     console.error('Error toggling free offer active status:', error);
//     return { 
//       success: false, 
//       error: 'Failed to toggle free offer status' 
//     };
//   }
// };

// // --- Integration with Orders ---

// export const getActiveFreeOffers = async () => {
//   try {
//     const now = Date.now();
//     const offersQuery = query(
//       collection(db, 'P_FreeOffers'),
//       where('active', '==', true)
//     );
//     const querySnapshot = await getDocs(offersQuery);
    
//     const offers = querySnapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data()
//     })) as FreeOffer[];

//     // Filter by date range if specified
//     const validOffers = offers.filter(offer => {
//       if (offer.start_date && offer.start_date > now) return false;
//       if (offer.end_date && offer.end_date < now) return false;
//       return true;
//     });

//     return {
//       success: true,
//       data: validOffers
//     };
//   } catch (error) {
//     console.error('Error fetching active free offers:', error);
//     return { 
//       success: false, 
//       error: 'Failed to fetch active free offers',
//       data: []
//     };
//   }
// };

// export const checkAndApplyFreeOffers = async (orderId: string, orderItems: any[]) => {
//   try {
//     console.log('🎁 Checking free offers for order:', orderId);
//     console.log('📦 Order items:', orderItems.map(item => ({ product_id: item.product_id, quantity: item.quantity })));
    
//     const activeOffers = await getActiveFreeOffers();
//     if (!activeOffers.success) {
//       console.log('❌ Failed to fetch active offers:', activeOffers.error);
//       return { success: false, error: 'Failed to fetch active offers' };
//     }

//     console.log('🎯 Active offers found:', activeOffers.data.length);
//     console.log('📋 Offers:', activeOffers.data.map(offer => ({ 
//       id: offer.id, 
//       title: offer.title, 
//       target_product_id: offer.target_product_id, 
//       free_product_id: offer.free_product_id,
//       used_orders: offer.used_orders.length,
//       max_orders: offer.max_orders
//     })));

//     const appliedOffers = [];
    
//     for (const offer of activeOffers.data) {
//       console.log(`🔍 Checking offer: ${offer.title}`);
      
//       // Check if offer is still valid (has remaining orders)
//       if (offer.used_orders.length >= offer.max_orders) {
//         console.log(`❌ Offer ${offer.title} has reached max orders (${offer.used_orders.length}/${offer.max_orders})`);
//         continue;
//       }

//       // Check if order contains any of the target products with required quantity and variant
//       let hasTargetProduct = false;
//       let matchingItems: any[] = [];
      
//       if (offer.target_type === 'all') {
//         // For "all products" offers, any product in the order qualifies
//         // But still check quantity and variant if specified
//         const hasQuantityRequirement = offer.target_quantity && offer.target_quantity > 0;
//         const hasVariantRequirement = offer.target_variant_id && offer.target_variant_id.trim() !== '';
        
//         if (hasQuantityRequirement || hasVariantRequirement) {
//           // Find items that match the variant requirement (if specified)
//           const variantMatchedItems = hasVariantRequirement
//             ? orderItems.filter(item => item.variant_id === offer.target_variant_id)
//             : orderItems;
          
//           // Check if total quantity meets requirement
//           const totalQuantity = variantMatchedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
//           hasTargetProduct = (!hasQuantityRequirement || totalQuantity >= offer.target_quantity!) && 
//                             (!hasVariantRequirement || variantMatchedItems.length > 0);
//           matchingItems = variantMatchedItems;
//         } else {
//           hasTargetProduct = orderItems.length > 0;
//           matchingItems = orderItems;
//         }
//         console.log(`🎯 All products offer - any product qualifies:`, hasTargetProduct);
//       } else if (offer.target_type === 'multiple' && offer.target_product_ids) {
//         // For multiple products, check if any order item matches any target product
//         const targetItems = orderItems.filter(item => 
//           offer.target_product_ids!.includes(item.product_id)
//         );
        
//         if (targetItems.length > 0) {
//           const hasQuantityRequirement = offer.target_quantity && offer.target_quantity > 0;
//           const hasVariantRequirement = offer.target_variant_id && offer.target_variant_id.trim() !== '';
          
//           // Check variant requirement if specified
//           const variantMatchedItems = hasVariantRequirement
//             ? targetItems.filter(item => item.variant_id === offer.target_variant_id)
//             : targetItems;
          
//           // Check quantity requirement if specified
//           const totalQuantity = variantMatchedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
//           hasTargetProduct = (!hasQuantityRequirement || totalQuantity >= offer.target_quantity!) &&
//                             (!hasVariantRequirement || variantMatchedItems.length > 0);
//           matchingItems = variantMatchedItems;
//         }
//         console.log(`🎯 Multiple target products ${offer.target_product_ids} found in order:`, hasTargetProduct);
//       } else if (offer.target_type === 'single' && offer.target_product_id) {
//         // For single product, check if order contains it with required quantity and variant
//         const targetItems = orderItems.filter(item => 
//           item.product_id === offer.target_product_id
//         );
        
//         if (targetItems.length > 0) {
//           const hasQuantityRequirement = offer.target_quantity && offer.target_quantity > 0;
//           const hasVariantRequirement = offer.target_variant_id && offer.target_variant_id.trim() !== '';
          
//           // Check variant requirement if specified
//           const variantMatchedItems = hasVariantRequirement
//             ? targetItems.filter(item => item.variant_id === offer.target_variant_id)
//             : targetItems;
          
//           // Check quantity requirement if specified
//           const totalQuantity = variantMatchedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
//           hasTargetProduct = (!hasQuantityRequirement || totalQuantity >= offer.target_quantity!) &&
//                             (!hasVariantRequirement || variantMatchedItems.length > 0);
//           matchingItems = variantMatchedItems;
//         }
//         console.log(`🎯 Single target product ${offer.target_product_id} found in order:`, hasTargetProduct, 
//                     offer.target_quantity && offer.target_quantity > 0 ? `(quantity: ${matchingItems.reduce((sum, item) => sum + (item.quantity || 0), 0)}/${offer.target_quantity})` : '',
//                     offer.target_variant_id && offer.target_variant_id.trim() !== '' ? `(variant: ${offer.target_variant_id})` : '');
//       } else {
//         // Fallback for legacy offers without target_type
//         const targetItems = orderItems.filter(item => 
//           item.product_id === offer.target_product_id
//         );
        
//         if (targetItems.length > 0) {
//           const hasQuantityRequirement = offer.target_quantity && offer.target_quantity > 0;
//           const hasVariantRequirement = offer.target_variant_id && offer.target_variant_id.trim() !== '';
          
//           // Check variant requirement if specified
//           const variantMatchedItems = hasVariantRequirement
//             ? targetItems.filter(item => item.variant_id === offer.target_variant_id)
//             : targetItems;
          
//           // Check quantity requirement if specified
//           const totalQuantity = variantMatchedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
//           hasTargetProduct = (!hasQuantityRequirement || totalQuantity >= offer.target_quantity!) &&
//                             (!hasVariantRequirement || variantMatchedItems.length > 0);
//           matchingItems = variantMatchedItems;
//         }
//         console.log(`🎯 Legacy single target product ${offer.target_product_id} found in order:`, hasTargetProduct);
//       }

//       if (hasTargetProduct) {
//         console.log(`✅ Target product found for offer: ${offer.title}`);
        
//         // Check if free product is in stock before applying the offer
//         try {
//           const { getAllProductsById } = await import('./q_products');
//           const { data: freeProductData } = await getAllProductsById('', offer.free_product_id);
          
//           if (!freeProductData) {
//             console.log(`❌ Free product ${offer.free_product_id} not found, skipping offer`);
//             continue;
//           }

//           // Check stock availability for the free product
//           let isInStock = false;
//           let availableStock = 0;
          
//           if (freeProductData.stocks && freeProductData.stocks.length > 0) {
//             // If a specific variant is specified in the offer, check that variant's stock
//             if (offer.free_variant_id) {
//               const variantStock = freeProductData.stocks.find((stock: any) => 
//                 stock.extras && Array.isArray(stock.extras) && 
//                 stock.extras.some((extra: any) => 
//                   typeof extra === 'object' && extra.id === offer.free_variant_id
//                 )
//               );
              
//               if (variantStock) {
//                 availableStock = Number(variantStock.quantity) || 0;
//                 isInStock = availableStock >= offer.free_quantity;
//                 console.log(`🔍 Checking variant ${offer.free_variant_id} stock: ${availableStock} (needed: ${offer.free_quantity})`);
//               } else {
//                 console.log(`❌ Variant ${offer.free_variant_id} not found for free product ${offer.free_product_id}`);
//                 continue;
//               }
//             } else {
//               // Check total stock across all variants
//               availableStock = freeProductData.stocks.reduce(
//                 (sum: number, stock: any) => sum + (Number(stock.quantity) || 0),
//                 0
//               );
//               isInStock = availableStock >= offer.free_quantity;
//               console.log(`🔍 Checking total stock for free product ${offer.free_product_id}: ${availableStock} (needed: ${offer.free_quantity})`);
//             }
//           } else {
//             console.log(`❌ No stocks found for free product ${offer.free_product_id}`);
//             continue;
//           }

//           if (!isInStock) {
//             console.log(`❌ Free product ${offer.free_product_id} is out of stock (available: ${availableStock}, needed: ${offer.free_quantity}), skipping offer`);
//             continue;
//           }

//           console.log(`✅ Free product ${offer.free_product_id} is in stock, applying offer`);
          
//           // Add free product to order
//           const freeProductItem = {
//             product_id: offer.free_product_id,
//             variant_id: offer.free_variant_id, // Include variant information
//             quantity: offer.free_quantity,
//             price: 0,
//             total_price: 0,
//             is_free: true,
//             free_offer_id: offer.id
//           };

//           // Update the offer's used_orders array
//           const updatedUsedOrders = [...offer.used_orders, orderId];
//           await updateFreeOffer(offer.id, { used_orders: updatedUsedOrders });

//           appliedOffers.push({
//             offer,
//             freeProductItem
//           });
          
//           console.log(`🎉 Free product added: ${offer.free_quantity}x ${offer.free_product_id}`);
//         } catch (error) {
//           console.error(`Error checking stock for free product ${offer.free_product_id}:`, error);
//           // Continue to next offer instead of failing completely
//           continue;
//         }
//       }
//     }

//     return {
//       success: true,
//       data: appliedOffers
//     };
//   } catch (error) {
//     console.error('Error checking and applying free offers:', error);
//     return { 
//       success: false, 
//       error: 'Failed to apply free offers' 
//     };
//   }
// };

// export const removeFreeOfferFromOrder = async (orderId: string, offerId: string) => {
//   try {
//     const offerRef = doc(db, 'P_FreeOffers', offerId);
//     const offerSnap = await getDoc(offerRef);
    
//     if (!offerSnap.exists()) {
//       return { 
//         success: false, 
//         error: 'Free offer not found' 
//       };
//     }
    
//     const offerData = offerSnap.data() as FreeOffer;
//     const updatedUsedOrders = offerData.used_orders.filter(id => id !== orderId);
    
//     await updateDoc(offerRef, {
//       used_orders: updatedUsedOrders,
//       updated_at: Date.now()
//     });
    
//     return { 
//       success: true, 
//       message: 'Free offer removed from order' 
//     };
//   } catch (error) {
//     console.error('Error removing free offer from order:', error);
//     return { 
//       success: false, 
//       error: 'Failed to remove free offer from order' 
//     };
//   }
// };





// // ----------------------------------------------------------------------------------------------------



// // q_houses.ts file



// // const ORDERS_COLLECTION = "p_orders";

// export interface House {
//   value: string;
//   label: string;
//   count: number;
// }

// // Get all unique houses from orders
// export const getAllHouses = async (): Promise<{ success: boolean; data?: House[]; error?: string }> => {
//   try {
//     const ordersCol = collection(db, ORDERS_COLLECTION);
//     const ordersQuery = query(ordersCol, orderBy('created_at', 'desc'));
//     const snapshot = await getDocs(ordersQuery);
    
//     const houseCounts: Record<string, number> = {};
    
//     snapshot.forEach((doc) => {
//       const data = doc.data();
//       const address = data.address as Record<string, string> | undefined;
      
//       if (address && address.street) {
//         const streetValue = address.street.trim();
//         if (streetValue) {
//           houseCounts[streetValue] = (houseCounts[streetValue] || 0) + 1;
//         }
//       }
//     });
    
//     // Convert to array and sort by count (descending)
//     const houses: House[] = Object.entries(houseCounts)
//       .map(([value, count]) => ({
//         value,
//         label: value,
//         count
//       }))
//       .sort((a, b) => b.count - a.count);
    
//     console.log(`🏠 Loaded ${houses.length} unique houses from orders`);
//     return { success: true, data: houses };
//   } catch (error) {
//     console.error('❌ Error fetching houses:', error);
//     return { 
//       success: false, 
//       error: error instanceof Error ? error.message : String(error) 
//     };
//   }
// };





// // ----------------------------------------------------------------------------------------------------


// // q_kitchens.ts file


// export interface Kitchen {
//   id: string;
//   uuid: string;
//   title: Record<string, string>;
//   description?: Record<string, string>;
//   active: boolean;
//   created_at?: number;
//   updated_at?: number;
//   locales?: string[];
//   shop_id?: string;
//   [key: string]: unknown;
// }

// export const createKitchenDb = async (orgId: string, payload: { params: Record<string, unknown> }) => {
//   const filesCollectionRef = collection(db, 'T_kitchen');
//   const myId = uuidv4();
//   const params = payload.params;
//   const titleData: Record<string, string> = {};
//   const descriptionData: Record<string, string> = {};
//   const translations: Array<{ id: string; locale: string; title: string; description: string }> = [];
//   const locales: string[] = [];
//   if (typeof params.title === 'object' && params.title !== null) {
//     Object.keys(params.title as Record<string, string>).forEach(locale => {
//       const value = (params.title as Record<string, string>)[locale];
//       if (value !== undefined && value !== null && value.trim() !== '') {
//         titleData[locale] = value;
//         if (!locales.includes(locale)) {
//           locales.push(locale);
//         }
//       }
//     });
//   }
//   if (typeof params.description === 'object' && params.description !== null) {
//     Object.keys(params.description as Record<string, string>).forEach(locale => {
//       const value = (params.description as Record<string, string>)[locale];
//       if (value !== undefined && value !== null && value.trim() !== '') {
//         descriptionData[locale] = value;
//         if (!locales.includes(locale)) {
//           locales.push(locale);
//         }
//       }
//     });
//   }
//   Object.keys(params).forEach(key => {
//     const titleMatch = key.match(/^title\[(.*)\]$/);
//     const descriptionMatch = key.match(/^description\[(.*)\]$/);
//     if (titleMatch && titleMatch[1]) {
//       const locale = titleMatch[1];
//       const value = params[key] as string;
//       if (value !== undefined && value !== null && value.trim() !== '') {
//         titleData[locale] = value;
//         if (!locales.includes(locale)) {
//           locales.push(locale);
//         }
//       }
//     }
//     if (descriptionMatch && descriptionMatch[1]) {
//       const locale = descriptionMatch[1];
//       const value = params[key] as string;
//       if (value !== undefined && value !== null && value.trim() !== '') {
//         descriptionData[locale] = value;
//         if (!locales.includes(locale)) {
//           locales.push(locale);
//         }
//       }
//     }
//   });
//   if (locales.length === 0) {
//     locales.push('en');
//   }
//   locales.forEach(locale => {
//     const hasTitle = locale in titleData;
//     const hasDescription = locale in descriptionData;
//     if (hasTitle || hasDescription) {
//       translations.push({
//         id: myId,
//         locale: locale,
//         title: hasTitle ? titleData[locale] : "",
//         description: hasDescription ? descriptionData[locale] : ""
//       });
//     }
//   });
//   const primaryLocale = locales[0];
//   const primaryTitle = titleData[primaryLocale] || '';
//   const primaryDescription = descriptionData[primaryLocale] || '';
//   const input = {
//     id: myId,
//     active: (params.active === true || (typeof params.active === 'number' && params.active === 1)) ? 1 : 0,
//     created_at: Timestamp.now().toMillis(),
//     updated_at: Timestamp.now().toMillis(),
//     title: titleData,
//     description: descriptionData,
//     translations: translations,
//     translation: {
//       id: myId,
//       locale: primaryLocale,
//       title: primaryTitle,
//       description: primaryDescription
//     },
//     locales: locales,
//     shop_id: params.shop_id as string,
//   };
//   const docRef = await addDoc(filesCollectionRef, input);
//   return {
//     id: docRef.id,
//     active: input.active === 1,
//     shop_id: input.shop_id,
//     translation: {
//       id: docRef.id,
//       locale: input.translation.locale,
//       title: input.translation.title,
//       description: input.translation.description
//     },
//     translations: input.translations.map(trans => ({ ...trans, id: docRef.id }))
//   };
// };

// export const getAllKitchens = async (orgId: string, params: unknown) => {
//   const filesQuery = query(collection(db, `T_kitchen`));
//   const querySnapshot = await getDocs(filesQuery);
//   const files: Kitchen[] = querySnapshot.docs.map((docSnap) => {
//     const x = docSnap.data() as Kitchen;
//     x.id = docSnap.id;
//     x.uuid = docSnap.id;
//     return x;
//   });
//   return {
//     data: files,
//     meta: {
//       current_page: 1,
//       from: 1,
//       last_page: 1,
//       links: [
//         { url: null, label: "« Previous", active: false },
//         { url: "https://single-api.foodyman.org/api/v1/dashboard/seller/kitchen/paginate?page=1", label: "1", active: true },
//         { url: null, label: "Next »", active: false }
//       ],
//       path: "https://single-api.foodyman.org/api/v1/dashboard/seller/kitchen/paginate",
//       per_page: "1000",
//       to: files.length,
//       total: files.length
//     }
//   };
// };

// export const getKitchenById = async (orgId: string, uid: string) => {
//   const docRef = doc(db, `T_kitchen`, uid);
//   const docSnap = await getDoc(docRef);
//   if (docSnap.exists() && docSnap.data()) {
//     const kitchenData = docSnap.data() as Kitchen;
//     kitchenData.id = docSnap.id;
//     kitchenData.uuid = docSnap.id;
//     kitchenData.active = (typeof kitchenData.active === 'number' && kitchenData.active === 1) || kitchenData.active === true;
//     return { data: kitchenData };
//   } else {
//     return { data: null };
//   }
// };

// export const updateKitchen = async (uid: string, payload: { params: Record<string, unknown> }) => {
//   const params = payload.params;
//   const titleData: Record<string, string> = {};
//   const descriptionData: Record<string, string> = {};
//   const translations: Array<{ locale: string; title: string; description: string }> = [];
//   const locales: string[] = [];
//   if (typeof params.title === 'object' && params.title !== null) {
//     Object.keys(params.title as Record<string, string>).forEach(locale => {
//       const value = (params.title as Record<string, string>)[locale];
//       if (value !== undefined && value !== null && value.trim() !== '') {
//         titleData[locale] = value;
//         if (!locales.includes(locale)) {
//           locales.push(locale);
//         }
//       }
//     });
//   }
//   if (typeof params.description === 'object' && params.description !== null) {
//     Object.keys(params.description as Record<string, string>).forEach(locale => {
//       const value = (params.description as Record<string, string>)[locale];
//       if (value !== undefined && value !== null && value.trim() !== '') {
//         descriptionData[locale] = value;
//         if (!locales.includes(locale)) {
//           locales.push(locale);
//         }
//       }
//     });
//   }
//   Object.keys(params).forEach(key => {
//     const titleMatch = key.match(/^title\[(.*)\]$/);
//     const descriptionMatch = key.match(/^description\[(.*)\]$/);
//     if (titleMatch && titleMatch[1]) {
//       const locale = titleMatch[1];
//       const value = params[key] as string;
//       if (value !== undefined && value !== null && value.trim() !== '') {
//         titleData[locale] = value;
//         if (!locales.includes(locale)) {
//           locales.push(locale);
//         }
//       }
//     }
//     if (descriptionMatch && descriptionMatch[1]) {
//       const locale = descriptionMatch[1];
//       const value = params[key] as string;
//       if (value !== undefined && value !== null && value.trim() !== '') {
//         descriptionData[locale] = value;
//         if (!locales.includes(locale)) {
//           locales.push(locale);
//         }
//       }
//     }
//   });
//   if (locales.length === 0) {
//     locales.push('en');
//   }
//   locales.forEach(locale => {
//     const hasTitle = locale in titleData;
//     const hasDescription = locale in descriptionData;
//     if (hasTitle || hasDescription) {
//       translations.push({
//         locale: locale,
//         title: hasTitle ? titleData[locale] : "",
//         description: hasDescription ? descriptionData[locale] : ""
//       });
//     }
//   });
//   const updateData: Record<string, unknown> = {
//     active: (params.active === true || (typeof params.active === 'number' && params.active === 1)) ? 1 : 0,
//     updated_at: Timestamp.now().toMillis(),
//     locales: locales,
//     shop_id: params.shop_id as string,
//   };
//   if (Object.keys(titleData).length > 0) {
//     updateData.title = titleData;
//   }
//   if (Object.keys(descriptionData).length > 0) {
//     updateData.description = descriptionData;
//   }
//   if (translations.length > 0) {
//     updateData.translations = translations;
//     updateData.translation = {
//       locale: translations[0].locale,
//       title: translations[0].title || "",
//       description: translations[0].description || ""
//     };
//   }
//   await updateDoc(doc(db, `T_kitchen`, uid), updateData);
//   return { success: true };
// };

// export const deleteKitchen = async (params: string[] | Record<string, string | number | boolean>) => {
//   const ids = Array.isArray(params) ? params : Object.values(params);
//   if (Array.isArray(ids)) {
//     await Promise.all(
//       ids.map(async (item) => {
//         await deleteDoc(doc(db, 'T_kitchen', String(item)));
//       })
//     );
//     return true;
//   } else {
//     throw new Error('Invalid parameter format for deletion');
//   }
// };

// export const setActiveKitchen = async (id: string) => {
//   const kitchenId = id.includes('/') ? id.split('/').pop() : id;
//   const docRef = doc(db, 'T_kitchen', kitchenId!);
//   const docSnap = await getDoc(docRef);
//   if (!docSnap.exists()) {
//     throw new Error(`Kitchen with ID ${kitchenId} not found`);
//   }
//   const kitchenData = docSnap.data() as Kitchen;
//   const currentActive = (typeof kitchenData.active === 'number' && kitchenData.active === 1) || kitchenData.active === true;
//   const newActive = !currentActive;
//   await updateDoc(docRef, {
//     active: newActive ? 1 : 0,
//     updated_at: Timestamp.now().toMillis()
//   });
//   return {
//     timestamp: new Date().toISOString(),
//     status: true,
//     data: {
//       id: kitchenId,
//       active: newActive,
//       position: kitchenData.position || "before",
//       created_at: Timestamp.now().toMillis(),
//       updated_at: Timestamp.now().toMillis(),
//       locales: kitchenData.locales || ["en"]
//     }
//   };
// }; 





// // ----------------------------------------------------------------------------------------------------


// // q_orders.ts file
// // Note: All Firebase imports are at the top of the file
// // Note: handleOrderCreated, handleOrderUpdated, handleOrderDeleted are imported inline where needed
// // Note: getAllProductsById, getStocksByProductId, updateStockQuantity are defined in this file
// // Note: OrderId, isValidOrderId, OrderItemId, isValidOrderItemId are imported at the top

// // Status Collections Interface
// interface StatusCollection {
//   id: string;
//   label: string;
//   value: string;
//   default_key: boolean;
//   groups: {
//     [key: string]: {
//       default_value: string;
//       values: string[];
//     };
//   };
//   created_at: number;
//   updated_at: number;
// }

// // Order Item ID generation constants
// const ORDER_ITEMS_COLLECTION = 'p_order_items';
// const BASE_ORDER_ITEM_NUMBER = 1000000001; // Starting number for ITM1000000001

// /**
//  * Generates the next sequential order item ID in the format ITM1000000001, ITM1000000002, etc.
//  * This follows the same pattern as orders (ORD) and products (PRD) for consistency.
//  * @returns Promise<string> - The next order item ID
//  */
// export const generateNextOrderItemId = async (): Promise<string> => {
//   try {
//     // Query the order items collection to find the highest existing ID
//     const orderItemsRef = collection(db, ORDER_ITEMS_COLLECTION);
//     const q = query(orderItemsRef, orderBy('order_item_id', 'desc'), limit(1));
    
//     const querySnapshot = await getDocs(q);
    
//     if (querySnapshot.empty) {
//       // No order items exist yet, start with the base number
//       return `ITM${BASE_ORDER_ITEM_NUMBER}`;
//     }
    
//     // Get the highest existing order item ID
//     const lastDoc = querySnapshot.docs[0];
//     const lastOrderItemId = lastDoc.data().order_item_id as string;
    
//     if (!lastOrderItemId || !lastOrderItemId.startsWith('ITM')) {
//       // If the last item doesn't have a proper ITM ID, start fresh
//       return `ITM${BASE_ORDER_ITEM_NUMBER}`;
//     }
    
//     // Extract the numeric part and increment
//     const numericPart = lastOrderItemId.substring(3); // Remove 'ITM' prefix
//     const nextNumber = parseInt(numericPart, 10) + 1;
    
//     return `ITM${nextNumber}`;
//   } catch (error) {
//     console.error('Error generating next order item ID:', error);
//     // Fallback to base number if there's an error
//     return `ITM${BASE_ORDER_ITEM_NUMBER}`;
//   }
// };

// // --- Order Type Definition (based on your Firestore structure) ---
// // export interface Order {
// //   id: string;
// //   address: Record<string, unknown>;
// //   commission_fee: number;
// //   created_at: string;
// //   currency: Record<string, unknown>;
// //   current: boolean;
// //   delivery_date: string;
// //   delivery_date_time: string;
// //   delivery_fee: number;
// //   delivery_time: string;
// //   delivery_type: string;
// //   deliveryman: unknown;
// //   location: Record<string, unknown>;
// //   order_details_count: number;
// //   origin_price: number;
// //   otp: number;
// //   paid_by_split: boolean;
// //   products: Record<string, number>;
// //   shop: Record<string, unknown>;
// //   locales: string[];
// //   logo_img: string;
// //   open: boolean;
// //   products_count: number;
// //   tax: unknown;
// //   translation: Record<string, unknown>;
// //   split: number;
// //   status: string;
// //   total_price: number;
// //   updated_at: string;
// //   user: Record<string, unknown>;
// //   [key: string]: unknown;
// // }

// // Main Order interface (stored in p_orders collection)
// export interface Order {
//   id: OrderId;
//   address: Record<string, unknown>;
//   commission_fee: number;
//   created_at: string;
//   currency: Record<string, unknown>;
//   current: boolean;
//   delivery_date: string;
//   delivery_date_time: string;
//   delivery_fee: number;
//   delivery_time: string;
//   delivery_type: string;
//   deliveryman: unknown;
//   location: Record<string, unknown>;
//   order_items_count: number; // Updated from order_details_count
//   order_items_status_count?: number; // Count of items with "delivery" or "delivered" status
//   origin_price: number;
//   otp: number;
//   paid_by_split: boolean;
//   shop: Record<string, unknown>;
//   split: number;
//   status: string;
//   total_price: number;
//   updated_at: string;
//   user: Record<string, unknown>;
//   [key: string]: unknown;
// }

// // Updated Order Item interface to match your schema
// export interface OrderItem {
//   order_item_id?: OrderItemId; // Maps to your order_item_id - now uses structured ID format
//   order_id: string; // Foreign key to order
//   product_id: string; // Foreign key to product
//   name?: string; // Product name stored based on product_id
//   variant_id?: string; // Selected variant ID for this item
//   stock_id?: string; // Stock record used for this item
//   quantity: number;
//   subtotal: number;
//   status?: string; // 'Active', 'Cancelled', 'Delivered'
//   cancellation_reason?: string;
//   cancelled_at?: string;
//   cancelled_by?: string;
//   packing_status?: string; // Added packing status
//   order_item_status?: string; // Status from status APIs (same as orders)
//   order_item_substatus?: string; // Sub-status from status APIs (same as orders)
//   product?: Record<string, unknown>; // Populated product data
//   is_free?: boolean; // Indicates if this is a free product from an offer
//   free_offer_id?: string; // ID of the free offer that provided this item
//   created_at?: string; // Timestamp when the order item was created
//   updated_at?: string; // Timestamp when the order item was last updated
//   delivery_date?: number; // timestamp in milliseconds
//   delivery_time?: string; // time string like "10:00" - Legacy support
//   delivery_time_start?: string; // time string like "10:00" - Preferred field
//   delivery_time_end?: string; // time string like "12:00" - Optional end time
// }

// // New Shipment interface
// export interface Shipment {
//   shipment_id?: string;
//   order_item_id: OrderItemId; // Foreign key to order item - now uses structured ID format
//   shipment_date?: string;
//   carrier?: string;
//   tracking_number?: string;
//   status: string; // 'Order received', 'Delivery', 'Cancelled', 'Return'
//   subStatus?: string; // 'Pending Confirmation', 'Order Confirmed', etc.
// }

// // Updated OrderItem with shipment info
// export interface OrderItemWithShipment extends OrderItem {
//   shipment?: Shipment;
//   packing_status?: string; // Ensure it's also in the extended interface
//   delivery_date?: number; // timestamp in milliseconds
//   delivery_time?: string; // time string like "10:00" - Legacy support
//   delivery_time_start?: string; // time string like "10:00" - Preferred field
//   delivery_time_end?: string; // time string like "12:00" - Optional end time
// }

// const ORDERS_COLLECTION = 'p_orders';
// const STATUS_COLLECTIONS_COLLECTION = 'status_collections';

// // Status Synchronization Functions

// /**
//  * Get status collection by value (e.g., "orderReceived", "cancelled")
//  */
// export const getStatusCollection = async (statusValue: string): Promise<StatusCollection | null> => {
//   try {
//     const statusQuery = query(
//       collection(db, STATUS_COLLECTIONS_COLLECTION),
//       where('value', '==', statusValue)
//     );
//     const snapshot = await getDocs(statusQuery);
    
//     if (snapshot.empty) {
//       console.warn(`Status collection not found for value: ${statusValue}`);
//       return null;
//     }
    
//     const doc = snapshot.docs[0];
//     return { id: doc.id, ...doc.data() } as StatusCollection;
//   } catch (error) {
//     console.error('Error fetching status collection:', error);
//     return null;
//   }
// };

// /**
//  * Get the default substatus for a given status value
//  */
// export const getDefaultSubstatus = async (statusValue: string): Promise<string> => {
//   const statusCollection = await getStatusCollection(statusValue);
//   if (!statusCollection) {
//     return 'Pending Confirmation'; // Default fallback
//   }
  
//   // Find the first group and return its default_value
//   const groups = statusCollection.groups;
//   const firstGroupKey = Object.keys(groups)[0];
//   if (firstGroupKey && groups[firstGroupKey]) {
//     return groups[firstGroupKey].default_value;
//   }
  
//   return 'Pending Confirmation'; // Default fallback
// };

// /**
//  * Get all possible substatus values for a given status value
//  */
// export const getSubstatusValues = async (statusValue: string): Promise<string[]> => {
//   const statusCollection = await getStatusCollection(statusValue);
//   if (!statusCollection) {
//     return ['Pending Confirmation']; // Default fallback
//   }
  
//   // Get all values from all groups
//   const allValues: string[] = [];
//   const groups = statusCollection.groups;
  
//   Object.values(groups).forEach(group => {
//     allValues.push(...group.values);
//   });
  
//   return allValues.length > 0 ? allValues : ['Pending Confirmation'];
// };

// /**
//  * Update order_item_status for all items in an order when order_status changes
//  */
// export const updateOrderItemsStatusFromOrder = async (
//   orderId: string, 
//   newOrderStatus: string, 
//   newSubStatus?: string
// ): Promise<void> => {
//   try {
//     console.log(`🔄 Updating order items status for order ${orderId} to ${newOrderStatus}`);
//     console.log(`🔍 Function called with parameters:`, { orderId, newOrderStatus, newSubStatus });
    
//     // Get all order items for this order
//     const orderItems = await getOrderItems(orderId);
//     console.log(`📦 Found ${orderItems.length} order items for order ${orderId}`);
    
//     if (orderItems.length === 0) {
//       console.log(`No order items found for order ${orderId}`);
//       return;
//     }
    
//     // Get the default substatus for the new order status
//     const defaultSubStatus = newSubStatus || await getDefaultSubstatus(newOrderStatus);
    
//     // Update each order item's order_item_status and order_item_substatus
//     const updatePromises = orderItems.map(async (item) => {
//       if (!item.order_item_id) return;
      
//       const oldStatus = item.order_item_status || 'new';
      
//       // Handle stock management for bulk status changes
//       try {
//         const { data: stocks } = await getStocksByProductId(item.product_id);
//         if (stocks && stocks.length > 0) {
//           const stockId = (item.stock_id as string) || stocks[0].id;
          
//           // Determine stock action based on status change
//           let stockAction: 'reduce' | 'restore' | 'none' = 'none';
          
//           if (newOrderStatus.toLowerCase() === 'orderreceived' && oldStatus.toLowerCase() !== 'orderreceived') {
//             // Changing TO orderReceived - reduce stock (re-order)
//             stockAction = 'reduce';
//           } else if (oldStatus.toLowerCase() === 'orderreceived' && newOrderStatus.toLowerCase() !== 'orderreceived') {
//             // Changing FROM orderReceived - restore stock (un-order)
//             stockAction = 'restore';
//           } else if (newOrderStatus.toLowerCase() === 'cancelled' && oldStatus.toLowerCase() !== 'cancelled') {
//             // Changing TO cancelled - restore stock (cancel)
//             stockAction = 'restore';
//           }
          
//           if (stockAction !== 'none') {
//             const stockDelta = stockAction === 'reduce' ? -item.quantity : +item.quantity;
//             await updateStockQuantity(item.product_id, stockId, stockDelta);
//             console.log(`📦 Bulk stock ${stockAction}d: ${Math.abs(stockDelta)} units for product ${item.product_id}`);
//           }
//         }
//       } catch (stockError) {
//         console.error(`Error managing stock for item ${item.order_item_id}:`, stockError);
//         // Don't throw here to avoid breaking the bulk update
//       }
      
//       const itemRef = doc(db, ORDER_ITEMS_COLLECTION, item.order_item_id);
//       await updateDoc(itemRef, {
//         order_item_status: newOrderStatus,
//         order_item_substatus: defaultSubStatus,
//         updated_at: getISTISOString()
//       });
      
//       console.log(`✅ Updated order item ${item.order_item_id} status to ${newOrderStatus}`);
//     });
    
//     await Promise.all(updatePromises);
//     console.log(`✅ Updated ${orderItems.length} order items for order ${orderId}`);
    
//   } catch (error) {
//     console.error('Error updating order items status from order:', error);
//     throw error;
//   }
// };

// /**
//  * Update order_status based on order_item_status aggregation
//  */
// export const updateOrderStatusFromItems = async (orderId: string): Promise<void> => {
//   try {
//     console.log(`🔄 Checking order status aggregation for order ${orderId}`);
    
//     // Get all order items for this order
//     const orderItems = await getOrderItems(orderId);
    
//     if (orderItems.length === 0) {
//       console.log(`No order items found for order ${orderId}`);
//       return;
//     }
    
//     // Group items by their order_item_status (normalize case)
//     const statusGroups: { [key: string]: OrderItem[] } = {};
//     orderItems.forEach(item => {
//       const status = (item.order_item_status || 'new').toLowerCase();
//       if (!statusGroups[status]) {
//         statusGroups[status] = [];
//       }
//       statusGroups[status].push(item);
//     });
    
//     console.log(`📊 Order ${orderId} status distribution:`, 
//       Object.entries(statusGroups).map(([status, items]) => `${status}: ${items.length}`).join(', ')
//     );
    
//     // Determine the overall order status based on item statuses
//     let newOrderStatus: string;
//     let newSubStatus: string;
    
//     // Define status priority order (higher priority = more important)
//     const statusPriority: { [key: string]: number } = {
//       'cancelled': 1,    // Highest priority
//       'return': 2,       // Return status
//       'delivered': 3,    // Delivered
//       'delivery': 4,     // In delivery
//       'orderreceived': 5, // Order received/confirmed (normalized)
//       'new': 6,          // New/pending
//     };
    
//     // Get all unique statuses and sort by priority
//     const uniqueStatuses = Object.keys(statusGroups);
//     const sortedStatuses = uniqueStatuses.sort((a, b) => {
//       const priorityA = statusPriority[a] || 999; // Unknown statuses get lowest priority
//       const priorityB = statusPriority[b] || 999;
//       return priorityA - priorityB;
//     });
    
//     console.log(`📊 Sorted statuses by priority:`, sortedStatuses);
    
//     // Map normalized status back to proper case for display
//     const statusMapping: { [key: string]: string } = {
//       'cancelled': 'cancelled',
//       'return': 'return',
//       'delivered': 'delivered',
//       'delivery': 'delivery',
//       'orderreceived': 'orderReceived',
//       'new': 'new',
//     };
    
//     if (uniqueStatuses.length === 1) {
//       // All items have the same status
//       const singleStatus = uniqueStatuses[0];
//       newOrderStatus = statusMapping[singleStatus] || singleStatus;
      
//       // Get appropriate substatus based on the status
//       if (singleStatus === 'cancelled') {
//         newSubStatus = 'Cancelled by Admin';
//       } else if (singleStatus === 'return') {
//         newSubStatus = 'Return requested';
//       } else if (singleStatus === 'delivered') {
//         newSubStatus = 'All items delivered';
//       } else if (singleStatus === 'delivery') {
//         newSubStatus = 'All items in delivery';
//       } else if (singleStatus === 'orderreceived') {
//         newSubStatus = 'Order Confirmed';
//       } else {
//         newSubStatus = 'Pending Confirmation';
//       }
//     } else {
//       // Mixed statuses - special handling for cancelled items
//       const cancelledItemsCount = statusGroups['cancelled']?.length || 0;
//       const totalItemsCount = orderItems.length;
      
//       // Check if ALL items are cancelled
//       if (cancelledItemsCount === totalItemsCount) {
//         // All items are cancelled - mark order as cancelled
//         newOrderStatus = 'cancelled';
//         newSubStatus = 'Cancelled by Admin';
//         console.log(`📊 All ${totalItemsCount} items are cancelled - marking order as cancelled`);
//       } else {
//         // Not all items are cancelled - use the highest priority non-cancelled status
//         const nonCancelledStatuses = uniqueStatuses.filter(status => status !== 'cancelled');
        
//         if (nonCancelledStatuses.length > 0) {
//           // Sort non-cancelled statuses by priority
//           const sortedNonCancelledStatuses = nonCancelledStatuses.sort((a, b) => {
//             const priorityA = statusPriority[a] || 999;
//             const priorityB = statusPriority[b] || 999;
//             return priorityA - priorityB;
//           });
          
//           const highestPriorityStatus = sortedNonCancelledStatuses[0];
//           newOrderStatus = statusMapping[highestPriorityStatus] || highestPriorityStatus;
          
//           // Create appropriate substatus for mixed statuses (excluding cancelled)
//           if (highestPriorityStatus === 'return') {
//             newSubStatus = 'Partially returned';
//           } else if (highestPriorityStatus === 'delivered') {
//             newSubStatus = 'Partially delivered';
//           } else if (highestPriorityStatus === 'delivery') {
//             newSubStatus = 'Partially in delivery';
//           } else if (highestPriorityStatus === 'orderreceived') {
//             newSubStatus = 'Partially confirmed';
//           } else {
//             newSubStatus = 'Mixed statuses';
//           }
          
//           console.log(`📊 Mixed statuses with ${cancelledItemsCount}/${totalItemsCount} cancelled - using ${highestPriorityStatus} status`);
//         } else {
//           // Fallback - should not happen, but just in case
//           newOrderStatus = 'orderReceived';
//           newSubStatus = 'Partially confirmed';
//           console.log(`⚠️ Fallback: No non-cancelled statuses found, using orderReceived`);
//         }
//       }
//     }
    
//     // Calculate order_items_status_count for delivery/delivered items
//     const deliveryItemsCount = orderItems.filter(item => {
//       const status = item.order_item_status?.toLowerCase() || item.status?.toLowerCase();
//       return status === 'delivery' || status === 'delivered';
//     }).length;
    
//     // Update the order status and delivery count
//     const orderRef = doc(db, ORDERS_COLLECTION, orderId);
//     await updateDoc(orderRef, {
//       order_status: newOrderStatus,
//       subStatus: newSubStatus,
//       order_items_status_count: deliveryItemsCount,
//       order_details_count: orderItems.length, // Update item count
//       updated_at: getISTISOString()
//     });
    
//     console.log(`✅ Updated order ${orderId} status to ${newOrderStatus} (${newSubStatus}), delivery count: ${deliveryItemsCount}/${orderItems.length}`);
    
//   } catch (error) {
//     console.error('Error updating order status from items:', error);
//     throw error;
//   }
// };

// /**
//  * Update individual order item status and trigger order status aggregation
//  */
// export const updateOrderItemStatus = async (
//   orderItemId: string, 
//   newStatus: string, 
//   newSubStatus?: string
// ): Promise<void> => {
//   try {
//     console.log(`🔄 Updating order item ${orderItemId} status to ${newStatus}`);
    
//     // Get the current order item data
//     const itemRef = doc(db, ORDER_ITEMS_COLLECTION, orderItemId);
//     const itemSnap = await getDoc(itemRef);
    
//     if (!itemSnap.exists()) {
//       throw new Error('Order item not found');
//     }
    
//     const itemData = itemSnap.data() as OrderItem;
//     const oldStatus = itemData.order_item_status || 'new';
    
//     console.log(`🔍 Status change: ${oldStatus} → ${newStatus}`);
    
//     // Handle stock management based on status changes
//     try {
//       const { data: stocks } = await getStocksByProductId(itemData.product_id);
//       if (stocks && stocks.length > 0) {
//         const stockId = (itemData.stock_id as string) || stocks[0].id;
        
//         // Determine stock action based on status change
//         let stockAction: 'reduce' | 'restore' | 'none' = 'none';
        
//         if (newStatus.toLowerCase() === 'orderreceived' && oldStatus.toLowerCase() !== 'orderreceived') {
//           // Changing TO orderReceived - reduce stock (re-order)
//           stockAction = 'reduce';
//         } else if (oldStatus.toLowerCase() === 'orderreceived' && newStatus.toLowerCase() !== 'orderreceived') {
//           // Changing FROM orderReceived - restore stock (un-order)
//           stockAction = 'restore';
//         } else if (newStatus.toLowerCase() === 'cancelled' && oldStatus.toLowerCase() !== 'cancelled') {
//           // Changing TO cancelled - restore stock (cancel)
//           stockAction = 'restore';
//         }
        
//         if (stockAction !== 'none') {
//           const stockDelta = stockAction === 'reduce' ? -itemData.quantity : +itemData.quantity;
//           await updateStockQuantity(itemData.product_id, stockId, stockDelta);
//           console.log(`📦 Stock ${stockAction}d: ${Math.abs(stockDelta)} units for product ${itemData.product_id}`);
//         } else {
//           console.log(`📦 No stock action needed for status change: ${oldStatus} → ${newStatus}`);
//         }
//       }
//     } catch (stockError) {
//       console.error('Error managing stock during status change:', stockError);
//       // Don't throw here to avoid breaking the status update
//     }
    
//     // Get the default substatus if not provided
//     const defaultSubStatus = newSubStatus || await getDefaultSubstatus(newStatus);
    
//     // Update the order item status
//     await updateDoc(itemRef, {
//       order_item_status: newStatus,
//       order_item_substatus: defaultSubStatus,
//       updated_at: getISTISOString()
//     });
    
//     console.log(`✅ Updated order item ${orderItemId} status to ${newStatus}`);
    
//     // Trigger order status aggregation
//     console.log(`🔄 Triggering order status aggregation for order ${itemData.order_id}`);
//     await updateOrderStatusFromItems(itemData.order_id);
//     console.log(`✅ Order status aggregation completed for order ${itemData.order_id}`);
    
//   } catch (error) {
//     console.error('Error updating order item status:', error);
//     throw error;
//   }
// };

// /**
//  * Manually trigger order status aggregation (useful for debugging)
//  */
// export const triggerOrderStatusAggregation = async (orderId: string): Promise<void> => {
//   try {
//     console.log(`🔧 Manually triggering order status aggregation for order ${orderId}`);
//     await updateOrderStatusFromItems(orderId);
//     console.log(`✅ Manual order status aggregation completed for order ${orderId}`);
//   } catch (error) {
//     console.error('Error in manual order status aggregation:', error);
//     throw error;
//   }
// };

// // --- Order ID Generation ---
// const BASE_ORDER_NUMBER = 1000000001; // Starting number for ORD1000000001

// /**
//  * Generates the next sequential order ID in the format ORD1000000001, ORD1000000002, etc.
//  * Uses Firestore transactions to ensure uniqueness even under concurrency.
//  * @returns Promise<string> - The next order ID
//  */
// export const generateNextOrderId = async (): Promise<OrderId> => {
//   return await runTransaction(db, async (transaction) => {
//     // Query for the latest order by ID (descending order)
//     const ordersRef = collection(db, ORDERS_COLLECTION);
//     const latestOrderQuery = query(
//       ordersRef,
//       orderBy('id', 'desc')
//     );
    
//     const snapshot = await getDocs(latestOrderQuery);
    
//     let highestNumericId = BASE_ORDER_NUMBER - 1; // Start from base - 1
    
//     // Find the highest numeric ID among ORD format IDs
//     snapshot.forEach((docSnap) => {
//       const data = docSnap.data();
//       const orderId = data.id || docSnap.id;
      
//       if (typeof orderId === 'string' && orderId.startsWith('ORD')) {
//         const numericPart = orderId.substring(3); // Remove 'ORD' prefix
//         const numericId = parseInt(numericPart, 10);
        
//         if (!isNaN(numericId) && numericId > highestNumericId) {
//           highestNumericId = numericId;
//         }
//       }
//     });
    
//     // Generate next sequential ID
//     const nextNumericId = highestNumericId + 1;
//     const newOrderId = `ORD${nextNumericId}` as OrderId;
    
//     // Validate the generated ID
//     if (!isValidOrderId(newOrderId)) {
//       throw new Error(`Generated invalid order ID: ${newOrderId}`);
//     }
    
//     // Verify the ID doesn't already exist (extra safety check)
//     const existingOrderRef = doc(db, ORDERS_COLLECTION, newOrderId);
//     const existingOrderSnap = await getDoc(existingOrderRef);
    
//     if (existingOrderSnap.exists()) {
//       throw new Error(`Order ID ${newOrderId} already exists`);
//     }
    
//     return newOrderId;
//   });
// };

// // Get all orders
// export const getAllOrders = async () => {
//   const ordersCol = collection(db, ORDERS_COLLECTION);
//   const snapshot = await getDocs(ordersCol);
//   const orders: Order[] = [];
//   snapshot.forEach(docSnap => {
//     const data = docSnap.data();
//     orders.push({ ...data, id: docSnap.id } as Order);
//   });
//   return orders;
// };

// // Get order by ID, optionally with order items
// export const getOrderById = async (orderId: string, includeItems: boolean = false) => {
//   const orderRef = doc(db, ORDERS_COLLECTION, orderId);
//   const orderSnap = await getDoc(orderRef);
//   if (!orderSnap.exists()) {
//     return null;
//   }
//   const order = { ...orderSnap.data(), id: orderSnap.id } as Order;

//   if (includeItems) {
//     const itemsQuery = query(
//       collection(db, ORDER_ITEMS_COLLECTION),
//       where('order_id', '==', orderId)
//     );
//     const itemsSnap = await getDocs(itemsQuery);
//     const items: OrderItem[] = [];
//     itemsSnap.forEach(itemSnap => {
//       items.push({ order_item_id: itemSnap.id, ...itemSnap.data() } as OrderItem);
//     });
//     return { ...order, items };
//   }
//   return order;
// };

// // Helper function to clean undefined values
// const cleanUndefinedValues = <T,>(obj: T): T => {
//   if (obj === null || obj === undefined) return null as T;
//   if (typeof obj !== 'object') return obj;
//   if (Array.isArray(obj)) return obj.map(cleanUndefinedValues) as T;
  
//   const cleaned: Record<string, unknown> = {};
//   for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
//     if (value !== undefined) {
//       cleaned[key] = cleanUndefinedValues(value);
//     }
//   }
//   return cleaned as T;
// };

// // Create order with proper order items and shipments
// export const createOrder = async (payload: Partial<Order>) => {
//   const orderId = payload.id || await generateNextOrderId();
//   const now = getISTISOString();
  
//   // Create main order (without products object)
//   const { products, ...orderData } = payload;
//   const order: Order = {
//     ...orderData,
//     id: orderId,
//     order_items_status_count: 0, // Initialize status count
//     created_at: now,
//     updated_at: now,
//   } as Order;
  
//   // Clean undefined values before saving
//   const cleanedOrder = cleanUndefinedValues(order);
//   await setDoc(doc(db, ORDERS_COLLECTION, orderId), cleanedOrder);

//   // Create order items and shipments from products
//   if (products) {
//     for (const [productId, quantity] of Object.entries(products)) {
//       // Get product price for subtotal calculation
//       const { data: productData } = await getAllProductsById('', productId);
//       const price = productData?.stocks?.[0]?.price || 0;
      
//       // Reduce stock quantity
//       const { data: stocks } = await getStocksByProductId(productId);
//       if (stocks && stocks.length > 0) {
//         const stock = stocks[0];
//         const newQty = Math.max(0, (stock.quantity || 0) - Number(quantity));
//         await updateDoc(doc(db, 'T_stocks', stock.id), { 
//           quantity: newQty,
//           updated_at: getISTISOString()
//         });
//       }
      
//       const orderItem: OrderItem = {
//         order_item_id: await generateNextOrderItemId(),
//         order_id: orderId,
//         product_id: productId,
//         quantity: Number(quantity),
//         subtotal: price * Number(quantity),
//         status: 'Active',
//         order_item_status: 'new', // Default status from status APIs
//         order_item_substatus: 'Pending Confirmation', // Default substatus
//       };
      
//       await addOrUpdateOrderItem(orderId, orderItem);
//     }
    
//     // Calculate and update order_items_status_count after all items are created
//     const allOrderItems = await getOrderItems(orderId);
//     const deliveryItemsCount = allOrderItems.filter(item => {
//       const status = item.order_item_status?.toLowerCase() || item.status?.toLowerCase();
//       return status === 'delivery' || status === 'delivered';
//     }).length;
    
//     // Calculate products_price (sum of all order items subtotals) and other_charges
//     const productsPrice = allOrderItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
//     const orderTotal = cleanedOrder.total_price || 0;
//     const otherCharges = Math.max(0, orderTotal - productsPrice); // Other charges (delivery, taxes, etc.)
    
//     await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
//       order_items_status_count: deliveryItemsCount,
//       products_price: productsPrice,
//       other_charges: otherCharges,
//       updated_at: getISTISOString()
//     });
//   }
  
//   // Trigger analytics update for order creation
//   try {
//     await handleOrderCreated(cleanedOrder);
//   } catch (err) {
//     console.error('Failed to update order analytics:', err);
//   }

//   // Notifications are persisted by the realtime listener to avoid duplicates
  
//   return order;
// };

// // Update an order (main document only)
// export const updateOrder = async (orderId: string, updates: Partial<Order>) => {
//   const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  
//   // Get the current order data before updating
//   const currentSnap = await getDoc(orderRef);
//   const oldOrder = currentSnap.exists() ? currentSnap.data() as Order : {};
  
//   const now = getISTISOString();
//   await updateDoc(orderRef, { ...updates, updated_at: now });
  
//   const updatedSnap = await getDoc(orderRef);
//   const newOrder = updatedSnap.exists() ? updatedSnap.data() as Order : {};
  
//   // Check if order_status or subStatus changed and sync to order items
//   const orderStatusChanged = updates.order_status && updates.order_status !== (oldOrder as Order).order_status;
//   const subStatusChanged = updates.subStatus && updates.subStatus !== (oldOrder as Order).subStatus;
  
//   console.log(`🔍 Checking order status/substatus change:`, {
//     orderId,
//     updatesOrderStatus: updates.order_status,
//     oldOrderStatus: (oldOrder as Order).order_status,
//     updatesSubStatus: updates.subStatus,
//     oldSubStatus: (oldOrder as Order).subStatus,
//     orderStatusChanged,
//     subStatusChanged
//   });
  
//   if (orderStatusChanged || subStatusChanged) {
//     try {
//       // Use the new order_status if provided, otherwise use the current one
//       let orderStatus: string = '';
//       if (typeof updates.order_status === 'string') {
//         orderStatus = updates.order_status;
//       } else {
//         const oldOrderStatus = (oldOrder as Order).order_status;
//         if (typeof oldOrderStatus === 'string') {
//           orderStatus = oldOrderStatus;
//         }
//       }
      
//       const subStatus: string | undefined = typeof updates.subStatus === 'string' 
//         ? updates.subStatus 
//         : undefined;
      
//       if (orderStatusChanged) {
//         console.log(`🔄 Order status changed from ${(oldOrder as Order).order_status} to ${orderStatus}`);
//       }
//       if (subStatusChanged) {
//         console.log(`🔄 Order substatus changed from ${(oldOrder as Order).subStatus} to ${subStatus}`);
//       }
      
//       await updateOrderItemsStatusFromOrder(orderId, orderStatus, subStatus);
//     } catch (error) {
//       console.error('Error syncing order status to order items:', error);
//       // Don't throw here to avoid breaking the order update
//     }
//   } else {
//     console.log(`⚠️ Order status/substatus sync skipped:`, {
//       reason: !orderStatusChanged && !subStatusChanged ? 'Neither status nor substatus changed' : 'Unknown',
//       updatesOrderStatus: updates.order_status,
//       oldOrderStatus: (oldOrder as Order).order_status,
//       updatesSubStatus: updates.subStatus,
//       oldSubStatus: (oldOrder as Order).subStatus
//     });
//   }
  
//   // Update analytics if the order changed
//   try {
//     await handleOrderUpdated(orderId, oldOrder, newOrder);
//   } catch (error) {
//     console.error('❌ Failed to update order analytics:', error);
//     console.error('🔍 Order update analytics error details:', {
//       orderId,
//       oldOrder: { 
//         total_price: (oldOrder as Order).total_price, 
//         status: (oldOrder as Order).status, 
//         order_status: (oldOrder as Order).order_status 
//       },
//       newOrder: { 
//         total_price: (newOrder as Order).total_price, 
//         status: (newOrder as Order).status, 
//         order_status: (newOrder as Order).order_status 
//       },
//       errorMessage: error instanceof Error ? error.message : String(error)
//     });
//     // Don't throw here to avoid breaking the order update, but log the issue
//   }
//   // Notifications are persisted by the realtime listener to avoid duplicates
  
//   return { ...newOrder, id: updatedSnap.id } as Order;
// };

// // Delete an order and its order items
// export const deleteOrder = async (orderId: string) => {
//   // Get the order data before deletion for analytics
//   const orderRef = doc(db, ORDERS_COLLECTION, orderId);
//   const orderSnap = await getDoc(orderRef);
//   const orderToDelete = orderSnap.exists() ? orderSnap.data() as Order : {};
  
//   // Delete order items from separate collection first
//   const itemsQuery = query(
//     collection(db, ORDER_ITEMS_COLLECTION),
//     where('order_id', '==', orderId)
//   );
//   const itemsSnap = await getDocs(itemsQuery);
//   for (const itemDoc of itemsSnap.docs) {
//     await deleteDoc(doc(db, ORDER_ITEMS_COLLECTION, itemDoc.id));
//   }
  
//   // Then delete the main order document
//   await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
  
//   // Update analytics for order deletion
//   try {
//     await handleOrderDeleted({ ...orderToDelete, id: orderId });
//   } catch (error) {
//     console.error('Failed to update order deletion analytics:', error);
//     // Don't throw here to avoid breaking the order deletion
//   }
  
//   return true;
// };

// // Helper function to extract product name from product data
// const getProductName = (product: any): string => {
//   if (!product) return '';
  
//   // Try translation.title first
//   if (product.translation?.title) {
//     return product.translation.title;
//   }
  
//   // Try title object (multi-language)
//   if (product.title && typeof product.title === 'object') {
//     const titleValues = Object.values(product.title as Record<string, string>);
//     if (titleValues.length > 0) {
//       return titleValues[0] as string;
//     }
//   }
  
//   // Try title as string
//   if (typeof product.title === 'string') {
//     return product.title;
//   }
  
//   return '';
// };

// // Helper: Add or update an order item with shipment
// export const addOrUpdateOrderItem = async (orderId: string, item: OrderItem) => {
//   const itemId = item.order_item_id || await generateNextOrderItemId();
//   const itemRef = doc(db, ORDER_ITEMS_COLLECTION, itemId);
  
//   // Get the current order data before updating
//   const orderRef = doc(db, ORDERS_COLLECTION, orderId);
//   const currentOrderSnap = await getDoc(orderRef);
//   const oldOrder = currentOrderSnap.exists() ? currentOrderSnap.data() as Order : {};
  
//   // Fetch product data to get product name
//   let productName = item.name || ''; // Use existing name if available
//   if (!productName && item.product_id) {
//     try {
//       const { data: productData } = await getAllProductsById('', item.product_id);
//       productName = getProductName(productData);
//     } catch (error) {
//       console.error(`Error fetching product name for ${item.product_id}:`, error);
//     }
//   }
  
//   const now = getISTISOString();
//   const orderItemData = {
//     ...item,
//     order_item_id: itemId,
//     order_id: orderId, // Ensure order_id is set
//     name: productName, // Add product name
//     created_at: item.created_at || now, // Use existing created_at or set to now
//     updated_at: now, // Always update the updated_at timestamp
//   };
  
//   await setDoc(itemRef, orderItemData);
  
//   // Always ensure a shipment exists for this order item
//   const existingShipments = await getShipmentsByOrderItem(itemId);
//   if (existingShipments.length === 0) {
//     await createShipment(itemId, { 
//       status: 'Order received',
//       subStatus: 'Pending Confirmation',
//       shipment_date: getISTISOString()
//     });
//   }
  
//   // Recalculate order total after item addition/update
//   const allOrderItems = await getOrderItems(orderId);
//   const activeItems = allOrderItems.filter(item => item.status?.toLowerCase() !== 'cancelled');
//   const newTotalPrice = activeItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  
//   // Calculate order_items_status_count for delivery/delivered items
//   const deliveryItemsCount = allOrderItems.filter(item => {
//     const status = item.order_item_status?.toLowerCase() || item.status?.toLowerCase();
//     return status === 'delivery' || status === 'delivered';
//   }).length;
  
//   // Update order with new total, status count, and item count
//   await updateDoc(orderRef, { 
//     total_price: newTotalPrice,
//     order_items_status_count: deliveryItemsCount,
//     order_details_count: allOrderItems.length, // Update item count to include free items
//     updated_at: getISTISOString()
//   });
  
//   const updatedOrderSnap = await getDoc(orderRef);
//   const newOrder = updatedOrderSnap.exists() ? updatedOrderSnap.data() as Order : {};
  
//   // Update analytics if the order total changed
//   try {
//     await handleOrderUpdated(orderId, oldOrder, newOrder);
//   } catch (error) {
//     console.error('Failed to update order analytics after item addition/update:', error);
//     // Don't throw here to avoid breaking the item addition/update
//   }
  
//   return { ...orderItemData };
// };

// // New: Create shipment for order item
// export const createShipment = async (orderItemId: string, shipmentData: Partial<Shipment>) => {
//   const shipmentId = uuidv4();
//   const shipmentRef = doc(db, 'shipments', shipmentId);
  
//   const shipment: Shipment = {
//     shipment_id: shipmentId,
//     order_item_id: orderItemId,
//     status: 'Order received',
//     subStatus: 'Pending Confirmation',
//     carrier: '',
//     tracking_number: '',
//     shipment_date: getISTISOString(),
//     ...shipmentData,
//   };
  
//   await setDoc(shipmentRef, shipment);
//   return shipment;
// };

// // New: Get shipments for order item
// export const getShipmentsByOrderItem = async (orderItemId: string): Promise<Shipment[]> => {
//   const shipmentsQuery = query(
//     collection(db, 'shipments'),
//     where('order_item_id', '==', orderItemId)
//   );
  
//   const snapshot = await getDocs(shipmentsQuery);
//   return snapshot.docs.map(doc => ({ shipment_id: doc.id, ...doc.data() } as Shipment));
// };

// // New: Update shipment
// export const updateShipment = async (shipmentId: string, updates: Partial<Shipment>) => {
//   try {
//     const shipmentRef = doc(db, 'shipments', shipmentId);
    
//     // Check if shipment exists
//     const shipmentSnap = await getDoc(shipmentRef);
//     if (!shipmentSnap.exists()) {
//       throw new Error(`Shipment with ID ${shipmentId} not found`);
//     }
    
//     const updateData = {
//       ...updates,
//       updated_at: getISTISOString()
//     };
    
//     await updateDoc(shipmentRef, updateData);
    
//     // Return updated shipment data
//     const updatedSnap = await getDoc(shipmentRef);
//     return { shipment_id: shipmentId, ...updatedSnap.data() } as Shipment;
//   } catch (error) {
//     console.error('Error updating shipment:', error);
//     throw error;
//   }
// };

// // Updated calculateOrder to return data compatible with new structure
// export const calculateOrder = async (params: string) => {
//   // Parse the query string parameters
//   const urlParams = new URLSearchParams(params);
//   const products = urlParams.get('products');
//   const currency_id = urlParams.get('currency_id');
//   const shop_id = urlParams.get('shop_id');
//   const type = urlParams.get('type');
//   const tips = urlParams.get('tips');
//   const address = urlParams.get('address');
//   const coupon = urlParams.get('coupon');

//   let totalPrice = 0;
//   let totalTax = 0;
//   let totalDiscount = 0;
//   let orderItems: OrderItem[] = [];

//   if (products) {
//     try {
//       const productsArray = JSON.parse(products);
//       orderItems = productsArray.map((product: Record<string, unknown>) => {
//         const price = Number(product.price) || 0;
//         const quantity = Number(product.quantity) || 0;
//         const subtotal = price * quantity;
//         totalPrice += subtotal;
//                  return {
//            product_id: product.product_id as string || uuidv4(),
//            quantity,
//            subtotal,
//            shipment: { status: 'Order received', subStatus: 'Pending Confirmation' },
//          };
//       });
//       totalTax = totalPrice * 0.1; // 10% tax
//     } catch (error) {
//       console.error('Error parsing products:', error);
//     }
//   }

//   if (coupon) {
//     totalDiscount = totalPrice * 0.05; // 5% discount for coupon
//   }

//   const tipsAmount = tips ? parseFloat(tips) : 0;

//   return {
//     data: {
//       data: {
//         total_price: totalPrice + totalTax - totalDiscount + tipsAmount,
//         total_tax: totalTax,
//         total_discount: totalDiscount,
//         total_tips: tipsAmount,
//         currency: {
//           id: currency_id || 1,
//           title: 'INR',
//           symbol: '₹',
//         },
//         shop: {
//           id: shop_id || 1,
//           name: 'Default Shop',
//         },
//         order_items: orderItems, // Updated to return structured items instead of stocks
//       },
//     },
//   };
// };

// // Helper: Get all order items for an order with better logging
// export const getOrderItems = async (orderId: string): Promise<OrderItem[]> => {
//   const itemsQuery = query(
//     collection(db, ORDER_ITEMS_COLLECTION),
//     where('order_id', '==', orderId)
//   );
//   const itemsSnap = await getDocs(itemsQuery);
  
//   const items = itemsSnap.docs.map(doc => {
//     const data = { order_item_id: doc.id, ...doc.data() } as OrderItem;
//     return data;
//   });
  
//   return items;
// };

// // Real-time order items listener
// export const subscribeToOrderItems = (
//   orderId: string, 
//   callback: (items: OrderItem[]) => void,
//   onError?: (error: Error) => void
// ): (() => void) => {
//   const itemsQuery = query(
//     collection(db, ORDER_ITEMS_COLLECTION),
//     where('order_id', '==', orderId)
//   );
  
//   const unsubscribe = onSnapshot(
//     itemsQuery,
//     (snapshot) => {
//       const items: OrderItem[] = [];
//       snapshot.forEach(doc => {
//         const data = { order_item_id: doc.id, ...doc.data() } as OrderItem;
//         items.push(data);
//       });
//       callback(items);
//     },
//     (error) => {
//       console.error('Error in order items snapshot:', error);
//       if (onError) {
//         onError(error);
//       }
//     }
//   );
  
//   return unsubscribe;
// };

// // Helper: Update an existing order item
// export const updateOrderItem = async (orderId: string, item: OrderItem) => {
//   if (!item.order_item_id) {
//     throw new Error('Order item ID is required for update');
//   }
  
//   // Get the current order data before updating
//   const orderRef = doc(db, ORDERS_COLLECTION, orderId);
//   const currentOrderSnap = await getDoc(orderRef);
//   const oldOrder = currentOrderSnap.exists() ? currentOrderSnap.data() as Order : {};
  
//   // Get the current order item data to check for status changes
//   const itemRef = doc(db, ORDER_ITEMS_COLLECTION, item.order_item_id);
//   const currentItemSnap = await getDoc(itemRef);
//   const oldItem = currentItemSnap.exists() ? currentItemSnap.data() as OrderItem : {};
  
//   const updateData = { 
//     ...item, 
//     order_id: orderId,
//     updated_at: getISTISOString()
//   };
//   delete (updateData as Record<string, unknown>).order_item_id; // Remove the ID from update data
//   await updateDoc(itemRef, updateData);
  
//   // Check if order_item_status changed and sync to order
//   if (item.order_item_status && item.order_item_status !== (oldItem as OrderItem).order_item_status) {
//     try {
//       console.log(`🔄 Order item ${item.order_item_id} status changed from ${(oldItem as OrderItem).order_item_status} to ${item.order_item_status}`);
//       await updateOrderStatusFromItems(orderId);
//     } catch (error) {
//       console.error('Error syncing order item status to order:', error);
//       // Don't throw here to avoid breaking the item update
//     }
//   }
  
//   // Recalculate order total after item update
//   const allOrderItems = await getOrderItems(orderId);
//   const activeItems = allOrderItems.filter(item => item.status?.toLowerCase() !== 'cancelled');
//   const newTotalPrice = activeItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  
//   // Calculate order_items_status_count for delivery/delivered items
//   const deliveryItemsCount = allOrderItems.filter(item => {
//     const status = item.order_item_status?.toLowerCase() || item.status?.toLowerCase();
//     return status === 'delivery' || status === 'delivered';
//   }).length;
  
//   // Update order with new total, status count, and item count
//   await updateDoc(orderRef, { 
//     total_price: newTotalPrice,
//     order_items_status_count: deliveryItemsCount,
//     order_details_count: allOrderItems.length, // Update item count to include free items
//     updated_at: getISTISOString()
//   });
  
//   const updatedOrderSnap = await getDoc(orderRef);
//   const newOrder = updatedOrderSnap.exists() ? updatedOrderSnap.data() as Order : {};
  
//   // Update analytics if the order total changed
//   try {
//     await handleOrderUpdated(orderId, oldOrder, newOrder);
//   } catch (error) {
//     console.error('Failed to update order analytics after item update:', error);
//     // Don't throw here to avoid breaking the item update
//   }
  
//   return item;
// };

// // Cancel an individual order item
// export const cancelOrderItem = async (orderItemId: string, reason: string, cancelledBy: string = 'Admin') => {
//   const itemRef = doc(db, ORDER_ITEMS_COLLECTION, orderItemId);
//   const itemSnap = await getDoc(itemRef);
  
//   if (!itemSnap.exists()) {
//     throw new Error('Order item not found');
//   }
  
//   const itemData = itemSnap.data() as OrderItem;
  
//   // Update order item status - use order_item_status instead of status
//   await updateDoc(itemRef, {
//     status: 'cancelled', // Keep this for backward compatibility
//     order_item_status: 'cancelled', // Use this for status synchronization
//     order_item_substatus: 'Cancelled by Admin', // Set appropriate substatus
//     cancellation_reason: reason,
//     cancelled_at: getISTISOString(),
//     cancelled_by: cancelledBy,
//     updated_at: getISTISOString(),
//   });

//   // Trigger order status aggregation based on order_item_status changes
//   try {
//     await updateOrderStatusFromItems(itemData.order_id);
//   } catch (error) {
//     console.error('Error updating order status from cancelled item:', error);
//     // Don't throw here to avoid breaking the cancellation
//   }

//   // Restock the cancelled item using the centralized updateStockQuantity function
//   const { data: stocks } = await getStocksByProductId(itemData.product_id);
//   if (stocks && stocks.length > 0) {
//     const stockId = (itemData.stock_id as string) || stocks[0].id;
//     await updateStockQuantity(itemData.product_id, stockId, +itemData.quantity); // Positive to restore stock
//   }
// };

// // Cancel an entire order and restore all stock quantities
// export const cancelOrder = async (orderId: string, reason: string, cancelledBy: string = 'Admin') => {
//   try {
//     // 1. Get the order and verify it exists
//     const orderRef = doc(db, ORDERS_COLLECTION, orderId);
//     const orderSnap = await getDoc(orderRef);
    
//     if (!orderSnap.exists()) {
//       throw new Error('Order not found');
//     }
    
//     const orderData = orderSnap.data() as Order;
    
//     // 2. Check if order is already cancelled
//     if (typeof orderData.order_status === 'string' && orderData.order_status.toLowerCase() === 'cancelled') {
//       console.log('Order is already cancelled, skipping duplicate cancellation');
//       return { success: true, message: 'Order already cancelled' };
//     }
    
//     // 3. Get all order items for this order
//     const orderItems = await getOrderItems(orderId);
    
//     if (orderItems.length === 0) {
//       console.log('No order items found for order, proceeding with order cancellation only');
//     }
    
//     // 4. Cancel all order items and restore stock quantities
//     let totalCancelledValue = 0;
//     let restoredItems = 0;
    
//     for (const item of orderItems) {
//       if (item.order_item_id && item.status?.toLowerCase() !== 'cancelled') {
//         try {
//           // Cancel the order item
//           await cancelOrderItem(item.order_item_id, reason, cancelledBy);
//           totalCancelledValue += item.subtotal || 0;
//           restoredItems++;
//         } catch (error) {
//           console.error(`Failed to cancel order item ${item.order_item_id}:`, error);
//           // Continue with other items even if one fails
//         }
//       }
//     }
    
//     // 5. Update order status to cancelled - this will trigger order items status sync
//     // Note: We don't need to call updateOrder here because cancelOrderItem already handles
//     // the status updates and stock restoration. Calling updateOrder would cause double stock restoration.
//     const orderDocRef = doc(db, ORDERS_COLLECTION, orderId);
//     await updateDoc(orderDocRef, {
//       order_status: 'cancelled',
//       subStatus: 'Cancelled by Admin',
//       cancellation_reason: reason,
//       cancelled_at: getISTISOString(),
//       cancelled_by: cancelledBy,
//       updated_at: getISTISOString()
//     });
    
//     console.log(`✅ Order ${orderId} cancelled successfully. Stock restored for ${restoredItems} items.`);
    
//     // 6. Handle legacy products object if it exists (for backward compatibility)
//     // NOTE: Disabled to prevent double stock restoration. Stock is now handled by cancelOrderItem.
//     if (false && orderData.products && typeof orderData.products === 'object') {
//       console.log('Processing legacy products object for stock restoration');
//       for (const [productId, qty] of Object.entries(orderData.products)) {
//         try {
//           const { data: stocks } = await getStocksByProductId(productId);
//           if (stocks && stocks.length > 0) {
//             const stock = stocks[0];
//             const newQty = (stock.quantity || 0) + Number(qty);
//             await updateDoc(doc(db, 'T_stocks', stock.id), { 
//               quantity: newQty,
//               updated_at: getISTISOString()
//             });
//             console.log(`Restored ${qty} units for product ${productId}`);
//           }
//         } catch (error) {
//           console.error(`Failed to restore stock for product ${productId}:`, error);
//         }
//       }
//     }
    
//     console.log(`⚠️ Legacy products object processing disabled to prevent double stock restoration`);
    
//           // 7. Update analytics for the cancelled order
//       try {
//         await handleOrderUpdated(
//           orderId,
//           { 
//             total_price: orderData.total_price, 
//             status: (orderData.status as string) || 'new', 
//             order_status: (orderData.order_status as string) || 'new',
//             created_at: orderData.created_at 
//           },
//           { 
//             total_price: orderData.total_price, 
//             status: 'cancelled', 
//             order_status: 'cancelled',
//             created_at: orderData.created_at 
//           }
//         );
//     } catch (error) {
//       console.error('Failed to update order analytics after cancellation:', error);
//       // Don't throw here to avoid breaking the cancellation process
//     }
    
//     console.log(`✅ Order ${orderId} cancelled successfully. Restored ${restoredItems} items with total value: ${totalCancelledValue}`);
    
//     return {
//       success: true,
//       orderId,
//       cancelledItems: restoredItems,
//       totalCancelledValue,
//       message: `Order cancelled successfully. ${restoredItems} items restored to inventory.`
//     };
    
//   } catch (error) {
//     console.error('Error cancelling order:', error);
//     throw error;
//   }
// };

// // Database trigger function for automatic stock restoration when order status changes
// export const handleOrderStatusChange = async (orderId: string, oldStatus: string, newStatus: string) => {
//   try {
//     // Only process when status changes to cancelled
//     if (newStatus?.toLowerCase() === 'cancelled' && oldStatus?.toLowerCase() !== 'cancelled') {
//       console.log(`🔄 Order ${orderId} status changed to cancelled, checking for stock restoration`);
      
//       // Get all order items for this order
//       const orderItems = await getOrderItems(orderId);
      
//       let restoredItems = 0;
      
//       for (const item of orderItems) {
//         if (item.status?.toLowerCase() !== 'cancelled') {
//           try {
//             // NOTE: Stock restoration disabled to prevent double restoration
//             // Stock is now handled by cancelOrderItem function
//             console.log(`⚠️ Stock restoration disabled for product ${item.product_id} to prevent double restoration`);
            
//             // Update order item status to cancelled (but don't restore stock)
//             if (item.order_item_id) {
//               await updateDoc(doc(db, ORDER_ITEMS_COLLECTION, item.order_item_id), {
//                 status: 'cancelled',
//                 cancellation_reason: 'Order cancelled',
//                 cancelled_at: getISTISOString(),
//                 cancelled_by: 'System',
//                 updated_at: getISTISOString()
//               });
//             }
            
//             restoredItems++;
//             console.log(`✅ Updated order item ${item.order_item_id} status to cancelled (no stock restoration)`);
//           } catch (error) {
//             console.error(`Failed to restore stock for product ${item.product_id}:`, error);
//           }
//         }
//       }
      
//       console.log(`🔄 Order item status updates completed for order ${orderId}. Updated ${restoredItems} items (no stock restoration).`);
//       return { success: true, restoredItems };
//     }
    
//     return { success: true, message: 'No action needed for this status change' };
    
//   } catch (error) {
//     console.error('Error in handleOrderStatusChange:', error);
//     throw error;
//   }
// };







// // ----------------------------------------------------------------------------------------------------


// // q_payouts.ts file




// export interface Transaction {
//   // Firestore document id (auto-generated)
//   docId?: string;
//   // Nested order id inside the document data, e.g. "ORD1000000006"
//   id?: string;
//   userid?: string;
//   price?: number;
//   status_description?: string;
//   perform_time?: string;
//   [key: string]: unknown;
// }

// export interface Payout {
//   orderId: string;
//   userName: string;
//   status: string;
//   price: number;
//   date: string;
// }

// // Get all transactions from p_transactions collection
// export const getAllTransactions = async () => {
//   try {
//     const transactionsQuery = query(collection(db, 'p_transactions'));
//     const querySnapshot = await getDocs(transactionsQuery);
//     const transactions: Transaction[] = querySnapshot.docs.map((docSnap) => {
//       // Do NOT overwrite the nested `id` field from data; keep Firestore doc id separately
//       const data = docSnap.data() as Omit<Transaction, 'docId'>;
//       return { ...data, docId: docSnap.id } as Transaction;
//     });
//     return transactions;
//   } catch (error) {
//     console.error('Error fetching transactions:', error);
//     throw error;
//   }
// };

// // Get transaction by Firestore document ID
// export const getTransactionById = async (transactionDocId: string) => {
//   try {
//     const transactions = await getAllTransactions();
//     return transactions.find(t => t.docId === transactionDocId);
//   } catch (error) {
//     console.error('Error fetching transaction by ID:', error);
//     throw error;
//   }
// };

// // Subscribe to real-time transaction updates
// export const subscribeToTransactions = (callback: (transactions: Transaction[]) => void) => {
//   const transactionsQuery = query(collection(db, 'p_transactions'));
//   return onSnapshot(transactionsQuery, (querySnapshot) => {
//     const transactions: Transaction[] = querySnapshot.docs.map((docSnap) => {
//       const data = docSnap.data() as Omit<Transaction, 'docId'>;
//       return { ...data, docId: docSnap.id } as Transaction;
//     });
//     callback(transactions);
//   });
// };

// // Create a new transaction
// export const createTransaction = async (transactionData: {
//   id?: string; // Order ID
//   userid?: string;
//   price?: number;
//   status_description?: string;
//   perform_time?: string;
//   [key: string]: unknown;
// }) => {
//   try {
//     const transactionsRef = collection(db, 'p_transactions');
//     const transaction = {
//       ...transactionData,
//       perform_time: transactionData.perform_time || getISTISOString(),
//     };
//     const docRef = await addDoc(transactionsRef, transaction);
//     return { success: true, docId: docRef.id, transaction };
//   } catch (error) {
//     console.error('Error creating transaction:', error);
//     throw error;
//   }
// };






// // ----------------------------------------------------------------------------------------------------


// // q_products.ts file


// // Note: getAllCategoriesById is imported inline where needed

// // --- Types ---
// export interface Translation {
//   locale: string;
//   title: string;
//   description: string;
// }

// // --- Product ID Generation ---
// const BASE_PRODUCT_NUMBER = 1000000001; // Starting number for PRD1000000001

// /**
//  * Generates the next sequential product ID in the format PRD1000000001, PRD1000000002, etc.
//  * Uses Firestore transactions to ensure uniqueness even under concurrency.
//  * @returns Promise<string> - The next product ID
//  */
// export const generateNextProductId = async (): Promise<string> => {
//   return await runTransaction(db, async (transaction) => {
//     // Query for the latest product by ID (descending order)
//     const productsRef = collection(db, 'T_products');
//     const latestProductQuery = query(
//       productsRef,
//       orderBy('id', 'desc')
//     );
    
//     const snapshot = await getDocs(latestProductQuery);
    
//     let nextNumber = BASE_PRODUCT_NUMBER;
    
//     if (!snapshot.empty) {
//       // Find the highest numeric ID
//       let highestNumber = BASE_PRODUCT_NUMBER - 1;
      
//       for (const docSnap of snapshot.docs) {
//         const productId = docSnap.data().id as string;
        
//         // Check if this is a PRD format ID
//         if (productId && productId.startsWith('PRD')) {
//           const numericPart = productId.substring(3); // Remove 'PRD' prefix
//           const number = parseInt(numericPart, 10);
          
//           if (!isNaN(number) && number > highestNumber) {
//             highestNumber = number;
//           }
//         }
//       }
      
//       nextNumber = highestNumber + 1;
//     }
    
//     // Generate the new ID
//     const newProductId = `PRD${nextNumber}`;
    
//     // Verify the ID doesn't already exist (extra safety check)
//     const existingProductRef = doc(productsRef, newProductId);
//     const existingProduct = await getDoc(existingProductRef);
    
//     if (existingProduct.exists()) {
//       throw new Error(`Product ID ${newProductId} already exists. This should not happen.`);
//     }
    
//     return newProductId;
//   });
// };

// export interface ProductPayload {
//   params: Record<string, unknown>;
// }

// export interface ActiveSku {
//   sku: string;
//   variant_name: string;
//   quantity: number;
//   price: number;
//   strike_price: number;
// }

// export interface Product {
//   uuid: string;
//   id: string;
//   img: string;
//   images: string[];
//   tax: number;
//   interval: number;
//   min_qty: number;
//   max_qty: number;
//   brand_id: string | null;
//   category_id: string | null;
//   sub_category_id: string | null;
//   unit_id: string | null;
//   kitchen_id: string | null;
//   active: number;
//   subscription_enabled?: boolean;
//   is_show_in_homescreen: boolean;
//   show_in: string[];
//   status: string;
//   type: string;
//   created_at: number;
//   updated_at: number;
//   title: Record<string, string>;
//   translations: Translation[];
//   translation: Translation & { id: string };
//   locales: string[];
//   price: number;
//   strike_price?: number;
//   discount_percent?: number;
//   sku?: string;
//   shopTitle?: string;
//   category?: string;
//   // Default variant label (e.g., lowest-priced extra value)
//   default?: string;
//   // Additional fields for complete product data
//   stocks?: Stock[];
//   categoryData?: Record<string, unknown>;
//   brandData?: Record<string, unknown>;
//   unitData?: Record<string, unknown>;
//   kitchenData?: Record<string, unknown>;
//   extras?: unknown;
//   extraGroups?: Record<string, unknown>[];
//   extraValues?: Record<string, unknown>[];
//   active_sku?: ActiveSku | null;
//   [key: string]: unknown;
// }

// export const PRODUCT_STATUS = {
//   PENDING: 'pending',
//   PUBLISHED: 'published',
//   UNPUBLISHED: 'unpublished',
// } as const;

// type ProductStatus = typeof PRODUCT_STATUS[keyof typeof PRODUCT_STATUS];

// const isValidStatus = (status: unknown): status is ProductStatus => {
//   return typeof status === 'string' && Object.values(PRODUCT_STATUS).includes(status as ProductStatus);
// };

// function replaceUndefined(obj: unknown): unknown {
//   if (Array.isArray(obj)) {
//     return obj.map(replaceUndefined);
//   } else if (obj !== null && typeof obj === 'object') {
//     return Object.fromEntries(
//       Object.entries(obj as Record<string, unknown>).map(([key, value]) => [key, replaceUndefined(value)])
//     );
//   } else if (typeof obj === 'undefined') {
//     return '';
//   } else {
//     return obj;
//   }
// }

// // Add a type for populated extras
// export interface PopulatedExtra {
//   id: string;
//   value: string;
//   extra_group_id?: string;
//   group?: {
//     id: string;
//     translation?: { title: string };
//   } | null;
// }

// // export const createProductsDb = async (orgId: string, payload: ProductPayload) => {
// //   const filesCollectionRef = collection(db, 'T_products');
// //   const { params } = payload;
// //   const uuid = uuidv4();
// //   const translationId = uuidv4();
// //   const translations: Translation[] = [];
// //   const locales: string[] = [];
// //   const titleData: Record<string, string> = {};
// //   const descriptionData: Record<string, string> = {};
// //   Object.keys(params).forEach(key => {
// //     const titleMatch = key.match(/^title\[(.*)\]$/);
// //     if (titleMatch && titleMatch[1] && typeof params[key] === 'string' && params[key].trim() !== '') {
// //       const locale = titleMatch[1];
// //       titleData[locale] = params[key] as string;
// //       translations.push({
// //         locale: locale,
// //         title: params[key] as string,
// //         description: descriptionData[locale] || '',
// //       });
// //       if (!locales.includes(locale)) {
// //         locales.push(locale);
// //       }
// //     }
// //     const descriptionMatch = key.match(/^description\[(.*)\]$/);
// //     if (descriptionMatch && descriptionMatch[1] && typeof params[key] === 'string' && params[key].trim() !== '') {
// //       const locale = descriptionMatch[1];
// //       descriptionData[locale] = params[key] as string;
// //       const translationIndex = translations.findIndex(t => t.locale === locale);
// //       if (translationIndex !== -1) {
// //         translations[translationIndex].description = params[key] as string;
// //       } else {
// //         translations.push({
// //           locale: locale,
// //           title: titleData[locale] || '',
// //           description: params[key] as string,
// //         });
// //       }
// //       if (!locales.includes(locale)) {
// //         locales.push(locale);
// //       }
// //     }
// //   });
// //   if (locales.length === 0) {
// //     locales.push('en');
// //   }
// //   const primaryLocale = locales[0];
// //   const primaryTitle = titleData[primaryLocale] || '';
// //   const primaryDescription = descriptionData[primaryLocale] || '';
// //   const images: string[] = [];
// //   Object.keys(params).forEach(key => {
// //     const imageMatch = key.match(/^images\[(\d+)\]$/);
// //     if (imageMatch && params[key]) {
// //       images[parseInt(imageMatch[1])] = params[key] as string;
// //     }
// //   });
// //   const cleanedImages = images.filter(img => img !== undefined);
// //   const imageUrl = cleanedImages.length > 0 ? cleanedImages[0] : '';

// //   // Fetch the full category object if category_id is provided
// //   let categoryObject = undefined;
// //   if (params.category_id) {
// //     const catRes = await getAllCategoriesById('', params.category_id as string);
// //     categoryObject = catRes.data;
// //   }

// //   const input: Product = {
// //     uuid: uuid,
// //     id: uuid,
// //     img: imageUrl,
// //     images: cleanedImages,
// //     tax: Number(params.tax) || 0,
// //     interval: Number(params.interval) || 0,
// //     min_qty: Number(params.min_qty) || 0,
// //     max_qty: Number(params.max_qty) || 0,
// //     brand_id: (params.brand_id as string) || null,
// //     category_id: (params.category_id as string) || null,
// //     unit_id: (params.unit_id as string) || null,
// //     kitchen_id: (params.kitchen_id as string) || null,
// //     active: params.active === true || params.active === 1 ? 1 : 0,
// //     is_show_in_homescreen: params.is_show_in_homescreen === true || params.is_show_in_homescreen === 1 ? true : false,
// //     show_in: params.show_in as unknown[] || [],
// //     status: params.status && isValidStatus(params.status) ? params.status : PRODUCT_STATUS.PENDING,
// //     type: 'product',
// //     created_at: Timestamp.now().toMillis(),
// //     updated_at: Timestamp.now().toMillis(),
// //     title: titleData,
// //     translations: translations,
// //     translation: {
// //       id: translationId,
// //       locale: primaryLocale,
// //       title: primaryTitle,
// //       description: primaryDescription,
// //     },
// //     locales: locales,
// //     price: Number(params.price) || 0,
// //     strike_price: Number(params.strike_price),
// //     discount_percent: Number(params.discount_percent),
// //     sku: params.sku as string || undefined,
// //     shopTitle: params.shopTitle as string || undefined,
// //     category: categoryObject, // store the full category object
// //   };
// //   await setDoc(doc(filesCollectionRef, uuid), input);
// //   return {
// //     data: {
// //       uuid: uuid,
// //     },
// //   };
// // };

// export const createProductsDb = async (orgId, payload) => {
//   const filesCollectionRef = collection(db, 'T_products');
//   const { params } = payload;
  
//   // Generate the new sequential product ID
//   const productId = await generateNextProductId();
//   const translationId = uuidv4(); // UUID for translation
//   // Extract all locale data from params
//   const translations = [];
//   const locales = [];
//   const titleData = {};
//   const descriptionData = {};
//   // Process all title and description fields with patterns title[locale] and description[locale]
//   Object.keys(params).forEach(key => {
//     const titleMatch = key.match(/^title\[(.*)\]$/);
//     if (titleMatch && titleMatch[1] && params[key] !== undefined && params[key].trim() !== '') {
//       const locale = titleMatch[1];
//       titleData[locale] = params[key];
//       translations.push({
//         locale: locale,
//         title: params[key],
//         description: descriptionData[locale] || '', // Attach description per locale
//       });
//       // Add to locales array
//       if (!locales.includes(locale)) {
//         locales.push(locale);
//       }
//     }
//     const descriptionMatch = key.match(/^description\[(.*)\]$/);
//     if (descriptionMatch && descriptionMatch[1] && params[key] !== undefined && params[key].trim() !== '') {
//       const locale = descriptionMatch[1];
//       descriptionData[locale] = params[key];
//       // Make sure descriptions are correctly associated in the translations array
//       const translationIndex = translations.findIndex(t => t.locale === locale);
//       if (translationIndex !== -1) {
//         translations[translationIndex].description = params[key];
//       } else {
//         translations.push({
//           locale: locale,
//           title: titleData[locale] || '',
//           description: params[key],
//         });
//       }
//       // Add to locales array if not already present
//       if (!locales.includes(locale)) {
//         locales.push(locale);
//       }
//     }
//   });
//   // Default to 'en' if no locales found
//   if (locales.length === 0) {
//     locales.push('en');
//   }
//   // Use first locale as primary translation
//   const primaryLocale = locales[0];
//   const primaryTitle = titleData[primaryLocale] || '';
//   const primaryDescription = descriptionData[primaryLocale] || '';
//   // Process images: support either images array or images[0], images[1], ... keys
//   let cleanedImages: string[] = [];
//   if (Array.isArray((params as Record<string, unknown>)?.images)) {
//     cleanedImages = ((params as Record<string, unknown>).images as unknown[])
//       .filter((v) => typeof v === 'string' && (v as string).trim() !== '') as string[];
//   } else {
//     const images: string[] = [];
//     Object.keys(params).forEach(key => {
//       const imageMatch = key.match(/^images\[(\d+)\]$/);
//       if (imageMatch && params[key]) {
//         const value = params[key];
//         if (typeof value === 'string' && value.trim() !== '') {
//           images[parseInt(imageMatch[1])] = value;
//         }
//       }
//     });
//     cleanedImages = images.filter(img => img !== undefined);
//   }
//   const imageUrl = cleanedImages.length > 0 ? cleanedImages[0] : '';
//   const input = {
//     uuid: productId,  // Store productId as uuid field for backward compatibility
//     id: productId,    // Store the new sequential ID
//     img: imageUrl,
//     images: cleanedImages, // Store all images
//     tax: Number(params.tax) || 0,
//     interval: Number(params.interval) || 0,
//     min_qty: Number(params.min_qty) || 0,
//     max_qty: Number(params.max_qty) || 0,
//     brand_id: params.brand_id || null,
//     category_id: params.category_id || null,
//     sub_category_id: params.sub_category_id || null,
//     unit_id: params.unit_id || null,
//     kitchen_id: params.kitchen_id || null,
//     active: params.active === true || params.active === 1 ? 1 : 0,
//     subscription_enabled: params.subscription_enabled === true,
//     is_show_in_homescreen: params.is_show_in_homescreen === true || params.is_show_in_homescreen === 1 ? true : false,
//     show_in: Array.isArray(params.show_in) ? params.show_in : [],
//     status: params.status && isValidStatus(params.status) ? params.status : PRODUCT_STATUS.PENDING,
//     type: 'product',
//     created_at: Timestamp.now().toMillis(),
//     updated_at: Timestamp.now().toMillis(),
//     title: titleData,  // Store all titles by localex
//     translations: translations,  // Store array of all translations
//     translation: {  // Store primary translation for backward compatibility
//       id: translationId,
//       locale: primaryLocale,
//       title: primaryTitle,
//       description: primaryDescription,
//     },
//     locales: locales,  // Store all available locales
//     price: 0, // Will be updated when stocks are created
//     strike_price: 0,
//     discount_percent: 0,
//     // Initialize default variant label if provided by caller; will be auto-set on stock creation
//     default: typeof (params as Record<string, unknown>)?.default === 'string' ? (params as Record<string, string>).default : '',
//     stocks: [], // Initialize empty stocks array
//     active_sku: null
//   };
//   try {
//     // Use the new sequential product ID as the document ID in Firestore
//     const docRef = await setDoc(doc(filesCollectionRef, productId), input);
//     // Return the response in the format expected by ProductsIndex.js
//     return { 
//       data: {
//         uuid: productId
//       }
//     };
//   } catch (error) {
//     console.error('Error saving product to Firestore:', error);
//     throw error;
//   }
// };

// export const getAllProducts = async (orgId: string, params: { params?: Record<string, unknown> }) => {
//   const filterParams = params?.params || {};
//   const constraints: QueryConstraint[] = [];
//   if (filterParams.category_id && filterParams.category_id !== 'undefined' && filterParams.category_id !== '') {
//     constraints.push(where('category_id', '==', filterParams.category_id));
//   }
//   if (filterParams.sub_category_id && filterParams.sub_category_id !== 'undefined' && filterParams.sub_category_id !== '') {
//     constraints.push(where('sub_category_id', '==', filterParams.sub_category_id));
//   }
//   if (filterParams.brand_id && filterParams.brand_id !== 'undefined' && filterParams.brand_id !== '') {
//     constraints.push(where('brand_id', '==', filterParams.brand_id));
//   }
//   if (filterParams.shop_id && filterParams.shop_id !== 'undefined' && filterParams.shop_id !== '') {
//     constraints.push(where('shop_id', '==', filterParams.shop_id));
//   }
//   if (filterParams.status && filterParams.status !== 'undefined' && filterParams.status !== '') {
//     constraints.push(where('status', '==', filterParams.status));
//   }
//   const productsQuery = query(collection(db, 'T_products'), ...constraints);
//   const querySnapshot = await getDocs(productsQuery);
//   if (querySnapshot.empty) {
//     return {
//       data: [],
//       meta: {
//         current_page: 1,
//         from: 0,
//         last_page: 1,
//         to: 0,
//         total: 0,
//       },
//     };
//   }
//   // Fetch stocks for each product and attach as 'stocks' array
//   let files = await Promise.all(
//     querySnapshot.docs.map(async docSnap => {
//     const data = docSnap.data();
//       // Fetch stocks for this product
//       const stocksQuery = query(
//         collection(db, 'T_stocks'),
//         where('countable_id', '==', docSnap.id)
//       );
//       const stocksSnapshot = await getDocs(stocksQuery);
//       const stocks: Stock[] = [];
      
//       for (const stockDoc of stocksSnapshot.docs) {
//         const stockData = { id: stockDoc.id, ...stockDoc.data() } as Stock;
        
//         // Process extras for each stock
//         if (Array.isArray(stockData.extras) && stockData.extras.length > 0) {
//           const populatedExtras: PopulatedExtra[] = [];
          
//           for (const extraId of stockData.extras) {
//             if (typeof extraId === 'string') {
//               try {
//                 // Fetch the extra value
//                 const extraValueDoc = await getDoc(doc(db, 'T_extra_values', extraId));
//                 if (extraValueDoc.exists()) {
//                   const extraValueData = extraValueDoc.data();
                  
//                   // Fetch the extra group
//                   let extraGroupData = null;
//                   if (extraValueData?.extra_group_id) {
//                     const extraGroupDoc = await getDoc(doc(db, 'T_extra_groups', extraValueData.extra_group_id));
//                     if (extraGroupDoc.exists()) {
//                       extraGroupData = extraGroupDoc.data();
//                     }
//                   }
                  
//                   populatedExtras.push({
//                     id: extraValueDoc.id,
//                     value: extraValueData?.value || '',
//                     extra_group_id: extraValueData?.extra_group_id,
//                     group: extraGroupData ? {
//                       id: extraValueData.extra_group_id,
//                       translation: extraGroupData.translation || { title: extraGroupData.title || 'Unknown Group' }
//                     } : null
//                   });
//                 }
//               } catch (error) {
//                 console.error('Error fetching extra data:', error);
//               }
//             }
//           }
          
//           stockData.extras = populatedExtras;
//         } else {
//           stockData.extras = [];
//         }
        
//         stocks.push(stockData);
//       }
//     return {
//       uuid: data.uuid || docSnap.id,
//       id: data.id || docSnap.id,
//       img: data.img || '',
//       images: data.images || [],
//       tax: data.tax ?? 0,
//       interval: data.interval ?? 0,
//       min_qty: data.min_qty ?? 0,
//       max_qty: data.max_qty ?? 0,
//       brand_id: data.brand_id ?? null,
//       category_id: data.category_id ?? null,
//       sub_category_id: data.sub_category_id ?? null,
//       unit_id: data.unit_id ?? null,
//       kitchen_id: data.kitchen_id ?? null,
//       active: data.active ?? 0,
//         subscription_enabled: Boolean(data.subscription_enabled),
//       is_show_in_homescreen: data.is_show_in_homescreen ?? false,
//       show_in: data.show_in ?? [],
//       status: data.status || '',
//       type: data.type || '',
//       created_at: data.created_at ?? 0,
//       updated_at: data.updated_at ?? 0,
//       title: data.title || {},
//       translations: data.translations || [{ locale: 'en', title: data.translation?.title || 'N/A', description: '' }],
//       translation: data.translation || { id: '', locale: 'en', title: '', description: '' },
//       locales: data.locales || ['en'],
//       price: data.price ?? 0,
//       strike_price: data.strike_price ?? 0,
//       discount_percent: Math.round(data.discount_percent ?? 0),
//       sku: data.sku ?? '',
//       shopTitle: data.shopTitle ?? '',
//       category: data.category ?? '',
//       ...data,
//         stocks, // Attach stocks array here
//     };
//     })
//   );
//   files.sort((a, b) => b.created_at - a.created_at);
//   if (filterParams.search && filterParams.search !== 'undefined' && filterParams.search !== '') {
//     const searchTerm = (filterParams.search as string).toLowerCase();
//     files = files.filter(product => {
//       const translationMatch = product.translations?.some((trans: Translation) =>
//         trans.title?.toLowerCase().includes(searchTerm) ||
//         trans.description?.toLowerCase().includes(searchTerm)
//       );
//       const titleMatch = Object.values(product.title || {}).some((title: string) =>
//         title.toLowerCase().includes(searchTerm)
//       );
//       const otherFieldsMatch =
//         (product.sku as string)?.toLowerCase().includes(searchTerm);
//       return translationMatch || titleMatch || otherFieldsMatch;
//     });
//   }
//   console.log("files", files);
//   return {
//     data: files,
//     meta: {
//       current_page: 1,
//       from: files.length > 0 ? 1 : 0,
//       last_page: 1,
//       to: files.length,
//       total: files.length,
//     },
    
//   };

// };

// export const getAllProductsById = async (lang: string, id: string) => {
//   try {
//     const docRef = doc(db, 'T_products', id);
//     const docSnap = await getDoc(docRef);
    
//     if (!docSnap.exists()) {
//       throw new Error('Product not found');
//     }
    
//     const product = { id: docSnap.id, ...docSnap.data() } as Product & { stocks?: Stock[] };
    
//     // Fetch stocks for this product
//     const stocksQuery = query(
//       collection(db, 'T_stocks'),
//       where('countable_id', '==', id)
//     );
//     const stocksSnapshot = await getDocs(stocksQuery);
//     const stocks: Stock[] = [];
    
//     for (const stockDoc of stocksSnapshot.docs) {
//       const stockData = { id: stockDoc.id, ...stockDoc.data() } as Stock;
      
//       // Process extras for each stock
//       if (Array.isArray(stockData.extras) && stockData.extras.length > 0) {
//         const populatedExtras: PopulatedExtra[] = [];
        
//         for (const extraId of stockData.extras) {
//           if (typeof extraId === 'string') {
//             try {
//               // Fetch the extra value
//               const extraValueDoc = await getDoc(doc(db, 'T_extra_values', extraId));
//               if (extraValueDoc.exists()) {
//                 const extraValueData = extraValueDoc.data();
                
//                 // Fetch the extra group
//                 let extraGroupData = null;
//                 if (extraValueData?.extra_group_id) {
//                   const extraGroupDoc = await getDoc(doc(db, 'T_extra_groups', extraValueData.extra_group_id));
//                   if (extraGroupDoc.exists()) {
//                     extraGroupData = extraGroupDoc.data();
//                   }
//                 }
                
//                 populatedExtras.push({
//                   id: extraValueDoc.id,
//                   value: extraValueData?.value || '',
//                   extra_group_id: extraValueData?.extra_group_id,
//                   group: extraGroupData ? {
//                     id: extraValueData.extra_group_id,
//                     translation: extraGroupData.translation || { title: extraGroupData.title || 'Unknown Group' }
//                   } : null
//                 });
//               }
//             } catch (error) {
//               console.error('Error fetching extra data:', error);
//             }
//           }
//         }
        
//         stockData.extras = populatedExtras;
//       } else {
//         stockData.extras = [];
//       }
      
//       stocks.push(stockData);
//     }
    
//     // Add stocks to product
//     product.stocks = stocks;
    
//     return { success: true, data: product };
//   } catch (error) {
//     console.error('Error fetching product:', error);
//     return { success: false, message: (error as Error).message };
//   }
// };


// export const updateProducts = async (productId: string, updateData: Partial<Product>) => {
//   const productRef = doc(db, 'T_products', productId);
  
//   // Clean the update data to avoid Firestore field path issues
//   const cleanUpdateData = { ...updateData };
  
//   // Remove any properties that might cause field path issues
//   const problematicFields = ['translations'];
//   problematicFields.forEach(field => {
//     if (cleanUpdateData[field] && typeof cleanUpdateData[field] === 'object') {
//       delete cleanUpdateData[field];
//     }
//   });
  
//   // Process title and description fields like createProductsDb does
//   const titleData = {};
//   const descriptionData = {};
//   const translations = [];
//   const locales = [];
  
//   // Extract title and description from the update data
//   Object.keys(cleanUpdateData).forEach(key => {
//     const titleMatch = key.match(/^title\[(.*)\]$/);
//     if (titleMatch && titleMatch[1] && cleanUpdateData[key] !== undefined && typeof cleanUpdateData[key] === 'string' && cleanUpdateData[key].trim() !== '') {
//       const locale = titleMatch[1];
//       titleData[locale] = cleanUpdateData[key] as string;
//       translations.push({
//         locale: locale,
//         title: cleanUpdateData[key] as string,
//         description: descriptionData[locale] || '',
//       });
//       if (!locales.includes(locale)) {
//         locales.push(locale);
//       }
//       // Remove the processed field from cleanUpdateData
//       delete cleanUpdateData[key];
//     }
    
//     const descriptionMatch = key.match(/^description\[(.*)\]$/);
//     if (descriptionMatch && descriptionMatch[1] && cleanUpdateData[key] !== undefined && typeof cleanUpdateData[key] === 'string' && cleanUpdateData[key].trim() !== '') {
//       const locale = descriptionMatch[1];
//       descriptionData[locale] = cleanUpdateData[key] as string;
//       const translationIndex = translations.findIndex(t => t.locale === locale);
//       if (translationIndex !== -1) {
//         translations[translationIndex].description = cleanUpdateData[key] as string;
//       } else {
//         translations.push({
//           locale: locale,
//           title: titleData[locale] || '',
//           description: cleanUpdateData[key] as string,
//         });
//       }
//       if (!locales.includes(locale)) {
//         locales.push(locale);
//       }
//       // Remove the processed field from cleanUpdateData
//       delete cleanUpdateData[key];
//     }
//   });
  
//   // Default to 'en' if no locales found
//   if (locales.length === 0) {
//     locales.push('en');
//   }
  
//   // Use first locale as primary translation
//   const primaryLocale = locales[0];
//   const primaryTitle = titleData[primaryLocale] || '';
//   const primaryDescription = descriptionData[primaryLocale] || '';
  
//   // Also process images like in createProductsDb
//   let orderedImages: string[] = [];
//   if (Array.isArray((cleanUpdateData as Record<string, unknown>)?.images)) {
//     orderedImages = ((cleanUpdateData as Record<string, unknown>).images as unknown[])
//       .filter((v) => typeof v === 'string' && (v as string).trim() !== '') as string[];
//     // Remove raw images array from field update to avoid large diffs with complex types elsewhere
//     delete (cleanUpdateData as Record<string, unknown>).images;
//   } else {
//     const imageIndexesToValue: Record<number, string> = {};
//     Object.keys(cleanUpdateData).forEach((key) => {
//       const imageMatch = key.match(/^images\[(\d+)\]$/);
//       if (imageMatch) {
//         const index = parseInt(imageMatch[1], 10);
//         const value = cleanUpdateData[key];
//         if (typeof value === 'string' && value.trim() !== '') {
//           imageIndexesToValue[index] = value;
//         }
//         // Remove the processed field from cleanUpdateData
//         delete cleanUpdateData[key];
//       }
//     });
//     orderedImages = Object.keys(imageIndexesToValue)
//       .map((k) => parseInt(k, 10))
//       .sort((a, b) => a - b)
//       .map((idx) => imageIndexesToValue[idx])
//       .filter((v) => typeof v === 'string' && v.trim() !== '');
//   }

//   // Only include simple fields that are safe for Firestore
//   const safeFields = ['active', 'subscription_enabled', 'status', 'price', 'strike_price', 'discount_percent', 'quantity', 'sku', 'category_id', 'sub_category_id', 'brand_id', 'unit_id', 'stocks', 'show_in', 'default', 'active_sku'];
//   const safeUpdateData: Record<string, unknown> = {};
  
//   safeFields.forEach(field => {
//     if (cleanUpdateData[field] !== undefined) {
//       safeUpdateData[field] = cleanUpdateData[field];
//     }
//   });
  
//   const updatePayload: Record<string, unknown> = {
//     ...safeUpdateData,
//     updated_at: Timestamp.now().toMillis()
//   };
  
//   // Add title and description if they were processed
//   if (Object.keys(titleData).length > 0) {
//     updatePayload.title = titleData;
//     updatePayload.translation = {
//       id: uuidv4(), // Generate new translation ID
//       locale: primaryLocale,
//       title: primaryTitle,
//       description: primaryDescription,
//     };
//     updatePayload.locales = locales;
//   }

//   // If images were provided, set both images array and primary img
//   if (orderedImages.length > 0) {
//     updatePayload.images = orderedImages;
//     updatePayload.img = orderedImages[0];
//   }
  
//   try {
//     await updateDoc(productRef, updatePayload);
//     return { success: true };
//   } catch (error) {
//     console.error("Error updating product:", error);
//     throw error;
//   }
// };

// export const deleteProducts = async (ids: string[]) => {
//   if (Array.isArray(ids)) {
//     await Promise.all(
//       ids.map(async (item) => {
//         await deleteDoc(doc(db, 'T_products', item));
//       })
//     );
//   } else {
//     throw new Error('Expected an array of IDs');
//   }
// };

// // Firebase configuration is handled in db.ts

// // =====================
// // Additional Product Functions (ported from user code)
// // =====================

// // 
// // --- Stock interface for T_stocks ---
// export interface Stock {
//   id: string;
//   countable_id: string;
//   sku: string;
//   price: number;
//   strike_price: number;
//   discount_percent: number;
//   quantity: number;
//   tax: number;
//   total_price: number;
//   addon: boolean;
//   addons: unknown[];
//   extras: string[] | PopulatedExtra[]; // Allow both types
//   bonus: unknown | null;
//   created_at: number;
//   updated_at: number;
//   [key: string]: unknown;
// }

// // --- createStocksDb ---
// export const createStocksDb = async (productId: string, data: { extras: Stock[]; delete_ids?: string[] }) => {
//   const collectionRef = collection(db, 'T_stocks');
//   const { extras, delete_ids } = data;
  
//   const resolveExtraValueNames = async (extrasList: (string | PopulatedExtra)[]): Promise<string[]> => {
//     const names: string[] = [];
//     for (const extra of extrasList) {
//       const extraId = typeof extra === 'string' ? extra : extra?.id;
//       if (!extraId) {
//         continue;
//       }
//       try {
//         const extraValueDoc = await getDoc(doc(db, 'T_extra_values', extraId));
//         if (extraValueDoc.exists()) {
//           const extraValueData = extraValueDoc.data() as { value?: unknown };
//           if (typeof extraValueData.value === 'string' && extraValueData.value.trim() !== '') {
//             names.push(extraValueData.value);
//           }
//         }
//       } catch (error) {
//         console.warn('Unable to resolve extra value name:', error);
//       }
//     }
//     return names;
//   };

//   // Delete existing stocks if provided
//   if (delete_ids && delete_ids.length > 0) {
//     for (const stockId of delete_ids) {
//       await deleteDoc(doc(collectionRef, stockId));
//     }
//   }
  
//   const processedStocks: Stock[] = [];
  
//   for (const stock of extras) {
//     if (typeof stock.price === 'undefined' || typeof stock.quantity === 'undefined') {
//       throw new Error('Stock must have price and quantity');
//     }
//     const id = stock.stock_id as string || uuidv4();
//     const docRef = doc(collectionRef, id);
//     const tax = Number(stock.tax || 0);
//     const strike_price = Number(stock.strike_price);
//     const price = Number(stock.price || strike_price);
//     let discount_percent = 0;
//     if (strike_price > 0 && price < strike_price) {
//       discount_percent = Math.round(((strike_price - price) / strike_price) * 100);
//     }
    
//     // Process extras properly - convert IDs to full extra value IDs
//     let extrasIds: string[] = [];
//     if (Array.isArray(stock.extras)) {
//       extrasIds = stock.extras.map((extra: unknown) => {
//         if (typeof extra === 'string') {
//           return extra;
//         } else if (typeof extra === 'object' && extra !== null && 'id' in extra) {
//           return (extra as { id: string }).id;
//         }
//         return '';
//       }).filter(Boolean);
//     }
    
//     const total_price = price + (price * tax / 100);
    
//     const stockData: Stock = {
//       id,
//       countable_id: productId,
//       sku: stock.sku as string || '',
//       price: price,
//       strike_price: strike_price,
//       discount_percent: discount_percent,
//       quantity: Number(stock.quantity),
//       tax: tax,
//       total_price: total_price,
//       addon: Boolean(stock.addon),
//       addons: Array.isArray(stock.addons) ? stock.addons : [],
//       extras: extrasIds, // Store as array of extra value IDs
//       bonus: stock.bonus || null,
//       created_at: Timestamp.now().toMillis(),
//       updated_at: Timestamp.now().toMillis()
//     };
    
//     await setDoc(docRef, stockData);
//     processedStocks.push(stockData);
//   }
  
//   // Update product with price info AND stocks array
//   const lowestPriceStock = processedStocks.reduce((min, current) => 
//     current.price < min.price ? current : min
//   );
  
//   // Determine default variant label from the lowest priced stock's extras
//   let defaultVariantLabel = '';
//   const activeSkuPayload: ActiveSku = {
//     sku: lowestPriceStock.sku || '',
//     variant_name: '',
//     quantity: Number(lowestPriceStock.quantity) || 0,
//     price: Number(lowestPriceStock.price) || 0,
//     strike_price: Number(lowestPriceStock.strike_price) || 0
//   };
//   try {
//     const extrasArray = Array.isArray(lowestPriceStock.extras) ? lowestPriceStock.extras : [];
//     const extraNames = await resolveExtraValueNames(extrasArray);
//     if (extraNames.length > 0) {
//       defaultVariantLabel = extraNames[0];
//     }
//     activeSkuPayload.variant_name = extraNames.join(' / ');
//   } catch (err) {
//     console.warn('Unable to resolve default variant label from extras:', err);
//   }

//   await updateProducts(productId, { 
//     price: lowestPriceStock.price, 
//     strike_price: lowestPriceStock.strike_price, 
//     discount_percent: Math.round(lowestPriceStock.discount_percent || 0),
//     stocks: processedStocks, // Store complete stocks array in product
//     ...(defaultVariantLabel ? { default: defaultVariantLabel } : {}),
//     active_sku: activeSkuPayload
//   });
  
//   return { success: true, message: 'Stocks created successfully' };
// };

// // --- getAllProductsSnap ---
// export const getAllProductsSnap = async (
//   params: { params?: { status?: string } },
//   callback: (response: unknown) => void
// ) => {
//   const filesQuery1 = query(
//     collection(db, `T_products`),
//     where("status", "==", params?.params?.status || "published")
//   );
//   const unsubscribe = onSnapshot(filesQuery1, (querySnapshot) => {
//     const files = querySnapshot.docs.map((doc) => {
//       const x = doc.data();
//       x.id = doc.id;
//       x.uuid = doc.id;
//       return x;
//     });
//     const response = {
//       data: files,
//       meta: {
//         current_page: 1,
//         from: 1,
//         last_page: 1,
//         links: [
//           { url: null, label: "&laquo; Previous", active: false },
//           {
//             url: "https://single-api.foodyman.org/api/v1/dashboard/admin/T_products/paginate?page=1",
//             label: "1",
//             active: true,
//           },
//           { url: null, label: "Next &raquo;", active: false },
//         ],
//         path: "https://single-api.foodyman.org/api/v1/dashboard/admin/T_products/paginate",
//         per_page: "10",
//         to: files.length,
//         total: files.length,
//       },
//     };
//     callback(response);
//   });
//   return unsubscribe;
// };

// // --- setActiveProducts ---
// export const setActiveProducts = async (id: string) => {
//   const productId = id.includes('/') ? id.split('/').pop() : id;
//   const docRef = doc(db, 'T_products', productId!);
//   const docSnap = await getDoc(docRef);
//   if (!docSnap.exists()) {
//     throw new Error(`Product with ID ${productId} not found`);
//   }
//   const productData = docSnap.data();
//   const currentActive = productData.active === 1 || productData.active === true;
//   const newActive = !currentActive;
//   await updateDoc(docRef, {
//     active: newActive ? 1 : 0,
//     updated_at: Timestamp.now().toMillis()
//   });
//   const response = {
//     timestamp: new Date().toISOString(),
//     status: true,
//     data: {
//       id: parseInt(productId!) || productId,
//       active: newActive,
//       position: productData.position || "before",
//       created_at: Timestamp.now().toMillis(),
//       updated_at: Timestamp.now().toMillis(),
//       locales: productData.locales || ["en"]
//     }
//   };
//   return response;
// };

// // --- setShowInHomescreenProducts ---
// export const setShowInHomescreenProducts = async (id: string) => {
//   const productId = id.includes('/') ? id.split('/').pop() : id;
//   const docRef = doc(db, 'T_products', productId!);
//   const docSnap = await getDoc(docRef);
//   if (!docSnap.exists()) {
//     throw new Error(`Product with ID ${productId} not found`);
//   }
//   const productData = docSnap.data();
//   const currentShowInHomescreen = productData.is_show_in_homescreen === true;
//   const newShowInHomescreen = !currentShowInHomescreen;
//   await updateDoc(docRef, {
//     is_show_in_homescreen: newShowInHomescreen,
//     updated_at: Timestamp.now().toMillis()
//   });
//   const response = {
//     timestamp: new Date().toISOString(),
//     status: true,
//     data: {
//       id: parseInt(productId!) || productId,
//       is_show_in_homescreen: newShowInHomescreen,
//       position: productData.position || "before",
//       created_at: Timestamp.now().toMillis(),
//       updated_at: Timestamp.now().toMillis(),
//       locales: productData.locales || ["en"]
//     }
//   };
//   return response;
// };

// // --- updateProductStatus ---
// export const updateProductStatus = async (uuid: string, status: string) => {
//   if (!isValidStatus(status)) {
//     throw new Error(`Invalid status: ${status}. Must be one of: ${Object.values(PRODUCT_STATUS).join(', ')}`);
//   }
//   const docRef = doc(db, 'T_products', uuid);
//   const docSnap = await getDoc(docRef);
//   if (!docSnap.exists()) {
//     throw new Error(`Product with UUID ${uuid} not found`);
//   }
//   const updateData = {
//     status: status,
//     updated_at: Timestamp.now().toMillis()
//   };
//   await updateDoc(docRef, updateData);
//   return {
//     timestamp: new Date().toISOString(),
//     status: true,
//     message: "web.record_has_been_successfully_updated",
//     data: {
//       uuid: uuid,
//       status: status,
//       updated_at: updateData.updated_at
//     }
//   };
// };

// // --- ExtrasGroupsDb ---
// export const ExtrasGroupsDb = async (url: string, params: unknown) => {
//   const extrasCollectionRef = collection(db, 'T_extras_groups');
//   const extrasQuery = query(extrasCollectionRef, where('active', '==', 1));
//   const querySnapshot = await getDocs(extrasQuery);
//   const extrasData = querySnapshot.docs.map((doc) => {
//     const data = doc.data();
//     data.id = doc.id;
//     return data;
//   });
//   return { data: extrasData };
// };

// export const getStocksByProductId = async (productId: string) => {
//   const stocksQuery = query(
//     collection(db, "T_stocks"),
//     where("countable_id", "==", productId)
//   );
//   const stocksSnapshot = await getDocs(stocksQuery);
//   return { data: stocksSnapshot.docs.map(doc => doc.data()) };
// };

// export const getProductsBasicInfo = async (
//   productIds: string[],
// ): Promise<Record<string, { image?: string; totalQuantity: number; price?: string; variantLabel?: string }>> => {
//   const uniqueIds = Array.from(
//     new Set(
//       productIds
//         .map((id) => (typeof id === "string" ? id.trim() : ""))
//         .filter((id): id is string => id.length > 0),
//     ),
//   );

//   if (!uniqueIds.length) {
//     return {};
//   }

//   const formatPrice = (value: unknown): string | undefined => {
//     const numericValue = typeof value === "string" ? Number(value) : Number(value);
//     if (!Number.isFinite(numericValue)) {
//       return undefined;
//     }
//     return numericValue.toLocaleString(undefined, {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     });
//   };

//   const extractVariantLabel = (stock: Stock | undefined): string | undefined => {
//     if (!stock) {
//       return undefined;
//     }

//     const parts: string[] = [];

//     if (typeof stock.sku === "string" && stock.sku.trim() !== "") {
//       parts.push(stock.sku.trim());
//     }

//     if (Array.isArray(stock.extras)) {
//       stock.extras.forEach((extra) => {
//         if (typeof extra === "string") {
//           return;
//         }
//         if (extra && typeof extra === "object" && "value" in extra && typeof extra.value === "string") {
//           const value = extra.value.trim();
//           if (value) {
//             parts.push(value);
//           }
//         }
//       });
//     }

//     if (parts.length === 0) {
//       return undefined;
//     }

//     return parts.join(" / ");
//   };

//   const results: Record<string, { image?: string; totalQuantity: number; price?: string; variantLabel?: string }> = {};

//   await Promise.all(
//     uniqueIds.map(async (productId) => {
//       try {
//         const productRef = doc(db, "T_products", productId);
//         const productSnap = await getDoc(productRef);

//         if (!productSnap.exists()) {
//           return;
//         }

//         const productData = productSnap.data() as {
//           img?: unknown;
//           images?: unknown[];
//           stocks?: Array<Stock>;
//           price?: unknown;
//         };

//         const imageCandidates: string[] = [];
//         if (typeof productData.img === "string" && productData.img.trim() !== "") {
//           imageCandidates.push(productData.img.trim());
//         }
//         if (Array.isArray(productData.images)) {
//           productData.images.forEach((img) => {
//             if (typeof img === "string" && img.trim() !== "") {
//               imageCandidates.push(img.trim());
//             }
//           });
//         }

//         let totalQuantity = 0;
//         let formattedPrice: string | undefined;
//         let variantLabel: string | undefined;

//         if (Array.isArray(productData.stocks) && productData.stocks.length > 0) {
//           totalQuantity = productData.stocks.reduce((sum, stock) => {
//             const qty = Number(stock?.quantity ?? 0);
//             return Number.isFinite(qty) ? sum + qty : sum;
//           }, 0);

//           const firstStock = productData.stocks[0];
//           formattedPrice = formatPrice(firstStock?.price ?? productData.price);
//           variantLabel = extractVariantLabel(firstStock);
//         } else {
//           const stocksQuery = query(
//             collection(db, "T_stocks"),
//             where("countable_id", "==", productId),
//           );
//           const stocksSnapshot = await getDocs(stocksQuery);
//           const stocks: Stock[] = stocksSnapshot.docs.map((stockDoc) => ({
//             id: stockDoc.id,
//             ...stockDoc.data(),
//           })) as Stock[];

//           totalQuantity = stocks.reduce((sum, stock) => {
//             const qty = Number(stock?.quantity ?? 0);
//             return Number.isFinite(qty) ? sum + qty : sum;
//           }, 0);

//           if (stocks.length > 0) {
//             const firstStock = stocks[0];
//             formattedPrice = formatPrice(firstStock?.price ?? productData.price);
//             variantLabel = extractVariantLabel(firstStock);
//           } else {
//             formattedPrice = formatPrice(productData.price);
//           }
//         }

//         results[productId] = {
//           image: imageCandidates[0],
//           totalQuantity,
//           price: formattedPrice,
//           variantLabel,
//         };
//       } catch (error) {
//         console.warn(`Unable to fetch basic info for product ${productId}:`, error);
//       }
//     }),
//   );

//   return results;
// };

// // NEW: Helper to get price and stock for order calculations (integration point with orders)
// export const getProductPriceAndStock = async (productId: string) => {
//   const product = await getAllProductsById('', productId);
//   if (!product.data) {
//     throw new Error(`Product ${productId} not found`);
//   }
  
//   const productData = product.data as Product & { stocks?: Stock[] };
  
//   // Use stocks from product document instead of separate query
//   if (productData.stocks && productData.stocks.length > 0) {
//     const firstStock = productData.stocks[0];
//     const totalQuantity = productData.stocks.reduce((sum: number, stock: Stock) => sum + (Number(stock.quantity) || 0), 0);
    
//     return {
//       price: firstStock.price || 0,
//       tax: firstStock.tax || 0,
//       availableQuantity: totalQuantity,
//       discount_percent: Math.round(firstStock.discount_percent || 0)
//     };
//   }
  
//   // Fallback to basic product data
//   return {
//     price: productData.price || 0,
//     tax: productData.tax || 0,
//     availableQuantity: 0,
//     discount_percent: Math.round(productData.discount_percent || 0)
//   };
// };

// // NEW: Update stock quantity (e.g., deduct when order is placed, add back if canceled)
// export const updateStockQuantity = async (productId: string, stockId: string, delta: number) => {
//   const stockRef = doc(db, 'T_stocks', stockId);
//   const stockSnap = await getDoc(stockRef);
//   if (!stockSnap.exists() || stockSnap.data().countable_id !== productId) {
//     throw new Error(`Stock ${stockId} not found for product ${productId}`);
//   }
//   const currentQuantity = stockSnap.data().quantity || 0;
//   const newQuantity = Math.max(0, currentQuantity + delta);
  
//   await updateDoc(stockRef, {
//     quantity: newQuantity,
//     updated_at: Timestamp.now().toMillis()
//   });
  
//   // Update the stocks array in the product document
//   const productRef = doc(db, 'T_products', productId);
//   const productSnap = await getDoc(productRef);
  
//   if (productSnap.exists()) {
//     const productData = productSnap.data();
//     const stocks = productData.stocks || [];
    
//     // Update the specific stock in the array
//     const updatedStocks = stocks.map((stock: Stock) => 
//       stock.id === stockId ? { ...stock, quantity: newQuantity, updated_at: Timestamp.now().toMillis() } : stock
//     );

//     // Update active_sku quantity if it matches this stock
//     let updatedActiveSku = productData.active_sku || null;
//     const matchingStock = updatedStocks.find((stock: Stock) => stock.id === stockId);
//     if (
//       updatedActiveSku &&
//       typeof updatedActiveSku === 'object' &&
//       matchingStock &&
//       typeof updatedActiveSku.sku === 'string' &&
//       updatedActiveSku.sku === (matchingStock.sku || '')
//     ) {
//       updatedActiveSku = {
//         ...updatedActiveSku,
//         quantity: newQuantity
//       };
//     }
    
//     await updateDoc(productRef, {
//       stocks: updatedStocks,
//       ...(updatedActiveSku ? { active_sku: updatedActiveSku } : {}),
//       updated_at: Timestamp.now().toMillis()
//     });
//   }
  
//   return { success: true, newQuantity };
// };

// export const getTotalProductsCount = async (): Promise<number> => {
//   try {
//     const productsRef = collection(db, 'T_products');
//     const snapshot = await getCountFromServer(productsRef);
//     return snapshot.data().count ?? 0;
//   } catch (error) {
//     console.error('Error fetching total products count:', error);
//     throw new Error('Failed to get total products count');
//   }
// };







// // ----------------------------------------------------------------------------------------------------




// // q_qr_settings.ts file


// export interface QRCodeSettings {
//   enabled: boolean;
//   upi?: string;
//   qr_image_url?: string;
//   merchant_name?: string;
//   merchant_id?: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface QRCodeData {
//   qr_id: string;
//   upi?: string;
//   qr_image_url?: string;
//   merchant_name?: string;
//   merchant_id?: string;
//   amount?: number;
//   order_id?: string;
//   created_at: string;
//   updated_at: string;
// }

// /**
//  * Get QR code settings
//  */
// export const getQRSettings = async (): Promise<QRCodeSettings> => {
//   try {
//     const qrSettingsRef = doc(db, 'upi_id', 'upi');
//     const qrSettingsSnap = await getDoc(qrSettingsRef);
    
//     if (qrSettingsSnap.exists()) {
//       return qrSettingsSnap.data() as QRCodeSettings;
//     } else {
//       // Return default settings if none exist
//       const defaultSettings: QRCodeSettings = {
//         enabled: false,
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString(),
//       };
      
//       // Create default settings
//       await setDoc(qrSettingsRef, defaultSettings);
//       return defaultSettings;
//     }
//   } catch (error) {
//     console.error('Error getting QR settings:', error);
//     throw new Error('Failed to get QR settings');
//   }
// };

// /**
//  * Update QR code settings
//  */
// export const updateQRSettings = async (settings: Partial<QRCodeSettings>): Promise<void> => {
//   try {
//     const qrSettingsRef = doc(db, 'upi_id', 'upi');
//     const updateData = {
//       ...settings,
//       updated_at: new Date().toISOString(),
//     };
    
//     await updateDoc(qrSettingsRef, updateData);
//   } catch (error) {
//     console.error('Error updating QR settings:', error);
//     throw new Error('Failed to update QR settings');
//   }
// };

// /**
//  * Check if QR code payment is enabled
//  */
// export const isQREnabled = async (): Promise<boolean> => {
//   try {
//     const settings = await getQRSettings();
//     return settings.enabled;
//   } catch (error) {
//     console.error('Error checking QR enabled status:', error);
//     return false;
//   }
// };

// /**
//  * Save QR code data for an order
//  */
// export const saveQRCodeData = async (qrData: Omit<QRCodeData, 'qr_id' | 'created_at' | 'updated_at'>): Promise<string> => {
//   try {
//     const qrId = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//     const qrCodeRef = doc(db, 'qr_codes', qrId);
    
//     const qrCodeData: QRCodeData = {
//       qr_id: qrId,
//       ...qrData,
//       created_at: new Date().toISOString(),
//       updated_at: new Date().toISOString(),
//     };
    
//     await setDoc(qrCodeRef, qrCodeData);
//     return qrId;
//   } catch (error) {
//     console.error('Error saving QR code data:', error);
//     throw new Error('Failed to save QR code data');
//   }
// };

// /**
//  * Get QR code data by ID
//  */
// export const getQRCodeData = async (qrId: string): Promise<QRCodeData | null> => {
//   try {
//     const qrCodeRef = doc(db, 'qr_codes', qrId);
//     const qrCodeSnap = await getDoc(qrCodeRef);
    
//     if (qrCodeSnap.exists()) {
//       return qrCodeSnap.data() as QRCodeData;
//     }
//     return null;
//   } catch (error) {
//     console.error('Error getting QR code data:', error);
//     return null;
//   }
// };

// /**
//  * Update QR code data
//  */
// export const updateQRCodeData = async (qrId: string, updates: Partial<QRCodeData>): Promise<void> => {
//   try {
//     const qrCodeRef = doc(db, 'qr_codes', qrId);
//     const updateData = {
//       ...updates,
//       updated_at: new Date().toISOString(),
//     };
    
//     await updateDoc(qrCodeRef, updateData);
//   } catch (error) {
//     console.error('Error updating QR code data:', error);
//     throw new Error('Failed to update QR code data');
//   }
// };

// /**
//  * Delete UPI settings
//  */
// export const deleteUPISettings = async (): Promise<void> => {
//   try {
//     const upiSettingsRef = doc(db, 'upi_id', 'upi');
//     await deleteDoc(upiSettingsRef);
//   } catch (error) {
//     console.error('Error deleting UPI settings:', error);
//     throw new Error('Failed to delete UPI settings');
//   }
// };

// /**
//  * Update UPI ID only
//  */
// export const updateUPIID = async (newUPI: string): Promise<void> => {
//   try {
//     const upiSettingsRef = doc(db, 'upi_id', 'upi');
//     await updateDoc(upiSettingsRef, {
//       upi: newUPI,
//       updated_at: new Date().toISOString(),
//     });
//   } catch (error) {
//     console.error('Error updating UPI ID:', error);
//     throw new Error('Failed to update UPI ID');
//   }
// };

// /**
//  * Update merchant name only
//  */
// export const updateMerchantName = async (newMerchantName: string): Promise<void> => {
//   try {
//     const upiSettingsRef = doc(db, 'upi_id', 'upi');
//     await updateDoc(upiSettingsRef, {
//       merchant_name: newMerchantName,
//       updated_at: new Date().toISOString(),
//     });
//   } catch (error) {
//     console.error('Error updating merchant name:', error);
//     throw new Error('Failed to update merchant name');
//   }
// };





// // ----------------------------------------------------------------------------------------------------

// // q_razorpay_settings.ts file


// export interface RazorpaySettings {
//   key_id?: string;
//   key_secret?: string;
//   merchant_id?: string;
//   webhook_secret?: string;
//   created_at: string;
//   updated_at: string;
// }

// const RAZORPAY_SETTINGS_COLLECTION = 'p_razorpay_settings';
// const RAZORPAY_SETTINGS_DOC_ID = 'razorpay';
// // Default Key ID provided by user; used to pre-seed Firestore if empty/missing
// const DEFAULT_RAZORPAY_KEY_ID = 'rzp_live_RQdbCRwwVpL1ZG';

// /**
//  * Get Razorpay settings
//  */
// export const getRazorpaySettings = async (): Promise<RazorpaySettings> => {
//   try {
//     const razorpaySettingsRef = doc(db, RAZORPAY_SETTINGS_COLLECTION, RAZORPAY_SETTINGS_DOC_ID);
//     const razorpaySettingsSnap = await getDoc(razorpaySettingsRef);
    
//     if (razorpaySettingsSnap.exists()) {
//       const existing = razorpaySettingsSnap.data() as RazorpaySettings;
//       // If key_id is missing and we have a default, set it once
//       if (!existing.key_id && DEFAULT_RAZORPAY_KEY_ID) {
//         const updated: RazorpaySettings = {
//           key_id: DEFAULT_RAZORPAY_KEY_ID,
//           created_at: existing.created_at || new Date().toISOString(),
//           updated_at: new Date().toISOString(),
//         } as RazorpaySettings;
//         // Overwrite to ensure only allowed fields are stored
//         await setDoc(razorpaySettingsRef, updated, { merge: false });
//         return updated;
//       }
//       // Normalize to only allowed fields on read (without writing)
//       return {
//         key_id: existing.key_id,
//         created_at: existing.created_at || new Date().toISOString(),
//         updated_at: existing.updated_at || new Date().toISOString(),
//       } as RazorpaySettings;
//     } else {
//       // Return default settings if none exist
//       const defaultSettings: RazorpaySettings = {
//         key_id: DEFAULT_RAZORPAY_KEY_ID,
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString(),
//       };
      
//       // Create default settings (only allowed fields)
//       await setDoc(razorpaySettingsRef, defaultSettings, { merge: false });
//       return defaultSettings;
//     }
//   } catch (error) {
//     console.error('Error getting Razorpay settings:', error);
//     throw new Error('Failed to get Razorpay settings');
//   }
// };

// /**
//  * Update Razorpay settings
//  */
// export const updateRazorpaySettings = async (settings: Partial<RazorpaySettings>): Promise<void> => {
//   try {
//     const razorpaySettingsRef = doc(db, RAZORPAY_SETTINGS_COLLECTION, RAZORPAY_SETTINGS_DOC_ID);
//     const existingDoc = await getDoc(razorpaySettingsRef);
//     const base: RazorpaySettings = existingDoc.exists()
//       ? (existingDoc.data() as RazorpaySettings)
//       : ({ created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as RazorpaySettings);

//     const updateData: RazorpaySettings = {
//       key_id: (settings.key_id ?? base.key_id) || undefined,
//       created_at: base.created_at || new Date().toISOString(),
//       updated_at: new Date().toISOString(),
//     } as RazorpaySettings;

//     // Overwrite the doc to ensure only allowed fields are present
//     await setDoc(razorpaySettingsRef, updateData, { merge: false });
//   } catch (error) {
//     console.error('Error updating Razorpay settings:', error);
//     throw new Error('Failed to update Razorpay settings');
//   }
// };

// /**
//  * Check if Razorpay is enabled
//  */
// export const isRazorpayEnabled = async (): Promise<boolean> => {
//   try {
//     // Enabled flag is no longer stored; treat presence of key_id as enabled for legacy callers
//     const settings = await getRazorpaySettings();
//     return !!settings.key_id;
//   } catch (error) {
//     console.error('Error checking Razorpay enabled status:', error);
//     return false;
//   }
// };

// /**
//  * Update only the enabled status
//  */
// export const updateRazorpayEnabled = async (enabled: boolean): Promise<void> => {
//   try {
//     // No-op: enabled is no longer stored. Function kept for backward compatibility.
//     return;
//   } catch (error) {
//     console.error('Error updating Razorpay enabled status:', error);
//     throw new Error('Failed to update Razorpay enabled status');
//   }
// };








// // ----------------------------------------------------------------------------------------------------

// // q_settings.ts file


// import { 
//   collection, 
//   doc, 
//   setDoc, 
//   getDoc,
//   updateDoc,
// } from 'firebase/firestore';

// const SETTINGS_COLLECTION = 'p_cod_settings';

// // COD Settings interface
// export interface CODSettings {
//   enabled: boolean;
//   updated_at: string;
// }

// // Get COD settings
// export const getCODSettings = async (): Promise<CODSettings> => {
//   try {
//     const settingsRef = doc(db, SETTINGS_COLLECTION, 'cod');
//     const settingsSnap = await getDoc(settingsRef);
    
//     if (settingsSnap.exists()) {
//       return settingsSnap.data() as CODSettings;
//     }
    
//     // Return default settings if not found
//     return {
//       enabled: false,
//       updated_at: new Date().toISOString()
//     };
//   } catch (error) {
//     console.error('Error fetching COD settings:', error);
//     return {
//       enabled: false,
//       updated_at: new Date().toISOString()
//     };
//   }
// };

// // Update COD settings
// export const updateCODSettings = async (enabled: boolean): Promise<CODSettings> => {
//   try {
//     const settingsRef = doc(db, SETTINGS_COLLECTION, 'cod');
//     const now = new Date().toISOString();
    
//     const settingsData: CODSettings = {
//       enabled,
//       updated_at: now
//     };
    
//     await setDoc(settingsRef, settingsData);
//     return settingsData;
//   } catch (error) {
//     console.error('Error updating COD settings:', error);
//     throw error;
//   }
// };

// // Check if COD is enabled
// export const isCODEnabled = async (): Promise<boolean> => {
//   try {
//     const settings = await getCODSettings();
//     return settings.enabled;
//   } catch (error) {
//     console.error('Error checking COD status:', error);
//     return false;
//   }
// };





// // ----------------------------------------------------------------------------------------------------


// // q_store.ts file


// export interface StoreDetails {
//   id: string;
//   name: string;
//   link: string;
//   mobileNumber: string;
//   mobileCountry: string;
//   emailAddress: string;
//   country: string;
//   address: string;
//   logoUrl?: string; // optional logo field
//   type?: string; // optional store type
//   created_at: number;
//   updated_at: number;
// }

// export const createStore = async (params: Omit<StoreDetails, 'id' | 'created_at' | 'updated_at'>) => {
//   const id = uuidv4();
//   const store: StoreDetails = {
//     id,
//     ...params,
//     created_at: Timestamp.now().toMillis(),
//     updated_at: Timestamp.now().toMillis(),
//   };
//   try {
//     await setDoc(doc(db, 'p_store', id), store);
//     return { success: true, id, ...store };
//   } catch (error) {
//     return { success: false, error: error instanceof Error ? error.message : String(error) };
//   }
// };

// export const updateStore = async (id: string, params: Partial<Omit<StoreDetails, 'id' | 'created_at'>>) => {
//   const docRef = doc(db, 'p_store', id);
//   const docSnap = await getDoc(docRef);
//   if (!docSnap.exists()) {
//     throw new Error(`Store with ID ${id} not found`);
//   }
//   const updateData = {
//     ...params,
//     updated_at: Timestamp.now().toMillis(),
//   };
//   await updateDoc(docRef, updateData);
//   return { success: true, id };
// };

// export async function getAllStores() {
//   const storesQuery = collection(db, 'p_store');
//   const querySnapshot = await getDocs(storesQuery);
//   const stores: StoreDetails[] = querySnapshot.docs.map((docSnap) => docSnap.data() as StoreDetails);
//   return { data: stores };
// }

// export const getStoreById = async (id: string) => {
//   const docRef = doc(db, 'p_store', id);
//   const docSnap = await getDoc(docRef);
//   if (docSnap.exists()) {
//     return { data: docSnap.data() as StoreDetails };
//   } else {
//     return { data: null };
//   }
// };

// export const deleteStore = async (id: string) => {
//   try {
//     await deleteDoc(doc(db, 'p_store', id));
//     return { success: true };
//   } catch (error) {
//     return { success: false, error: error instanceof Error ? error.message : String(error) };
//   }
// }; 





// // ----------------------------------------------------------------------------------------------------


// // q_subcatogries.ts file



// // Define translation type
// interface SubCategoryTranslation {
//   id: string;
//   locale: string;
//   title: string;
//   description: string;
// }

// // Define the params type
// interface SubCategoryQueryParams {
//   params?: {
//     status?: string;
//     lang?: string;
//     category_id?: string;
//     [key: string]: unknown;
//   };
// }

// // Create sub-category with multilingual support
// export const createSubCategoriesDb = async (orgId: string, payload: { params: Record<string, unknown> }) => {
//   const { params } = payload;
//   const did = uuidv4();
//   const supportedLanguages = ['en', 'fr', 'th'];
//   const translations: SubCategoryTranslation[] = [];
//   const locales: string[] = [];
//   let primaryTitle = '';
//   let primaryDescription = '';
  
//   supportedLanguages.forEach(lang => {
//     let title: string | null = null;
//     if (typeof params[`title[${lang}]`] === 'string') {
//       title = params[`title[${lang}]`] as string;
//     } else if (typeof (params.title as Record<string, string> | undefined)?.[lang] === 'string') {
//       title = (params.title as Record<string, string>)[lang];
//     } else if (lang === 'en' && typeof params.title === 'string') {
//       title = params.title as string;
//     }
    
//     let description: string | null = null;
//     if (typeof params[`description[${lang}]`] === 'string') {
//       description = params[`description[${lang}]`] as string;
//     } else if (typeof (params.description as Record<string, string> | undefined)?.[lang] === 'string') {
//       description = (params.description as Record<string, string>)[lang];
//     } else if (lang === 'en' && typeof params.description === 'string') {
//       description = params.description as string;
//     }
    
//     if (title) {
//       translations.push({
//         id: did,
//         locale: lang,
//         title: title,
//         description: description || ""
//       });
//       locales.push(lang);
//       if ((!primaryTitle || lang === 'en') && title) {
//         primaryTitle = title;
//         primaryDescription = description || "";
//       }
//     }
//   });
  
//   if (translations.length === 0) {
//     translations.push({
//       id: did,
//       locale: 'en',
//       title: "",
//       description: ""
//     });
//     locales.push('en');
//     primaryTitle = "";
//     primaryDescription = "";
//   }
  
//   const imageUrl = (params['images[0]'] as string) || (Array.isArray(params.images) && (params.images as string[])[0]) || "https://cdnimg.webstaurantstore.com/uploads/design/2023/5/Homepage-Categories/category-refrigeration.png";
//   const isActive = params.active === undefined ? false : Boolean(params.active);
  
//   const subCategoryData = {
//     id: did,
//     uuid: did,
//     keywords: params?.keywords || "",
//     type: params?.type || "sub",
//     input: 32767,
//     img: imageUrl,
//     active: isActive,
//     status: params?.status || "published",
//     created_at: Timestamp.now().toMillis(),
//     updated_at: Timestamp.now().toMillis(),
//     shop: null,
//     children: [],
//     parent: params.category_id || null, // Link to parent category
//     title: primaryTitle,
//     description: primaryDescription,
//     translation: translations[0],
//     translations: translations,
//     locales: locales,
//     category_id: params.category_id || null // Store parent category ID
//   };
  
//   try {
//     await setDoc(doc(db, `p_subcategory`, did), subCategoryData);
//     return {
//       success: true,
//       id: did,
//       ...subCategoryData,
//       _timestamp: new Date().getTime()
//     };
//   } catch (error) {
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : String(error)
//     };
//   }
// };

// // Update sub-category with multilingual support
// export const updateSubCategory = async (uid: string, params: Record<string, unknown>) => {
//   const docRef = doc(db, `p_subcategory`, uid);
//   const docSnap = await getDoc(docRef);
//   if (!docSnap.exists()) {
//     throw new Error(`Sub-category with ID ${uid} not found`);
//   }
  
//   const existingData = docSnap.data();
//   const updateData = { ...existingData };
//   const supportedLanguages = ['en', 'fr', 'th'];
//   const translations: SubCategoryTranslation[] = [...(updateData.translations || [])];
//   const locales: string[] = [...(updateData.locales || [])];
//   let primaryTitle = updateData.title;
//   let primaryDescription = updateData.description;
//   const primaryLocale = updateData.translation?.locale || 'en';
  
//   supportedLanguages.forEach(lang => {
//     let hasUpdate = false;
//     let title: string | null = null;
//     let description: string | null = null;
    
//     if (typeof params[`title[${lang}]`] === 'string') {
//       title = params[`title[${lang}]`] as string;
//       hasUpdate = true;
//     } else if (typeof (params.title as Record<string, string> | undefined)?.[lang] === 'string') {
//       title = (params.title as Record<string, string>)[lang];
//       hasUpdate = true;
//     } else if (lang === 'en' && typeof params.title === 'string' && params.title !== undefined) {
//       title = params.title as string;
//       hasUpdate = true;
//     }
    
//     if (typeof params[`description[${lang}]`] === 'string') {
//       description = params[`description[${lang}]`] as string;
//       hasUpdate = true;
//     } else if (typeof (params.description as Record<string, string> | undefined)?.[lang] === 'string') {
//       description = (params.description as Record<string, string>)[lang];
//       hasUpdate = true;
//     } else if (lang === 'en' && typeof params.description === 'string' && params.description !== undefined) {
//       description = params.description as string;
//       hasUpdate = true;
//     }
    
//     if (hasUpdate) {
//       const langTranslationIndex = translations.findIndex((t) => t.locale === lang);
//       if (langTranslationIndex >= 0) {
//         const updatedTranslation = { ...translations[langTranslationIndex] };
//         if (title !== null) updatedTranslation.title = title;
//         if (description !== null) updatedTranslation.description = description || updatedTranslation.description;
//         translations[langTranslationIndex] = updatedTranslation;
//       } else {
//         translations.push({
//           id: uid,
//           locale: lang,
//           title: title || "",
//           description: description || ""
//         });
//         if (!locales.includes(lang)) {
//           locales.push(lang);
//         }
//       }
//       if (lang === primaryLocale || (lang === 'en' && !primaryLocale)) {
//         if (title !== null) primaryTitle = title;
//         if (description !== null) primaryDescription = description;
//       }
//     }
//   });
  
//   if (Array.isArray(params.images) && (params.images as string[])[0]) updateData.img = (params.images as string[])[0];
//   if (typeof params['images[0]'] === 'string') updateData.img = params['images[0]'] as string;
//   if (params.active !== undefined) updateData.active = params.active;
//   if (params.keywords !== undefined) updateData.keywords = params.keywords;
//   if (params.type !== undefined) updateData.type = params.type;
//   if (params.status !== undefined) updateData.status = params.status;
//   if (params.category_id !== undefined) updateData.category_id = params.category_id;
  
//   updateData.updated_at = Timestamp.now().toMillis();
//   updateData.translations = translations;
//   updateData.locales = locales;
//   updateData.title = primaryTitle;
//   updateData.description = primaryDescription;
//   const primaryTranslation = translations.find((t) => t.locale === primaryLocale) || translations[0];
//   updateData.translation = primaryTranslation;
  
//   await setDoc(doc(db, `p_subcategory`, uid), updateData, { merge: true });
//   return { success: true, id: uid, data: updateData };
// };

// // Get all sub-categories with multilingual display
// export const getAllSubCategories = async (orgId = '', params: SubCategoryQueryParams = {}) => {
//   const constraints = [];
  
//   // Filter by category if specified
//   if (params?.params?.category_id && params.params.category_id !== 'undefined' && params.params.category_id !== '') {
//     constraints.push(where('category_id', '==', params.params.category_id));
//   }
  
//   const filesQuery = query(
//     collection(db, `p_subcategory`),
//     ...constraints
//   );
  
//   const querySnapshot = await getDocs(filesQuery);
//   const files = querySnapshot.docs.map((docSnap) => {
//     const x = docSnap.data();
//     x.id = docSnap.id;
//     x.uuid = docSnap.id;
//     if (!x.title && x.translations && x.translations.length > 0) {
//       const preferredLang = params?.params?.lang || 'en';
//       const preferredTranslation = x.translations.find((t: SubCategoryTranslation) => t.locale === preferredLang);
//       if (preferredTranslation) {
//         x.title = preferredTranslation.title;
//       } else {
//         x.title = x.translations[0].title;
//       }
//     }
//     return x;
//   });
  
//   return {
//     data: files,
//     meta: {
//       current_page: 1,
//       from: 1,
//       last_page: 1,
//       links: [
//         { url: null, label: "« Previous", active: false },
//         { url: "https://single-api.foodyman.org/api/v1/dashboard/admin/subcategories/paginate?page=1", label: "1", active: true },
//         { url: null, label: "Next »", active: false }
//       ],
//       path: "https://single-api.foodyman.org/api/v1/dashboard/admin/subcategories/paginate",
//       per_page: "1000",
//       to: files.length,
//       total: files.length
//     }
//   };
// };

// // Get sub-category by ID with multilingual display
// export const getAllSubCategoriesById = async (orgId = '', uid: string, payload: SubCategoryQueryParams = {}) => {
//   const docRef = doc(db, `p_subcategory`, uid);
//   const docSnap = await getDoc(docRef);
//   if (docSnap.exists() && docSnap.data()) {
//     const x = docSnap.data();
//     x.id = docSnap.id;
//     x.uuid = docSnap.id;
//     x.img = x['images[0]'] || x.img;
//     if (!x.title && x.translations && x.translations.length > 0) {
//       const preferredLang = payload?.params?.lang || 'en';
//       const preferredTranslation = x.translations.find((t: SubCategoryTranslation) => t.locale === preferredLang);
//       if (preferredTranslation) {
//         x.title = preferredTranslation.title;
//       } else {
//         x.title = x.translations[0].title;
//       }
//     }
//     return { data: x };
//   } else {
//     return { data: null };
//   }
// };

// // Delete sub-categories by IDs
// export const deleteSubCategory = async (params: Record<string, string | number | boolean>) => {
//   const ids = Object.values(params);
//   if (Array.isArray(ids)) {
//     await Promise.all(
//       ids.map(async (item) => {
//         await deleteDoc(doc(db, 'p_subcategory', String(item)));
//       })
//     );
//     return true;
//   } else {
//     throw new Error('Invalid parameter format for deletion');
//   }
// };

// // Toggle active status for a sub-category
// export const setActiveSubCategory = async (id: string) => {
//   const subCategoryId = id.includes('/') ? id.split('/').pop() : id;
//   const docRef = doc(db, `p_subcategory`, subCategoryId!);
//   const docSnap = await getDoc(docRef);
//   if (!docSnap.exists()) {
//     throw new Error(`Sub-category with ID ${subCategoryId} not found`);
//   }
  
//   const subCategoryData = docSnap.data();
//   const currentActive = subCategoryData.active === true;
//   const newActive = !currentActive;
  
//   await updateDoc(docRef, {
//     active: newActive,
//     updated_at: Timestamp.now().toMillis()
//   });
  
//   const title = subCategoryData.title || (subCategoryData.translations && subCategoryData.translations.length > 0 ? subCategoryData.translations[0].title : "");
  
//   const response = {
//     timestamp: new Date().toISOString(),
//     status: true,
//     data: {
//       id: subCategoryId,
//       uuid: subCategoryId,
//       active: newActive,
//       created_at: subCategoryData.created_at || Timestamp.now().toMillis(),
//       updated_at: Timestamp.now().toMillis(),
//       title: title,
//       translation: {
//         id: subCategoryId,
//         locale: "en",
//         title: title
//       },
//       locales: subCategoryData.locales || ["en"]
//     }
//   };
//   return response;
// };






// // ----------------------------------------------------------------------------------------------------



// // q_subscriptions.ts file


// import {
//   collection,
//   doc,
//   getDoc,
//   getDocs,
//   query,
//   where,
//   setDoc,
//   updateDoc,
//   addDoc,
//   orderBy,
//   limit,
// } from 'firebase/firestore';
// import { generateNextOrderId, generateNextOrderItemId, addOrUpdateOrderItem } from './q_orders';
// import { getAllProductsById, getStocksByProductId, updateStockQuantity } from './q_products';
// import { deductFromWallet } from './q_wallets';

// export type SubscriptionType = 'Daily' | 'Weekend' | 'Alternate' | 'Every 3 Days';

// export interface SubscriptionRecord {
//   id?: string;
//   subscription_id: string;
//   user_id: string;
//   product_id: string;
//   product_variant?: string;
//   price: number;
//   type: SubscriptionType;
//   status: 'active' | 'inactive' | 'paused' | 'vacation' | string;
//   is_paused: boolean;
//   start_date: string; // ISO
//   start_timestamp?: string; // Unix timestamp in milliseconds
//   next_delivery_date: string; // Unix timestamp in milliseconds (as string)
//   delivery_start_time: string; // e.g., "08:00"
//   delivery_end_time?: string; // Optional: e.g., "10:00" - synced from delivery schedules
//   subscription_days: string[]; // ['Mon', 'Tue', ...] or timestamp array
//   cancelled_at?: string | null;
//   vacation_start?: string; // Unix timestamp in milliseconds
//   vacation_end?: string; // Unix timestamp in milliseconds
// }

// const SUBSCRIPTIONS_COLLECTION = 'p_subscriptions';

// function getSubscriptionDays(type: SubscriptionType): string[] {
//   switch (type) {
//     case 'Daily':
//       return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
//     case 'Weekend':
//       return ['Sat','Sun'];
//     case 'Alternate':
//       return ['Mon','Wed','Fri'];
//     case 'Every 3 Days':
//       return []; // Computed via next date increments; days array not required
//     default:
//       return [];
//   }
// }

// export async function activateSubscription(input: Omit<SubscriptionRecord,
//   'subscription_days' | 'is_paused' | 'status'> & { start_date: string; next_delivery_date?: string; }) {
//   const start = new Date(input.start_date);
//   const next = input.next_delivery_date ? parseTimestamp(input.next_delivery_date) : start;
//   const record: any = {
//     ...input,
//     next_delivery_date: next.getTime().toString(), // Store as milliseconds
//     // Map from input's delivery_time_start/delivery_time_end to subscription's delivery_start_time/delivery_end_time
//     delivery_start_time: (input as any).delivery_start_time || (input as any).delivery_time_start,
//     delivery_end_time: (input as any).delivery_end_time || (input as any).delivery_time_end,
//     start_date: start.toISOString(),
//     status: 'active',
//     is_paused: false,
//     subscription_days: getSubscriptionDays(input.type),
//   } as SubscriptionRecord;

//   await setDoc(doc(collection(db, SUBSCRIPTIONS_COLLECTION), input.subscription_id), record);
//   return { success: true, data: record };
// }

// function addDays(date: Date, days: number): Date {
//   const d = new Date(date);
//   d.setDate(d.getDate() + days);
//   return d;
// }

// function nextWeekendDate(from: Date): Date {
//   const d = new Date(from);
//   // move to next day for subsequent cycles
//   let i = 0;
//   while (i < 8) {
//     const day = d.getDay(); // 0 Sun - 6 Sat
//     if (day === 6 || day === 0) return d;
//     d.setDate(d.getDate() + 1);
//     i++;
//   }
//   return d;
// }

// export function computeNextDeliveryDate(currentNextISO: string, type: SubscriptionType): string {
//   const base = new Date(currentNextISO);
//   let next: Date;
//   switch (type) {
//     case 'Daily':
//       next = addDays(base, 1);
//       break;
//     case 'Alternate':
//       next = addDays(base, 2);
//       break;
//     case 'Every 3 Days':
//       next = addDays(base, 3);
//       break;
//     case 'Weekend':
//       next = nextWeekendDate(addDays(base, 1));
//       break;
//     default:
//       next = addDays(base, 1);
//   }
//   // Return as milliseconds (string format for Firestore compatibility)
//   return next.getTime().toString();
// }

// // Helper to check if a date is within vacation period
// function isInVacationPeriod(deliveryDate: Date, vacationStart?: string, vacationEnd?: string): boolean {
//   if (!vacationStart || !vacationEnd) return false;
  
//   const vacationStartDate = new Date(Number(vacationStart));
//   const vacationEndDate = new Date(Number(vacationEnd));
//   const delivery = new Date(deliveryDate);
  
//   return delivery >= vacationStartDate && delivery <= vacationEndDate;
// }

// // Helper to parse timestamp string to Date
// export function parseTimestamp(timestamp: string | number | Date): Date {
//   if (typeof timestamp === 'string') {
//     // Check if it's a Unix timestamp (milliseconds)
//     if (/^\d+$/.test(timestamp)) {
//       return new Date(Number(timestamp));
//     }
//     // Otherwise treat as ISO string
//     return new Date(timestamp);
//   }
//   if (typeof timestamp === 'number') {
//     return new Date(timestamp);
//   }
//   return timestamp;
// }

// export async function getAllActiveSubscriptions() {
//   // Get subscriptions with status 'active' or 'vacation'
//   // Firestore 'in' operator supports up to 10 values, we only have 2 so it's fine
//   const qActive = query(
//     collection(db, SUBSCRIPTIONS_COLLECTION),
//     where('status', 'in', ['active', 'vacation'])
//   );
//   const snap = await getDocs(qActive);
//   return snap.docs.map(d => ({ id: d.id, ...d.data() } as SubscriptionRecord));
// }

// export async function getActiveSubscriptionsForToday(todayDateOnlyISO: string) {
//   // Compare by date only (YYYY-MM-DD)
//   const todayDate = new Date(todayDateOnlyISO).toISOString().slice(0,10);
//   const qActive = query(collection(db, SUBSCRIPTIONS_COLLECTION), where('status','==','active'), where('is_paused','==',false));
//   const snap = await getDocs(qActive);
//   const subscriptions = snap.docs
//     .map(d => ({ id: d.id, ...d.data() } as SubscriptionRecord))
//     .filter(s => {
//       const nextDelivery = parseTimestamp(s.next_delivery_date);
//       const nextDeliveryDateOnly = nextDelivery.toISOString().slice(0,10);
      
//       // Check if next_delivery_date matches today
//       if (nextDeliveryDateOnly !== todayDate) return false;
      
//       // Check if delivery date falls within vacation period
//       if (isInVacationPeriod(nextDelivery, s.vacation_start, s.vacation_end)) {
//         return false; // Skip if in vacation period
//       }
      
//       return true;
//     });
//   return subscriptions;
// }

// export interface GenerateResult {
//   processed: number;
//   createdOrders: string[];
//   skipped: { subscription_id: string; reason: string }[];
// }

// export async function generateSubscriptionOrders(todayISO: string): Promise<GenerateResult> {
//   const subs = await getActiveSubscriptionsForToday(todayISO);
//   const createdOrders: string[] = [];
//   const skipped: { subscription_id: string; reason: string }[] = [];

//   for (const sub of subs) {
//     try {
//       // Wallet deduction first - ensures affordability
//       const price = Number(sub.price) || 0;
//       const walletResult = await deductFromWallet(sub.user_id, price, { type: 'subscription_precheck' });
//       if (!walletResult.success) {
//         skipped.push({ subscription_id: sub.subscription_id, reason: walletResult.message || 'Insufficient wallet balance' });
//         continue;
//       }

//       // Create order
//       const orderId = await generateNextOrderId();
//       const now = getISTISOString();

//       // Minimal order doc
//       await setDoc(doc(db, 'p_orders', orderId), {
//         id: orderId,
//         user_id: sub.user_id,
//         created_at: now,
//         updated_at: now,
//         total_price: price,
//         origin_price: price,
//         order_status: 'new',
//         subStatus: 'Pending Confirmation',
//         source: 'subscription',
//         delivery_time: (sub as any).delivery_start_time || null,
//         delivery_date: new Date(sub.next_delivery_date).toISOString(),
//       });

//       // Add order item and reduce stock
//       const quantity = 1;
//       const { data: productData } = await getAllProductsById('', sub.product_id);
//       let stockToUse: { id?: string } | null = null;
//       if (productData?.stocks && productData.stocks.length > 0) {
//         stockToUse = productData.stocks[0];
//       }
//       if (stockToUse?.id) {
//         await updateStockQuantity(sub.product_id, stockToUse.id as string, -quantity);
//       }

//       const orderItem = {
//         order_item_id: await generateNextOrderItemId(),
//         order_id: orderId,
//         product_id: sub.product_id,
//         quantity,
//         subtotal: price * quantity,
//         status: 'Active',
//         order_item_status: 'orderReceived',
//         order_item_substatus: 'Order confirmed',
//         stock_id: (stockToUse?.id as string | undefined),
//       };
      
//       await addOrUpdateOrderItem(orderId, orderItem);

//       // Create delivery_dates array similar to non-subscription orders
//       // Read from delivery_start_time/delivery_end_time (correct subscription keys)
//       const deliveryTimeStr = (sub as any).delivery_start_time || '08:00';
//       // Use delivery_end_time from subscription if available, otherwise add 2 hours to start time
//       let deliveryTimeEnd: string;
//       if ((sub as any).delivery_end_time) {
//         deliveryTimeEnd = (sub as any).delivery_end_time;
//       } else {
//         // Default: add 2 hours to start time
//         const [hours, minutes] = deliveryTimeStr.split(':').map(Number);
//         const endHours = (hours + 2) % 24;
//         deliveryTimeEnd = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
//       }
      
//       const deliveryDate = new Date(sub.next_delivery_date);
//       const deliveryDatesArray = [{
//         delivery_date: deliveryDate.getTime(), // timestamp in milliseconds
//         delivery_time_start: deliveryTimeStr,
//         delivery_time_end: deliveryTimeEnd,
//         order_item_id: orderItem.order_item_id,
//       }];

//       // Calculate products_price and other_charges
//       const productsPrice = orderItem.subtotal; // Product subtotal from order item
//       const otherCharges = Math.max(0, price - productsPrice); // Other charges (for subscriptions, usually 0)

//       // Update order with products_price, other_charges, and delivery_dates array
//       await updateDoc(doc(db, 'p_orders', orderId), {
//         products_price: productsPrice,
//         other_charges: otherCharges,
//         delivery_dates: deliveryDatesArray,
//         updated_at: now,
//       });

//       // Finalize wallet transaction to link order
//       await deductFromWallet(sub.user_id, price, { type: 'deduct', method: 'wallet', orderId });

//       // Update next delivery date based on the ACTUAL delivery date used for this order
//       // Normalize the delivery date to start of day to ensure consistent calculation
//       const deliveryDateForOrder = parseTimestamp(sub.next_delivery_date);
//       deliveryDateForOrder.setHours(0, 0, 0, 0);
      
//       // Compute next delivery date from the actual delivery date being used
//       // Pass as ISO string for computation, function will return milliseconds
//       const next = computeNextDeliveryDate(deliveryDateForOrder.toISOString(), sub.type);
      
//       try {
//         await updateDoc(doc(db, SUBSCRIPTIONS_COLLECTION, sub.subscription_id), {
//           next_delivery_date: next,
//           updated_at: now,
//         });
//         console.log(`Updated subscription ${sub.subscription_id}: next_delivery_date from ${sub.next_delivery_date} to ${next}`);
//       } catch (updateErr) {
//         console.error(`Error updating next_delivery_date for subscription ${sub.subscription_id}:`, updateErr);
//         // Don't fail the entire operation if update fails, but log it
//         // The order was already created successfully
//       }

//       createdOrders.push(orderId);
//     } catch (err) {
//       skipped.push({ subscription_id: sub.subscription_id, reason: (err as Error).message });
//     }
//   }

//   return { processed: subs.length, createdOrders, skipped };
// }

// // Manual subscription order generation
// // Generates orders for subscriptions whose next_delivery_date is within 24 hours
// /**
//  * Sync subscriptions with updated delivery schedule times
//  * This function updates all subscriptions that match a delivery schedule's products/category
//  * with the schedule's delivery_time_start and delivery_time_end
//  */
// export async function syncSubscriptionsWithDeliverySchedule(
//   schedule: {
//     category_id: string;
//     product_ids?: string[];
//     delivery_time_start: string;
//     delivery_time_end?: string;
//   }
// ): Promise<{ success: boolean; updatedCount: number; message: string }> {
//   try {
//     // Get all active subscriptions
//     const allSubscriptions = await getAllActiveSubscriptions();
    
//     // Filter subscriptions that match the delivery schedule
//     const matchingSubscriptions: SubscriptionRecord[] = [];
    
//     for (const sub of allSubscriptions) {
//       // Get product details to check category
//       try {
//         const { data: productData } = await getAllProductsById('', sub.product_id);
        
//         if (!productData) continue;
        
//         const productCategoryId = productData.category_id;
//         const productId = sub.product_id;
        
//         // Check if subscription matches the schedule:
//         // 1. If schedule has specific product_ids, check if this product is in the list
//         // 2. Otherwise, check if product's category matches schedule's category
//         let matches = false;
        
//         if (schedule.product_ids && schedule.product_ids.length > 0) {
//           // Schedule has specific products - match by product ID
//           matches = schedule.product_ids.includes(productId);
//         } else {
//           // Schedule applies to all products in category - match by category
//           matches = productCategoryId === schedule.category_id;
//         }
        
//         if (matches) {
//           matchingSubscriptions.push(sub);
//         }
//       } catch (err) {
//         console.error(`Error checking product ${sub.product_id} for subscription sync:`, err);
//         // Continue with other subscriptions
//       }
//     }
    
//     // Update matching subscriptions
//     let updatedCount = 0;
    
//     for (const sub of matchingSubscriptions) {
//       try {
//         // Update subscriptions with delivery_start_time and delivery_end_time (correct keys for subscriptions)
//         // Schedule uses delivery_time_start/delivery_time_end, but subscriptions use delivery_start_time/delivery_end_time
//         const updateData: any = {
//           delivery_start_time: schedule.delivery_time_start,
//         };
        
//         // Add delivery_end_time if provided (map from schedule's delivery_time_end)
//         if (schedule.delivery_time_end) {
//           updateData.delivery_end_time = schedule.delivery_time_end;
//         }
        
//         await updateDoc(doc(db, SUBSCRIPTIONS_COLLECTION, sub.subscription_id), updateData);
//         updatedCount++;
//       } catch (err) {
//         console.error(`Error updating subscription ${sub.subscription_id}:`, err);
//         // Continue with other subscriptions
//       }
//     }
    
//     return {
//       success: true,
//       updatedCount,
//       message: `Successfully updated ${updatedCount} subscription(s) with new delivery times`,
//     };
//   } catch (err) {
//     return {
//       success: false,
//       updatedCount: 0,
//       message: `Failed to sync subscriptions: ${(err as Error).message}`,
//     };
//   }
// }

// export async function generateManualSubscriptionOrder(subscriptionId: string): Promise<{ success: boolean; orderId?: string; message: string }> {
//   try {
//     const subDoc = await getDoc(doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId));
//     if (!subDoc.exists()) {
//       return { success: false, message: 'Subscription not found' };
//     }

//     const sub = { id: subDoc.id, ...subDoc.data() } as SubscriptionRecord;

//     // Check if subscription is active or vacation status
//     if (sub.status !== 'active' && sub.status !== 'vacation') {
//       return { success: false, message: 'Subscription is not active' };
//     }

//     // Parse next_delivery_date
//     const nextDeliveryDate = parseTimestamp(sub.next_delivery_date);
//     const deliveryDateStr = nextDeliveryDate.toISOString().split('T')[0]; // Get date only (YYYY-MM-DD)
//     const now = new Date();
//     const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

//     // Check if next_delivery_date is within 24 hours from now
//     if (nextDeliveryDate < now) {
//       return { success: false, message: 'Next delivery date is in the past' };
//     }
//     if (nextDeliveryDate > twentyFourHoursFromNow) {
//       return { success: false, message: 'Next delivery date is more than 24 hours away' };
//     }

//     // Check if vacation has ended
//     let vacationEnded = false;
//     if (sub.vacation_end) {
//       const vacationEnd = new Date(Number(sub.vacation_end));
//       vacationEnded = vacationEnd < now;
//     }

//     // Check if delivery date falls within vacation period (only if vacation hasn't ended)
//     if (!vacationEnded && isInVacationPeriod(nextDeliveryDate, sub.vacation_start, sub.vacation_end)) {
//       return { success: false, message: 'Cannot generate order during vacation period' };
//     }

//     // If subscription is paused but vacation has ended, we'll allow order generation and update is_paused
//     if (sub.is_paused && !vacationEnded) {
//       return { success: false, message: 'Subscription is paused' };
//     }

//     // Check for duplicate order - prevent creating duplicate orders for same subscription and delivery date
//     const existingOrdersQuery = query(
//       collection(db, 'p_orders'),
//       where('subscription_id', '==', sub.subscription_id),
//       where('is_subscription', '==', true)
//     );
//     const existingOrdersSnap = await getDocs(existingOrdersQuery);
    
//     for (const existingOrderDoc of existingOrdersSnap.docs) {
//       const existingOrder = existingOrderDoc.data();
//       if (existingOrder.delivery_date) {
//         const existingDeliveryDate = parseTimestamp(existingOrder.delivery_date);
//         const existingDateStr = existingDeliveryDate.toISOString().split('T')[0];
        
//         // If an order already exists for this subscription and delivery date, skip
//         if (existingDateStr === deliveryDateStr) {
//           return { success: false, message: `Order already exists for delivery date ${deliveryDateStr}` };
//         }
//       }
//     }

//     // Fetch user information to include in order - match by doc_id
//     // Use the same logic as SubscriptionsOrders.tsx to compute name
//     let userInfo: { computedName: string; email: string } = { computedName: 'Unknown User', email: '' };
//     try {
//       const userDoc = await getDoc(doc(db, 'users', sub.user_id));
//       if (userDoc.exists()) {
//         const userData = userDoc.data();
//         const docId = userDoc.id; // This is the doc_id (document ID)
//         // Match subscriptions.user_id with users.doc_id
//         if (docId === sub.user_id) {
//           // Use the exact same logic as SubscriptionsOrders.tsx:
//           // name || firstname + lastname || email || 'Unknown User'
//           const computedName = userData.name || 
//             `${userData.firstname || ''} ${userData.lastname || ''}`.trim() || 
//             userData.email || 
//             'Unknown User';
//           userInfo = {
//             computedName,
//             email: userData.email || '',
//           };
//         }
//       }
//     } catch (userErr) {
//       console.error(`Error fetching user ${sub.user_id}:`, userErr);
//       // Continue without user info if fetch fails
//     }

//     // Fetch address information based on user doc_id
//     let addressInfo: Record<string, string> | null = null;
//     try {
//       const addressDoc = await getDoc(doc(db, 'address', sub.user_id));
//       if (addressDoc.exists()) {
//         const addressData = addressDoc.data();
//         // Get the first address from addresses array or use the address data directly
//         if (addressData.addresses && Array.isArray(addressData.addresses) && addressData.addresses.length > 0) {
//           // Use the first address or the default address
//           const defaultAddress = addressData.addresses.find((addr: any) => addr.defaultaddress === true) || addressData.addresses[0];
//           addressInfo = {
//             house: defaultAddress.houseNo || defaultAddress.house || '',
//             street: defaultAddress.street || '',
//             landmark: defaultAddress.landmark || '',
//             pincode: defaultAddress.pincode || '',
//             city: defaultAddress.city || '',
//             state: defaultAddress.state || ''
//           };
//         } else {
//           // Address data is directly on the document
//           addressInfo = {
//             house: addressData.houseNo || addressData.house || '',
//             street: addressData.street || '',
//             landmark: addressData.landmark || '',
//             pincode: addressData.pincode || '',
//             city: addressData.city || '',
//             state: addressData.state || ''
//           };
//         }
//       }
//     } catch (addressErr) {
//       console.error(`Error fetching address for user ${sub.user_id}:`, addressErr);
//       // Continue without address if fetch fails
//     }

//     // Wallet deduction first - ensures affordability
//     const price = Number(sub.price) || 0;
//     const walletResult = await deductFromWallet(sub.user_id, price, { type: 'subscription_precheck' });
//     if (!walletResult.success) {
//       return { success: false, message: walletResult.message || 'Insufficient wallet balance' };
//     }

//     // Create order
//     const orderId = await generateNextOrderId();
//     const nowISO = getISTISOString();


//     // Create order with is_subscription flag, user info, address, and delivery date/time
//     // Note: products_price and other_charges will be calculated after order item is created
//     const orderData: any = {
//       id: orderId,
//       user_id: sub.user_id,
//       created_at: nowISO,
//       updated_at: nowISO,
//       total_price: price,
//       origin_price: price,
//       order_status: 'orderReceived',
//       subStatus: 'Order confirmed',
//       source: 'subscription',
//       is_subscription: true,
//       subscription_id: sub.subscription_id,
//       delivery_date: nextDeliveryDate.toISOString(),
//       delivery_time: (sub as any).delivery_start_time || null,
//       products_price: 0, // Will be updated after order item creation
//       other_charges: 0, // Will be updated after order item creation
//     };

//     // Always add user information - use the computed name (same as displayed in subscriptions)
//     // Store the computed name in firstname field (as requested)
//     orderData.user = {
//       firstname: userInfo.computedName, // The name displayed in subscriptions section
//       email: userInfo.email,
//     };

//     // Add address information if available
//     if (addressInfo) {
//       orderData.address = addressInfo;
//     }

//     await setDoc(doc(db, 'p_orders', orderId), orderData);

//     // Add order item and reduce stock - match variant correctly
//     const quantity = 1;
//     const { data: productData } = await getAllProductsById('', sub.product_id);
    
//     let stockToUse: any = null;
//     let variantIdToUse: string | undefined = undefined;
    
//     // If product_variant is specified, try to find matching stock with that variant
//     if (sub.product_variant && productData?.stocks && Array.isArray(productData.stocks)) {
//       // Try to find stock that matches the variant value or variant ID
//       for (const stock of productData.stocks) {
//         if (stock.extras && Array.isArray(stock.extras)) {
//           // Check if any extra matches the product_variant (by value or id)
//           const matchingExtra = stock.extras.find((extra: any) => {
//             if (typeof extra === 'object' && extra !== null) {
//               // Match by variant value (display name) or variant ID
//               return extra.value === sub.product_variant || extra.id === sub.product_variant;
//             }
//             return false;
//           });
          
//           if (matchingExtra && typeof matchingExtra === 'object' && matchingExtra.id) {
//             stockToUse = stock;
//             variantIdToUse = matchingExtra.id;
//             break;
//           }
//         }
//       }
//     }
    
//     // If no variant match found, fall back to first stock (or price match if product_variant is not set)
//     if (!stockToUse && productData?.stocks && productData.stocks.length > 0) {
//       if (sub.product_variant) {
//         // Try price matching if variant string didn't match
//         const matchingStock = productData.stocks.find((stock: any) => {
//           const stockPrice = Number(stock.price) || 0;
//           return Math.abs(stockPrice - price) < 0.01;
//         });
//         stockToUse = matchingStock || productData.stocks[0];
//       } else {
//         stockToUse = productData.stocks[0];
//       }
//     }
    
//     // If we found a stock with variant, get the variant ID from it
//     if (!variantIdToUse && stockToUse?.extras && Array.isArray(stockToUse.extras)) {
//       const firstExtra = stockToUse.extras.find((e: any) => e && typeof e === 'object' && e.id);
//       if (firstExtra && typeof firstExtra === 'object' && firstExtra.id) {
//         variantIdToUse = firstExtra.id;
//       }
//     }
    
//     // Reduce stock quantity
//     if (stockToUse?.id) {
//       await updateStockQuantity(sub.product_id, stockToUse.id as string, -quantity);
//     }

//     const orderItemData: any = {
//       order_item_id: await generateNextOrderItemId(),
//       order_id: orderId,
//       product_id: sub.product_id,
//       quantity,
//       subtotal: price * quantity,
//       status: 'Active',
//       order_item_status: 'orderReceived',
//       order_item_substatus: 'Order confirmed',
//       // Add delivery_date and delivery_time_start to order item (matching how orders display delivery info)
//       // Read from delivery_start_time/delivery_end_time (correct subscription keys) but write as delivery_time_start/delivery_time_end
//       delivery_date: nextDeliveryDate.getTime(), // timestamp in milliseconds
//       delivery_time_start: (sub as any).delivery_start_time || null,
//       delivery_time_end: (sub as any).delivery_end_time || null,
//     };
    
//     // Add variant_id if found (this ensures variant is properly matched in orders)
//     if (variantIdToUse) {
//       orderItemData.variant_id = variantIdToUse;
//     }
    
//     // Add stock_id if found (avoid undefined)
//     if (stockToUse?.id) {
//       orderItemData.stock_id = stockToUse.id;
//     }
    
//     await addOrUpdateOrderItem(orderId, orderItemData);

//     // Create delivery_dates array similar to non-subscription orders
//     // Read from delivery_start_time/delivery_end_time (correct subscription keys)
//     const deliveryTimeStr = (sub as any).delivery_start_time || '08:00';
//     // Use delivery_end_time from subscription if available, otherwise add 2 hours to start time
//     let deliveryTimeEnd: string;
//     if ((sub as any).delivery_end_time) {
//       deliveryTimeEnd = (sub as any).delivery_end_time;
//     } else {
//       // Default: add 2 hours to start time
//       const [hours, minutes] = deliveryTimeStr.split(':').map(Number);
//       const endHours = (hours + 2) % 24;
//       deliveryTimeEnd = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
//     }
    
//     const deliveryDatesArray = [{
//       delivery_date: nextDeliveryDate.getTime(), // timestamp in milliseconds
//       delivery_time_start: deliveryTimeStr,
//       delivery_time_end: deliveryTimeEnd,
//       order_item_id: orderItemData.order_item_id,
//     }];

//     // Calculate products_price and other_charges
//     // products_price = sum of all product subtotals (from order items)
//     // other_charges = total_price - products_price (delivery charges, taxes, etc.)
//     const productsPrice = orderItemData.subtotal; // Product subtotal from order item
//     const otherCharges = Math.max(0, price - productsPrice); // Other charges (for subscriptions, usually 0)

//     // Update order with products_price, other_charges, and delivery_dates array
//     await updateDoc(doc(db, 'p_orders', orderId), {
//       products_price: productsPrice,
//       other_charges: otherCharges,
//       delivery_dates: deliveryDatesArray,
//       updated_at: nowISO,
//     });

//     // Finalize wallet transaction to link order
//     await deductFromWallet(sub.user_id, price, { type: 'deduct', method: 'wallet', orderId });

//     // Update next delivery date based on the ACTUAL delivery date used for this order
//     // Normalize the delivery date to start of day to ensure consistent calculation
//     const actualDeliveryDate = new Date(nextDeliveryDate);
//     actualDeliveryDate.setHours(0, 0, 0, 0);
    
//     // Compute next delivery date from the actual delivery date being used
//     // Pass as ISO string for computation, function will return milliseconds
//     const next = computeNextDeliveryDate(actualDeliveryDate.toISOString(), sub.type);
    
//     try {
//       // Prepare update data
//       const updateData: any = {
//         next_delivery_date: next,
//         updated_at: nowISO,
//       };

//       // If vacation has ended and subscription is paused, update is_paused to false
//       if (vacationEnded && sub.is_paused) {
//         updateData.is_paused = false;
//         console.log(`Vacation has ended for subscription ${subscriptionId}, updating is_paused to false`);
//       }

//       await updateDoc(doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId), updateData);
//       console.log(`Updated subscription ${subscriptionId}: next_delivery_date from ${sub.next_delivery_date} to ${next}`);
//     } catch (updateErr) {
//       console.error(`Error updating subscription ${subscriptionId}:`, updateErr);
//       // Don't fail the entire operation if update fails, but log it
//       // The order was already created successfully
//     }

//     return { success: true, orderId, message: 'Order generated successfully' };
//   } catch (err) {
//     return { success: false, message: (err as Error).message };
//   }
// }









// // ----------------------------------------------------------------------------------------------------



// // q_units.ts file



// export interface Unit {
//   id: string;
//   uuid: string;
//   title: Record<string, string>;
//   active: boolean;
//   position?: string;
//   created_at?: number;
//   updated_at?: number;
//   locales?: string[];
//   [key: string]: unknown;
// }

// export const createUnitsDb = async (orgId: string, payload: { params: Record<string, unknown> }) => {
//   const filesCollectionRef = collection(db, 'T_unit');
//   const myId = uuidv4();
//   const params = payload.params;
//   const translations: Array<{ locale: string; title: string }> = [];
//   const locales: string[] = [];
//   const titleData: Record<string, string> = {};
//   Object.keys(params).forEach(key => {
//     const match = key.match(/^title\[(.*)\]$/);
//     if (match && match[1] && params[key] !== undefined && params[key].toString().trim() !== '') {
//       const locale = match[1];
//       titleData[locale] = params[key] as string;
//       translations.push({
//         locale: locale,
//         title: params[key] as string
//       });
//       if (!locales.includes(locale)) {
//         locales.push(locale);
//       }
//     }
//   });
//   if (locales.length === 0) {
//     locales.push('en');
//   }
//   const primaryLocale = locales[0];
//   const primaryTitle = titleData[primaryLocale] || '';
//   const input = {
//     id: myId,
//     active: (params.active === true || params.active === 1 || params.active === '1') ? 1 : 0,
//     position: params.position as string || 'after',
//     created_at: Timestamp.now().toMillis(),
//     updated_at: Timestamp.now().toMillis(),
//     title: titleData,
//     translations: translations,
//     translation: {
//       id: myId,
//       locale: primaryLocale,
//       title: primaryTitle,
//     },
//     locales: locales,
//   };
//   const docRef = await addDoc(filesCollectionRef, input);
//   return docRef.id;
// };

// export const getAllUnits = async (orgId: string, params: unknown) => {
//   const filesQuery = query(collection(db, `T_unit`));
//   const querySnapshot = await getDocs(filesQuery);
//   const files: Unit[] = querySnapshot.docs.map((docSnap) => {
//     const x = docSnap.data() as Unit;
//     x.id = docSnap.id;
//     x.uuid = docSnap.id;
//     return x;
//   });
//   return {
//     data: files,
//     meta: {
//       current_page: 1,
//       from: 1,
//       last_page: 1,
//       links: [
//         { url: null, label: "« Previous", active: false },
//         { url: "https://single-api.foodyman.org/api/v1/dashboard/admin/units/paginate?page=1", label: "1", active: true },
//         { url: null, label: "Next »", active: false }
//       ],
//       path: "https://single-api.foodyman.org/api/v1/dashboard/admin/units/paginate",
//       per_page: "1000",
//       to: files.length,
//       total: files.length
//     }
//   };
// };

// export const getAllUnitsById = async (orgId: string, uid: string, payload?: unknown) => {
//   const docRef = doc(db, `T_unit`, uid);
//   const docSnap = await getDoc(docRef);
//   if (docSnap.exists() && docSnap.data()) {
//     const unitData = docSnap.data() as Unit;
//     unitData.id = docSnap.id;
//     unitData.uuid = docSnap.id;
//     unitData.active = (typeof unitData.active === 'number' && unitData.active === 1) || unitData.active === true;
//     return { data: unitData };
//   } else {
//     return { data: null };
//   }
// };

// export const updateUnits = async (uid: string, params: Record<string, unknown>) => {
//   const titleData: Record<string, string> = {};
//   const translations: Array<{ locale: string; title: string }> = [];
//   const locales: string[] = [];
//   Object.keys(params).forEach(key => {
//     const match = key.match(/^title\[(.*)\]$/);
//     if (match && match[1] && params[key] !== undefined) {
//       const locale = match[1];
//       titleData[locale] = params[key] as string;
//       translations.push({
//         locale: locale,
//         title: params[key] as string
//       });
//       if (!locales.includes(locale)) {
//         locales.push(locale);
//       }
//     }
//   });
//   const updateData: Record<string, unknown> = {
//     position: params.position,
//     active: params.active === true || params.active === 1 ? 1 : 0,
//     updated_at: Timestamp.now().toMillis(),
//     locales: locales.length > 0 ? locales : ['en']
//   };
//   if (Object.keys(titleData).length > 0) {
//     updateData.title = titleData;
//     updateData.translations = translations;
//     if (translations.length > 0) {
//       updateData.translation = {
//         locale: translations[0].locale,
//         title: translations[0].title
//       };
//     }
//   }
//   await updateDoc(doc(db, `T_unit`, uid), updateData);
//   return { success: true };
// };

// export const deleteUnits = async (params: string[] | Record<string, string | number | boolean>) => {
//   const ids = Array.isArray(params) ? params : Object.values(params);
//   if (Array.isArray(ids)) {
//     await Promise.all(
//       ids.map(async (item) => {
//         await deleteDoc(doc(db, 'T_unit', String(item)));
//       })
//     );
//     return true;
//   } else {
//     throw new Error('Invalid parameter format for deletion');
//   }
// };

// export const setActiveUnits = async (id: string) => {
//   const unitId = id.includes('/') ? id.split('/').pop() : id;
//   const docRef = doc(db, 'T_unit', unitId!);
//   const docSnap = await getDoc(docRef);
//   if (!docSnap.exists()) {
//     throw new Error(`Unit with ID ${unitId} not found`);
//   }
//   const unitData = docSnap.data() as Unit;
//   const currentActive = (typeof unitData.active === 'number' && unitData.active === 1) || unitData.active === true;
//   const newActive = !currentActive;
//   await updateDoc(docRef, {
//     active: newActive ? 1 : 0,
//     updated_at: Timestamp.now().toMillis()
//   });
//   return {
//     timestamp: new Date().toISOString(),
//     status: true,
//     data: {
//       id: unitId,
//       active: newActive,
//       position: unitData.position || "before",
//       created_at: Timestamp.now().toMillis(),
//       updated_at: Timestamp.now().toMillis(),
//       locales: unitData.locales || ["en"]
//     }
//   };
// }; 








// // ----------------------------------------------------------------------------------------------------


// // q_users.ts file


// export interface User {
//   id: string;
//   uuid: string;
//   birthday: string;
//   email: string;
//   firstname: string;
//   gender: string;
//   images: string[];
//   lastname: string;
//   password: string;
//   password_confirmation: string;
//   phone: string;
//   mobile: string; // Mobile field from Firebase
//   name: string; // Name field from Firebase
//   createdAt: string; // Created date field from Firebase
//   [key: string]: unknown;
// }

// // Create a new User
// export const createUsersDb = async (payload: { params: Partial<User> }) => {
//   try {
//     const usersCollectionRef = collection(db, 'users');
//     const { params } = payload;
//     const docRef = await addDoc(usersCollectionRef, { ...params });
//     return docRef.id;
//   } catch (error) {
//     console.error('Error saving user to Firestore:', error);
//     throw error;
//   }
// };

// // Update a User
// export const updateUsers = async (uid: string, params: Partial<User>) => {
//   try {
//     const updateData: Partial<User> = {};
//     if (params.firstname !== undefined) updateData.firstname = params.firstname;
//     if (params.lastname !== undefined) updateData.lastname = params.lastname;
//     if (params.email !== undefined) updateData.email = params.email;
//     if (params.phone !== undefined) updateData.phone = params.phone;
//     if (params.birthday !== undefined) updateData.birthday = params.birthday;
//     if (params.gender !== undefined) updateData.gender = params.gender;
//     if (params.images !== undefined) updateData.images = params.images;
//     if (params.password !== undefined) updateData.password = params.password;
//     if (params.password_confirmation !== undefined) updateData.password_confirmation = params.password_confirmation;
//     await updateDoc(doc(db, 'users', uid), updateData);
//   } catch (error) {
//     console.error('Failed updating user', error, params);
//     throw error;
//   }
// };

// // Get all Users
// export const getAllUsers = async (params?: { params?: { status?: string } }) => {
//   const usersQuery = query(collection(db, 'users'));
//   const querySnapshot = await getDocs(usersQuery);
//   const users: User[] = querySnapshot.docs.map((docSnap) => {
//     const x = docSnap.data() as User;
//     x.id = docSnap.id;
//     x.uuid = docSnap.id;
//     return x;
//   });
//   return {
//     data: users,
//     meta: {
//       current_page: 1,
//       from: 1,
//       last_page: 1,
//       links: [
//         { url: null, label: "&laquo; Previous", active: false },
//         { url: "#", label: "1", active: true },
//         { url: null, label: "Next &raquo;", active: false },
//       ],
//       path: "#",
//       per_page: "1000",
//       to: users.length,
//       total: users.length,
//     },
//   };
// };

// // Get all Users with real-time snapshot
// export const getAllUsersSnap = (params: { params?: { status?: string } }, callback: (response: unknown) => void) => {
//   try {
//     const usersQuery = query(collection(db, 'users'));
//     const unsubscribe = onSnapshot(usersQuery, (querySnapshot) => {
//       const users: User[] = querySnapshot.docs.map((docSnap) => {
//         const x = docSnap.data() as User;
//         x.id = docSnap.id;
//         x.uuid = docSnap.id;
//         return x;
//       });
//       const response = {
//         data: users,
//         meta: {
//           current_page: 1,
//           from: 1,
//           last_page: 1,
//           links: [
//             { url: null, label: "&laquo; Previous", active: false },
//             { url: "#", label: "1", active: true },
//             { url: null, label: "Next &raquo;", active: false },
//           ],
//           path: "#",
//           per_page: "10",
//           to: users.length,
//           total: users.length,
//         },
//       };
//       callback(response);
//     });
//     return unsubscribe;
//   } catch (error) {
//     console.error('Error fetching users snapshot:', error);
//     return;
//   }
// };

// // Get User by ID
// export const getAllUsersById = async (uid: string) => {
//   try {
//     const docRef = doc(db, 'users', uid);
//     const docSnap = await getDoc(docRef);
//     if (docSnap.exists() && docSnap.data()) {
//       const x = docSnap.data() as User & { img?: string };
//       x.id = docSnap.id;
//       x.uuid = docSnap.id;
//       // Ensure img is populated from images[0] if it exists
//       if (x.images && Array.isArray(x.images) && x.images[0]) {
//         x.img = x.images[0];
//       } else if (!x.img) {
//         x.img = '';
//       }
//       return { data: x };
//     } else {
//       return null;
//     }
//   } catch (error) {
//     console.error('Error fetching user details:', error);
//     throw error;
//   }
// };

// // Delete Users (single or multiple)
// export const deleteUsers = async (params: string[] | { [key: string]: string }) => {
//   const values = Array.isArray(params) ? params : Object.values(params);
//   await Promise.all(values.map(async (item) => {
//     await deleteDoc(doc(db, 'users', item));
//   }));
// };

// // Search Users
// export const searchUsers = async (params: { params?: { search?: string } }) => {
//   try {
//     const usersQuery = query(collection(db, 'users'));
//     const querySnapshot = await getDocs(usersQuery);
//     const users: User[] = querySnapshot.docs.map((docSnap) => {
//       const x = docSnap.data() as User;
//       x.id = docSnap.id;
//       x.uuid = docSnap.id;
//       return x;
//     });
//     let filteredUsers = users;
//     if (params?.params?.search) {
//       const searchTerm = params.params.search.toLowerCase();
//       filteredUsers = users.filter(user =>
//         (user.firstname && user.firstname.toLowerCase().includes(searchTerm)) ||
//         (user.lastname && user.lastname.toLowerCase().includes(searchTerm)) ||
//         (user.email && user.email.toLowerCase().includes(searchTerm)) ||
//         (user.phone && String(user.phone).includes(searchTerm))
//       );
//     }
//     return {
//       data: filteredUsers,
//       meta: {
//         current_page: 1,
//         from: 1,
//         last_page: 1,
//         links: [
//           { url: null, label: "&laquo; Previous", active: false },
//           { url: "#", label: "1", active: true },
//           { url: null, label: "Next &raquo;", active: false },
//         ],
//         path: "#",
//         per_page: "1000",
//         to: filteredUsers.length,
//         total: filteredUsers.length,
//       },
//     };
//   } catch (error) {
//     console.error('Error searching users:', error);
//     throw error;
//   }
// }; 








// // ----------------------------------------------------------------------------------------------------




// // q_wallets.ts file


// const WALLETS_COLLECTION = 'wallets';

// export interface WalletTransaction {
//   id: number;
//   type: 'add' | 'deduct' | 'refund' | 'subscription_precheck' | string;
//   method: 'wallet' | 'Razorpay' | string;
//   amount: number;
//   createdAt: string;
//   paymentId?: string;
//   orderId?: string;
// }

// export interface WalletRecord {
//   user_id: string;
//   balance: number;
//   lastTransactionId: number;
//   transactions: WalletTransaction[];
//   updatedAt?: string;
// }

// async function getOrCreateWallet(userId: string): Promise<WalletRecord> {
//   const ref = doc(collection(db, WALLETS_COLLECTION), userId);
//   const snap = await getDoc(ref);
//   if (!snap.exists()) {
//     const now = getISTISOString();
//     const initial: WalletRecord = { user_id: userId, balance: 0, lastTransactionId: 0, transactions: [], updatedAt: now };
//     await setDoc(ref, initial);
//     return initial;
//   }
//   return { user_id: userId, ...(snap.data() as any) } as WalletRecord;
// }

// export async function deductFromWallet(userId: string, amount: number, opts?: Partial<Omit<WalletTransaction, 'id' | 'amount' | 'createdAt'>> & { orderId?: string }) {
//   if (amount <= 0) return { success: true };
//   const ref = doc(collection(db, WALLETS_COLLECTION), userId);
//   const wallet = await getOrCreateWallet(userId);
//   if (wallet.balance < amount) {
//     return { success: false, message: 'Insufficient wallet balance' };
//   }
  
//   const txType = (opts?.type as any) || 'deduct';
  
//   // For 'subscription_precheck', only check balance and return - don't record transaction or modify wallet
//   if (txType === 'subscription_precheck') {
//     return { success: true, data: { balance: wallet.balance } };
//   }
  
//   // For all other types, deduct the amount and record the transaction
//   const nextId = (wallet.lastTransactionId || 0) + 1;
//   const tx: WalletTransaction = {
//     id: nextId,
//     type: txType,
//     method: (opts?.method as any) || 'wallet',
//     amount,
//     createdAt: getISTISOString(),
//   };
  
//   // Only add optional fields if they are defined (not undefined)
//   if (opts?.orderId) {
//     tx.orderId = opts.orderId;
//   }
//   if (opts?.paymentId) {
//     tx.paymentId = opts.paymentId;
//   }
  
//   const newBalance = (wallet.balance || 0) - amount;
  
//   // Clean existing transactions to remove any undefined values
//   const cleanExistingTransactions = (wallet.transactions || []).map(t => {
//     const clean: any = {
//       id: t.id,
//       type: t.type,
//       method: t.method,
//       amount: t.amount,
//       createdAt: t.createdAt,
//     };
//     if (t.orderId) clean.orderId = t.orderId;
//     if (t.paymentId) clean.paymentId = t.paymentId;
//     return clean;
//   });
  
//   const updated = {
//     balance: newBalance,
//     lastTransactionId: nextId,
//     transactions: [...cleanExistingTransactions, tx],
//     updatedAt: tx.createdAt,
//   };
//   await updateDoc(ref, updated as any);
//   return { success: true, data: { balance: newBalance, transaction: tx } };
// }

// // Get all wallets
// export async function getAllWallets(): Promise<WalletRecord[]> {
//   try {
//     const walletsRef = collection(db, WALLETS_COLLECTION);
//     const querySnapshot = await getDocs(walletsRef);
//     const wallets: WalletRecord[] = [];
    
//     querySnapshot.forEach((docSnap) => {
//       const data = docSnap.data();
//       wallets.push({
//         user_id: docSnap.id,
//         balance: data.balance || 0,
//         lastTransactionId: data.lastTransactionId || 0,
//         transactions: data.transactions || [],
//         updatedAt: data.updatedAt,
//       });
//     });
    
//     return wallets;
//   } catch (error) {
//     console.error('Error fetching wallets:', error);
//     throw error;
//   }
// }

// // Add to wallet (credit)
// export async function addToWallet(userId: string, amount: number, opts?: Partial<Omit<WalletTransaction, 'id' | 'amount' | 'createdAt'>> & { orderId?: string }) {
//   if (amount <= 0) return { success: false, message: 'Amount must be greater than 0' };
//   const ref = doc(collection(db, WALLETS_COLLECTION), userId);
//   const wallet = await getOrCreateWallet(userId);
  
//   const txType = (opts?.type as any) || 'add';
//   const nextId = (wallet.lastTransactionId || 0) + 1;
//   const tx: WalletTransaction = {
//     id: nextId,
//     type: txType,
//     method: (opts?.method as any) || 'wallet',
//     amount,
//     createdAt: getISTISOString(),
//   };
  
//   // Only add optional fields if they are defined (not undefined)
//   if (opts?.orderId) {
//     tx.orderId = opts.orderId;
//   }
//   if (opts?.paymentId) {
//     tx.paymentId = opts.paymentId;
//   }
  
//   const newBalance = (wallet.balance || 0) + amount;
  
//   // Clean existing transactions to remove any undefined values
//   const cleanExistingTransactions = (wallet.transactions || []).map(t => {
//     const clean: any = {
//       id: t.id,
//       type: t.type,
//       method: t.method,
//       amount: t.amount,
//       createdAt: t.createdAt,
//     };
//     if (t.orderId) clean.orderId = t.orderId;
//     if (t.paymentId) clean.paymentId = t.paymentId;
//     return clean;
//   });
  
//   const updated = {
//     balance: newBalance,
//     lastTransactionId: nextId,
//     transactions: [...cleanExistingTransactions, tx],
//     updatedAt: tx.createdAt,
//   };
//   await updateDoc(ref, updated as any);
//   return { success: true, data: { balance: newBalance, transaction: tx } };
// }










// // ----------------------------------------------------------------------------------------------------


// // qrCodeService.ts file 





// export interface QRCodeOptions {
//   width?: number;
//   height?: number;
//   margin?: number;
//   color?: {
//     dark?: string;
//     light?: string;
//   };
//   errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
// }

// export interface UPIQRData {
//   upi: string;
//   merchant_name?: string;
//   amount?: number;
//   transaction_id?: string;
//   transaction_note?: string;
// }

// /**
//  * Generate UPI QR code data string
//  */
// export const generateUPIQRString = (data: UPIQRData): string => {
//   const { upi, merchant_name, amount, transaction_id, transaction_note } = data;
  
//   // UPI QR format: upi://pay?pa=<UPI_ID>&pn=<MERCHANT_NAME>&am=<AMOUNT>&tr=<TRANSACTION_ID>&tn=<TRANSACTION_NOTE>&cu=INR
//   // Note: UPI ID should NOT be URL encoded as UPI apps expect the raw @ symbol
//   let qrString = `upi://pay?pa=${upi}`;
  
//   if (merchant_name) {
//     qrString += `&pn=${encodeURIComponent(merchant_name)}`;
//   }
  
//   if (amount && amount > 0) {
//     qrString += `&am=${amount.toFixed(2)}`;
//   }
  
//   if (transaction_id) {
//     qrString += `&tr=${encodeURIComponent(transaction_id)}`;
//   }
  
//   if (transaction_note) {
//     qrString += `&tn=${encodeURIComponent(transaction_note)}`;
//   }
  
//   qrString += '&cu=INR';
  
//   return qrString;
// };

// /**
//  * Generate QR code as data URL
//  */
// export const generateQRCodeDataURL = async (
//   data: string, 
//   options: QRCodeOptions = {}
// ): Promise<string> => {
//   try {
//     const defaultOptions: QRCodeOptions = {
//       width: 256,
//       height: 256,
//       margin: 2,
//       color: {
//         dark: '#000000',
//         light: '#FFFFFF'
//       },
//       errorCorrectionLevel: 'M'
//     };
    
//     const finalOptions = { ...defaultOptions, ...options };
    
//     const dataURL = await QRCode.toDataURL(data, {
//       width: finalOptions.width,
//       margin: finalOptions.margin,
//       color: finalOptions.color,
//       errorCorrectionLevel: finalOptions.errorCorrectionLevel
//     });
    
//     return dataURL;
//   } catch (error) {
//     console.error('Error generating QR code:', error);
//     throw new Error('Failed to generate QR code');
//   }
// };

// /**
//  * Generate QR code as SVG
//  */
// export const generateQRCodeSVG = async (
//   data: string, 
//   options: QRCodeOptions = {}
// ): Promise<string> => {
//   try {
//     const defaultOptions: QRCodeOptions = {
//       width: 256,
//       height: 256,
//       margin: 2,
//       color: {
//         dark: '#000000',
//         light: '#FFFFFF'
//       },
//       errorCorrectionLevel: 'M'
//     };
    
//     const finalOptions = { ...defaultOptions, ...options };
    
//     const svg = await QRCode.toString(data, {
//       type: 'svg',
//       width: finalOptions.width,
//       margin: finalOptions.margin,
//       color: finalOptions.color,
//       errorCorrectionLevel: finalOptions.errorCorrectionLevel
//     });
    
//     return svg;
//   } catch (error) {
//     console.error('Error generating QR code SVG:', error);
//     throw new Error('Failed to generate QR code SVG');
//   }
// };

// /**
//  * Generate QR code for UPI payment
//  */
// export const generateUPIQRCode = async (
//   upiData: UPIQRData,
//   options: QRCodeOptions = {}
// ): Promise<string> => {
//   try {
//     const qrString = generateUPIQRString(upiData);
//     return await generateQRCodeDataURL(qrString, options);
//   } catch (error) {
//     console.error('Error generating UPI QR code:', error);
//     throw new Error('Failed to generate UPI QR code');
//   }
// };

// /**
//  * Validate UPI ID format
//  */
// export const validateUPIID = (upi: string): boolean => {
//   // Basic UPI ID validation - should contain @ and be in format like user@paytm, user@phonepe, etc.
//   const upiIdRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
//   return upiIdRegex.test(upi);
// };

// /**
//  * Extract UPI ID from QR code data
//  */
// export const extractUPIIDFromQR = (qrString: string): string | null => {
//   try {
//     const url = new URL(qrString);
//     if (url.protocol === 'upi:' && url.hostname === 'pay') {
//       const params = new URLSearchParams(url.search);
//       return params.get('pa');
//     }
//     return null;
//   } catch (error) {
//     console.error('Error extracting UPI ID from QR:', error);
//     return null;
//   }
// };





// // ----------------------------------------------------------------------------------------------------

// // status.ts file 



// export interface Status {
//   id: string;
//   label: string;
//   value: string;
//   groups: {
//     [groupName: string]: {
//       values: string[];
//       default_value?: string;
//     };
//   };
//   default_key: boolean;
//   created_at: number;
//   updated_at: number;
// }

// export const createStatus = async (params: Omit<Status, 'id' | 'created_at' | 'updated_at'>) => {
//   const id = Date.now().toString();
  
//   // If this is being set as default, unset all other defaults
//   if (params.default_key) {
//     await unsetAllDefaults();
//   }
  
//   // Clean groups to remove undefined default_value fields
//   const cleanedGroups: { [groupName: string]: { values: string[]; default_value?: string } } = {};
//   Object.entries(params.groups).forEach(([groupName, group]) => {
//     cleanedGroups[groupName] = {
//       values: group.values,
//       ...(group.default_value !== undefined && { default_value: group.default_value })
//     };
//   });
  
//   const status: Status = {
//     id,
//     ...params,
//     groups: cleanedGroups,
//     created_at: Timestamp.now().toMillis(),
//     updated_at: Timestamp.now().toMillis(),
//   };
  
//   try {
//     await setDoc(doc(db, 'T_Status', id), status);
//     return { success: true, id, ...status };
//   } catch (error) {
//     return { success: false, error: error instanceof Error ? error.message : String(error) };
//   }
// };

// export const updateStatus = async (id: string, params: Partial<Omit<Status, 'id' | 'created_at'>>) => {
//   const docRef = doc(db, 'T_Status', id);
//   const docSnap = await getDoc(docRef);
  
//   if (!docSnap.exists()) {
//     return { success: false, error: `Status with ID ${id} not found` };
//   }
  
//   // If this is being set as default, unset all other defaults
//   if (params.default_key) {
//     await unsetAllDefaults();
//   }
  
//   // Clean groups to remove undefined default_value fields if groups are being updated
//   let cleanedParams = { ...params };
//   if (params.groups) {
//     const cleanedGroups: { [groupName: string]: { values: string[]; default_value?: string } } = {};
//     Object.entries(params.groups).forEach(([groupName, group]) => {
//       cleanedGroups[groupName] = {
//         values: group.values,
//         ...(group.default_value !== undefined && { default_value: group.default_value })
//       };
//     });
//     cleanedParams.groups = cleanedGroups;
//   }
  
//   const updateData = {
//     ...cleanedParams,
//     updated_at: Timestamp.now().toMillis(),
//   };
  
//   try {
//     await updateDoc(docRef, updateData);
//     return { success: true, id };
//   } catch (error) {
//     return { success: false, error: error instanceof Error ? error.message : String(error) };
//   }
// };

// export const getAllStatuses = async () => {
//   try {
//     const statusesQuery = collection(db, 'T_Status');
//     const querySnapshot = await getDocs(statusesQuery);
//     const statuses: Status[] = querySnapshot.docs.map((docSnap) => docSnap.data() as Status);
    
//     // Sort by created_at descending
//     statuses.sort((a, b) => b.created_at - a.created_at);
    
//     return { success: true, data: statuses };
//   } catch (error) {
//     return { success: false, error: error instanceof Error ? error.message : String(error) };
//   }
// };

// export const getStatusById = async (id: string) => {
//   try {
//     const docRef = doc(db, 'T_Status', id);
//     const docSnap = await getDoc(docRef);
//     if (docSnap.exists()) {
//       return { success: true, data: docSnap.data() as Status };
//     } else {
//       return { success: false, error: 'Status not found' };
//     }
//   } catch (error) {
//     return { success: false, error: error instanceof Error ? error.message : String(error) };
//   }
// };

// export const deleteStatus = async (id: string) => {
//   try {
//     await deleteDoc(doc(db, 'T_Status', id));
//     return { success: true };
//   } catch (error) {
//     return { success: false, error: error instanceof Error ? error.message : String(error) };
//   }
// };

// // Helper function to unset all default statuses
// const unsetAllDefaults = async () => {
//   try {
//     const statusesQuery = collection(db, 'T_Status');
//     const querySnapshot = await getDocs(statusesQuery);
    
//     const updatePromises = querySnapshot.docs.map(async (docSnap) => {
//       const data = docSnap.data() as Status;
//       if (data.default_key) {
//         await updateDoc(docSnap.ref, { 
//           default_key: false,
//           updated_at: Timestamp.now().toMillis()
//         });
//       }
//     });
    
//     await Promise.all(updatePromises);
//   } catch (error) {
//     console.error('Error unsetting defaults:', error);
//   }
// };

// // Get the default status
// export const getDefaultStatus = async () => {
//   try {
//     const statusesQuery = query(collection(db, 'T_Status'), where('default_key', '==', true));
//     const querySnapshot = await getDocs(statusesQuery);
    
//     if (querySnapshot.empty) {
//       return { success: true, data: null };
//     }
    
//     const defaultStatus = querySnapshot.docs[0].data() as Status;
//     return { success: true, data: defaultStatus };
//   } catch (error) {
//     return { success: false, error: error instanceof Error ? error.message : String(error) };
//   }
// };








// // ----------------------------------------------------------------------------------------------------


// // supabaseClient.ts file 
// // Note: Supabase client is already set up at the top of the file
