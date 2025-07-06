
import React, { useState, useEffect, useMemo } from 'react';
import CategoryGrid from '../components/CategoryGrid';
import ProductCarousel from '../components/ProductCarousel';
import ProductCard from '../components/ProductCard';
import { useStore } from '../hooks/useStore';
import { Product } from '../types';

interface HomePageProps {
  onProductSelect: (barcode: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onProductSelect }) => {
  const { products, categories } = useStore();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // When the store's products change, reset the view
  useEffect(() => {
    setFilteredProducts(products);
    setSearchQuery('');
    setSelectedCategory(null);
    sessionStorage.removeItem('searchQuery');
    window.dispatchEvent(new CustomEvent('clear-search'));
  }, [products]);

  useEffect(() => {
    const sessionSearch = sessionStorage.getItem('searchQuery');
    if (sessionSearch) {
      handleSearch(sessionSearch);
    }
    
    const handleGlobalSearch = (event: CustomEvent) => {
        handleSearch(event.detail);
    };
    
    const handleClearSearch = () => {
        clearFilter();
    };

    window.addEventListener('app-search', handleGlobalSearch as EventListener);
    window.addEventListener('clear-search', handleClearSearch);

    return () => {
        window.removeEventListener('app-search', handleGlobalSearch as EventListener);
        window.removeEventListener('clear-search', handleClearSearch);
    }
  }, []); // Empty dependency array as we want this to run once

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory(null); // Clear category filter when searching
    if (query.trim() === '') {
      setFilteredProducts(products);
    } else {
      const lowercasedQuery = query.toLowerCase();
      const results = products.filter(
        (product) =>
          product.name.toLowerCase().includes(lowercasedQuery) ||
          product.category.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredProducts(results);
    }
  };
  
  const handleSelectCategory = (categoryName: string) => {
    setSearchQuery('');
    sessionStorage.removeItem('searchQuery');
    setSelectedCategory(categoryName);
    const results = products.filter(p => p.category === categoryName);
    setFilteredProducts(results);
  };
  
  const clearFilter = () => {
    setSearchQuery('');
    sessionStorage.removeItem('searchQuery');
    setSelectedCategory(null);
    setFilteredProducts(products);
  }

  const trendingProducts = useMemo(() => products.slice(0, 10), [products]);
  const dailyStaples = useMemo(() => products.filter(p => p.category === "Dairy & Eggs" || p.category === "Fresh Food & Produce").slice(0, 10), [products]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="w-full h-auto mb-8">
          <img src="https://cdn.dotpe.in/longtail/store-items/8/2024/05/20/19_30_23_968_331206_Blinkit_331206_2024_05_20_11_25_48_682.jpeg" alt="Promotional Banner" className="w-full h-auto rounded-xl object-cover" />
      </div>

      <CategoryGrid categories={categories} onSelectCategory={handleSelectCategory} />
      
      <div className="my-12 border-t border-gray-200"></div>

      {searchQuery || selectedCategory ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              {searchQuery ? `Search Results for "${searchQuery}"` : `Category: ${selectedCategory}`}
            </h2>
            <button 
              onClick={clearFilter} 
              className="text-sm text-blinkit-green font-semibold hover:underline"
            >
              Clear Filter
            </button>
          </div>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={`${product.id}-${product.price}`} product={product} onProductSelect={onProductSelect} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No products found. Try a different search or category.</p>
            </div>
          )}
        </div>
      ) : (
          <>
          <ProductCarousel title="Trending Near You" products={trendingProducts} onProductSelect={onProductSelect} />
          <div className="my-12"></div>
          <ProductCarousel title="Your Daily Staples" products={dailyStaples} onProductSelect={onProductSelect} />
        </>
      )}
    </div>
  );
}

export default HomePage;
