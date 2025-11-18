/**
 * Product Filtering Utilities
 * 
 * Helper functions to filter products by category and subcategory
 */

import { getAllCategories } from '@/services/read/category';
import { getAllSubCategories } from '@/services/read/subCategory';
import { getAllProducts } from '@/services/read/product';
import type { Product } from '@/lib/products';

/**
 * Map filter values from URL to subcategory titles
 * This matches the filter values used in Header navigation links
 */
const FILTER_TO_TITLE_MAP: Record<string, string> = {
  'new-arrivals': 'NEW ARRIVALS',
  'organic-linen': 'ORGANIC LINEN',
  'dresses': 'DRESSES & JUMPSUITS',
  'shirts': 'SHIRTS',
  'tops': 'TOPS & TEES',
  'skirts': 'SKIRTS & BOTTOMS',
  'sleepwear': 'SLEEPWEAR',
  'knits': 'ORGANIC KNITS',
  'accessories': 'SARONGS, SCARVES & BAGS',
  'coords': 'CO-ORDS AT 5% OFF',
  'sale': 'SALE',
  'bottoms': 'BOTTOMS',
};

/**
 * Get category ID by section name (her/him)
 */
export async function getCategoryIdBySection(section: 'her' | 'him'): Promise<string | null> {
  try {
    const allCategories = await getAllCategories('', { params: {} });
    const categories = allCategories.data || [];
    
    // Look for category with title containing "her" or "him"
    const sectionCategory = categories.find((cat) => {
      const title = ((cat as { title?: string }).title || '').toLowerCase();
      return section === 'her' 
        ? title.includes('her') || title.includes('women')
        : title.includes('him') || title.includes('men');
    });
    
    return sectionCategory?.id || null;
  } catch (error) {
    console.error(`Error fetching category for section ${section}:`, error);
    return null;
  }
}

/**
 * Get subcategory ID by filter value and category ID
 * 
 * Logic:
 * 1. Get all subcategories for the category from Firebase
 * 2. Try to match the filter value to subcategory title using multiple strategies:
 *    - Exact match (case-insensitive)
 *    - Partial match (contains key words)
 *    - Direct filter value match
 */
export async function getSubCategoryIdByFilter(
  filterValue: string,
  categoryId: string
): Promise<string | null> {
  try {
    console.log(`\n🔍 Finding subcategory for filter: "${filterValue}" in category: ${categoryId}`);
    
    // Get all subcategories for this category from Firebase
    const allSubCategories = await getAllSubCategories('', {
      params: { category_id: categoryId }
    });
    
    const subCategories = allSubCategories.data || [];
    
    console.log(`📋 Found ${subCategories.length} subcategories in Firebase:`);
    subCategories.forEach((s, idx) => {
      const sub = s as { title?: string; id?: string };
      console.log(`  ${idx + 1}. "${sub.title || 'No title'}" (ID: ${sub.id || 'No ID'})`);
    });
    
    if (subCategories.length === 0) {
      console.warn(`⚠️ No subcategories found for category ${categoryId}`);
      return null;
    }
    
    // Strategy 1: Try exact match with mapped title (case-insensitive)
    const expectedTitle = FILTER_TO_TITLE_MAP[filterValue.toLowerCase()];
    if (expectedTitle) {
      const exactMatch = subCategories.find((sub) => {
        const title = ((sub as { title?: string }).title || '').trim().toUpperCase();
        return title === expectedTitle.toUpperCase();
      });
      
      if (exactMatch) {
        const sub = exactMatch as { title?: string; id?: string };
        console.log(`✅ Exact match found: "${sub.title}" (ID: ${sub.id})`);
        return sub.id || null;
      }
    }
    
    // Strategy 2: Try matching filter value directly (e.g., "shirts" matches "SHIRTS")
    const filterLower = filterValue.toLowerCase().replace(/-/g, ' ');
    const directMatch = subCategories.find((sub) => {
      const title = ((sub as { title?: string }).title || '').trim().toLowerCase();
      // Check if title contains the filter word or vice versa
      return title.includes(filterLower) || filterLower.split(' ').some(word => 
        word.length > 2 && title.includes(word)
      );
    });
    
    if (directMatch) {
      const sub = directMatch as { title?: string; id?: string };
      console.log(`✅ Direct match found: "${sub.title}" (ID: ${sub.id})`);
      return sub.id || null;
    }
    
    // Strategy 3: Try partial match with expected title words
    if (expectedTitle) {
      const expectedLower = expectedTitle.toLowerCase();
      const expectedWords = expectedLower.split(/[\s&,]+/).filter(w => w.length > 2);
      const partialMatch = subCategories.find((sub) => {
        const title = ((sub as { title?: string }).title || '').trim().toLowerCase();
        return expectedWords.some(word => title.includes(word));
      });
      
      if (partialMatch) {
        const sub = partialMatch as { title?: string; id?: string };
        console.log(`✅ Partial match found: "${sub.title}" (ID: ${sub.id})`);
        return sub.id || null;
      }
    }
    
    console.warn(`❌ No subcategory match found for filter "${filterValue}"`);
    console.warn(`   Expected title: "${expectedTitle || 'N/A'}"`);
    console.warn(`   Available titles: ${subCategories.map(s => (s as { title?: string }).title).join(', ')}`);
    return null;
  } catch (error) {
    console.error(`❌ Error fetching subcategory for filter ${filterValue}:`, error);
    return null;
  }
}

/**
 * Get products filtered by section and optional subcategory filter
 */
export async function getFilteredProducts(
  section: 'her' | 'him',
  filterValue?: string
): Promise<Product[]> {
  try {
    // Get category ID for the section
    const categoryId = await getCategoryIdBySection(section);
    if (!categoryId) {
      console.warn(`No category found for section: ${section}`);
      return [];
    }
    
    const filterParams: Record<string, unknown> = {
      category_id: categoryId
      // Note: Not filtering by status initially - we'll filter client-side
    };
    
    // If filter value is provided, get subcategory ID and filter by it
    if (filterValue && filterValue !== 'all') {
      console.log(`🔍 Filtering by subcategory: ${filterValue}`);
      const subCategoryId = await getSubCategoryIdByFilter(filterValue, categoryId);
      if (subCategoryId) {
        filterParams.sub_category_id = subCategoryId;
        console.log(`✅ Using subcategory_id: ${subCategoryId}`);
      } else {
        console.warn(`⚠️ No subcategory found for filter: ${filterValue}, showing all products for category`);
        // Still return products filtered by category only
      }
    } else {
      console.log(`📦 Showing all products for ${section} category`);
    }
    
    console.log('🔎 Fetching products with filters:', filterParams);
    
    // Fetch products with filters from Firebase
    console.log('🔎 Querying Firebase with filters:', JSON.stringify(filterParams, null, 2));
    const result = await getAllProducts('', { params: filterParams });
    const products = (result.data || []) as Product[];
    
    console.log(`📊 Firebase returned ${products.length} products`);
    
    // Log first few products for debugging
    if (products.length > 0) {
      console.log('📦 Sample products:');
      products.slice(0, 3).forEach((p, idx) => {
        console.log(`  ${idx + 1}. Product ID: ${p.id}`);
        console.log(`     category_id: ${p.category_id}`);
        console.log(`     sub_category_id: ${p.sub_category_id || 'null'}`);
        console.log(`     active: ${p.active}`);
        console.log(`     show_in: ${JSON.stringify(p.show_in || [])}`);
      });
    }
    
    // Additional client-side filtering
    const filteredProducts = products.filter((product) => {
      // Check category_id match - this should already be filtered by Firebase query
      if (product.category_id !== categoryId) {
        console.log(`  ⚠️ Product ${product.id} has wrong category_id: ${product.category_id} (expected: ${categoryId})`);
        return false;
      }
      
      // If we're filtering by subcategory, check sub_category_id matches
      if (filterValue && filterValue !== 'all' && filterParams.sub_category_id) {
        if (product.sub_category_id !== filterParams.sub_category_id) {
          console.log(`  ⚠️ Product ${product.id} has wrong sub_category_id: ${product.sub_category_id} (expected: ${filterParams.sub_category_id})`);
          return false;
        }
      }
      
      // Check status - accept "published" or if status field doesn't exist, include it
      if (product.status !== undefined && product.status !== null) {
        const statusStr = String(product.status).toLowerCase();
        if (statusStr !== 'published') {
          console.log(`  ⚠️ Product ${product.id} has wrong status: "${product.status}" (expected: "published")`);
          // Still include it - don't filter by status too strictly
          // return false;
        }
      }
      
      // Check show_in array - if it exists and has values, it must include the section
      // If show_in doesn't exist or is empty, we still include it if category_id matches
      if (product.show_in && Array.isArray(product.show_in) && product.show_in.length > 0) {
        const showInLower = product.show_in.map((s: string) => String(s).toLowerCase());
        if (!showInLower.includes(section)) {
          console.log(`  ⚠️ Product ${product.id} show_in doesn't include ${section}: ${JSON.stringify(product.show_in)}`);
          // Don't filter by show_in if category_id matches - be more lenient
          // return false;
        }
      }
      
      // Check active status - only exclude if explicitly set to false/0
      if (product.active !== undefined && product.active !== null) {
        const isActive = product.active === true || product.active === 1;
        if (!isActive) {
          console.log(`  ⚠️ Product ${product.id} is not active: ${product.active}`);
          // Still include inactive products for now to see them
          // return false;
        }
      }
      
      return true;
    });
    
    console.log(`\n✅ Final result: ${filteredProducts.length} products for ${section}${filterValue && filterValue !== 'all' ? ` (filter: ${filterValue})` : ''}`);
    
    return filteredProducts;
  } catch (error) {
    console.error(`Error fetching filtered products for ${section}:`, error);
    return [];
  }
}

