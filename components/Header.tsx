import React, { useState, useEffect } from 'react';
import { LocationIcon, ChevronDownIcon, SearchIcon, CartIcon, UserIcon, QrCodeIcon, HeartIcon } from './Icons';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../hooks/useStore';
import { TrophyIcon } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';

interface HeaderProps {
  onCartClick: () => void;
  onScanClick: () => void;
  onLocationClick: () => void;
  navigate: (path: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onCartClick, onScanClick, onLocationClick, navigate }) => {
  const { cartCount } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { selectedStore } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const { wishlist } = useWishlist();

  useEffect(() => {
    const handleClearSearch = () => {
      setSearchQuery('');
    };
    window.addEventListener('clear-search', handleClearSearch);
    return () => {
      window.removeEventListener('clear-search', handleClearSearch);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.dispatchEvent(new CustomEvent('app-search', { detail: searchQuery }));
      sessionStorage.setItem('searchQuery', searchQuery);
      navigate('/');
    }
  }
  
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
      e.preventDefault();
      navigate(path);
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200 shadow-lg rounded-b-2xl">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24 md:h-20 border-b-0">
          <div className="flex items-center gap-x-10">
            {/* Logo */}
            <a href="/" onClick={(e) => handleNavClick(e, '/')} className="flex items-end gap-1 text-2xl font-bold text-gray-800">
              <svg width="28" height="30" viewBox="0 0 96 108" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M48 0L95.225 26.5V79.5L48 106L0.775017 79.5V26.5L48 0Z" fill="#0C831F"/>
                <path d="M48 10L83.825 31V75L48 96L12.175 75V31L48 10Z" fill="white"/>
                <path d="M68 53C68 64.0457 59.0457 73 48 73C36.9543 73 28 64.0457 28 53C28 41.9543 36.9543 33 48 33C59.0457 33 68 41.9543 68 53Z" fill="#FFC83D"/>
                <path d="M48 43V63" stroke="#0C831F" strokeWidth="4" strokeLinecap="round"/>
                <path d="M58 53L38 53" stroke="#0C831F" strokeWidth="4" strokeLinecap="round"/>
              </svg>
              <span className="hidden md:inline">blinkit</span>
            </a>

            {/* Location */}
            <div onClick={onLocationClick} className="hidden lg:flex items-center border-l pl-8 cursor-pointer group">
                <LocationIcon className="h-6 w-6 text-gray-800 group-hover:text-blinkit-green" />
                <div className="ml-3">
                    <p className="font-bold text-sm text-gray-800 group-hover:text-blinkit-green transition-colors">{selectedStore.name}</p>
                    <p className="text-xs text-gray-500 flex items-center">
                        {selectedStore.address} <ChevronDownIcon className="h-4 w-4 ml-1" />
                    </p>
                </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end flex-1 min-w-0">
            {/* Search Bar */}
            <div className="w-full max-w-lg hidden md:block ml-10">
              <form onSubmit={handleSearchSubmit} className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search for products..."
                  className="w-full bg-blinkit-gray-100 border border-transparent rounded-lg py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blinkit-green focus:border-transparent transition"
                />
              </form>
            </div>

            {/* Auth, Scan and Cart */}
            <div className="flex items-center ml-6 gap-3 md:gap-5">
               {isAuthenticated ? (
                 <a href="/profile" onClick={(e) => handleNavClick(e, '/profile')} className="flex items-center text-sm font-semibold bg-blinkit-green text-white hover:bg-blinkit-green-dark px-2 py-2 rounded-lg transition-transform duration-150 hover:scale-105 hover:shadow-md">
                    <UserIcon className="h-6 w-6 mr-1"/>
                    {user?.name?.split(' ')[0]}
                 </a>
               ) : (
                <a href="/login" onClick={(e) => handleNavClick(e, '/login')} className="text-sm font-semibold text-gray-700 hover:text-blinkit-green transition-transform duration-150 hover:scale-105 hover:shadow-md">Login</a>
               )}

              <button
                onClick={() => navigate('/wishlist')}
                className="relative p-2 rounded-full bg-blinkit-green text-white hover:bg-blinkit-green-dark transition-colors flex items-center justify-center transition-transform duration-150 hover:scale-110 hover:shadow-lg"
                aria-label="Wishlist"
              >
                <HeartIcon className="h-6 w-6" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blinkit-yellow text-blinkit-green-dark text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>

              <button onClick={onScanClick} className="p-2 rounded-full bg-blinkit-green text-white hover:bg-blinkit-green-dark transition-colors flex items-center justify-center transition-transform duration-150 hover:scale-110 hover:shadow-lg" aria-label="Scan product">
                  <QrCodeIcon className="h-6 w-6"/>
               </button>

              <button
                onClick={onCartClick}
                className="flex items-center bg-blinkit-green text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blinkit-green-dark transition-colors duration-200 relative transition-transform duration-150 hover:scale-105 hover:shadow-md"
              >
                <CartIcon className="h-5 w-5 mr-2" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blinkit-yellow text-blinkit-green-dark text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              {/* Leaderboard */}
              <button onClick={() => navigate('/leaderboard')} className="flex items-center bg-blinkit-green text-white hover:bg-blinkit-green-dark border border-blinkit-green px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blinkit-green hover:text-white transition-colors duration-200 relative transition-transform duration-150 hover:scale-105 hover:shadow-md">
                <TrophyIcon className="h-5 w-5 mr-2" />
                <span>Leaderboard</span>
                <span className="absolute -top-2 -right-2 bg-blinkit-yellow text-blinkit-green-dark text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  #{3}
                </span>
              </button>
            </div>
          </div>
        </div>
        <div className="md:hidden px-4 py-2 border-t">
            <form onSubmit={handleSearchSubmit} className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search for products..."
                    className="w-full bg-blinkit-gray-100 border border-transparent rounded-lg py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blinkit-green focus:border-transparent transition"
                />
            </form>
        </div>
      </div>
    </header>
  );
};

export default Header;
