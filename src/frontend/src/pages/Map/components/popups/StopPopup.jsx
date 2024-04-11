import React, { useState, useEffect } from "react";
import { Popup } from "react-leaflet";
import { readString } from "react-papaparse";
import { getAvgStopDelay } from "../../../../api";
import csvLines from "../../../../assets/stops2lines.csv";
import csvAvgDelay from "../../../../assets/avgStopDelay.csv";
import "../components.css";

const PopupComponent = ({ nearestCsvStop, defaultText }) => {
  const fetchLinesForStop = async (stopName) => {
    try {
      const response = await fetch(csvLines);
      const csvData = await response.text();
      const parsedData = readString(csvData).data;

      const stopData = parsedData.find((row) => row[0] === stopName);

      if (stopData) {
        return stopData[1].split(", ").map((line) => line.trim());
      }

      return [];
    } catch (error) {
      console.error("Error fetching CSV data:", error);
      return [];
    }
  };

  const fetchAvgDelayForStop = async (stopName) => {
    try {
      const response = await fetch(csvAvgDelay);
      const csvData = await response.text();
      const parsedData = readString(csvData).data;

      const avgDelayData = parsedData.find((row) => row[0] === stopName);

      if (avgDelayData) {
        // Umrechnung von Sekunden in Minuten und Sekunden
        const totalSeconds = parseFloat(avgDelayData[1]);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
      }

      return null;
    } catch (error) {
      console.error("Error fetching average delay CSV data:", error);
      return null;
    }
  };

  const [lines, setLines] = useState([]);
  const [avgStopDelay, setAvgStopDelay] = useState(null);

  useEffect(() => {
    if (nearestCsvStop) {
      fetchLinesForStop(nearestCsvStop.stop_name).then((lines) => {
        setLines(lines);
      });

      fetchAvgDelayForStop(nearestCsvStop.stop_name).then((avgDelay) => {
        setAvgStopDelay(avgDelay);
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
          <p>Linien: {lines.join(", ")}</p>
        ) : (
          "Keine Linieninformationen verfügbar"
        )}
      </div>
      <div className="popup-section">
        {avgStopDelay !== null ? (
          avgStopDelay === "0:00" ? (
            "Wird zur Zeit wohl nicht befahren."
          ) : (
            <p>Durschnittliche Abfahrtsverspätung: {avgStopDelay}</p>
          )
        ) : (
          "Durschnittliche Abfahrtsverspätung nicht verfügbar"
        )}
      </div>
    </Popup>
  );
};

export default PopupComponent;
