import React, { useEffect } from "react";
import { Polyline, Popup } from "react-leaflet";
import { useRouteContext } from "../store/RouteContext";
import { fetchRoutesAndStops } from "../API";

function Routes() {
  const { tramRoutes, setTramRoutes, selectedRoute, setSelectedRoute } = useRouteContext();
  
  useEffect(() => {
    console.log("Selected route has changed:", selectedRoute);
  }, [selectedRoute]);
  
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
  }, []); // Passen Sie die Abhängigkeiten hier an, wenn nötig

  const drawRoutes = (tramRoutesData) => {
    const routes = [];

    const isValidRoute = (tags) => {
      return (
        tags.type === "route" && (tags.route === "tram" || tags.route === "bus")
      );
    };

    const pushRoute = (id, color, name, routeGeometry) => {
      routes.push({
        id: id,
        geometry: routeGeometry,
        color: color,
        name: name,
      });
    };

    const processMembers = (members, tags, color, id) => {
      members.forEach((member) => {
        if (member.type === "way" && member.role === "") {
          const routeGeometry = member.geometry || [];
          pushRoute(id, color, tags.name, routeGeometry);
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

    setTramRoutes(routes);
  };
  const handleRouteClick = (routeId) => {
    console.log("Route clicked:", routeId, "Color:", tramRoutes.find(route => route.id === routeId)?.color);
    setSelectedRoute(routeId === selectedRoute ? null : routeId);
  };
  

  return (
    <div>
      {tramRoutes.map((route, index) => (
        <Polyline
          positions={route.geometry}
          color={selectedRoute === null || selectedRoute === route.id ? route.color : "grey"}
          weight={5}
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
