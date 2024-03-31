import React, { createContext, useContext, useState, useMemo } from "react";

const SelectedContext = createContext();

export const useSelectedContext = () => useContext(SelectedContext);

function useSelected() {
  const [isSelected, setIsSelected] = useState(false);

  const toggleSelected = () => {
    setIsSelected(!isSelected);
  };

  return useMemo(
    () => ({
      isSelected,
      toggleSelected,
    }),
    [isSelected]
  );
}

export default function SelectedProvider({ children }) {
  const selectedValue = useSelected();

  return (
    <SelectedContext.Provider value={selectedValue}>
      {children}
    </SelectedContext.Provider>
  );
}
