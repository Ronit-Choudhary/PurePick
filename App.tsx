import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ScannerModal from './components/ScannerModal';
import LocationModal from './components/LocationModal';
import AddressModal from './components/AddressModal';
import AddressSelectionModal from './components/AddressSelectionModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { useAuth } from './hooks/useAuth';
import { useStore } from './hooks/useStore';
import { WishlistProvider } from './context/WishlistContext';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';

import { GoogleGenAI } from '@google/genai';
import { ScannedProductDetails, Product } from './types';
import { categories as allCategories } from './constants';
import Leaderboard from './components/LeaderBoard';


const API_KEY = process.env.API_KEY;

// A more robust check. An actual key is a long string.
const IS_API_KEY_VALID = typeof API_KEY === 'string' && API_KEY.trim().length > 10;

const ai = IS_API_KEY_VALID ? new GoogleGenAI({ apiKey: API_KEY }) : null;


// A utility function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// A small utility to handle navigation without page reloads
const navigate = (path: string) => {
  window.history.pushState({}, '', path);
  const navEvent = new PopStateEvent('popstate');
  window.dispatchEvent(navEvent);
};

// The main shell of the application, including routing
const AppShell = () => {
  const [route, setRoute] = useState(window.location.pathname);
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { products } = useStore(); // Get products from the selected store
  
  // State for modals
  const [isCartOpen, setCartOpen] = useState(false);
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [isLocationModalOpen, setLocationModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isAddressModalOpen, setAddressModalOpen] = useState(false);
  const [isAddressSelectionModalOpen, setAddressSelectionModalOpen] = useState(false);

  const [scannedProductDetails, setScannedProductDetails] = useState<ScannedProductDetails | null>(null);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    // Show location modal on first visit
    if (!localStorage.getItem('blinkit_store_id')) {
        setLocationModalOpen(true);
    }

    const onLocationChange = () => {
      setRoute(window.location.pathname);
    };
    window.addEventListener('popstate', onLocationChange);
    return () => {
      window.removeEventListener('popstate', onLocationChange);
    };
  }, []);

  // Effect to handle all auth-based navigation
  useEffect(() => {
    if (isAuthLoading) return;

    const onAuthPages = route === '/login' || route === '/register';

    if (isAuthenticated && onAuthPages) {
      navigate('/');
    }
    
    if (!isAuthenticated && route === '/profile') {
      navigate('/login');
    }
  }, [route, isAuthenticated, isAuthLoading]);

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setScannedProductDetails(null);
    setDetailError(null);
    setScannedBarcode(null);
    window.dispatchEvent(new CustomEvent('clear-search'));
  }
  
  const getRecommendations = (details: ScannedProductDetails, sourceBarcode: string): Product[] => {
    // Stage 1: Find strictly better products
    let recommendations = products
        .filter(p => p.category === details.category && p.barcode !== sourceBarcode)
        .filter(p => {
            const ecoScanned = details.ecologicalScore ?? 0;
            const nutriScanned = details.nutritionalScore ?? -1;
            const ecoCand = p.ecologicalScore ?? 0;
            const nutriCand = p.nutritionalScore ?? -1;

            if (details.isFoodProduct) {
                const noScoreWorse = ecoCand >= ecoScanned && nutriCand >= nutriScanned;
                const atLeastOneBetter = ecoCand > ecoScanned || nutriCand > nutriScanned;
                return noScoreWorse && atLeastOneBetter;
            } else {
                return ecoCand > ecoScanned;
            }
        });

    // Stage 2: If no strictly better products, find products with equal scores
    if (recommendations.length === 0) {
        recommendations = products
            .filter(p => p.category === details.category && p.barcode !== sourceBarcode)
            .filter(p => {
                const ecoScanned = details.ecologicalScore ?? 0;
                const nutriScanned = details.nutritionalScore ?? -1;
                const ecoCand = p.ecologicalScore ?? 0;
                const nutriCand = p.nutritionalScore ?? -1;

                // All scores must be identical to be considered "equal"
                if (details.isFoodProduct) {
                    return ecoCand === ecoScanned && nutriCand === nutriScanned;
                } else {
                    return ecoCand === ecoScanned;
                }
            });
    }
    
    return shuffleArray(recommendations).slice(0, 3);
  }

  const handleScanSuccess = async (decodedText: string) => {
    setScannerOpen(false);
    setDetailModalOpen(true);
    setIsLoadingDetails(true);
    setDetailError(null);
    setScannedProductDetails(null);
    setScannedBarcode(decodedText);
    
    if (!ai) {
        console.error("API Key is missing. Cannot perform AI-based product analysis.");
        setDetailError("The AI functionality is not configured. Please ensure the API key is set up correctly.");
        setIsLoadingDetails(false);
        return;
    }

    const knownProduct = products.find(p => p.barcode === decodedText);

    if (knownProduct) {
      const details: ScannedProductDetails = {
        productName: knownProduct.name,
        brand: knownProduct.brand,
        ingredients: knownProduct.description, 
        isFoodProduct: knownProduct.nutritionalScore !== null,
        category: knownProduct.category,
        ecologicalScore: knownProduct.ecologicalScore,
        nutritionalScore: knownProduct.nutritionalScore,
        ecologicalJustification: `This score is based on an analysis of the product's category, ingredients, and typical manufacturing processes.`,
        nutritionalJustification: knownProduct.nutritionalScore !== null
          ? `This score reflects the product's nutritional profile, including factors like sugar, fat, and vitamin content, relative to other items in its category.`
          : null,
        recommendations: [],
      };

      details.recommendations = getRecommendations(details, decodedText);
      
      setTimeout(() => {
        setScannedProductDetails(details);
        setIsLoadingDetails(false);
      }, 300);

      return;
    }

    try {
      const categoryNames = allCategories.map(c => c.name);
      const prompt = `
        You are a product analysis API. You will receive a product barcode. Your only job is to return a single, valid JSON object with the requested information. Do not add any commentary, explanations, or markdown formatting like \`\`\`json.

        Analyze the product for this barcode: '${decodedText}'
        
        Available product categories are: [${categoryNames.map(c => `'${c}'`).join(', ')}]

        **Instructions:**
        1.  **Use Google Search** to find the product's name, brand, and category.
        2.  **For the 'category' field, you MUST choose the most appropriate category from the provided list of available categories.**
        3.  **Analyze the product** and fill the following fields:
            *   \`isFoodProduct\`: A boolean value.
            *   \`ingredients\`: A string listing the likely primary ingredients.
            *   \`ecologicalScore\`: A number from 0 to 100.
            *   \`ecologicalJustification\`: A brief string explaining the score.
            *   \`nutritionalScore\`: A number from 0 to 100 if it's a food product, otherwise \`null\`.
            *   \`nutritionalJustification\`: A brief string if it's a food product, otherwise \`null\`.
        4.  **Strictly adhere to the JSON output format.** Do not include a trailing comma at the end of the object.

        **JSON Output Format:**
        {
          "productName": "string",
          "brand": "string | null",
          "ingredients": "string",
          "isFoodProduct": boolean,
          "category": "string",
          "ecologicalScore": number,
          "ecologicalJustification": "string",
          "nutritionalScore": "number | null",
          "nutritionalJustification": "string | null"
        }
        
        **CRITICAL:** If you cannot find the product or perform the analysis, you MUST return this exact JSON object and nothing else:
        {
          "productName": "Unknown Product",
          "brand": null,
          "ingredients": "",
          "isFoodProduct": false,
          "category": "Unknown",
          "ecologicalScore": 0,
          "ecologicalJustification": "The product could not be identified from the barcode using Google Search.",
          "nutritionalScore": null,
          "nutritionalJustification": null
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const candidate = response.candidates?.[0];
      const responseText = response.text;

      if (!responseText || responseText.trim() === '') {
          let errorMessage = 'The AI returned an empty response.';
          if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
              errorMessage = `Analysis was stopped unexpectedly. Reason: ${candidate.finishReason}.`;
          } else if (response.promptFeedback?.blockReason) {
              errorMessage = `Request was blocked for safety reasons. Reason: ${response.promptFeedback.blockReason}.`;
          } else {
              errorMessage = 'The product might be unidentifiable or a network error occurred.';
          }
          console.error("AI returned an empty text response. Full response:", JSON.stringify(response, null, 2));
          throw new Error(errorMessage);
      }

      let jsonStr = responseText.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }
      
      try {
        const sanitizedJsonStr = jsonStr.replace(/,(?=\s*?[\}\]])/g, '');
        
        const parsedJson = JSON.parse(sanitizedJsonStr);
        const parsedDetails: ScannedProductDetails = { ...parsedJson, recommendations: [] };

        if (parsedDetails.productName !== 'Unknown Product') {
            parsedDetails.recommendations = getRecommendations(parsedDetails, decodedText);
        }
        
        setScannedProductDetails(parsedDetails);

      } catch (parseError) {
        console.error("Failed to parse JSON from AI:", jsonStr, parseError);
        throw new Error("The AI returned data in an unexpected format. Please try scanning again.");
      }

    } catch (error: any) {
      console.error(error);
      setScannedProductDetails(null);
      setDetailError(error.message || 'An unknown error occurred while analyzing the barcode.');
    } finally {
      setIsLoadingDetails(false);
    }
  };


  const renderPage = () => {
    if (isAuthLoading) {
      return <div className="text-center p-10">Loading...</div>;
    }
    
    switch (route) {
      case '/login':
        return <LoginPage navigate={navigate} />;
      case '/register':
        return <RegisterPage navigate={navigate} />;
      case '/profile':
        return <ProfilePage navigate={navigate} onAddAddressClick={() => setAddressModalOpen(true)} />;
      case '/leaderboard':
        return <Leaderboard/>;
      case '/wishlist':
        return <WishlistPage onProductSelect={handleScanSuccess} />;
      default:
        return <HomePage onProductSelect={handleScanSuccess} />;
    }
  };
  
  const showHeaderAndFooter = route !== '/login' && route !== '/register';

  return (
    <div className="bg-white min-h-screen font-sans flex flex-col">
      {showHeaderAndFooter && <Header onCartClick={() => setCartOpen(true)} onScanClick={() => setScannerOpen(true)} onLocationClick={() => setLocationModalOpen(true)} navigate={navigate} />}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setCartOpen(false)} 
        navigate={navigate}
        onSelectAddressClick={() => setAddressSelectionModalOpen(true)}
      />
      <ScannerModal isOpen={isScannerOpen} onClose={() => setScannerOpen(false)} onScanSuccess={handleScanSuccess} />
      <LocationModal isOpen={isLocationModalOpen} onClose={() => setLocationModalOpen(false)} />
      <AddressModal isOpen={isAddressModalOpen} onClose={() => setAddressModalOpen(false)} />
      <AddressSelectionModal 
        isOpen={isAddressSelectionModalOpen} 
        onClose={() => setAddressSelectionModalOpen(false)}
        onAddNewAddress={() => {
            setAddressSelectionModalOpen(false);
            setAddressModalOpen(true);
        }}
       />
      <ProductDetailModal 
        isOpen={isDetailModalOpen} 
        onClose={closeDetailModal}
        details={scannedProductDetails}
        isLoading={isLoadingDetails}
        error={detailError}
        barcode={scannedBarcode}
      />
      <main className="flex-grow w-full">
        {renderPage()}
      </main>
      {showHeaderAndFooter && <Footer />}
    </div>
  );
};


export function App() {
   if (!IS_API_KEY_VALID) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-8">
                <div className="flex items-center text-red-600 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <h1 className="text-3xl font-bold">Configuration Error</h1>
                </div>
                <div className="text-gray-700 space-y-4">
                    <p className="text-lg">
                        The <strong className="font-semibold text-gray-900">Google Gemini API Key</strong> is not configured.
                    </p>
                    <p>
                        This application requires a valid API key to function correctly. Please follow these steps to set it up:
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h2 className="font-semibold text-lg mb-2 text-gray-800">Setup Instructions</h2>
                        <ol className="list-decimal list-inside space-y-3">
                            <li>
                                In the main project folder (the one with <code>package.json</code>), create a new file named <code>.env</code>.
                            </li>
                            <li>
                                Open the new <code>.env</code> file and add the following line. Be sure to replace <code>YOUR_ACTUAL_API_KEY</code> with your key from Google AI Studio.
                                <div className="bg-gray-200 text-gray-800 font-mono p-3 rounded-md my-2">
                                   API_KEY=YOUR_ACTUAL_API_KEY
                                </div>
                            </li>
                            <li>
                                After saving the <code>.env</code> file, you must <strong className="font-semibold">stop and restart</strong> the development server for the key to be loaded.
                            </li>
                        </ol>
                    </div>
                     <p className="text-sm text-center text-gray-500 pt-4">
                        You can get a free API key from the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Google AI Studio</a>.
                    </p>
                </div>
            </div>
        </div>
    );
  }

  return (
    <StoreProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
          <AppShell />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </StoreProvider>
  );
}