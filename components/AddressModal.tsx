
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { XIcon } from './Icons';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose }) => {
  const { addAddress } = useAuth();
  const [nickname, setNickname] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !fullAddress.trim()) {
      setError('Nickname and Full Address are required.');
      return;
    }
    setError('');
    addAddress({ nickname, fullAddress, details });
    onClose();
    // Reset form for next time
    setNickname('');
    setFullAddress('');
    setDetails('');
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
              onChange={(e) => setFullAddress(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blinkit-green focus:border-blinkit-green"
              placeholder="123 Main St, Anytown, State, 12345"
            />
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
