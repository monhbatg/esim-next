import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-emerald-100 bg-linear-to-b from-white to-slate-100">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-xl font-bold bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                GOY
              </span>
              <span className="text-xl font-bold text-slate-800 ml-1">
                eSIM
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your global connectivity solution. Stay connected anywhere, anytime.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-900">
              Product
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/marketplace" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <a href="#" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-900">
              Support
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-900">
              Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-8 text-center text-sm text-slate-600">
          <p>&copy; {new Date().getFullYear()} GOY eSIM. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
