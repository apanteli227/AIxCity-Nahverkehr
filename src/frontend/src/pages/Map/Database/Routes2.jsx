import React, { useEffect, useState } from "react";
import { Polyline, Popup } from "react-leaflet";
import axios from "axios";

function Routes() {
  const [routes, setRoutes] = useState([]);
  const isNight = // Hier Logik zum Bestimmen, ob es Nacht ist (z.B. basierend auf der Uhrzeit oder Nutzerauswahl)

  useEffect(() => {
    const fetchData = async () => {
      const fileToLoad = isNight ? 'night_routes_and_stops.json' : 'day_routes_and_stops.json';
      const response = await axios.get(`/data/${fileToLoad}`);
      if (response.status) {
        setRoutes(response.data.elements); // oder angepasst an die Struktur deiner Daten
      }
    };

    fetchData();
  }, [isNight]); // Dependency Array sorgt dafür, dass fetchData ausgeführt wird, wenn sich isNight ändert

  // Render-Logik bleibt gleich, nutzt nun `routes` aus dem State
}

export default Routes;
