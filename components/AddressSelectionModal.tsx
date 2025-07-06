
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { XIcon, LocationIcon } from './Icons';
import { Address } from '../types';

interface AddressSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNewAddress: () => void;
}

const AddressSelectionModal: React.FC<AddressSelectionModalProps> = ({ isOpen, onClose, onAddNewAddress }) => {
  const { user, selectAddress } = useAuth();
  
  const handleSelect = (addressId: string) => {
    selectAddress(addressId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Select Delivery Address</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <XIcon className="w-6 h-6 text-gray-600" />
          </button>
        </header>

        <div className="p-6">
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
            {user && user.addresses.length > 0 ? (
                user.addresses.map(address => (
                    <button
                        key={address.id}
                        onClick={() => handleSelect(address.id)}
                        className={`w-full text-left p-4 border rounded-lg transition-all flex gap-3 items-start ${user.selectedAddressId === address.id ? 'border-blinkit-green ring-2 ring-blinkit-green bg-blinkit-green-light' : 'border-gray-200 hover:border-gray-400'}`}
                    >
                         <LocationIcon className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-bold text-gray-800">{address.nickname}</p>
                            <p className="text-sm text-gray-600">{address.fullAddress}</p>
                            <p className="text-xs text-gray-500">{address.details}</p>
                        </div>
                    </button>
                ))
            ) : (
                <p className="text-center text-gray-500 py-8">You have no saved addresses.</p>
            )}
          </div>

          <div className="mt-6 border-t pt-4">
             <button
              onClick={onAddNewAddress}
              className="w-full px-4 py-3 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-center"
            >
              + Add a New Address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressSelectionModal;
