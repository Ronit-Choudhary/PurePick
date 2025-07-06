
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Order, Address } from '../types';
import { WalletIcon, LocationIcon } from '../components/Icons'; 

interface ProfilePageProps {
  navigate: (path: string) => void;
  onAddAddressClick: () => void;
}

type ProfileSection = 'profile' | 'orders' | 'addresses' | 'wallet';

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
    return (
        <div className="border rounded-lg p-4 mb-4">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <p className="font-bold text-gray-800">Order #{order.id.slice(-6)}</p>
                    <p className="text-sm text-gray-500">
                        {new Date(order.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                     <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <LocationIcon className="w-3 h-3"/> {order.storeName}
                    </p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg text-gray-800">₹{order.totalAmount.toFixed(2)}</p>
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">Completed</span>
                </div>
            </div>
            <div className="border-t pt-3 space-y-3">
                 <h4 className="font-semibold text-sm">Delivered To: <span className="font-normal">{order.deliveryAddress.fullAddress}</span></h4>
                 <h4 className="font-semibold text-sm mb-2">Items ({order.items.length})</h4>
                 <div className="space-y-2">
                    {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.name} (x{item.quantity})</span>
                            <span className="text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                 </div>
                 {(order.rewardPointsEarned > 0 || order.rewardPointsRedeemed > 0) && (
                    <div className="mt-3 pt-2 border-t border-dashed text-xs space-y-1">
                      {order.rewardPointsEarned > 0 && <p className="flex justify-between text-green-600"><span>Rewards Earned:</span> <span>+₹{order.rewardPointsEarned.toFixed(2)}</span></p>}
                      {order.rewardPointsRedeemed > 0 && <p className="flex justify-between text-red-600"><span>Rewards Redeemed:</span> <span>-₹{order.rewardPointsRedeemed.toFixed(2)}</span></p>}
                    </div>
                )}
            </div>
        </div>
    )
}

const AddressCard: React.FC<{address: Address, isSelected: boolean, onSelect: () => void, onRemove: () => void}> = 
({ address, isSelected, onSelect, onRemove }) => {
    return (
        <div className={`border rounded-lg p-4 relative ${isSelected ? 'border-blinkit-green ring-2 ring-blinkit-green' : 'border-gray-200'}`}>
            <div className="flex gap-3">
                <LocationIcon className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                <div>
                    <p className="font-bold text-gray-800">{address.nickname}</p>
                    <p className="text-sm text-gray-600">{address.fullAddress}</p>
                    <p className="text-xs text-gray-500">{address.details}</p>
                    <div className="mt-3 flex gap-2">
                        <button 
                            onClick={onSelect} 
                            disabled={isSelected}
                            className="text-sm font-semibold text-white bg-blinkit-green px-3 py-1 rounded-md disabled:bg-green-200 disabled:text-green-500 disabled:cursor-not-allowed hover:bg-blinkit-green-dark transition-colors"
                        >
                            {isSelected ? 'Selected' : 'Select'}
                        </button>
                        <button 
                            onClick={onRemove} 
                            className="text-sm font-semibold text-red-600 hover:bg-red-50 px-3 py-1 rounded-md transition-colors"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const ProfilePage: React.FC<ProfilePageProps> = ({ navigate, onAddAddressClick }) => {
  const { user, logout, orders, removeAddress, selectAddress } = useAuth();
  const [activeSection, setActiveSection] = useState<ProfileSection>('profile');

  const handleLogout = () => {
    logout();
    // Navigation is now handled by the effect in App.tsx
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">My Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-lg text-gray-800">{user?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg text-gray-800">{user?.email}</p>
              </div>
               <button 
                  onClick={handleLogout}
                  className="mt-6 w-full sm:w-auto px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
               >
                  Logout
               </button>
            </div>
          </div>
        );
      case 'orders':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">My Orders</h2>
            {orders.length > 0 ? (
                <div>
                    {orders.map(order => <OrderCard key={order.id} order={order} />)}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">You have no past orders.</p>
                    <p className="text-sm text-gray-400">Let's change that!</p>
                </div>
            )}
          </div>
        );
      case 'addresses':
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">My Addresses</h2>
              <button onClick={onAddAddressClick} className="px-4 py-2 bg-blinkit-green text-white font-semibold rounded-lg hover:bg-blinkit-green-dark transition-colors text-sm">
                Add New Address
              </button>
            </div>
            {user && user.addresses.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {user.addresses.map(address => (
                        <AddressCard 
                            key={address.id} 
                            address={address} 
                            isSelected={user.selectedAddressId === address.id}
                            onSelect={() => selectAddress(address.id)}
                            onRemove={() => removeAddress(address.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">You have no saved addresses.</p>
                    <p className="text-sm text-gray-400">Add an address to see it here.</p>
                </div>
            )}
          </div>
        );
       case 'wallet':
        const rewardTiers = [
            { score: "90-100", reward: "6%" },
            { score: "80-89", reward: "5%" },
            { score: "60-79", reward: "4%" },
            { score: "50-59", reward: "3%" },
            { score: "40-49", reward: "2.5%" },
            { score: "20-39", reward: "2%" },
        ];
        const transactions = orders.flatMap(order => [
            order.rewardPointsEarned > 0 ? { type: 'credit', amount: order.rewardPointsEarned, date: order.date, id: `credit-${order.id}` } : null,
            order.rewardPointsRedeemed > 0 ? { type: 'debit', amount: order.rewardPointsRedeemed, date: order.date, id: `debit-${order.id}` } : null
        ]).filter((tx): tx is { type: 'credit' | 'debit'; amount: number; date: string; id: string; } => tx !== null)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return (
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">My Wallet</h2>
                <div className="bg-gradient-to-br from-blinkit-green to-green-700 text-white p-6 rounded-xl shadow-lg mb-8 flex justify-between items-center">
                    <div>
                        <p className="text-sm opacity-80 uppercase tracking-wider">Eco Rewards Balance</p>
                        <p className="text-4xl font-bold mt-1">₹{user?.walletBalance.toFixed(2)}</p>
                    </div>
                    <WalletIcon className="w-16 h-16 opacity-20" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">How Rewards Work</h3>
                        <p className="text-sm text-gray-600 mb-4">Earn rewards on every purchase based on your cart's average Ecological Score. The higher the score, the more you save! You can redeem up to 8% of your next order's value using your wallet balance.</p>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2 font-semibold">Avg. Eco Score</th>
                                    <th className="p-2 font-semibold">Reward Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rewardTiers.map(tier => (
                                    <tr key={tier.score} className="border-b">
                                        <td className="p-2">{tier.score}</td>
                                        <td className="p-2 font-bold text-blinkit-green">{tier.reward}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">Transaction History</h3>
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                            {transactions.length > 0 ? (
                                transactions.map(tx => (
                                    <div key={tx.id} className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-md">
                                        <div>
                                            <p className={`font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                                {tx.type === 'credit' ? 'Rewards Earned' : 'Rewards Redeemed'}
                                            </p>
                                            <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                                        </div>
                                        <p className={`font-bold text-base ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-8">No wallet transactions yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
      default:
        return null;
    }
  };

  const SectionButton: React.FC<{ section: ProfileSection, label: string }> = ({ section, label }) => (
    <button
      onClick={() => setActiveSection(section)}
      className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors duration-200 ${
        activeSection === section 
          ? 'bg-blinkit-green-light text-blinkit-green' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Account</h1>
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            <aside className="w-full md:w-1/4 lg:w-1/5">
                <nav className="space-y-2">
                    <SectionButton section="profile" label="My Profile" />
                    <SectionButton section="orders" label="My Orders" />
                    <SectionButton section="wallet" label="My Wallet" />
                    <SectionButton section="addresses" label="My Addresses" />
                </nav>
            </aside>
            <section className="flex-1 bg-white p-6 rounded-lg border border-gray-200 min-h-[30rem]">
                {renderSection()}
            </section>
        </div>
    </div>
  );
};

export default ProfilePage;
