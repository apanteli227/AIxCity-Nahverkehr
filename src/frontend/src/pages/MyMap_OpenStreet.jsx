import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Circle, Popup } from 'react-leaflet';
import axios from 'axios';

const MapComponent = () => {
    const [tramRoutes, setTramRoutes] = useState([]);
    const [tramStops, setTramStops] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);
    const position = [53.0826, 8.8136];
    const circleRadius = 100; // Radius des Kreises um den Mittelpunkt einer Haltestellengruppe

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
        console.log("Routes:", routes);
        setTramStops(stops);
        console.log("Stops:", stops);
    };

    const groupNearbyStops = (stops) => {
        const groupedStops = [];
        const processedIndexes = new Set();

        stops.forEach((stop, index) => {
            if (!processedIndexes.has(index)) {
                const nearbyStops = [stop];
                for (let i = index + 1; i < stops.length; i++) {
                    const distance = calculateDistance(stop.coords, stops[i].coords);
                    if (distance < circleRadius / 1000) { // Umrechnung von Metern in Kilometer
                        nearbyStops.push(stops[i]);
                        processedIndexes.add(i);
                    }
                }
                groupedStops.push(nearbyStops);
            }
        });

        console.log("Grouped Stops:", groupedStops); // Gruppierte Haltestellen in der Konsole ausgeben
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

    const groupedStops = groupNearbyStops(tramStops);

    const getGroupCenter = (group) => {
        const sumLat = group.reduce((acc, stop) => acc + stop.coords[0], 0);
        const sumLon = group.reduce((acc, stop) => acc + stop.coords[1], 0);
        const avgLat = sumLat / group.length;
        const avgLon = sumLon / group.length;
        return [avgLat, avgLon];
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
                {tramRoutes.map((route, index) => (
                    <Polyline
                        key={`route_${index}`}
                        positions={route.geometry.map(coord => [coord.lat, coord.lon])}
                        color={route.color}
                        weight={5}
                    >
                        <Popup>{route.name || "Route"}</Popup> 
                    </Polyline>
                ))}
                {groupedStops.map((group, index) => {
                    const center = getGroupCenter(group);
                    return (
                        <Circle
                            key={`stop_group_${index}`}
                            center={center}
                            radius={circleRadius}
                            pathOptions={{ color: 'grey', fillColor: 'white', fillOpacity: 0.4, opacity: 0.5 }} // Farbe des Kreises festlegen
                        >
                            <Popup>Gruppierte Haltestellen</Popup>
                        </Circle>
                    );
                })}
            </MapContainer>
        </main>
    );
};

export default MapComponent;
