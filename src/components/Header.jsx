import React from 'react';

const Header = ({ onLoginClick, onSignUpClick }) => {
  return (
    <header className="fixed w-full bg-gray-900/80 backdrop-blur-md shadow-sm z-30 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16 sm:h-20">
        <div>
          <img src="/bizzysitelogo.svg" alt="BizzySite Logo" className="h-12 sm:h-14 w-auto"/>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={onLoginClick} className="px-4 py-2 text-gray-300 font-medium hover:text-indigo-400 transition-colors">Login</button>
          <button onClick={onSignUpClick} className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-md hover:opacity-90 transition-all shadow-md">Sign Up</button>
        </div>
      </div>
    </header>
  );
};

export default Header;