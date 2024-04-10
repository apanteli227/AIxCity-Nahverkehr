import React, { useState, useEffect } from "react";
import { Popup } from "react-leaflet";
import { getAvgLineDelay } from "../../../../api";
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

        const delay = await getAvgLineDelay();
        const avgDelay = delay.find((data) => data[0] === routeName);

        if (avgDelay) {
          setAvgLineDelay(avgDelay[1]);
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
          <p>Avg. Delay: {avgLineDelay} minutes</p>
        ) : (
          <p>Average delay not available</p>
        )}
      </div>
    </Popup>
  );
};

export default LinePopupComponent;
