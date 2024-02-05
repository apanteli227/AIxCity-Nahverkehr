import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

const MyMap = () => {
  const [busStops, setBusStops] = useState([]);
  const [tramStations, setTramStations] = useState([]);
  const position = [53.0826, 8.8136]; // Setze die Startposition der Karte

  useEffect(() => {
    // Funktion zum Laden der Bushaltestellen
    const loadBusStops = async () => {
      try {
        const response = await axios.get(
          "https://overpass-api.de/api/interpreter?data=[out:json];node[highway=bus_stop](53.07,8.76,53.10,8.87);out;"
        );
        setBusStops(response.data.elements);
      } catch (error) {
        console.error("Fehler beim Laden der Bushaltestellen:", error);
      }
    };

    // Funktion zum Laden der Tramstationen
    const loadTramStations = async () => {
      try {
        const response = await axios.get(
          "https://overpass-api.de/api/interpreter?data=[out:json];node[railway=tram_stop](53.07,8.76,53.10,8.87);out;"
        );
        setTramStations(response.data.elements);
      } catch (error) {
        console.error("Fehler beim Laden der Tramstationen:", error);
      }
    };

    // Lade die Bushaltestellen und Tramstationen beim Mounten der Komponente
    loadBusStops();
    loadTramStations();
  }, []); // Leerer Abhängigkeits-Array, um sicherzustellen, dass es nur einmal geladen wird

  return (
    <main className="map-container">
      <MapContainer center={position} zoom={12}>
        {/* Füge eine schlichte OpenStreetMap-Kachel-Schicht hinzu */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Füge eine Overlay-TileLayer nur für Straßen hinzu */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
          maxZoom={18}
          minZoom={12}
          opacity={0.5} // Stelle die Opazität nach Bedarf ein
        />

        {/* Füge Marker für Bushaltestellen hinzu */}
        {busStops.map((busStop) => (
          <Marker key={busStop.id} position={[busStop.lat, busStop.lon]}>
            <Popup>{busStop.tags.name || "Bushaltestelle"}</Popup>
          </Marker>
        ))}

        {/* Füge Marker für Tramstationen hinzu */}
        {tramStations.map((tramStation) => (
          <Marker
            key={tramStation.id}
            position={[tramStation.lat, tramStation.lon]}
          >
            <Popup>{tramStation.tags.name || "Tramstation"}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </main>
  );
};

export default MyMap;
