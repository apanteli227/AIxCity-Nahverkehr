import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import axios from 'axios';

const MapComponent = () => {
    const [tramRoutes, setTramRoutes] = useState([]);
    const [tramStops, setTramStops] = useState([]);
    const [selectedRouteId, setSelectedRouteId] = useState(null);
    const [dataFetched, setDataFetched] = useState(false); // Zustand für Verfolgung, ob Daten bereits abgerufen wurden
    const position = [53.0826, 8.8136];
    
    const customIcon = L.divIcon({
        className: 'custom-icon-stop',
        html: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10"/>
              </svg>`,
        iconSize: [15, 15],
        iconAnchor: [12, 12]
      });

      useEffect(() => {
        if (!dataFetched && tramRoutes.length === 0) {
            fetchTramRoutes();
        }
    }, [dataFetched, tramRoutes]);

    const fetchTramRoutes = async () => {
        try {
            setDataFetched(true);
            const response = await axios.get(
                "https://overpass-api.de/api/interpreter?data=[out:json][timeout:50];(relation[network=VBN][type=route][route=tram];relation[operator=BSAG][type=route][route=bus];);out geom;"
            );
            console.log('Raw Overpass API response:', response.data); // Log raw response
            const tramRoutesData = response.data.elements;
            drawTramRoutesAndStops(tramRoutesData);
             // Setze dataFetched auf true, um anzuzeigen, dass die Daten abgerufen wurden
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
                const color = tags.colour || "blue";
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
        console.log('Tram Routes:', routes);
        setTramStops(stops);
        console.log('Tram Stops:', stops);
    };
    const handleRouteClick = (id) => {
        
        console.log(`Route selected: ${id}`); // Zum Debuggen
        setSelectedRouteId(id); // Aktualisiere den Zustand mit der ausgewählten Route
        
    };

    return (
        <main className="map-container">
            <MapContainer center={position} zoom={12}>
                
                    <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
                    attribution="&copy; OpenStreetMap contributors"
                    maxZoom={18}
                    minZoom={12}
                    
                />

                {tramStops.map((stop, index) => (
                    <Marker key={`stop_${index}`} position={stop.coords} icon={customIcon}>
                    <Popup>{stop.id || "Tramstation"}</Popup>
                  </Marker>
                ))}
                {tramRoutes.map((route, index) => (
                    <Polyline
                        key={`route_${index}`}
                        positions={route.geometry}
                        color={route.color}
                        weight={5}
                        onClick={() => 
                            handleRouteClick(route.id)
                        } // Füge einen Klick-Handler hinzu
                    >
                        <Popup>{route.name || "Route"}</Popup> 
                    </Polyline>
                ))}
            </MapContainer>
        </main>
    );
};

export default MapComponent;
