import React, { createContext, useContext, useState, useMemo } from "react";

const NightModeContext = createContext();

export const useNightModeContext = () => useContext(NightModeContext);

function useNightMode() {
  const [nightMode, setNightMode] = useState(false);

  const toggleNightMode = () => {
    setNightMode(!nightMode);
  };

  return useMemo(
    () => ({
      nightMode,
      toggleNightMode,
    }),
    [nightMode]
  );
}

export default function NightModeProvider({ children }) {
  const nightModeValue = useNightMode();

  return (
    <NightModeContext.Provider value={nightModeValue}>
      {children}
    </NightModeContext.Provider>
  );
}
