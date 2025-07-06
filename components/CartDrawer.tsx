
import React from 'react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { XIcon, MinusIcon, PlusIcon } from './Icons';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
}

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


const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, navigate }) => {
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();
  const { isAuthenticated, addOrder } = useAuth();
  
  const deliveryFee = cartTotal > 0 ? 15 : 0;
  const totalAmount = cartTotal + deliveryFee;

  const handleCheckout = () => {
    if (!isAuthenticated) {
        onClose();
        navigate('/login');
        return;
    }

    addOrder(cartItems, totalAmount);
    clearCart();
    alert('Order placed successfully!');
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
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 transform transition-transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } duration-300 ease-in-out flex flex-col`}
      >
        <header className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">My Cart ({cartCount})</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <XIcon className="w-6 h-6 text-gray-600" />
          </button>
        </header>

        {cartItems.length > 0 ? (
          <div className="flex-grow overflow-y-auto px-4 divide-y">
            {cartItems.map((item) => (
              <CartItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
            <img src="https://cdn.grofers.com/assets/ui/empty_states/emp_empty_cart.png" alt="Empty Cart" className="w-48 h-48 mb-4"/>
            <h3 className="text-lg font-semibold">You don't have any items in your cart</h3>
            <p className="text-sm text-gray-500">Your favourite items are just a click away</p>
          </div>
        )}

        <footer className="p-4 border-t bg-white">
          <button 
            onClick={handleCheckout}
            className="w-full bg-blinkit-green text-white font-bold py-3 rounded-lg flex justify-between items-center hover:bg-blinkit-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={cartItems.length === 0}
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
