import React from "react";
import { Popup } from "react-leaflet";
import "../components.css";
import csv from "../../../../assets/stops2lines.csv";
import { readString } from "react-papaparse"; // Installieren Sie zuerst react-papaparse, um CSV zu parsen

const PopupComponent = ({ nearestCsvStop, defaultText }) => {
  // Die Funktion zum Lesen und Parsen der CSV-Datei
  const fetchLinesForStop = async (stopName) => {
    try {
      const response = await fetch(csv);
      const csvData = await response.text();
      const parsedData = readString(csvData).data;

      // Finden Sie die Zeile, die der gewählten Haltestelle entspricht
      const stopData = parsedData.find((row) => row[0] === stopName);

      // Extrahieren Sie die Linieninformationen aus der gefundenen Zeile
      if (stopData) {
        return stopData[1].split(", ").map((line) => line.trim());
      }

      return [];
    } catch (error) {
      console.error("Error fetching CSV data:", error);
      return [];
    }
  };

  // Zustand für die Linieninformationen
  const [lines, setLines] = React.useState([]);

  // Effekt zum Laden der Linieninformationen, wenn sich die Haltestelle ändert
  React.useEffect(() => {
    if (nearestCsvStop) {
      fetchLinesForStop(nearestCsvStop.stop_name).then((lines) => {
        setLines(lines);
      });
    }
  }, [nearestCsvStop]);

  return (
    <Popup className="my-popup-style">
      <div className="popup-section">
        {nearestCsvStop ? nearestCsvStop.stop_name : defaultText}
      </div>
      <div className="popup-section">
        {lines.length > 0 ? (
          <p>{lines.join(", ")}</p>
        ) : (
          "No information available"
        )}
      </div>
    </Popup>
  );
};

export default PopupComponent;
