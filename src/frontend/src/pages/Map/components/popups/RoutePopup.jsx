import React, { useState, useEffect } from "react";
import { Popup } from "react-leaflet";
import { getAvgLineDelay } from "../../../../api";
import { readString } from "react-papaparse";
import csvAvgDelay from "../../../../assets/avgLineDelay.csv";
import "../components.css";

const LinePopupComponent = ({ routeName, position }) => {
  const [avgLineDelay, setAvgLineDelay] = useState(null);

  useEffect(() => {
    const fetchAvgDelay = async () => {
      try {
        if (!routeName) {
          setAvgLineDelay(null);
          return;
        }

        const response = await fetch(csvAvgDelay);
        const csvData = await response.text();
        const parsedData = readString(csvData).data;

        // Extrahiere den Linienname aus der Route
        const lineName = routeName.match(/[N\d]+/)[0]; // Extrahiere alle Zahlen und das "N" aus der Route

        const avgDelay = parsedData.find((data) => data[0] === lineName);

        if (avgDelay) {
          // Umrechnung von Sekunden in Minuten und Sekunden
          const totalSeconds = parseFloat(avgDelay[1]);
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = Math.floor(totalSeconds % 60);
          const formattedDelay = `${minutes}:${
            seconds < 10 ? "0" : ""
          }${seconds}`;
          setAvgLineDelay(formattedDelay);
        } else {
          setAvgLineDelay(null);
        }
      } catch (error) {
        console.error("Error fetching average line delay:", error);
      }
    };

    fetchAvgDelay();
  }, [routeName]);

  return (
    <Popup className="my-popup-style-route" position={position}>
      <div className="popup-section">{routeName}</div>
      <div className="popup-section">
        {avgLineDelay !== null ? (
          <p>Durchschnittliche Abfahrtsverspätung: {avgLineDelay}</p>
        ) : (
          <p>Durchschnittliche Abfahrtsverspätung nicht verfügbar.</p>
        )}
      </div>
    </Popup>
  );
};

export default LinePopupComponent;
