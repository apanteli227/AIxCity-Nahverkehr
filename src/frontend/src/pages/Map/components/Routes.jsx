import React, { useEffect, useState } from "react";
import { Polyline } from "react-leaflet";
import RoutePopup from "./popups/RoutePopup";
import { useRouteContext } from "../store/RouteContext";
import { fetchRoutesAndStops } from "../API";
import { useNightModeContext } from "../store/NightModeContext";
import { useSelectedContext } from "../store/SelectedContext";

function Routes() {
  const { tramRoutes, setTramRoutes } = useRouteContext();
  const { nightMode } = useNightModeContext();
  const { isSelected, toggleSelected, resetSelected } = useSelectedContext();
  const { selectedRoute, setSelectedRoute } = useRouteContext();
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

  useEffect(() => {
    setSelectedRoute(null);
    resetSelected();
    console.log("selectedRoute reset");
  }, [nightMode]);

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
    setSelectedRoute(selectedRoute === null ? routeId : null);
    toggleSelected();
  };

  const routesToDisplay = nightMode ? nightRoutes : dayRoutes;

  const mappedRoutes = routesToDisplay.map((route, index) => (
    <Polyline
      key={`${route.id}_${index}`}
      positions={route.geometry}
      color={
        isSelected
          ? selectedRoute === route.id
            ? route.color
            : "rgba(128, 128, 128, 0.1)"
          : route.color
      }
      weight={isSelected ? (selectedRoute === route.id ? 8 : 4) : 4}
      eventHandlers={{
        click: () => {
          handleRouteClick(route.id);
        },
      }}
    >
      <RoutePopup routeName={route.name} />
    </Polyline>
  ));

  return (
      <div>
        {!isSelected && mappedRoutes}
        {isSelected && mappedRoutes}
        {console.log(isSelected, selectedRoute)}
      </div>
    
  );
}

export default Routes;
