import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold text-sa-green">SA</span>
              <span className="text-lg font-semibold text-white">Bookings</span>
            </div>
            <p className="text-sm text-gray-400">
              Your gateway to the best accommodation across all 9 provinces of South Africa.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Explore</h3>
            <ul className="space-y-2">
              {['Western Cape', 'Gauteng', 'KwaZulu-Natal', 'Mpumalanga', 'Eastern Cape'].map((p) => (
                <li key={p}><a href={`/accommodations?province=${encodeURIComponent(p)}`} className="text-sm hover:text-white transition-colors">{p}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-sm hover:text-white transition-colors">About Us</a></li>
              <li><a href="/contact" className="text-sm hover:text-white transition-colors">Contact</a></li>
              <li><a href="/careers" className="text-sm hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="/privacy" className="text-sm hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="text-sm hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/cancellation" className="text-sm hover:text-white transition-colors">Cancellation Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} SA Bookings. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
