/**
 * Category Update Operations
 * 
 * This file contains all UPDATE operations related to categories
 */

import { doc, updateDoc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../app/db';

// ============================================
// INTERFACES
// ============================================

interface CategoryTranslation {
  id: string;
  locale: string;
  title: string;
  description: string;
}

// ============================================
// CATEGORY UPDATE OPERATIONS
// ============================================

/**
 * Update category with multilingual support
 */
export const updateCategory = async (uid: string, params: Record<string, unknown>) => {
  const docRef = doc(db, `p_category`, uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error(`Category with ID ${uid} not found`);
  }
  const existingData = docSnap.data();
  const updateData = { ...existingData };
  const supportedLanguages = ['en', 'fr', 'th'];
  const translations: CategoryTranslation[] = [...(updateData.translations || [])];
  const locales: string[] = [...(updateData.locales || [])];
  let primaryTitle = updateData.title;
  let primaryDescription = updateData.description;
  const primaryLocale = updateData.translation?.locale || 'en';
  
  supportedLanguages.forEach(lang => {
    let hasUpdate = false;
    let title: string | null = null;
    let description: string | null = null;
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
    if (typeof params[`description[${lang}]`] === 'string') {
      description = params[`description[${lang}]`] as string;
      hasUpdate = true;
    } else if (typeof (params.description as Record<string, string> | undefined)?.[lang] === 'string') {
      description = (params.description as Record<string, string>)[lang];
      hasUpdate = true;
    } else if (lang === 'en' && typeof params.description === 'string' && params.description !== undefined) {
      description = params.description as string;
      hasUpdate = true;
    }
    if (hasUpdate) {
      const langTranslationIndex = translations.findIndex((t) => t.locale === lang);
      if (langTranslationIndex >= 0) {
        const updatedTranslation = { ...translations[langTranslationIndex] };
        if (title !== null) updatedTranslation.title = title;
        if (description !== null) updatedTranslation.description = description || updatedTranslation.description;
        translations[langTranslationIndex] = updatedTranslation;
      } else {
        translations.push({
          id: uid,
          locale: lang,
          title: title || "",
          description: description || ""
        });
        if (!locales.includes(lang)) {
          locales.push(lang);
        }
      }
      if (lang === primaryLocale || (lang === 'en' && !primaryLocale)) {
        if (title !== null) primaryTitle = title;
        if (description !== null) primaryDescription = description;
      }
    }
  });
  
  if (Array.isArray(params.images) && (params.images as string[])[0]) updateData.img = (params.images as string[])[0];
  if (typeof params['images[0]'] === 'string') updateData.img = params['images[0]'] as string;
  if (params.active !== undefined) updateData.active = params.active;
  if (params.keywords !== undefined) updateData.keywords = params.keywords;
  if (params.type !== undefined) updateData.type = params.type;
  if (params.status !== undefined) updateData.status = params.status;
  updateData.updated_at = Timestamp.now().toMillis();
  updateData.translations = translations;
  updateData.locales = locales;
  updateData.title = primaryTitle;
  updateData.description = primaryDescription;
  const primaryTranslation = translations.find((t) => t.locale === primaryLocale) || translations[0];
  updateData.translation = primaryTranslation;
  await setDoc(doc(db, `p_category`, uid), updateData, { merge: true });
  return { success: true, id: uid, data: updateData };
};

/**
 * Set active status for category
 */
export const setActiveCategory = async (id: string) => {
  const categoryId = id.includes('/') ? id.split('/').pop() : id;
  const docRef = doc(db, `p_category`, categoryId!);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error(`Category with ID ${categoryId} not found`);
  }
  const categoryData = docSnap.data();
  const currentActive = categoryData.active === true;
  const newActive = !currentActive;
  await updateDoc(docRef, {
    active: newActive,
    updated_at: Timestamp.now().toMillis()
  });
  const title = categoryData.title || (categoryData.translations && categoryData.translations.length > 0 ? categoryData.translations[0].title : "");
  const response = {
    timestamp: new Date().toISOString(),
    status: true,
    data: {
      id: categoryId,
      uuid: categoryId,
      active: newActive,
      created_at: categoryData.created_at || Timestamp.now().toMillis(),
      updated_at: Timestamp.now().toMillis(),
      title: title,
      translation: {
        id: categoryId,
        locale: "en",
        title: title
      },
      locales: categoryData.locales || ["en"]
    }
  };
  return response;
};

