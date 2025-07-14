

import React from 'react';
import { XIcon, PlusIcon, MinusIcon } from './Icons';
import { ScannedProductDetails, Product } from '../types';
import { useCart } from '../hooks/useCart';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: ScannedProductDetails | null;
  isLoading: boolean;
  error: string | null;
  barcode: string | null;
}

const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
  const getScoreColor = (s: number) => {
    if (s > 75) return '#0C831F'; // green
    if (s > 40) return '#FFC83D'; // yellow
    return '#DC2626'; // red
  };
  
  const color = getScoreColor(score);
  const circumference = 2 * Math.PI * 45; // r=45
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle
          className="text-gray-200"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
        <circle
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
          className="transform -rotate-90 origin-center transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
         <span className="text-3xl font-bold" style={{ color }}>{score}</span>
         <span className="text-xs font-semibold text-gray-500">/ 100</span>
      </div>
    </div>
  );
};

// Helper component for score badges
const ScoreBadge: React.FC<{ score: number, type: 'eco' | 'nutri' }> = ({ score, type }) => {
    const getScoreColorClasses = (s: number) => {
        if (s > 75) return 'bg-green-100 text-green-800';
        if (s > 40) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };
    const colorClasses = getScoreColorClasses(score);
    return (
      <div className={`text-xs font-bold px-2 py-1 rounded-full ${colorClasses}`}>
        {type === 'eco' ? 'Eco' : 'Nutri'}: {score}
      </div>
    );
};

const RecommendationCard: React.FC<{ recommendation: Product }> = ({ recommendation }) => {
  const { addToCart, getItemQuantity, updateQuantity } = useCart();
  const quantity = getItemQuantity(recommendation.id);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(recommendation);
  };
  
  return (
    <div className="border border-gray-200 rounded-lg p-3 flex flex-col bg-white hover:shadow-md transition-shadow h-full">
      <div className="flex-grow">
        <h5 className="font-bold text-sm text-gray-800 mb-1">{recommendation.name}</h5>
        <p className="text-xs text-gray-500 mb-2">{recommendation.weight}</p>
        <div className="flex items-center gap-2 mb-3">
          <ScoreBadge score={recommendation.ecologicalScore} type="eco" />
          {recommendation.nutritionalScore !== null && (
            <ScoreBadge score={recommendation.nutritionalScore} type="nutri" />
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-3">
        <p className="text-sm font-bold text-gray-900">₹{recommendation.price}</p>
        <div className="w-20">
          {quantity > 0 ? (
            <div className="flex items-center justify-center w-full h-8 bg-purepick-green-light rounded-lg">
                <button
                    onClick={() => updateQuantity(recommendation.id, quantity - 1)}
                    className="px-2 text-purepick-green hover:bg-gray-200 rounded-l-lg h-full"
                    aria-label={`Decrease quantity of ${recommendation.name}`}
                >
                    <MinusIcon className="w-4 h-4" />
                </button>
                <span className="px-3 text-sm font-bold text-purepick-green" aria-live="polite">{quantity}</span>
                <button
                    onClick={() => updateQuantity(recommendation.id, quantity + 1)}
                    className="px-2 text-purepick-green hover:bg-gray-200 rounded-r-lg h-full"
                    aria-label={`Increase quantity of ${recommendation.name}`}
                >
                    <PlusIcon className="w-4 h-4" />
                </button>
            </div>
          ) : (
            <button
                onClick={handleAddClick}
                className="bg-white shadow-md border border-gray-200 text-purepick-green text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-purepick-green-light transition-colors"
                >
                ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ isOpen, onClose, details, isLoading, error, barcode }) => {
  if (!isOpen) return null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purepick-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing barcode with AI...</p>
          <p className="text-sm text-gray-400">Fetching scores & recommendations.</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center py-20">
          <h3 className="text-lg font-bold text-red-600">Analysis Failed</h3>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      );
    }
    if (!details) {
       return (
        <div className="text-center py-20">
          <h3 className="text-lg font-bold text-gray-800">No Product Data</h3>
          <p className="mt-2 text-gray-600">Could not retrieve details for this product.</p>
        </div>
      );
    }
    
    if (details.productName === 'Unknown Product') {
        return (
            <div className="text-center py-20">
              <h3 className="text-lg font-bold text-gray-800">Product Not Found</h3>
              <p className="mt-2 text-gray-600">{details.ecologicalJustification || 'Could not identify this product from the barcode.'}</p>
            </div>
        );
    }

    return (
      <>
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">{details.productName}</h3>
          <p className="text-sm text-gray-500">{details.brand || 'Unknown Brand'}</p>
                          {details.category && <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-purepick-green bg-purepick-green-light px-2 py-0.5 rounded-full inline-block">{details.category}</p>}
          {barcode && <p className="text-xs text-gray-400 mt-2 font-mono">EAN/UPC: {barcode}</p>}
        </div>

        <div className="mb-6">
          {details.isFoodProduct && details.nutritionalScore !== null ? (
            <>
              <div className="flex justify-around items-start text-center">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Ecological Score</h4>
                  <ScoreGauge score={details.ecologicalScore} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Nutritional Score</h4>
                  <ScoreGauge score={details.nutritionalScore} />
                </div>
              </div>
                              <div className="mt-4 space-y-3 bg-purepick-gray-100 p-4 rounded-lg text-xs text-gray-600 text-left">
                <p><span className="font-bold text-gray-700">Eco Justification:</span> {details.ecologicalJustification}</p>
                <p><span className="font-bold text-gray-700">Nutri Justification:</span> {details.nutritionalJustification}</p>
              </div>
            </>
          ) : (
            <>
              <h4 className="font-semibold text-gray-700 mb-2 text-center">Ecological Score</h4>
                              <div className="flex flex-col items-center gap-4 bg-purepick-gray-100 p-4 rounded-lg">
                <ScoreGauge score={details.ecologicalScore} />
                <p className="text-sm text-center text-gray-600">{details.ecologicalJustification}</p>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 border-t pt-4">
          <h4 className="font-semibold text-gray-700 mb-2">Likely Ingredients</h4>
          <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg leading-relaxed">
            {details.ingredients || 'Could not be determined.'}
          </p>
        </div>

        {details.recommendations && details.recommendations.length > 0 && (
                          <div className="mt-8 border-t pt-6 bg-purepick-gray-100 -mx-6 px-6 pb-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">Healthier & Greener Alternatives</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {details.recommendations.map((rec) => (
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-800">Product Analysis</h2>
          <button 
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }} 
            type="button"
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <XIcon className="w-6 h-6 text-gray-600" />
          </button>
        </header>
        <div className="p-6 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
