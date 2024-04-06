import React, { createContext, useContext, useState, useMemo } from "react";

const HeatmapContext = createContext();

export const useHeatmapContext = () => useContext(HeatmapContext);

function useHeatmap() {
  const [heatMode, setHeatMode] = useState(false);

  const toggleHeatMode = () => {
    setHeatMode(!heatMode);
  };

  return useMemo(
    () => ({
      heatMode,
      toggleHeatMode,
    }),
    [heatMode]
  );
}

export default function HeatmapProvider({ children }) {
  const heatmapValue = useHeatmap();

  return (
    <HeatmapContext.Provider value={heatmapValue}>
      {children}
    </HeatmapContext.Provider>
  );
}