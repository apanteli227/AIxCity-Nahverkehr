import React from "react";
import { Popup } from "react-leaflet"; // Stellen Sie sicher, dass Sie die Popup-Komponente von 'react-leaflet' importieren
import "../components.css"; // Importieren Sie Ihre CSS-Datei

const PopupComponent = ({ routeName, position }) => {
  return (
    <Popup className="my-popup-style-route" position={position}>
      <div className="popup-section">{routeName}</div>
      <div className="popup-section">-</div>
      <div className="popup-section">-</div>
    </Popup>
  );
};

export default PopupComponent;
