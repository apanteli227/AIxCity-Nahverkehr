import React, { createContext, useContext, useState, useMemo } from "react";

const HeatmapContext = createContext();

export const useHeatmapContext = () => useContext(HeatmapContext);

function useHeatmap() {
    const [heatmapEnabled, setHeatmapEnabled] = useState(false);

    const toggleHeatmap = () => {
        setHeatmapEnabled(!heatmapEnabled);
      };

  return useMemo(
    () => ({
        heatmapEnabled,
        toggleHeatmap,
    }),
    [heatmapEnabled]
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