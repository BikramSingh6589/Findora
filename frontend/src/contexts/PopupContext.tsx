import React, { createContext, useContext, useState } from 'react';
import { StitchPopups } from '../components/StitchPopups';

export type PopupType = 'success' | 'failure' | 'login_success' | null;

interface PopupOptions {
  title: string;
  message: string;
  onClose?: () => void;
}

interface PopupContextType {
  showSuccess: (title: string, message: string, onClose?: () => void) => void;
  showFailure: (title: string, message: string, onClose?: () => void) => void;
  showLoginSuccess: (userName: string, onClose?: () => void) => void;
  closePopup: () => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const PopupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [popupType, setPopupType] = useState<PopupType>(null);
  const [options, setOptions] = useState<PopupOptions>({ title: '', message: '' });

  const showSuccess = (title: string, message: string, onClose?: () => void) => {
    setPopupType('success');
    setOptions({ title, message, onClose });
  };

  const showFailure = (title: string, message: string, onClose?: () => void) => {
    setPopupType('failure');
    setOptions({ title, message, onClose });
  };

  const showLoginSuccess = (userName: string, onClose?: () => void) => {
    setPopupType('login_success');
    setOptions({ 
      title: `Welcome Back, ${userName}! 👋`, 
      message: "You've successfully signed in. Ready to help the campus today?", 
      onClose 
    });
  };

  const closePopup = () => {
    if (options.onClose) {
      options.onClose();
    }
    setPopupType(null);
  };

  return (
    <PopupContext.Provider value={{ showSuccess, showFailure, showLoginSuccess, closePopup }}>
      {children}
      {popupType && (
        <StitchPopups 
          type={popupType}
          title={options.title}
          message={options.message}
          onClose={closePopup}
        />
      )}
    </PopupContext.Provider>
  );
};

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};
