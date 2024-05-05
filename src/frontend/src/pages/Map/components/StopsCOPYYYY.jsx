
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Circle } from "react-leaflet";
import StopPopup from "./popups/StopPopup";
import { useStopContext } from "../store/StopContext";
import { fetchRoutesAndStops } from "../API";
import csv from "../../../assets/stops_bremen.csv";
import { useNightModeContext } from "../store/NightModeContext";
import "./components.css";
import HeatmapProvider, { useHeatmapContext } from "../store/HeatmapContext";
import delay from "../../../assets/avgStopDelay.csv";
import { readString } from "react-papaparse";


const Stops = () => {
  const { tramStops, setTramStops } = useStopContext();
  const { nightMode } = useNightModeContext();
  const { heatmapEnabled } = useHeatmapContext();
  const [csvStops, setCsvStops] = useState([]);
  const [dayStops, setDayStops] = useState([]);
  const [nightStops, setNightStops] = useState([]);
  const circleRadius = 100;
  const [csvStop, setCsvStop] = useState([]);
  const [avgStopDelay, setAvgStopDelay] = useState(null);
  const [stopColor, setStopColor] = useState(null);
  
 // const [avgStopDelay2, setStopDelay] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchRoutesAndStops();
        const routesData = response.data.elements;
        const { dayStops, nightStops } = drawStops(routesData);
        setDayStops(dayStops);
        setNightStops(nightStops);
        //fetchAvgDelayForStop(); //HIER FEHLT DER PARAMETER
  
        const csvFetch = await axios.get(csv);
        const csvData = csvFetch.data.split("\n").slice(1);
        loadCsvStops(csvData);
        console.log(avgStopDelay, "Test");
        const color = getStopColor(avgStopDelay);
        setStopColor(color);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []); 
  const getStopColor = (delay) => {
    
    if (delay < 60) {
      return "blue";
    } else if (delay < 120) {
      return "yellow";
    } else {
      return "red";
    }
  };
    
  
  
  
  
    const fetchAvgDelayForStop = async () => {
      try {
        //const response = await fetch(delay);
        //const csvData = await response.text();
        //const parsedData = readString(csvData).data;

        //const avgDelayData = parsedData.find((row) => row[0] === csvStop.stop_name);
        const delayFetch = await axios.get(delay);
        const parsedData = readString(delayFetch.data).data;
        setAvgStopDelay(parsedData);
        console.log(parsedData);
        const avgDelayData = parsedData.find((row) => row[0] === csvStop.stop_name);
        return avgDelayData;
      } catch (error) {
        console.error("Error fetching average delay CSV data:", error);
        return null;
      }
    };
  
    const getColor = () => {
      if (avgStopDelay) {
        if (avgStopDelay < 60) {
          setStopColor("green");
        }
        if (avgStopDelay < 120) {
          setStopColor("yellow");
        }
        setStopColor("red");
    }
  };
  useEffect(() => {
    

      fetchAvgDelayForStop(csvStop.stop_name).then((avgDelay) => {
        setAvgStopDelay(avgDelay);
      });
      getColor();

    
  }, [csvStop]);

    
    


  
  const drawStops = (tramRoutesData) => {
    const dayStops = [];
    const nightStops = [];

    tramRoutesData.forEach((element) => {
      if (
        element.type === "relation" &&
        element.tags?.type === "route" &&
        ["tram", "bus"].includes(element.tags.route)
      ) {
        element.members.forEach((member) => {
          if (member.type === "node" && member.role === "stop") {
            const isNightStop =
              element.tags.by_night === "yes" ||
              element.tags.by_night === "only";
            const stop = { id: element.id, coords: [member.lat, member.lon] };
            if (isNightStop) {
              nightStops.push(stop);
            } else {
              dayStops.push(stop);
            }
          }
        });
      }
    });

    return { dayStops, nightStops };
  };

  const loadCsvStops = (csvData) => {
    const uniqueStops = {};

    csvData.forEach((row) => {
      const [stop_id, stop_name, stop_lat, stop_lon] = row.split(",");
      const parsedStop = {
        stop_id: parseInt(stop_id),
        stop_name,
        stop_lat: parseFloat(stop_lat),
        stop_lon: parseFloat(stop_lon),
      };

      // Überprüfen, ob die Haltestelle bereits im eindeutigen Objekt vorhanden ist
      if (!uniqueStops[stop_name]) {
        uniqueStops[stop_name] = parsedStop;
      } else {
        // Wenn die Haltestelle bereits existiert, füge die Koordinaten zum vorhandenen Eintrag hinzu
        uniqueStops[stop_name].coords.push([
          parsedStop.stop_lat,
          parsedStop.stop_lon,
        ]);
      }
    });
    // Konvertieren des eindeutigen Objekts wieder in ein Array
    const stops = Object.values(uniqueStops);

    setCsvStops(stops);
  };


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
          if (distance < circleRadius / 1000) {
            // Umrechnung von Metern in Kilometer
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
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const findNearestStop = (apiStopCoords, csvStops) => {
    let nearestStop = null;
    let minDistance = Infinity;

    csvStops.forEach((csvStop) => {
      const distance = calculateDistance(apiStopCoords, [
        csvStop.stop_lat,
        csvStop.stop_lon,
      ]);
      if (distance < minDistance) {
        minDistance = distance;
        nearestStop = csvStop;
      }
    });
    return nearestStop;
  };

  const groupedDayStops = groupNearbyStops(dayStops);
  const groupedNightStops = groupNearbyStops(nightStops);
  const mappedStopsNight = groupedNightStops.map((group, index) => {
    const center = getGroupCenter(group);
            const nearestCsvStop = findNearestStop(center, csvStops);
            setCsvStop(nearestCsvStop);
            <Circle
                key={`night_stop_group_${index}`}
                center={center}
                radius={circleRadius / 3}//Hier noch irgendwie die Haltestelle übergeben
                pathOptions={{
                  color: "black",
                  fillColor: "white",
                  fillOpacity: 0.4,
                  opacity: 0.5,
                }}
              >
                {/* Verwenden Sie die PopupComponent hier */}
                <StopPopup
                  nearestCsvStop={nearestCsvStop}
                  defaultText="Unknown Night Stop"
                />
              </Circle>
  }
);
const mappedStopsDay = groupedDayStops.map((group, index) => {
  const center = getGroupCenter(group);
          const nearestCsvStop = findNearestStop(center, csvStops);
          setCsvStop(nearestCsvStop);
          <Circle
              key={`day_stop_group_${index}`}
              center={center}
              radius={circleRadius / 3}//Hier noch irgendwie die Haltestelle übergeben
              pathOptions={{
                color: "black",
                fillColor: "white",
                fillOpacity: 0.4,
                opacity: 0.5,
              }}
            >
              {/* Verwenden Sie die PopupComponent hier */}
              <StopPopup
                nearestCsvStop={nearestCsvStop}
                defaultText="Unknown Day Stop"
              />
            </Circle>
}
);

  return (
    <>
      <div>
        {nightMode && mappedStopsNight}
        {!nightMode && mappedStopsDay}
        </div>
      </>
  )
}
export default Stops;
