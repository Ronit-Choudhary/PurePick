import React from 'react';
import { Product } from '../types';
import { useCart } from '../hooks/useCart';
import { PlusIcon, MinusIcon } from './Icons';
import { useWishlist } from '../hooks/useWishlist';
import { HeartIcon as OutlineHeart, HeartFillIcon as FilledHeart } from './Icons';

interface ProductCardProps {
  product: Product;
  onProductSelect: (barcode: string) => void;
}

const QuantityStepper: React.FC<{ productId: string }> = ({ productId }) => {
  const { getItemQuantity, updateQuantity } = useCart();
  const quantity = getItemQuantity(productId);

  return (
                <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-center w-full h-8 bg-purepick-green-light rounded-lg">
      <button
        onClick={() => updateQuantity(productId, quantity - 1)}
                    className="px-2 text-purepick-green hover:bg-gray-200 rounded-l-lg h-full"
      >
        <MinusIcon className="w-4 h-4" />
      </button>
                  <span className="px-3 text-sm font-bold text-purepick-green">{quantity}</span>
      <button
        onClick={() => updateQuantity(productId, quantity + 1)}
                    className="px-2 text-purepick-green hover:bg-gray-200 rounded-r-lg h-full"
      >
        <PlusIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

const AddButton: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        addToCart(product);
      }}
                  className="absolute bottom-2 -right-2 bg-white shadow-md border border-gray-200 text-purepick-green text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-purepick-green-light transition-colors"
    >
      ADD
    </button>
  );
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onProductSelect }) => {
  const { getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.id);
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (wishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div
      onClick={() => onProductSelect(product.barcode)}
      className="bg-white border border-gray-200 rounded-lg p-3 relative h-full flex flex-col group transition-shadow duration-200 hover:shadow-lg cursor-pointer"
    >
      <button
        onClick={handleWishlistClick}
        className={`absolute top-2 right-2 z-10 p-1 rounded-full bg-white shadow ${wishlisted ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 transition-colors`}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {wishlisted ? <FilledHeart className="w-5 h-5" /> : <OutlineHeart className="w-5 h-5" />}
      </button>
      <div className="relative mb-2">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-28 object-contain"
        />
        {quantity === 0 && <AddButton product={product} />}
      </div>
      <div className="flex-grow flex flex-col">
        <p className="text-sm font-semibold text-gray-800 flex-grow">{product.name}</p>
        <p className="text-xs text-gray-500 mt-1">{product.weight}</p>
      </div>
      <div className="flex justify-between items-center mt-3">
        <p className="text-sm font-bold text-gray-900">₹{product.price}</p>
        {quantity > 0 && 
            <div className="w-20">
                <QuantityStepper productId={product.id} />
            </div>
        }
      </div>
    </div>
  );
};

export default ProductCard;