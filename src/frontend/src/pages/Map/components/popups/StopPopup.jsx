import React from "react";
import { Popup } from "react-leaflet"; // Stellen Sie sicher, dass Sie die Popup-Komponente von 'react-leaflet' importieren
import "../components.css"; // Importieren Sie Ihre CSS-Datei

const PopupComponent = ({ nearestCsvStop, defaultText }) => {
  return (
    <Popup className="my-popup-style">
      <div className="popup-section">
        {nearestCsvStop ? nearestCsvStop.stop_name : defaultText}
      </div>
      <div className="popup-section">-</div>
      <div className="popup-section">-</div>
    </Popup>
  );
};

export default PopupComponent;
