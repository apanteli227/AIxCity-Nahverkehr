import React, { useEffect, useState } from "react";
import { TileLayer } from "react-leaflet";
import NightModeProvider, {
  useNightModeContext,
} from "../store/NightModeContext";
import SelectedProvider, { useSelectedContext } from "../store/SelectedContext";

function Heatmap() {
  const { nightMode, toggleNightMode } = useNightModeContext();
  const { isSelected, toggleSelected } = useSelectedContext();
  const [mapUrl, setMapUrl] = useState("");

  useEffect(() => {

  }, [isSelected, nightMode]);


return (
    <HeatmapProvider>
    <div className="heatmap-checkbox">
        <label>
            <input
                type="checkbox"
                checked={nightMode}
                onChange={() => {
                    console.log("Heatmap");
                }}
            />
            <span> Heatmap </span>
        </label>
    </div>
    </HeatmapProvider>
);
}

export default Heatmap;

// Nur als Beispiel
  /**
   *    https://codesandbox.io/p/sandbox/heatmap-bangalore-forked-lfjf7?file=%2Fsrc%2Fatd.js
   *    import React from "react";
import { Map as LeafletMap, TileLayer, Marker, Popup } from "react-leaflet";
import "../node_modules/leaflet/dist/leaflet.css";

import HeatmapLayer from "react-leaflet-heatmap-layer";
import { geojson } from "./atd";

class Map extends React.Component {
  constructor() {
    super();
    this.state = {
      lat: 12.9716,
      lng: 77.5946,
      zoom: 12,
      position: [12.9716, 77.5946]
    };
  }

  render() {
    return (
      <LeafletMap center={this.state.position} zoom={this.state.zoom}>
        <HeatmapLayer
          points={geojson.features}
          longitudeExtractor={(m) => m.geometry.coordinates[0]}
          latitudeExtractor={(m) => m.geometry.coordinates[1]}
          intensityExtractor={(m) => parseFloat(m.geometry.coordinates[1])}
          max={100}
          minOpacity={0.4}
        />

        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
        />
      </LeafletMap>
    );
  }
}

export default Map;
   */