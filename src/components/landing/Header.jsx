const Header = ({ onLoginClick, onSignUpClick }) => {
    return (
      <header className="fixed top-6 left-1/2 -translate-x-1/2 max-w-lg w-full z-30 px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900/40 backdrop-blur-xl rounded-full border border-gray-700/50 shadow-2xl">
          <div className="flex justify-between items-center h-14 px-6">
            <div>
              <img src="/bizzysitelogo.svg" alt="BizzySite Logo" className="h-8 w-auto"/>
            </div>
            <div className="flex gap-2 items-center">
              <button onClick={onLoginClick} className="px-3 py-1.5 text-sm text-gray-300 font-medium hover:text-indigo-400 transition-colors rounded-full">Login</button>
              <button onClick={onSignUpClick} className="px-4 py-1.5 text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-full hover:opacity-90 transition-all shadow-md">Sign Up</button>
            </div>
          </div>
        </div>
      </header>
    );
  };
  
  export default Header;