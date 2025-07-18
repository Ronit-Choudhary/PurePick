
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  const searchResultsRef = useRef<HTMLDivElement>(null);

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
          product.name.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredProducts(results);
      
      // Scroll to search results after a short delay to ensure DOM is updated
      setTimeout(() => {
        if (searchResultsRef.current) {
          searchResultsRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    }
  };
  
  const handleSelectCategory = (categoryName: string) => {
    setSearchQuery('');
    sessionStorage.removeItem('searchQuery');
    setSelectedCategory(categoryName);
    const results = products.filter(p => p.category === categoryName);
    setFilteredProducts(results);
    
    // Scroll to search results after a short delay to ensure DOM is updated
    setTimeout(() => {
      if (searchResultsRef.current) {
        searchResultsRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };
  
  const clearFilter = () => {
    setSearchQuery('');
    sessionStorage.removeItem('searchQuery');
    setSelectedCategory(null);
    setFilteredProducts(products);
  }

  // Utility to shuffle an array
  function getRandomProducts(arr: Product[], n: number) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, n);
  }

  const trendingProducts = useMemo(() => getRandomProducts(products, 10), [products]);
  const dailyStaples = useMemo(() => products.filter(p => p.category === "Dairy & Eggs" || p.category === "Fresh Food & Produce").slice(0, 10), [products]);

  return (
    <div className="max-w-screen-xl mx-auto  px-4 sm:px-6 lg:px-8 py-8">
      <div className="w-full h-auto mb-8 border border-gray-400 rounded-xl">
          <img src="/Banner/1.png" alt="Promotional Banner" className="w-full h-auto rounded-xl object-cover" />
      </div>

      <CategoryGrid categories={categories} onSelectCategory={handleSelectCategory} />
      
      <div className="my-12 border-t border-gray-200"></div>

      {searchQuery || selectedCategory ? (
        <div ref={searchResultsRef}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              {searchQuery ? `Search Results for "${searchQuery}"` : `Category: ${selectedCategory}`}
            </h2>
            <button 
              onClick={clearFilter} 
                              className="text-sm text-purepick-green font-semibold hover:underline"
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
