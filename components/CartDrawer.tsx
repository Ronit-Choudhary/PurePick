
import React, { useState, useMemo, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../hooks/useStore';
import { XIcon, MinusIcon, PlusIcon, SparklesIcon, LocationIcon } from './Icons';
import { CartItem, Address } from '../types';

// Tier list for rewards based on average eco score
const getRewardPercentage = (score: number): number => {
    if (score >= 90) return 0.06; // 6%
    if (score >= 80) return 0.05; // 5%
    if (score >= 60) return 0.04; // 4%
    if (score >= 50) return 0.03; // 3%
    if (score >= 40) return 0.025; // 2.5%
    if (score >= 20) return 0.02; // 2%
    return 0;
};

const CartItemCard: React.FC<{ item: CartItem }> = ({ item }) => {
  const { updateQuantity } = useCart();

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center">
        <img src={item.imageUrl} alt={item.name} className="h-14 w-14 object-contain mr-4"/>
        <div>
          <p className="text-sm font-semibold text-gray-800">{item.name}</p>
          <p className="text-xs text-gray-500">{item.weight}</p>
          <p className="text-sm font-bold text-gray-900 mt-1">₹{item.price}</p>
        </div>
      </div>
      <div className="flex items-center border border-gray-300 rounded-lg">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="p-1 text-blinkit-green"
        >
          <MinusIcon className="w-4 h-4"/>
        </button>
        <span className="px-2 text-sm">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="p-1 text-blinkit-green"
        >
          <PlusIcon className="w-4 h-4"/>
        </button>
      </div>
    </div>
  );
};

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
  onSelectAddressClick: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, navigate, onSelectAddressClick }) => {
  const { cartItems, cartTotal, cartCount, clearCart, avgEcoScore } = useCart();
  const { user, isAuthenticated, addOrder } = useAuth();
  const { selectedStore } = useStore();
  const [applyWallet, setApplyWallet] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  
  // As per the request, delivery fee is set to 0.
  const deliveryFee = 0;
  
  const selectedAddress = useMemo(() => {
    if (!user || !user.selectedAddressId) return null;
    return user.addresses.find(a => a.id === user.selectedAddressId);
  }, [user]);

  useEffect(() => {
    setCheckoutError('');
  }, [selectedAddress]);

  const maxRedeemable = useMemo(() => cartTotal * 0.08, [cartTotal]);
  const redeemableAmount = useMemo(() => Math.min(user?.walletBalance || 0, maxRedeemable), [user, maxRedeemable]);
  const redeemedAmount = applyWallet && user && user.walletBalance > 0 ? redeemableAmount : 0;
  
  const totalAmount = cartTotal + deliveryFee - redeemedAmount;
  
  const earnedRewards = useMemo(() => {
    const rewardPercentage = getRewardPercentage(avgEcoScore);
    return cartTotal * rewardPercentage;
  }, [avgEcoScore, cartTotal]);

  const handleCheckout = () => {
    if (!isAuthenticated) {
        onClose();
        navigate('/login');
        return;
    }

    if (!selectedAddress) {
        alert("Please select a delivery address before placing an order.");
        return;
    }

    // Delivery radius check
    if (selectedAddress.lat == null || selectedAddress.lng == null) {
      setCheckoutError('This address does not have location data. Please re-add it using the address form.');
      return;
    }
    const storeLat = selectedStore.latitude;
    const storeLng = selectedStore.longitude;
    const addrLat = selectedAddress.lat;
    const addrLng = selectedAddress.lng;
    const R = 3958.8; // miles
    const dLat = (addrLat - storeLat) * Math.PI / 180;
    const dLon = (addrLng - storeLng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(storeLat * Math.PI / 180) * Math.cos(addrLat * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    if (distance > 10) {
      setCheckoutError('This address is outside the 10 mile delivery radius for this store. Please select another address.');
      return;
    }
    setCheckoutError('');

    addOrder(cartItems, totalAmount, cartTotal, deliveryFee, redeemedAmount, selectedAddress);
    alert(`Order placed successfully! You've earned ₹${earnedRewards.toFixed(2)} in Eco Rewards.`);
    clearCart();
    setApplyWallet(false);
    onClose();
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-blinkit-gray-100 z-50 transform transition-transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } duration-300 ease-in-out flex flex-col`}
      >
        <header className="flex items-center justify-between p-4 border-b bg-white">
          <h2 className="text-xl font-bold text-gray-800">My Cart ({cartCount})</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <XIcon className="w-6 h-6 text-gray-600" />
          </button>
        </header>

        {cartItems.length > 0 ? (
          <div className="flex-grow overflow-y-auto">
            <div className="p-4 bg-white border-b">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Delivery Address</h3>
                {selectedAddress ? (
                    <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                            <LocationIcon className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-gray-800">{selectedAddress.nickname}</p>
                                <p className="text-sm text-gray-600">{selectedAddress.fullAddress}</p>
                                <p className="text-xs text-gray-500">{selectedAddress.details}</p>
                            </div>
                        </div>
                        <button onClick={onSelectAddressClick} className="text-sm font-semibold text-blinkit-green hover:underline flex-shrink-0">
                            Change
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-2 border-2 border-dashed rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Please select an address for delivery.</p>
                        <button onClick={onSelectAddressClick} className="px-4 py-1.5 bg-blinkit-green text-white font-semibold rounded-lg text-sm">
                            Select Address
                        </button>
                    </div>
                )}
            </div>
            
            <div className="px-4 divide-y bg-white mt-2">
                {cartItems.map((item) => (
                    <CartItemCard key={item.id} item={item} />
                ))}
            </div>
            
            {cartCount > 0 && (
                <div className="p-4 mt-2 bg-green-50 border-y border-green-200">
                    <div className="flex justify-center items-center gap-2">
                        <SparklesIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <p className="text-sm text-green-700">
                            Avg. Cart Eco Score: <span className="font-bold text-green-800">{avgEcoScore.toFixed(1)} / 100</span>
                        </p>
                    </div>
                    {earnedRewards > 0 && (
                        <p className="text-xs text-green-600 text-center mt-2">
                            You'll earn <span className="font-bold">₹{earnedRewards.toFixed(2)}</span> in Eco Rewards on this order!
                        </p>
                    )}
                </div>
            )}

            {isAuthenticated && user && user.walletBalance > 0 && (
                <div className="p-4 border-b bg-white mt-2">
                    <div className="flex justify-between items-center">
                    <label htmlFor="useWallet" className="flex items-center cursor-pointer">
                        <input 
                        type="checkbox" 
                        id="useWallet" 
                        checked={applyWallet}
                        onChange={(e) => setApplyWallet(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blinkit-green focus:ring-blinkit-green"
                        />
                        <span className="ml-3 text-sm font-semibold text-gray-700">Apply Wallet Balance</span>
                    </label>
                    <span className="text-sm font-bold text-blinkit-green">₹{user.walletBalance.toFixed(2)}</span>
                    </div>
                    {applyWallet && (
                    <p className="text-right text-xs text-green-600 mt-1">- ₹{redeemedAmount.toFixed(2)} applied</p>
                    )}
                </div>
            )}
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
            <img src="https://cdn.grofers.com/assets/ui/empty_states/emp_empty_cart.png" alt="Empty Cart" className="w-48 h-48 mb-4"/>
            <h3 className="text-lg font-semibold">You don't have any items in your cart</h3>
            <p className="text-sm text-gray-500">Your favourite items are just a click away</p>
          </div>
        )}

        <footer className="p-4 border-t bg-white">
          {checkoutError && <p className="text-red-600 text-sm mb-2">{checkoutError}</p>}
            <div className="space-y-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Bill Details</h3>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Item Total</span>
                    <span className="font-medium text-gray-800">₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium text-gray-800">₹{deliveryFee.toFixed(2)}</span>
                </div>
                {redeemedAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                    <span className="font-medium">Wallet Discount</span>
                    <span className="font-medium">- ₹{redeemedAmount.toFixed(2)}</span>
                </div>
                )}
                 <div className="border-t my-2"></div>
                <div className="flex justify-between font-bold text-base">
                    <span>To Pay</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                </div>
            </div>
            
          <button 
            onClick={handleCheckout}
            className="w-full bg-blinkit-green text-white font-bold py-3 rounded-lg flex justify-between items-center hover:bg-blinkit-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={cartItems.length === 0 || !selectedAddress}
          >
            <span>Proceed to Checkout</span>
            <span>₹{totalAmount.toFixed(2)} &rsaquo;</span>
          </button>
        </footer>
      </div>
    </>
  );
};

export default CartDrawer;
