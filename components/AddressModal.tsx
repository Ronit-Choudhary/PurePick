
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../hooks/useStore';
import { XIcon } from './Icons';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_API_KEY;

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose }) => {
  const { addAddress } = useAuth();
  const { selectedStore } = useStore();
  const [nickname, setNickname] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isDeliverable, setIsDeliverable] = useState(true);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedLatLng, setSelectedLatLng] = useState<{lat: number, lng: number} | null>(null);

  // Fetch address suggestions from Mapbox
  const fetchSuggestions = async (query: string) => {
    if (!query) return setSuggestions([]);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&country=IN&limit=5`;
    const res = await fetch(url);
    const data = await res.json();
    setSuggestions(data.features || []);
  };

  // When user types address, fetch suggestions
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullAddress(e.target.value);
    setSelectedLatLng(null);
    setIsDeliverable(true);
    fetchSuggestions(e.target.value);
  };

  // When user selects a suggestion, set address and lat/lng
  const handleSuggestionClick = (feature: any) => {
    setFullAddress(feature.place_name);
    setSuggestions([]);
    setSelectedLatLng({ lat: feature.center[1], lng: feature.center[0] });
    // Check delivery radius
    const storeLat = selectedStore.latitude;
    const storeLng = selectedStore.longitude;
    const addrLat = feature.center[1];
    const addrLng = feature.center[0];
    const R = 3958.8; // miles
    const dLat = (addrLat - storeLat) * Math.PI / 180;
    const dLon = (addrLng - storeLng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(storeLat * Math.PI / 180) * Math.cos(addrLat * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    if (distance > 10) {
      setIsDeliverable(false);
      setError('Sorry, this address is outside our 10 mile delivery radius for this store.');
    } else {
      setIsDeliverable(true);
      setError('');
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !fullAddress.trim()) {
      setError('Nickname and Full Address are required.');
      return;
    }
    if (!isDeliverable) {
      setError('This address is not within the delivery area.');
      return;
    }
    setError('');
    addAddress({ nickname, fullAddress, details, lat: selectedLatLng?.lat, lng: selectedLatLng?.lng });
    onClose();
    setNickname('');
    setFullAddress('');
    setDetails('');
    setSelectedLatLng(null);
    setIsDeliverable(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Add a New Address</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <XIcon className="w-6 h-6 text-gray-600" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">Nickname (e.g., Home, Work)</label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blinkit-green focus:border-blinkit-green"
              placeholder="Home"
            />
          </div>
           <div>
            <label htmlFor="fullAddress" className="block text-sm font-medium text-gray-700">Full Address</label>
            <input
              id="fullAddress"
              type="text"
              value={fullAddress}
              onChange={handleAddressChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blinkit-green focus:border-blinkit-green"
              placeholder="123 Main St, Anytown, State, 12345"
              autoComplete="off"
            />
            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <ul className="bg-white border border-gray-200 rounded-md shadow absolute z-50 w-full mt-1 max-h-56 overflow-y-auto">
                {suggestions.map((s) => (
                  <li key={s.id} className="px-4 py-2 hover:bg-blinkit-green-light cursor-pointer" onClick={() => handleSuggestionClick(s)}>
                    {s.place_name}
                  </li>
                ))}
              </ul>
            )}
            {!isDeliverable && (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
          </div>
           <div>
            <label htmlFor="details" className="block text-sm font-medium text-gray-700">More Details (Flat No., Landmark...)</label>
            <input
              id="details"
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blinkit-green focus:border-blinkit-green"
              placeholder="Apt 4B, Near City Park"
            />
          </div>
          
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-blinkit-green text-white font-semibold rounded-lg hover:bg-blinkit-green-dark transition-colors"
            >
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;
