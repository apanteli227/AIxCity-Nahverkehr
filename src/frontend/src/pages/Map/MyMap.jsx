import { MapContainer } from "react-leaflet";
import Nightmode from "./components/Nightmode";
import NightModeProvider from "./store/NightModeContext";
import RouteProvider from "./store/RouteContext";
import Routes from "./components/Routes";
import StopProvider from "./store/StopContext";
import Stops from "./components/Stops";
import CustomizedSelects from "./components/Dropdown";

const MapComponent = () => {
  const position = [53.0826, 8.8136];

  return (
    <main className="map-container">
      <NightModeProvider>
        <MapContainer center={position} zoom={12}>
          <ul className="navigation-bar-map">
            <li>
              <Nightmode />
            </li>
            <CustomizedSelects />
          </ul>

          <RouteProvider>
            <Routes />
          </RouteProvider>

          <StopProvider>
            <Stops />
          </StopProvider>
        </MapContainer>
      </NightModeProvider>
    </main>
  );
};

export default MapComponent;
