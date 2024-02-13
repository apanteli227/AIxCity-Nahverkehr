import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

const MyMap = () => {
  const [busStops, setBusStops] = useState([]);
  const [tramStations, setTramStations] = useState([]);
  const [tramRoutes, setTramRoutes] = useState([]);
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
        console.log('Raw Overpass API response Tram Stations:', response.data); // Log raw response
      } catch (error) {
        console.error("Fehler beim Laden der Tramstationen:", error);
      }
    };

    const fetchTramRoutes = async () => {
      try {
        const response = await axios.get(
          "https://overpass-api.de/api/interpreter?data=[out:json];way[route=bus](53.07,8.76,53.10,8.87);out;"
        );
        console.log('Raw Overpass API response:', response.data); // Log raw response
        const geoJSON = osmToGeoJSON(response.data.elements);
        console.log('Converted GeoJSON:', geoJSON); // Log converted GeoJSON
        setTramRoutes(geoJSON.features);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTramRoutes();
    loadBusStops();
    loadTramStations();
  }, []);

  const osmToGeoJSON = (elements) => {
    // Initialize an empty GeoJSON FeatureCollection
    const geoJSON = {
      type: 'FeatureCollection',
      features: [],
    };

    // A lookup to find nodes by id
    const nodesById = {};

    // First pass to get all nodes and store them by id
    elements.forEach((el) => {
      if (el.type === 'node') {
        nodesById[el.id] = el;
      }
    });

    // Second pass to get all ways and construct linestring features
    elements.forEach((el) => {
      if (el.type === 'way') {
        const coordinates = el.nodes.map((nodeId) => {
          const node = nodesById[nodeId];
          return [node.lon, node.lat];
        });

        // Only add the feature if it has coordinates
        if (coordinates.length) {
          geoJSON.features.push({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates,
            },
            properties: el.tags,
          });
        }
      }
    });

    return geoJSON;
  };

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

        {/* Draw tram routes */}
        {tramRoutes.map((route, idx) => (
          <Polyline
            key={route.properties.id}
            positions={route.geometry.coordinates}
            color="pink" // Use a distinctive color for tram routes
          />
        ))}
      </MapContainer>
    </main>
  );
};

export default MyMap;
