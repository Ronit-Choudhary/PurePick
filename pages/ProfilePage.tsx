
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Order } from '../types';

interface ProfilePageProps {
  navigate: (path: string) => void;
}

type ProfileSection = 'profile' | 'orders' | 'addresses';

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
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg text-gray-800">₹{order.totalAmount.toFixed(2)}</p>
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">Completed</span>
                </div>
            </div>
            <div className="border-t pt-3">
                 <h4 className="font-semibold text-sm mb-2">Items ({order.items.length})</h4>
                 <div className="space-y-2">
                    {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.name} (x{item.quantity})</span>
                            <span className="text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    )
}

const ProfilePage: React.FC<ProfilePageProps> = ({ navigate }) => {
  const { user, logout, orders } = useAuth();
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4">My Addresses</h2>
            <div className="text-center py-16 bg-gray-50 rounded-lg">
                <p className="text-gray-500">You have no saved addresses.</p>
                 <button className="mt-4 px-4 py-2 bg-blinkit-green text-white font-semibold rounded-lg hover:bg-blinkit-green-dark transition-colors">
                    Add Address
                </button>
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
      className={`w-full text-left px-4 py-3 rounded-lg font-semibold ${
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
        <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-1/4 lg:w-1/5">
                <nav className="space-y-2">
                    <SectionButton section="profile" label="My Profile" />
                    <SectionButton section="orders" label="My Orders" />
                    <SectionButton section="addresses" label="My Addresses" />
                </nav>
            </aside>
            <section className="flex-1 bg-white p-6 rounded-lg border border-gray-200">
                {renderSection()}
            </section>
        </div>
    </div>
  );
};

export default ProfilePage;
