import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Papa from "papaparse";
import stopsBremenCSV from "../../../data_collection/data_cleanup/resources/stops_bremen.csv";

const MyMap = () => {
  const [gtfsData, setGtfsData] = useState([]);
  const position = [53.0826, 8.8136];

  useEffect(() => {
    const getGtfsData = async () => {
      const response = await fetch(stopsBremenCSV);
      const reader = response.body.getReader();
      const result = await reader.read(); // raw array
      const decoder = new TextDecoder("utf-8");
      const csv = decoder.decode(result.value);

      Papa.parse(csv, {
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          const gtfsDataArray = result.data.map((row) => {
            const latitude = parseFloat(row["stop_lat"]);
            const longitude = parseFloat(row["stop_lon"]);
            const station = row["stop_name"];
            const stopId = parseInt(row["stop_id"]);

            if (!isNaN(latitude) && !isNaN(longitude)) {
              return {
                stop_latitude: latitude,
                stop_longitude: longitude,
                stop_station: station,
                stop_id: stopId,
              };
            } else {
              console.error(
                "Fehler beim Parsen der Koordinaten für Haltestelle:",
                row
              );
              return null;
            }
          });

          // Setzen Sie die verarbeiteten Daten in den Zustand der Komponente
          setGtfsData(gtfsDataArray);
        },
        error: (error) => {
          console.error("Fehler beim Parsen der CSV-Daten:", error);
        },
      });
    };

    getGtfsData();
  }, []);

  return (
    <main className="map-container">
      <MapContainer center={position} zoom={13}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position}>
          <Popup>Ein Popup für den Marker</Popup>
        </Marker>

        {gtfsData.map((stop, index) => (
          <Marker
            key={index}
            position={[stop.stop_latitude, stop.stop_longitude]}
          >
            <Popup>{stop.stop_station}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </main>
  );
};

export default MyMap;
