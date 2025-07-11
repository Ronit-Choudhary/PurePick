import React from 'react';
import { useWishlist } from '../hooks/useWishlist';
import ProductCard from '../components/ProductCard';

const WishlistPage: React.FC<{ onProductSelect: (barcode: string) => void }> = ({ onProductSelect }) => {
  const { wishlist } = useWishlist();

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Your Wishlist</h2>
      {wishlist.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">Your wishlist is empty. Start adding products you love!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {wishlist.map(product => (
            <ProductCard key={product.id} product={product} onProductSelect={onProductSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage; 