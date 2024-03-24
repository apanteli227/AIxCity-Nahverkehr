import React from "react";
import { TileLayer } from "react-leaflet";
import NightModeProvider, {
  useNightModeContext,
} from "../store/NightModeContext";

function Nightmode() {
  const { nightMode, toggleNightMode } = useNightModeContext();

  return (
    <NightModeProvider>
      <TileLayer
        url={
          nightMode
            ? "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
        }
        attribution="&copy; OpenStreetMap contributors"
        maxZoom={18}
        minZoom={12}
      />
      <div>
        <label>
          <input
            type="checkbox"
            checked={nightMode}
            onChange={toggleNightMode}
          />
          <span> Nachtmodus </span>
        </label>
      </div>
    </NightModeProvider>
  );
}

export default Nightmode;
