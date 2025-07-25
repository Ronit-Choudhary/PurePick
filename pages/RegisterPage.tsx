import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface RegisterPageProps {
    navigate: (path: string) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ navigate }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await register(name, email, password);
            // Redirection is now handled by App.tsx, so we don't
            // update state here to avoid a race condition on unmount.
        } catch (err: any) {
            setError(err.message || 'Failed to register.');
            setIsLoading(false); // Only set loading to false on error
        }
    };
    
    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
      e.preventDefault();
      navigate(path);
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-purepick-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <div className="text-center">
                     <a href="/" onClick={(e) => handleNavClick(e, '/')} className="inline-flex items-end gap-1 text-3xl font-bold text-gray-800">
                        <svg width="32" height="36" viewBox="0 0 96 108" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M48 0L95.225 26.5V79.5L48 106L0.775017 79.5V26.5L48 0Z" fill="#0C831F"/>
                            <path d="M48 10L83.825 31V75L48 96L12.175 75V31L48 10Z" fill="white"/>
                            <path d="M68 53C68 64.0457 59.0457 73 48 73C36.9543 73 28 64.0457 28 53C28 41.9543 36.9543 33 48 33C59.0457 33 68 41.9543 68 53Z" fill="#FFC83D"/>
                            <path d="M48 43V63" stroke="#0C831F" strokeWidth="4" strokeLinecap="round"/>
                            <path d="M58 53L38 53" stroke="#0C831F" strokeWidth="4" strokeLinecap="round"/>
                        </svg>
                        <span>PurePick</span>
                    </a>
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">Create an account</h2>
                </div>
                <form className="space-y-6" onSubmit={handleRegister}>
                    <div>
                        <label htmlFor="name" className="text-sm font-medium text-gray-700">Full name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purepick-green focus:border-purepick-green"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purepick-green focus:border-purepick-green"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purepick-green focus:border-purepick-green"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purepick-green hover:bg-purepick-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purepick-green disabled:opacity-50"
                        >
                            {isLoading ? 'Creating account...' : 'Create account'}
                        </button>
                    </div>
                </form>
                 <p className="text-sm text-center text-gray-600">
                    Already have an account?{' '}
                    <a href="/login" onClick={(e) => handleNavClick(e, '/login')} className="font-medium text-purepick-green hover:underline">
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;