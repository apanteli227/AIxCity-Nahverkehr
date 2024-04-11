import React from "react";
import { Popup } from "react-leaflet";
import "../components.css";
import csvLines from "../../../../assets/stops2lines.csv";
import csvAvgDelay from "../../../../assets/avgStopDelay.csv";
import { readString } from "react-papaparse"; 
import { getAvgStopDelay } from "../../../../api";

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
        return avgDelayData[1];
      }

      return null;
    } catch (error) {
      console.error("Error fetching average delay CSV data:", error);
      return null;
    }
  };

  const [lines, setLines] = React.useState([]);
  const [avgStopDelay, setAvgStopDelay] = React.useState(null);

  React.useEffect(() => {
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
          <p>{lines.join(", ")}</p>
        ) : (
          "Keine Linieninformationen verfügbar"
        )}
      </div>
      <div className="popup-section">
        {avgStopDelay !== null ? (
          <p>Durschnittliche Abfahrtsverspätung in Sekunden: {avgStopDelay}</p>
        ) : (
          "Durschnittliche Abfahrtsverspätung nicht verfügbar"
        )}
      </div>
    </Popup>
  );
};

export default PopupComponent;
