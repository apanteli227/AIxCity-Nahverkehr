import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Circle, Popup } from 'react-leaflet';
import axios from 'axios';
import StopsCSV from '../../../../data_collection/data_cleanup/resources/stops_bremen.csv';

const MapComponent = () => {
    const [tramRoutes, setTramRoutes] = useState([]);
    const [tramStops, setTramStops] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);
    const [csvStops, setCsvStops] = useState([]);
    const [routeColors, setRouteColors] = useState({});
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [nightMode, setNightMode] = useState(false); // Zustandsvariable für Tag-/Nachtmodus
    const position = [53.0826, 8.8136];
    const circleRadius = 100;

    const getGroupCenter = (group) => {
        const sumLat = group.reduce((acc, stop) => acc + stop.coords[0], 0);
        const sumLon = group.reduce((acc, stop) => acc + stop.coords[1], 0);
        const avgLat = sumLat / group.length;
        const avgLon = sumLon / group.length;
        return [avgLat, avgLon];
    };
    
    const groupNearbyStops = (stops) => {
        const groupedStops = [];
        const processedIndexes = new Set(); // Haltestellen-Indizes, die bereits verarbeitet wurden
    
        stops.forEach((stop, index) => {
            if (!processedIndexes.has(index)) {
                let foundGroup = false;
    
                for (const group of groupedStops) {
                    const groupCenter = getGroupCenter(group);
    
                    // Überprüfen, ob die Haltestelle nahe genug an der Gruppenmitte liegt
                    const distance = calculateDistance(stop.coords, groupCenter);
                    if (distance < circleRadius / 1000) { // Umrechnung von Metern in Kilometer
                        group.push(stop);
                        foundGroup = true;
                        break;
                    }
                }
    
                // Wenn die Haltestelle keiner Gruppe zugeordnet ist, eine neue Gruppe erstellen
                if (!foundGroup) {
                    groupedStops.push([stop]);
                }
    
                // Markiere den aktuellen Index als verarbeitet
                processedIndexes.add(index);
            }
        });
    
        return groupedStops;
    };

    const calculateDistance = (coord1, coord2) => {
        const [lat1, lon1] = coord1;
        const [lat2, lon2] = coord2;
        const R = 6371; // Radius der Erde in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    };

    // Funktion zum Umschalten zwischen Tag- und Nachtmodus
    

    useEffect(() => {
        if (!dataFetched && tramRoutes.length === 0) {
            fetchTramRoutes();
            loadCsvStops(); // CSV-Haltestellen laden
            console.log("CSV Stops:", csvStops);
        }
    }, [dataFetched, tramRoutes, csvStops]);

    const fetchTramRoutes = async () => {
        try {
            setDataFetched(true);
            const response = await axios.get(
                "https://overpass-api.de/api/interpreter?data=[out:json][timeout:50];(relation[network=VBN][type=route][route=tram];relation[operator=BSAG][type=route][route=bus];);out geom;"
            );
            const tramRoutesData = response.data.elements;
            drawTramRoutesAndStops(tramRoutesData);
        } catch (error) {
            console.error(error);
        }
    };

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

    const drawTramRoutesAndStops = (tramRoutesData) => {
        const routes = [];
        const stops = [];
        const colors = {}; // Objekt zum Speichern der Farben für jede Route

        tramRoutesData.forEach(element => {
            if (element.type === "relation") {
                const tags = element.tags || {};
                const color = tags.colour || "blue";
                colors[element.id] = color; // Farbe der Route speichern
                if (tags.type === "route" && (tags.route === "tram" || tags.route === "bus")) {
                    element.members.forEach(member => {
                        if (member.type === "way" && member.role === "") {
                            const routeGeometry = member.geometry || [];
                            routes.push({ id: element.id, geometry: routeGeometry, color: color, name: tags.name });
                        }
                        else if (member.type === "node") {
                            if (member.role === "stop") {
                                stops.push({ id: element.id, coords: [member.lat, member.lon] });
                            }
                        }
                    });                   
                }                
            } 
        });

        setTramRoutes(routes);
        setTramStops(stops);
        setRouteColors(colors); // Setzen der Farben für jede Route
    };

    const findNearestStop = (apiStopCoords) => {
        let nearestStop = null;
        let minDistance = Infinity;
    
        csvStops.forEach(csvStop => {
            const distance = calculateDistance(apiStopCoords, [csvStop.stop_lat, csvStop.stop_lon]);
            if (distance < minDistance) {
                minDistance = distance;
                nearestStop = csvStop;
            }
        });
        return nearestStop;
    };

    // Funktion zum Auswählen einer Route
    const selectRoute = (routeId) => {
        setSelectedRoute(routeId);
    };

    const groupedStops = groupNearbyStops(tramStops);
    console.log("Grouped Stops:", groupedStops); // Ausgabe der gruppierten Haltestellen

    return (
        <main className="map-container">
            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={nightMode}
                        onChange={toggleNightMode}
                    />
                    Nachtmodus
                </label>
            </div>
            <MapContainer center={position} zoom={12}>
                <TileLayer
                    url={nightMode ? "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}" : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"}
                    attribution="&copy; OpenStreetMap contributors"
                    maxZoom={18}
                    minZoom={12}
                />
                {tramRoutes.map((route, index) => (
                    <Polyline
                        key={`route_${index}`}
                        positions={route.geometry.map(coord => [coord.lat, coord.lon])}
                        color={selectedRoute === route.id ? route.color : (routeColors[route.id] || 'gray')} // Farbe je nach Auswahl der Route oder vordefinierter Farbe setzen
                        weight={5}
                        onClick={() => selectRoute(route.id)} // Klick-Handler zum Auswählen der Route hinzufügen
                    >
                        <Popup>{route.name || "Route"}</Popup> 
                    </Polyline>
                ))}
                {groupedStops.map((group, index) => {
                    const center = getGroupCenter(group);
                    const nearestStop = findNearestStop(center); // Die nächstgelegene Haltestelle für die Gruppe finden
                    return (
                        <Circle
                            key={`stop_group_${index}`}
                            center={center}
                            radius={circleRadius / 3}
                            pathOptions={{ color: 'black', fillColor: 'white', fillOpacity: 0.4, opacity: 0.5 }} // Farbe des Kreises festlegen
                        >
                            <Popup>{nearestStop ? nearestStop.stop_name : "Unknown Stop"}</Popup> 
                        </Circle>
                    );
                })}
            </MapContainer>
        </main>
    );
};

export default MapComponent;
