// ModalContext.tsx
import { createContext, useContext, useState } from 'react';

const ModalContext = createContext({
  showNewItemModal: false,
  setShowNewItemModal: (show: boolean) => {}
});

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  
  return (
    <ModalContext.Provider value={{ showNewItemModal, setShowNewItemModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);