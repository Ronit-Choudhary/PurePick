
import React from 'react';

const Footer: React.FC = () => {
    const usefulLinks = ['About', 'Careers', 'Blog', 'Press', 'Lead', 'Value'];
    const categories = ['Fresh Food & Produce', 'Dairy & Eggs', 'Snacks', 'Beverages', 'Pantry & Groceries', 'Household Essentials'];

    const LinkColumn: React.FC<{title: string, links: string[]}> = ({ title, links }) => (
        <div>
            <h3 className="font-semibold text-gray-800 mb-4">{title}</h3>
            <ul className="space-y-3">
                {links.map(link => (
                    <li key={link}>
                        <a href="#" className="text-gray-500 hover:text-blinkit-green text-sm">{link}</a>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <footer className="bg-blinkit-gray-100 border-t">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                    <div className="col-span-2 md:col-span-4 lg:col-span-2">
                        <h3 className="font-semibold text-gray-800 mb-4">Categories</h3>
                         <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                            {categories.map(cat => (
                                <a key={cat} href="#" className="text-gray-500 hover:text-blinkit-green text-sm">{cat}</a>
                            ))}
                        </div>
                    </div>

                    <div className="hidden lg:block"><LinkColumn title="Useful Links" links={usefulLinks} /></div>
                    <div className="hidden lg:block"><LinkColumn title="Useful Links" links={usefulLinks} /></div>
                    
                    <div className="col-span-2 md:col-span-2 lg:col-span-2 flex flex-col items-start">
                        <h3 className="font-semibold text-gray-800 mb-4">Download App</h3>
                        <div className="flex space-x-2 mb-6">
                            <a href="#"><img src="https://blinkit.com/d6d5501a0a28556069dc.png" alt="Play Store" className="h-12"/></a>
                            <a href="#"><img src="https://blinkit.com/95bf069d76d659379840.png" alt="App Store" className="h-12"/></a>
                        </div>
                        <div className="flex space-x-4">
                            {/* Social media icons can go here */}
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t pt-8 text-sm text-gray-500">
                    <p className="mb-2">© Blink Commerce Private Limited (formerly known as Grofers India Private Limited), 2016-2024</p>
                    <p>“Blinkit” is owned & managed by "Blink Commerce Private Limited" and is not related, linked or interconnected in whatsoever manner or nature, to “GROFFR.COM” which is a real estate services business operated by “Redstone Consultancy Services Private Limited”.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
