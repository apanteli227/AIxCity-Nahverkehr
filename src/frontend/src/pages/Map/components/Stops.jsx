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
  const [avgStopDelay, setAvgStopDelay] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchRoutesAndStops();
        const routesData = response.data.elements;
        const { dayStops, nightStops } = drawStops(routesData);
        setDayStops(dayStops);
        setNightStops(nightStops);

        const csvFetch = await axios.get(csv);
        const csvData = csvFetch.data.split("\n").slice(1);

        const delayFetch = await axios.get(delay);
        const parsedData = readString(delayFetch.data).data;

        const delaysMap = {};
        parsedData.forEach((row) => {
          const stopName = row[0];
          const delay = parseFloat(row[1]);
          delaysMap[stopName] = delay;
        });

        setAvgStopDelay(delaysMap);
        loadCsvStops(csvData);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []);

  const getStopColor = (delay) => {
    if (delay < 60) {
      return "green";
    } else if (delay < 120) {
      return "yellow";
    } else if (delay < 180) {
      return "orange";
    } else {
      return "red";
    }
  };

  const fetchAvgDelayForStop = async (stopName) => {
    try {
      const delayFetch = await axios.get(delay);
      const parsedData = readString(delayFetch.data).data;
      const avgDelayData = parsedData.find((row) => row[0] === stopName);
      return avgDelayData ? parseFloat(avgDelayData[1]) : 0; // Return 0 if no delay data found
    } catch (error) {
      console.error("Error fetching average delay CSV data:", error);
      return 0; // Return 0 in case of error
    }
  };

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

      if (!uniqueStops[stop_name]) {
        uniqueStops[stop_name] = parsedStop;
      } else {
        uniqueStops[stop_name].coords.push([
          parsedStop.stop_lat,
          parsedStop.stop_lon,
        ]);
      }
    });

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
    const processedIndexes = new Set();

    stops.forEach((stop, index) => {
      if (!processedIndexes.has(index)) {
        let foundGroup = false;
        for (const group of groupedStops) {
          const groupCenter = getGroupCenter(group);
          const distance = calculateDistance(stop.coords, groupCenter);
          if (distance < circleRadius / 1000) {
            group.push(stop);
            foundGroup = true;
            break;
          }
        }
        if (!foundGroup) {
          groupedStops.push([stop]);
        }
        processedIndexes.add(index);
      }
    });

    return groupedStops;
  };

  const calculateDistance = (coord1, coord2) => {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    const R = 6371;
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

  return (
    <>
      {nightMode
        ? groupedNightStops.map((group, index) => {
            const center = getGroupCenter(group);
            const nearestCsvStop = findNearestStop(center, csvStops);
            return (
              <Circle
                key={`night_stop_group_${index}`}
                center={center}
                radius={heatmapEnabled ? 200 : circleRadius / 3}
                pathOptions={{
                  color: "black",
                  fillColor: "white",
                  fillOpacity: 0.4,
                  opacity: 0.5,
                }}
              >
                <StopPopup
                  nearestCsvStop={nearestCsvStop}
                  defaultText="Unknown Night Stop"
                />
              </Circle>
            );
          })
        : groupedDayStops.map((group, index) => {
            const center = getGroupCenter(group);
            const nearestCsvStop = findNearestStop(center, csvStops);
            const stopName = nearestCsvStop ? nearestCsvStop.stop_name : "";
            const stopDelay = avgStopDelay[stopName] || 0;

            return (
              <Circle
                key={`day_stop_group_${index}`}
                center={center}
                radius={heatmapEnabled ? 200 : circleRadius / 3}
                pathOptions={{
                  color: "black",
                  fillColor: heatmapEnabled ? getStopColor(stopDelay) : "white",
                  fillOpacity: 0.4,
                  opacity: 1,
                }}
              >
                <StopPopup
                  nearestCsvStop={nearestCsvStop}
                  defaultText="Unknown Day Stop"
                />
              </Circle>
            );
          })}
    </>
  );
};

export default Stops;
