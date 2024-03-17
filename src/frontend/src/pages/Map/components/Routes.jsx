import React, { useEffect, useState } from "react";
import { Polyline, Popup } from "react-leaflet";
import { useRouteContext } from "../store/RouteContext";
import { fetchRoutesAndStops } from "../API";
import { useNightModeContext } from "../store/NightModeContext";

function Routes() {
  const { tramRoutes, setTramRoutes, selectedRoute, setSelectedRoute } =
    useRouteContext();
  const { nightMode } = useNightModeContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchRoutesAndStops();
        const routesData = response.data.elements;
        drawRoutes(routesData);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, [nightMode, selectedRoute]);

  const drawRoutes = (tramRoutesData) => {
    const routes = [];

    const isValidRoute = (tags) => {
      return (
        tags.type === "route" && (tags.route === "tram" || tags.route === "bus")
      );
    };

    const pushRoute = (id, color, name, routeGeometry, isNight) => {
      routes.push({
        id: id,
        geometry: routeGeometry,
        color: color,
        name: name,
        isNight: isNight,
      });
    };

    const processMembers = (members, tags, color, id) => {
      let isNight = false;
      if (tags.by_night) {
        if (tags.by_night === "yes" || tags.by_night === "only") {
          isNight = true;
        }
      }

      members.forEach((member) => {
        if (member.type === "way" && member.role === "") {
          const routeGeometry = member.geometry || [];
          pushRoute(id, color, tags.name, routeGeometry, isNight);
        }
      });
    };

    tramRoutesData.forEach((element) => {
      if (element.type === "relation") {
        const tags = element.tags || {};
        const color = tags.colour || "blue";
        const id = element.id;
        if (isValidRoute(tags)) {
          processMembers(element.members, tags, color, id);
        }
      }
    });

    const filteredRoutes = routes.filter((route) =>
      nightMode ? route.isNight : !route.isNight
    );
    setTramRoutes(filteredRoutes);
  };
  const handleRouteClick = (routeId) => {
    console.log(
      "Route clicked:",
      routeId,
      "Color:",
      tramRoutes.find((route) => route.id === routeId)?.color
    );
    console.log("Selected route has changed:", selectedRoute);
    setSelectedRoute(routeId === selectedRoute ? null : routeId);
  };

  return (
    <div>
      {tramRoutes.map((route, index) => (
        <Polyline
          key={`${route.id}_${index}`} // Eindeutiger Schlüssel hinzugefügt
          positions={route.geometry}
          color={
            selectedRoute === null || selectedRoute === route.id
              ? route.color
              : "grey"
          }
          weight={4}
          eventHandlers={{
            click: () => handleRouteClick(route.id),
          }}
        >
          <Popup>{route.name}</Popup>
        </Polyline>
      ))}
    </div>
  );
}

export default Routes;
