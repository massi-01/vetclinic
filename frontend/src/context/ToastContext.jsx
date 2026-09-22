import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title = null, message = '', duration = 4000 }) => {
    const id = `toast-${Date.now()}-${++toastCounter}`;
    const newToast = { id, type, title, message, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const success = useCallback((message, title = 'Operazione riuscita', duration = 4000) => {
    if (typeof title === 'number') {
      return addToast({ type: 'success', message, title: 'Operazione riuscita', duration: title });
    }
    return addToast({ type: 'success', message, title, duration });
  }, [addToast]);

  const error = useCallback((message, title = 'Si è verificato un errore', duration = 6000) => {
    if (typeof title === 'number') {
      return addToast({ type: 'error', message, title: 'Si è verificato un errore', duration: title });
    }
    return addToast({ type: 'error', message, title, duration });
  }, [addToast]);

  const warning = useCallback((message, title = 'Attenzione', duration = 5000) => {
    if (typeof title === 'number') {
      return addToast({ type: 'warning', message, title: 'Attenzione', duration: title });
    }
    return addToast({ type: 'warning', message, title, duration });
  }, [addToast]);

  const info = useCallback((message, title = 'Informazione', duration = 4000) => {
    if (typeof title === 'number') {
      return addToast({ type: 'info', message, title: 'Informazione', duration: title });
    }
    return addToast({ type: 'info', message, title, duration });
  }, [addToast]);

  const toast = {
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve essere utilizzato all\'interno di un ToastProvider');
  }
  return context.toast;
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext deve essere utilizzato all\'interno di un ToastProvider');
  }
  return context;
};
