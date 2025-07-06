
import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { useCart } from '../hooks/useCart';
import { XIcon, LocationIcon } from './Icons';
import { Store } from '../types';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { stores, selectedStore, selectStore, findNearestStore } = useStore();
  const { cartCount, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [pendingStoreSwitch, setPendingStoreSwitch] = useState<Store | null>(null);

  // When the modal is closed, reset internal state
  const handleClose = () => {
    setIsLoading(false);
    setMessage('');
    setPendingStoreSwitch(null);
    onClose();
  };

  const handleManualStoreSelect = (storeId: string) => {
    setMessage('');
    const targetStore = stores.find(s => s.id === storeId);
    if (!targetStore || selectedStore.id === targetStore.id) {
      handleClose();
      return;
    }

    if (cartCount > 0) {
      setPendingStoreSwitch(targetStore);
    } else {
      selectStore(targetStore.id);
      handleClose();
    }
  };
  
  const handleDetectLocation = () => {
    setIsLoading(true);
    setMessage('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLoading(false);
        const { latitude, longitude } = position.coords;
        const { store: nearestStore, distance } = findNearestStore(latitude, longitude);

        if (!nearestStore) {
          setMessage('Could not find any of our stores. Please select one manually.');
          return;
        }

        if (distance > 10) {
          setMessage(`Your location is outside our delivery range (${distance.toFixed(1)} miles away). Please select a store manually.`);
          return;
        }

        if (selectedStore.id === nearestStore.id) {
          setMessage(`You are already at the nearest store: ${nearestStore.name}.`);
          setTimeout(handleClose, 2500);
          return;
        }
        
        // A new, closer store is found.
        if (cartCount > 0) {
          setPendingStoreSwitch(nearestStore);
        } else {
          selectStore(nearestStore.id);
          setMessage(`Switched to nearest store: ${nearestStore.name}.`);
          setTimeout(handleClose, 2500);
        }
      },
      (error: GeolocationPositionError) => {
        setIsLoading(false);
        let errorMessage = "An unknown geolocation error occurred.";
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = "Location permission denied. Please enable it in your browser settings or select a store manually.";
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = "Location information is currently unavailable. Please check your connection or phone's location services.";
            break;
          case 3: // TIMEOUT
            errorMessage = "The request to get your location timed out. Please check your connection and try again.";
            break;
        }
        console.error("Geolocation error:", `Code: ${error.code}, Message: ${error.message}`);
        setMessage(errorMessage);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const confirmSwitch = () => {
    if (!pendingStoreSwitch) return;
    clearCart();
    selectStore(pendingStoreSwitch.id);
    handleClose();
  };

  const cancelSwitch = () => {
    setPendingStoreSwitch(null);
  };

  if (!isOpen) return null;

  const renderConfirmationView = () => {
    if (!pendingStoreSwitch) return null;
    return (
        <div className="p-6">
            <h3 className="text-lg font-bold text-center text-gray-800">Confirm Store Change</h3>
            <p className="text-center text-gray-600 my-4">
                You have items in your cart for the "{selectedStore.name}" store. Switching to <span className="font-semibold">"{pendingStoreSwitch.name}"</span> will clear your cart.
            </p>
            <p className="text-center text-gray-600 mb-6">
                Are you sure you want to continue?
            </p>
            <div className="flex justify-center gap-4">
                <button
                    onClick={cancelSwitch}
                    className="px-6 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                    Cancel
                </button>
                 <button
                    onClick={confirmSwitch}
                    className="px-6 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                    Yes, Clear Cart & Switch
                </button>
            </div>
        </div>
    );
  };

  const renderSelectionView = () => (
    <div className="p-6">
        <p className="text-gray-600 mb-6 text-center">Select your preferred store or let us find the one nearest to you for the fastest delivery.</p>
        
        <button
            onClick={handleDetectLocation}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-6 font-bold text-white bg-blinkit-green rounded-lg hover:bg-blinkit-green-dark transition-colors disabled:opacity-70"
        >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Detecting...</span>
              </>
            ) : (
              <>
                <LocationIcon className="w-5 h-5" />
                <span>Use My Current Location</span>
              </>
            )}
        </button>
        
        {message && <p className="text-center text-sm font-semibold mb-4 min-h-[20px]">{message}</p>}

        <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
                <span className="bg-white px-2 text-sm text-gray-500">OR</span>
            </div>
        </div>

        <h3 className="font-semibold text-gray-700 text-center mb-4">Select a store manually</h3>

        <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2">
            {stores.map(store => (
              <button
                key={store.id}
                onClick={() => handleManualStoreSelect(store.id)}
                className={`w-full text-left p-4 border rounded-lg transition-all ${selectedStore.id === store.id ? 'border-blinkit-green ring-2 ring-blinkit-green bg-blinkit-green-light' : 'border-gray-200 hover:border-gray-400'}`}
              >
                <p className="font-bold text-gray-800">{store.name}</p>
                <p className="text-sm text-gray-500">{store.address}</p>
              </button>
            ))}
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">{pendingStoreSwitch ? 'Confirm Change' : 'Choose Your Location'}</h2>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-100">
            <XIcon className="w-6 h-6 text-gray-600" />
          </button>
        </header>

        {pendingStoreSwitch ? renderConfirmationView() : renderSelectionView()}
      </div>
    </div>
  );
};

export default LocationModal;
