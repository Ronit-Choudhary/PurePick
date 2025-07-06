
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ScannerModal from './components/ScannerModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

import { GoogleGenAI } from '@google/genai';
import { ScannedProductDetails, Product } from './types';
import { products, categories } from './constants';

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
  const [isCartOpen, setCartOpen] = useState(false);
  const { isAuthenticated, isAuthLoading } = useAuth();
  
  // State for scanner and product detail modal
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [scannedProductDetails, setScannedProductDetails] = useState<ScannedProductDetails | null>(null);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const ai = new GoogleGenAI({ apiKey:process.env.GEMINI_API_KEY });

  useEffect(() => {
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

    // --- Start of new local-first logic ---
    const knownProduct = products.find(p => p.barcode === decodedText);

    if (knownProduct) {
      // Product found in our catalog, no AI call needed.
      const details: ScannedProductDetails = {
        productName: knownProduct.name,
        brand: knownProduct.brand,
        ingredients: knownProduct.description, // Use description as a proxy for ingredients
        isFoodProduct: knownProduct.nutritionalScore !== null,
        category: knownProduct.category,
        ecologicalScore: knownProduct.ecologicalScore,
        nutritionalScore: knownProduct.nutritionalScore,
        ecologicalJustification: `This score is based on an analysis of the product's category, ingredients, and typical manufacturing processes.`,
        nutritionalJustification: knownProduct.nutritionalScore !== null
          ? `This score reflects the product's nutritional profile, including factors like sugar, fat, and vitamin content, relative to other items in its category.`
          : null,
        recommendations: [], // This will be populated next
      };

      // Run local recommendation engine
      details.recommendations = getRecommendations(details, decodedText);
      
      // Use a brief timeout to allow the modal to animate in smoothly
      setTimeout(() => {
        setScannedProductDetails(details);
        setIsLoadingDetails(false);
      }, 300);

      return; // End execution here for known products
    }
    // --- End of new local-first logic ---


    // --- Fallback to AI for unknown barcodes ---
    try {
      const categoryNames = categories.map(c => c.name);
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
        // Sanitize the JSON string to remove trailing commas which are not valid in standard JSON.
        const sanitizedJsonStr = jsonStr.replace(/,(?=\s*?[\}\]])/g, '');
        
        // We need to add an empty recommendations array for type safety before parsing
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
        return <ProfilePage navigate={navigate} />;
      default:
        return <HomePage onProductSelect={handleScanSuccess} />;
    }
  };
  
  const showHeaderAndFooter = route !== '/login' && route !== '/register';

  return (
    <div className="bg-white min-h-screen font-sans flex flex-col">
      {showHeaderAndFooter && <Header onCartClick={() => setCartOpen(true)} onScanClick={() => setScannerOpen(true)} navigate={navigate} />}
      <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} navigate={navigate}/>
      <ScannerModal isOpen={isScannerOpen} onClose={() => setScannerOpen(false)} onScanSuccess={handleScanSuccess} />
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
  return (
    <AuthProvider>
      <CartProvider>
        <AppShell />
      </CartProvider>
    </AuthProvider>
  );
}
