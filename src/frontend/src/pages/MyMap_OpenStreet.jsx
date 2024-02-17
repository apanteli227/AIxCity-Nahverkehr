import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import axios from 'axios';

const MapComponent = () => {
    const [tramRoutes, setTramRoutes] = useState([]);
    const [tramStops, setTramStops] = useState([]);
    const position = [53.0826, 8.8136]; // Setze die Startposition der Karte

    useEffect(() => {
        fetchTramRoutes();
    }, []);

    const fetchTramRoutes = async () => {
        try {
            const response = await axios.get(
                "https://overpass-api.de/api/interpreter?data=[out:json][timeout:50];(relation[network=VBN][type=route][route=tram];relation[operator=BSAG][type=route][route=bus];);out geom;"
            );
            console.log('Raw Overpass API response:', response.data); // Log raw response
            const tramRoutesData = response.data.elements;
            drawTramRoutesAndStops(tramRoutesData);
        } catch (error) {
            console.error(error);
        }
    };

    const drawTramRoutesAndStops = (tramRoutesData) => {
        const routes = [];
        const stops = [];

        tramRoutesData.forEach(element => {
            if (element.type === "relation") {
                const tags = element.tags || {};
                const color = tags.colour || "blue"; // Verwende standardmäßig Blau, falls keine Farbe gefunden wird
                if (tags.type === "route" && (tags.route === "tram" || tags.route === "bus")) {
                    element.members.forEach(member => {
                        if (member.type === "way" && member.role === "") {
                            const routeGeometry = member.geometry || [];
                            // Extrahiere die Farbe aus den Tags und füge sie als Eigenschaft zur Route hinzu                          
                            routes.push({ id: element.id, geometry: routeGeometry, color: color , name: tags.name});
                        }
                        else if (member.type === "node") {
                            const stop = tramRoutesData.find(e => e.type === "node" && e.id === member.ref);
                            if (member.role === "stop") {
                                stops.push({ id: element.id, coords: [member.lat, member.lon] });
                            }
                        }
                    });                   
                }                
            } 
        });

        setTramRoutes(routes);
        console.log('Tram Routes:', routes);
        setTramStops(stops);
        console.log('Tram Stops:', stops);
    };

    return (
        <main className="map-container">
            <MapContainer center={position} zoom={12}>
                {/* Füge eine schlichte OpenStreetMap-Kachel-Schicht hinzu */}
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Füge eine Overlay-TileLayer nur für Straßen hinzu */}
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                    maxZoom={18}
                    minZoom={12}
                    opacity={0.5} // Stelle die Opazität nach Bedarf ein
                />

                {tramStops.map((stop, index) => (
                    <Marker key={`stop_${index}`} position={stop.coords}>
                        <Popup>{stop.id || "Tramstation"}</Popup>
                    </Marker>
                ))}
                {tramRoutes.map((route, index) => (
                    <Polyline
                        key={`route_${index}`}
                        positions={route.geometry}
                        color={route.color || "blue"} // Verwende standardmäßig Blau, falls keine Farbe gefunden wird
                    >
                        <Popup>{route.name || "Route"}</Popup>
                    </Polyline>
                ))}
            </MapContainer>
        </main>
    );
};

export default MapComponent;