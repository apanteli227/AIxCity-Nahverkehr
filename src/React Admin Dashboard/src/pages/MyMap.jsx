import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MyMap = () => {
  const position = [53.0826, 8.8136]; // Setze die Startposition der Karte

  return (
    <MapContainer
      center={position}
      zoom={12}
      style={{ height: "100%", width: "300%" }}
    >
      {/* Füge eine OpenStreetMap-Kachel-Schicht hinzu */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Füge einen Marker hinzu */}
      <Marker position={position}>
        <Popup>Ein einfacher Marker auf der OpenStreetMap-Karte.</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MyMap;
