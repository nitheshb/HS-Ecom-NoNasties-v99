/**
 * Debug script to check actual stock quantities in database
 * Run with: npx tsx scripts/check-stock.ts
 */

import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../app/db';

const STOCKS_COLLECTION = 'T_stocks';
const PRODUCTS_COLLECTION = 'T_products';

async function checkStockForProduct() {
  try {
    console.log('🔍 Checking stock quantities in database...\n');

    // First, let's get all products from "him" section
    console.log('📦 Fetching products from T_products collection...');
    const productsQuery = query(collection(db, PRODUCTS_COLLECTION));
    const productsSnapshot = await getDocs(productsQuery);
    
    console.log(`Found ${productsSnapshot.docs.length} total products\n`);

    // Find products that might be "Mens img 1" or similar
    const himProducts: Array<{ id: string; title: any; img: string; name?: string }> = [];
    
    productsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const title = data.title || data.name || '';
      const img = data.img || '';
      const name = data.name || '';
      
      // Look for products that might match "Mens img 1" or have "img" in their data
      if (
        (typeof title === 'string' && title.toLowerCase().includes('mens')) ||
        (typeof title === 'object' && Object.values(title).some((v: any) => 
          typeof v === 'string' && v.toLowerCase().includes('mens')
        )) ||
        img.includes('img') ||
        name.toLowerCase().includes('mens')
      ) {
        himProducts.push({
          id: doc.id,
          title: data.title,
          img: img,
          name: name,
        });
      }
    });

    console.log(`Found ${himProducts.length} potential "Mens" products:\n`);
    
    // Display found products
    himProducts.forEach((product, index) => {
      console.log(`${index + 1}. Product ID: ${product.id}`);
      console.log(`   Title: ${JSON.stringify(product.title)}`);
      console.log(`   Name: ${product.name || 'N/A'}`);
      console.log(`   Image: ${product.img || 'N/A'}`);
      console.log('');
    });

    // Now check stock for each product
    console.log('\n📊 Checking stock quantities for each product:\n');
    
    for (const product of himProducts) {
      console.log(`\n--- Product: ${product.id} ---`);
      
      // Get stocks for this product
      const stocksQuery = query(
        collection(db, STOCKS_COLLECTION),
        where('countable_id', '==', product.id)
      );
      const stocksSnapshot = await getDocs(stocksQuery);
      
      if (stocksSnapshot.empty) {
        console.log('  ❌ No stocks found for this product');
        continue;
      }
      
      console.log(`  Found ${stocksSnapshot.docs.length} stock entry/entries:`);
      
      let totalQuantity = 0;
      stocksSnapshot.docs.forEach((stockDoc, index) => {
        const stockData = stockDoc.data();
        const quantity = Number(stockData.quantity) || 0;
        totalQuantity += quantity;
        
        console.log(`  Stock ${index + 1}:`);
        console.log(`    Stock ID: ${stockDoc.id}`);
        console.log(`    SKU: ${stockData.sku || 'N/A'}`);
        console.log(`    Quantity: ${quantity}`);
        console.log(`    Price: ${stockData.price || 'N/A'}`);
        console.log(`    Countable ID: ${stockData.countable_id}`);
      });
      
      console.log(`  ✅ TOTAL QUANTITY: ${totalQuantity}`);
    }

    // Also check if there are any stocks with specific patterns
    console.log('\n\n🔍 Checking all stocks in T_stocks collection...\n');
    const allStocksQuery = query(collection(db, STOCKS_COLLECTION));
    const allStocksSnapshot = await getDocs(allStocksQuery);
    
    console.log(`Total stocks in database: ${allStocksSnapshot.docs.length}`);
    
    // Group by countable_id and show totals
    const stockByProduct: Record<string, { count: number; total: number; details: any[] }> = {};
    
    allStocksSnapshot.docs.forEach((stockDoc) => {
      const stockData = stockDoc.data();
      const productId = stockData.countable_id;
      const quantity = Number(stockData.quantity) || 0;
      
      if (!stockByProduct[productId]) {
        stockByProduct[productId] = {
          count: 0,
          total: 0,
          details: [],
        };
      }
      
      stockByProduct[productId].count++;
      stockByProduct[productId].total += quantity;
      stockByProduct[productId].details.push({
        stockId: stockDoc.id,
        quantity: quantity,
        sku: stockData.sku,
      });
    });
    
    console.log(`\n📈 Stock summary by product:\n`);
    Object.entries(stockByProduct).slice(0, 10).forEach(([productId, data]) => {
      console.log(`Product ID: ${productId}`);
      console.log(`  Stock entries: ${data.count}`);
      console.log(`  Total quantity: ${data.total}`);
      console.log(`  Details:`, data.details);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error checking stock:', error);
  }
}

// Run the check
checkStockForProduct()
  .then(() => {
    console.log('\n✅ Stock check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

