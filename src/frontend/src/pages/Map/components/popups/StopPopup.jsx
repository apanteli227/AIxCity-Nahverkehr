import React from "react";
import { Popup } from "react-leaflet";
import "../components.css";
import csv from "../../../../assets/stops2lines.csv";
import { readString } from "react-papaparse"; // Installieren Sie zuerst react-papaparse, um CSV zu parsen
import { getAvgStopDelay } from "../../../../api"; // Importiere die Funktion getAvgStopDelay

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
  // Zustand für die durchschnittliche Verspätung
  const [avgStopDelay, setAvgStopDelay] = React.useState(null);

  // Effekt zum Laden der Linieninformationen und der durchschnittlichen Verspätung, wenn sich die Haltestelle ändert
  React.useEffect(() => {
    if (nearestCsvStop) {
      // Linieninformationen laden
      fetchLinesForStop(nearestCsvStop.stop_name).then((lines) => {
        setLines(lines);
      });

      async function fetchAvgDelay() {
        try {
          const data = await getAvgStopDelay();
          console.log(data);
          const avgDelay = data.find(
            (data) => data[0] === nearestCsvStop.stop_name
          );
          if (avgDelay) {
            setAvgStopDelay(avgDelay[1]);
          } else {
            setAvgStopDelay(null);
          }
        } catch (error) {
          console.error("Error fetching average Delay:", error);
        }
      }
      fetchAvgDelay();
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
      <div className="popup-section">
        {avgStopDelay !== null ? (
          <p>Average delay: {avgStopDelay}</p>
        ) : (
          "Average delay not available"
        )}
      </div>
    </Popup>
  );
};

export default PopupComponent;
