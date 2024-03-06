import React, { createContext, useContext, useState } from "react";

const DropdownContext = createContext();

export const useDropdownContext = () => useContext(DropdownContext);

function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return {
    isOpen,
    toggleDropdown,
  };
}

export default function DropdownProvider({ children }) {
  const contextValue = useDropdown();

  return (
    <DropdownContext.Provider value={contextValue}>
      {children}
    </DropdownContext.Provider>
  );
}
