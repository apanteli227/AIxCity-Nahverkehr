import React, { useEffect, useState } from "react";
import { Polyline, Popup } from "react-leaflet";
import { useRouteContext } from "../store/RouteContext";
import { fetchRoutesAndStops } from "../API";
import { useNightModeContext } from "../store/NightModeContext";

function Routes() {
  const { setTramRoutes, setSelectedRoute } = useRouteContext();
  const { nightMode } = useNightModeContext();
  const [dayRoutes, setDayRoutes] = useState([]);
  const [nightRoutes, setNightRoutes] = useState([]);

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
  }, []);

  const drawRoutes = (tramRoutesData) => {
    const dayRoutes = [];
    const nightRoutes = [];

    const isValidRoute = (tags) => {
      return (
        tags.type === "route" && (tags.route === "tram" || tags.route === "bus")
      );
    };

    const pushRoute = (id, color, name, routeGeometry, isNight) => {
      const route = {
        id: id,
        geometry: routeGeometry,
        color: color,
        name: name,
        isNight: isNight,
      };
      if (isNight) {
        nightRoutes.push(route);
      } else {
        dayRoutes.push(route);
      }
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

    setDayRoutes(dayRoutes);
    setNightRoutes(nightRoutes);
    setTramRoutes(nightMode ? nightRoutes : dayRoutes);
  };

  const handleRouteClick = (routeId) => {
    setSelectedRoute((prevRouteId) =>
      routeId === prevRouteId ? null : routeId
    );
  };

  const routesToDisplay = nightMode ? nightRoutes : dayRoutes;

  return (
    <div>
      {routesToDisplay.map((route, index) => (
        <Polyline
          key={`${route.id}_${index}`} // Eindeutiger Schlüssel hinzugefügt
          positions={route.geometry}
          color={route.color}
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