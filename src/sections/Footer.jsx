import React from 'react';

const Footer = () => {
    return (
        <footer className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white border-t border-gray-800">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">BizzySite</h3>
                        <p className="text-gray-400">Empowering small businesses to succeed online with simple, powerful tools.</p>
                    </div>
                    <div></div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Contact</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>Email: your-store@bizzysite.shop</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
                    <p>© {new Date().getFullYear()} BizzySite. Made with ❤️ for small businesses.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;