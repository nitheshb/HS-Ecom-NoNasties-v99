import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Your Order */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Your Order</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/track-order" className="text-gray-600 hover:text-black transition">
                  Track your Order
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-600 hover:text-black transition">
                  Return or Exchange
                </Link>
              </li>
              <li>
                <Link href="/gift-cards" className="text-gray-600 hover:text-black transition">
                  Buy a Gift Card
                </Link>
              </li>
            </ul>
          </div>

          {/* Our Stores */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Our Stores</h3>
            <ul className="space-y-2">
              <li className="text-gray-600">Assagao, Goa</li>
              <li className="text-gray-600">Panjim, Goa</li>
              <li className="text-gray-600">Indiranagar, Bengaluru</li>
            </ul>
          </div>

          {/* Our Story */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Our Story</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-black transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/for-the-planet" className="text-gray-600 hover:text-black transition">
                  For the Planet
                </Link>
              </li>
              <li>
                <Link href="/for-the-record" className="text-gray-600 hover:text-black transition">
                  For the Record
                </Link>
              </li>
              <li>
                <Link href="/planet-diaries" className="text-gray-600 hover:text-black transition">
                  Planet Diaries
                </Link>
              </li>
            </ul>
          </div>

          {/* FYI */}
          <div>
            <h3 className="font-semibold text-lg mb-4">FYI</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-black transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-black transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-black transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8">
          <div className="max-w-md mx-auto text-left ">
            <p className="text-gray-600 mb-4">
              Sign up to get good news & great offers in your inbox.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-black text-[#28e605] text-[12px] rounded hover:bg-gray-800 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>


        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-right text-gray-600 text-sm">
          <p>© {currentYear} - No Nasties. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

