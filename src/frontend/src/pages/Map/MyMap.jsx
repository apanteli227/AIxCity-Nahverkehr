import { MapContainer } from "react-leaflet";
import Nightmode from "./components/Nightmode";
import NightModeProvider from "./store/NightModeContext";
import RouteProvider from "./store/RouteContext";
import Routes from "./components/Routes";
import StopProvider from "./store/StopContext";
import Stops from "./components/Stops";
import CustomizedSelects from "./components/Dropdown";
import SelectedProvider from "./store/SelectedContext";
import HeatmapProvider from "./store/HeatmapContext";
import Heatmap from "./components/Heatmap";

const MapComponent = () => {
  const position = [53.0826, 8.8136];

  return (
    <main className="map-container">
      <NightModeProvider>
        <HeatmapProvider>
          <SelectedProvider>
            <MapContainer center={position} zoom={12}>
              <RouteProvider>
                <Routes />

                <StopProvider>
                  <Stops />
                </StopProvider>

                <div className="navigation-bar-map-searchbar">
                  <CustomizedSelects />
                </div>
                <ul className="navigation-bar-map-buttons">
                  <li>
                    <Nightmode />
                  </li>
                </ul>
              </RouteProvider>
            </MapContainer>
          </SelectedProvider>
        </HeatmapProvider>
      </NightModeProvider>
    </main>
  );
};

export default MapComponent;
