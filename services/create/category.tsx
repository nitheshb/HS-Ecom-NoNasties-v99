/**
 * Category Create Operations
 * 
 * This file contains all CREATE operations related to categories
 */

import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../app/db';
import { v4 as uuidv4 } from 'uuid';

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
// CATEGORY CREATE OPERATIONS
// ============================================

/**
 * Create category with multilingual support
 */
export const createCategoriesDb = async (orgId: string, payload: { params: Record<string, unknown> }) => {
  const { params } = payload;
  const did = uuidv4();
  const supportedLanguages = ['en', 'fr', 'th'];
  const translations: CategoryTranslation[] = [];
  const locales: string[] = [];
  let primaryTitle = '';
  let primaryDescription = '';
  
  supportedLanguages.forEach(lang => {
    let title: string | null = null;
    if (typeof params[`title[${lang}]`] === 'string') {
      title = params[`title[${lang}]`] as string;
    } else if (typeof (params.title as Record<string, string> | undefined)?.[lang] === 'string') {
      title = (params.title as Record<string, string>)[lang];
    } else if (lang === 'en' && typeof params.title === 'string') {
      title = params.title as string;
    }
    let description: string | null = null;
    if (typeof params[`description[${lang}]`] === 'string') {
      description = params[`description[${lang}]`] as string;
    } else if (typeof (params.description as Record<string, string> | undefined)?.[lang] === 'string') {
      description = (params.description as Record<string, string>)[lang];
    } else if (lang === 'en' && typeof params.description === 'string') {
      description = params.description as string;
    }
    if (title) {
      translations.push({
        id: did,
        locale: lang,
        title: title,
        description: description || ""
      });
      locales.push(lang);
      if ((!primaryTitle || lang === 'en') && title) {
        primaryTitle = title;
        primaryDescription = description || "";
      }
    }
  });
  
  if (translations.length === 0) {
    translations.push({
      id: did,
      locale: 'en',
      title: "",
      description: ""
    });
    locales.push('en');
    primaryTitle = "";
    primaryDescription = "";
  }
  
  const imageUrl = (params['images[0]'] as string) || (Array.isArray(params.images) && (params.images as string[])[0]) || "https://cdnimg.webstaurantstore.com/uploads/design/2023/5/Homepage-Categories/category-refrigeration.png";
  const isActive = params.active === undefined ? false : Boolean(params.active);
  const categoryData = {
    id: did,
    uuid: did,
    keywords: params?.keywords || "",
    type: params?.type || "main",
    input: 32767,
    img: imageUrl,
    active: isActive,
    status: params?.status || "published",
    created_at: Timestamp.now().toMillis(),
    updated_at: Timestamp.now().toMillis(),
    shop: null,
    children: [],
    parent: null,
    title: primaryTitle,
    description: primaryDescription,
    translation: translations[0],
    translations: translations,
    locales: locales
  };
  
  try {
    await setDoc(doc(db, `p_category`, did), categoryData);
    return {
      success: true,
      ...categoryData,
      _timestamp: new Date().getTime()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

