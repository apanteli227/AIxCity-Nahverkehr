import React, { useEffect, useState } from "react";
import { TileLayer } from "react-leaflet";
import HeatmapProvider, { useHeatmapContext } from "../store/HeatmapContext";


export default function Heatmap() {
  const { heatmapEnabled, toggleHeatmap } = useHeatmapContext();


return (
    <HeatmapProvider>
    
    <div className="heatmap-checkbox">
        <label>
            <input
                type="checkbox"
                checked={heatmapEnabled}
                onChange={() => {
                    toggleHeatmap();
                    console.log(heatmapEnabled);
                }}
            />
            <span> Heatmap </span>
        </label>
    </div>
    </HeatmapProvider>
);
}

//export default Heatmap;