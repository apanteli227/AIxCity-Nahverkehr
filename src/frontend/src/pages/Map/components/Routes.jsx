import React, { useEffect, useState } from "react";
import { Polyline, Popup } from "react-leaflet";
import RoutePopup from "./popups/RoutePopup";
import { useRouteContext } from "../store/RouteContext";
import { fetchRoutesAndStops } from "../API";
import { useNightModeContext } from "../store/NightModeContext";
import { useSelectedContext } from "../store/SelectedContext";

function Routes() {
  const {
    dayRoutes,
    setDayRoutes,
    nightRoutes,
    setNightRoutes,
    selectedRoute,
    setSelectedRoute,
  } = useRouteContext();
  const { nightMode } = useNightModeContext();
  const { isSelected, toggleSelected, resetSelected } = useSelectedContext();
  const [popupInfo, setPopupInfo] = useState(null);

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
  };

  const handleRouteClick = (routeid) => {
    setSelectedRoute(selectedRoute === null ? routeid : null);
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
        click: (event) => {
          handleRouteClick(route.id);
          setPopupInfo({
            position: event.latlng,
            name: route.name,
          });
        },
      }}
    ></Polyline>
  ));

  return (
    <>
      <div>
        {!isSelected && mappedRoutes}
        {isSelected && mappedRoutes}
        {popupInfo && isSelected && (
          <RoutePopup
            routeName={popupInfo.name}
            position={popupInfo.position}
          />
        )}
      </div>
    </>
  );
}

export default Routes;
