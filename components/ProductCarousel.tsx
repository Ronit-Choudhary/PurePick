
import React, { useRef } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface ProductCarouselProps {
  title: string;
  products: Product[];
  onProductSelect: (barcode: string) => void;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ title, products, onProductSelect }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{title}</h2>
        <div className="flex items-center space-x-2">
            <button
                onClick={() => scroll('left')}
                className="bg-gray-200 hover:bg-gray-300 rounded-full p-2 transition-colors"
                aria-label="Scroll left"
            >
                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <button
                onClick={() => scroll('right')}
                className="bg-gray-200 hover:bg-gray-300 rounded-full p-2 transition-colors"
                aria-label="Scroll right"
            >
                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>
        </div>
      </div>
      <div 
        ref={scrollRef} 
        className="flex space-x-4 md:space-x-6 overflow-x-auto pb-4 scrollbar-hide"
      >
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-40 md:w-48">
             <ProductCard product={product} onProductSelect={onProductSelect} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductCarousel;