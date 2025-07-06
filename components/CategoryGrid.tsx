
import React from 'react';
import { Category } from '../types';

interface CategoryGridProps {
  categories: Category[];
  onSelectCategory: (categoryName: string) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onSelectCategory }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
      {categories.slice(0, 10).map((category) => (
        <div key={category.name} onClick={() => onSelectCategory(category.name)} className="cursor-pointer group flex flex-col items-center text-center">
          <img
            src={category.imageUrl}
            alt={category.name}
            className="w-full h-auto object-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
          />
          <p className="mt-2 text-sm font-semibold text-gray-700 group-hover:text-blinkit-green">{category.name}</p>
        </div>
      ))}
    </div>
  );
};

export default CategoryGrid;
