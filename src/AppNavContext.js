import React, { createContext, useContext, useState, useCallback } from 'react';

const AppNavContext = createContext();

export const useAppNav = () => useContext(AppNavContext);

export const AppNavProvider = ({ children }) => {
  const [isNavLocked, setNavLocked] = useState(false);
  const [errorHandler, setErrorHandler] = useState(null);

  const registerErrorHandler = useCallback((handler) => {
    setErrorHandler(() => handler);
  }, []);

  const triggerError = () => {
    if (errorHandler) {
      errorHandler();
    }
  };

  const value = {
    isNavLocked,
    setNavLocked,
    registerErrorHandler,
    triggerError,
  };

  return (
    <AppNavContext.Provider value={value}>
      {children}
    </AppNavContext.Provider>
  );
};
