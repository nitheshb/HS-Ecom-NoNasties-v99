/**
 * Extra Groups and Values Create Operations
 * 
 * This file contains all CREATE operations related to extra groups and extra values
 */

import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../app/db';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// INTERFACES
// ============================================

interface ExtraGroupTranslation {
  id: string;
  locale: string;
  title: string;
}

export interface ExtraGroup {
  id: string;
  uuid: string;
  type: string;
  active: boolean;
  created_at: number;
  updated_at: number;
  shop: unknown;
  title: string;
  translation: {
    id: string;
    locale: string;
    title: string;
  };
  translations: Array<{
    id: string;
    locale: string;
    title: string;
  }>;
  locales: string[];
}

export interface ExtraValue {
  id: string;
  uuid: string;
  extra_group_id: string;
  value: string;
  active: boolean;
  group?: unknown;
  created_at: number;
  updated_at: number;
}

// ============================================
// EXTRA GROUP CREATE OPERATIONS
// ============================================

/**
 * Create extra group with multilingual support
 */
export const createExtraGroupsDb = async (orgId: string, payload: { params: Record<string, unknown> }) => {
  const { params } = payload;
  const did = uuidv4();
  const supportedLanguages = ['en', 'fr', 'th'];
  const translations: ExtraGroupTranslation[] = [];
  const locales: string[] = [];
  let primaryTitle = '';
  
  supportedLanguages.forEach(lang => {
    let title: string | null = null;
    if (typeof params[`title[${lang}]`] === 'string') {
      title = params[`title[${lang}]`] as string;
    } else if (typeof (params.title as Record<string, string> | undefined)?.[lang] === 'string') {
      title = (params.title as Record<string, string>)[lang];
    } else if (lang === 'en' && typeof params.title === 'string') {
      title = params.title as string;
    }
    if (title) {
      translations.push({
        id: did,
        locale: lang,
        title: title
      });
      locales.push(lang);
      if ((!primaryTitle || lang === 'en') && title) {
        primaryTitle = title;
      }
    }
  });
  
  if (translations.length === 0) {
    translations.push({
      id: did,
      locale: 'en',
      title: ""
    });
    locales.push('en');
    primaryTitle = "";
  }
  
  const isActive = params.active === undefined ? true : Boolean(params.active);
  const groupData = {
    id: did,
    uuid: did,
    type: params?.type || 'text',
    active: isActive,
    created_at: Timestamp.now().toMillis(),
    updated_at: Timestamp.now().toMillis(),
    shop: null,
    title: primaryTitle,
    translation: translations[0],
    translations: translations,
    locales: locales
  };
  
  try {
    await setDoc(doc(db, 'T_extra_groups', did), groupData);
    return {
      success: true,
      id: did,
      ...groupData,
      _timestamp: new Date().getTime()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// ============================================
// EXTRA VALUE CREATE OPERATIONS
// ============================================

/**
 * Create extra value
 */
export const createExtraValuesDb = async (orgId: string, payload: { params: Record<string, unknown> }) => {
  const { params } = payload;
  const did = uuidv4();
  const isActive = params.active === undefined ? true : Boolean(params.active);
  const extra_group_id = params.extra_group_id as string;
  const value = params.value as string;
  const extraValueData: ExtraValue = {
    id: did,
    uuid: did,
    extra_group_id,
    value,
    active: isActive,
    created_at: Timestamp.now().toMillis(),
    updated_at: Timestamp.now().toMillis(),
  };
  
  try {
    await setDoc(doc(db, 'T_extra_values', did), extraValueData);
    return {
      success: true,
      id: did,
      ...extraValueData,
      _timestamp: new Date().getTime()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

