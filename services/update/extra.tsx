/**
 * Extra Groups and Values Update Operations
 * 
 * This file contains all UPDATE operations related to extra groups and extra values
 */

import { doc, updateDoc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

interface ExtraGroupTranslation {
  id: string;
  locale: string;
  title: string;
}

// ============================================
// EXTRA GROUP UPDATE OPERATIONS
// ============================================

/**
 * Update extra group with multilingual support
 */
export const updateExtraGroup = async (uid: string, params: Record<string, unknown>) => {
  const docRef = doc(db, 'T_extra_groups', uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error(`Extra group with ID ${uid} not found`);
  }
  const existingData = docSnap.data();
  const updateData = { ...existingData };
  const supportedLanguages = ['en', 'fr', 'th'];
  const translations: ExtraGroupTranslation[] = [...(updateData.translations || [])];
  const locales: string[] = [...(updateData.locales || [])];
  let primaryTitle = updateData.title;
  const primaryLocale = updateData.translation?.locale || 'en';
  
  supportedLanguages.forEach(lang => {
    let hasUpdate = false;
    let title: string | null = null;
    if (typeof params[`title[${lang}]`] === 'string') {
      title = params[`title[${lang}]`] as string;
      hasUpdate = true;
    } else if (typeof (params.title as Record<string, string> | undefined)?.[lang] === 'string') {
      title = (params.title as Record<string, string>)[lang];
      hasUpdate = true;
    } else if (lang === 'en' && typeof params.title === 'string' && params.title !== undefined) {
      title = params.title as string;
      hasUpdate = true;
    }
    if (hasUpdate) {
      const langTranslationIndex = translations.findIndex((t) => t.locale === lang);
      if (langTranslationIndex >= 0) {
        const updatedTranslation = { ...translations[langTranslationIndex] };
        if (title !== null) updatedTranslation.title = title;
        translations[langTranslationIndex] = updatedTranslation;
      } else {
        translations.push({
          id: uid,
          locale: lang,
          title: title || ""
        });
        if (!locales.includes(lang)) {
          locales.push(lang);
        }
      }
      if (lang === primaryLocale || (lang === 'en' && !primaryLocale)) {
        if (title !== null) primaryTitle = title;
      }
    }
  });
  
  if (params.active !== undefined) updateData.active = params.active;
  if (params.type !== undefined) updateData.type = params.type;
  updateData.updated_at = Timestamp.now().toMillis();
  updateData.translations = translations;
  updateData.locales = locales;
  updateData.title = primaryTitle;
  const primaryTranslation = translations.find((t) => t.locale === primaryLocale) || translations[0];
  updateData.translation = primaryTranslation;
  await setDoc(doc(db, 'T_extra_groups', uid), updateData, { merge: true });
  return { success: true, id: uid, data: updateData };
};

// ============================================
// EXTRA VALUE UPDATE OPERATIONS
// ============================================

/**
 * Update extra value
 */
export const updateExtraValue = async (uid: string, params: Record<string, unknown>) => {
  const docRef = doc(db, 'T_extra_values', uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error(`Extra value with ID ${uid} not found`);
  }
  const existingData = docSnap.data();
  const updateData = { ...existingData };
  if (params.value !== undefined) updateData.value = params.value;
  if (params.active !== undefined) updateData.active = params.active;
  if (params.extra_group_id !== undefined) updateData.extra_group_id = params.extra_group_id;
  updateData.updated_at = Timestamp.now().toMillis();
  await setDoc(doc(db, 'T_extra_values', uid), updateData, { merge: true });
  return { success: true, id: uid, data: updateData };
};

