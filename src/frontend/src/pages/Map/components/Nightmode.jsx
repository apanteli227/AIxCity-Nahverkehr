import React, { useEffect, useState } from "react";
import { TileLayer } from "react-leaflet";
import NightModeProvider, {
  useNightModeContext,
} from "../store/NightModeContext";
import SelectedProvider, { useSelectedContext } from "../store/SelectedContext";

function Nightmode() {
  const { nightMode, toggleNightMode } = useNightModeContext();
  const { isSelected, toggleSelected } = useSelectedContext();
  const [mapUrl, setMapUrl] = useState("");

  useEffect(() => {
    changeMap();
  }, [isSelected, nightMode]);

  const changeMap = () => {
    const mapToRender = isSelected
      ? nightMode
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
      : nightMode
      ? "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
      : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";

    setMapUrl(mapToRender);
  };

  return (
    <SelectedProvider>
      <NightModeProvider>
        <TileLayer
          url={mapUrl}
          attribution="&copy; OpenStreetMap contributors"
          maxZoom={18}
          minZoom={12}
        />
        <div>
          <label>
            <input
              type="checkbox"
              checked={nightMode}
              onChange={() => {
                toggleNightMode();
                toggleSelected();
              }}
            />
            <span> Nachtmodus </span>
          </label>
        </div>
      </NightModeProvider>
    </SelectedProvider>
  );
}

export default Nightmode;
