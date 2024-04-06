import { MapContainer } from "react-leaflet";
import Nightmode from "./components/Nightmode";
import NightModeProvider from "./store/NightModeContext";
import RouteProvider from "./store/RouteContext";
import Routes from "./components/Routes";
import StopProvider from "./store/StopContext";
import Stops from "./components/Stops";
import CustomizedSelects from "./components/Dropdown";
import SelectedProvider from "./store/SelectedContext";
import Heatmap from "./components/Heatmap";
import HeatmapProvider from "./store/HeatmapContext";

const MapComponent = () => {
  const position = [53.0826, 8.8136];

  return (
    <main className="map-container">
      <NightModeProvider>
        <SelectedProvider>
          <MapContainer center={position} zoom={12}>
            <RouteProvider>
              <HeatmapProvider>
                <Routes />

                <StopProvider>
                  <Stops />
                </StopProvider>

                <ul className="navigation-bar-map">
                  <li>
                    <Nightmode />
                  </li>
                  <CustomizedSelects />
                </ul>
                <Heatmap />
              </HeatmapProvider>
            </RouteProvider>
          </MapContainer>
        </SelectedProvider>
      </NightModeProvider>
    </main>
  );
};

export default MapComponent;
