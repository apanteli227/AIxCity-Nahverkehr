import axios from 'axios';
import { useState } from 'react';
import StopsCSV from '../../../../data_collection/data_cleanup/resources/stops_bremen.csv';

const LoadCsvStops = () => {
    const [csvStops, setCsvStops] = useState([]);

    const loadCsvStops = async () => {
        try {
            const response = await axios.get(StopsCSV);
            const csvData = response.data.split('\n').slice(1); // Header entfernen und Zeilen trennen
        
            // Objekt zum Speichern von eindeutigen Haltestellen basierend auf dem Namen erstellen
            const uniqueStops = {};
        
            csvData.forEach(row => {
                const [stop_id, stop_name, stop_lat, stop_lon] = row.split(',');
                const parsedStop = {
                    stop_id: parseInt(stop_id),
                    stop_name,
                    stop_lat: parseFloat(stop_lat),
                    stop_lon: parseFloat(stop_lon)
                };
            
                // Überprüfen, ob die Haltestelle bereits im eindeutigen Objekt vorhanden ist
                if (!uniqueStops[stop_name]) {
                    uniqueStops[stop_name] = parsedStop;
                } else {
                    // Wenn die Haltestelle bereits existiert, füge die Koordinaten zum vorhandenen Eintrag hinzu
                    if (!Array.isArray(uniqueStops[stop_name].coords)) {
                        uniqueStops[stop_name].coords = [];
                    }
                    uniqueStops[stop_name].coords.push([parsedStop.stop_lat, parsedStop.stop_lon]);
                }
            });
        
            // Konvertieren des eindeutigen Objekts wieder in ein Array
            const stops = Object.values(uniqueStops);
            console.log("Parsed Stops:", stops); // Ausgabe der verarbeiteten Haltestellen-Daten
        
            setCsvStops(stops);
            console.log("CSV Stops:", csvStops); // Ausgabe der zugewiesenen CSV-Haltestellen
            console.log("CSV data loaded successfully.");
        } catch (error) {
            console.error("Error loading CSV data:", error);
        }
    };

    // Rückgabe der Funktion zum Laden der CSV-Haltestellen
    return { loadCsvStops };
};

export default LoadCsvStops;
