import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaGooglePlay,
  FaApple,
} from "react-icons/fa";
import React from "react";

const Footer: React.FC = () => {
  const usefulLinks = ["About Us", "Careers", "Contact", "FAQs", "Privacy Policy", "Terms"];
  const categories = ["Fruits & Vegetables", "Dairy & Eggs", "Snacks", "Beverages", "Bakery", "Household"];

  return (
    <footer className="bg-blinkit-green-dark text-white">
      <div className="max-w-screen-xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Categories */}
        <div>
          <h3 className="text-lg font-bold mb-4">Shop by Category</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            {categories.map((cat, i) => (
              <li key={i} className="hover:text-white transition-colors">
                <a href="#">{cat}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Useful Links */}
        <div>
          <h3 className="text-lg font-bold mb-4">Useful Links</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            {usefulLinks.map((link, i) => (
              <li key={i} className="hover:text-white transition-colors">
                <a href="#">{link}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* App Download */}
        <div>
          <h3 className="text-lg font-bold mb-4">Download Our App</h3>
          <div className="flex flex-col space-y-4">
            <a href="#" className="flex items-center space-x-3 bg-white text-[#0f3d25] font-medium px-4 py-2 rounded-md shadow hover:scale-105 transition-transform">
              <FaGooglePlay className="text-xl" />
              <span>Google Play</span>
            </a>
            <a href="#" className="flex items-center space-x-3 bg-white text-[#0f3d25] font-medium px-4 py-2 rounded-md shadow hover:scale-105 transition-transform">
              <FaApple className="text-xl" />
              <span>App Store</span>
            </a>
          </div>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-bold mb-4">Follow Us</h3>
          <div className="flex space-x-5 text-xl">
            <a href="#" className="text-gray-300 hover:text-white transition-colors"><FaFacebookF /></a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors"><FaInstagram /></a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors"><FaTwitter /></a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors"><FaLinkedinIn /></a>
          </div>
        </div>
      </div>

      {/* Bottom Disclaimer */}
      <div className="border-t border-green-700 mt-5 pt-4 pb-6 text-center text-sm text-gray-300 px-6">
        <p>© 2025 PurePick. All rights reserved.</p>
        <p className="mt-1">
          We’re on a mission to make grocery shopping greener. At PurePick, we source responsibly, reduce waste, and deliver fresh essentials with sustainability at heart — because every choice matters.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
