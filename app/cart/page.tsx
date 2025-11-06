export default function CartPage() {
  return (
    <div className="min-h-screen pb-12 pt-24">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        <div className="text-center py-20">
          <p className="text-2xl text-gray-600 mb-4">Your cart is empty</p>
          <a
            href="/her"
            className="inline-block border-2 border-black px-8 py-3 rounded hover:bg-black hover:text-white transition font-semibold"
          >
            Continue Shopping
          </a>
        </div>

        {/* Example cart item structure for when items are added */}
        <div className="hidden">
          <div className="border-b pb-6 mb-6">
            <div className="flex gap-6">
              <div className="w-24 h-24 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Product Name</h3>
                <p className="text-gray-600 text-sm mb-2">Size: M</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold">₹ 2,999</p>
                  <button className="text-red-600 hover:text-red-800">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

