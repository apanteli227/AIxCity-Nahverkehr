import React, { createContext, useContext, useState, useMemo } from "react";

const RouteContext = createContext();

export const useRouteContext = () => useContext(RouteContext);

function useSelectedRoute() {
  const [selectedRoute, setSelectedRoute] = useState(null);

  return useMemo(
    () =>
      ({
        selectedRoute,
        setSelectedRoute,
      }[selectedRoute])
  );
}

export default function RouteProvider({ children }) {
  const [dayRoutes, setDayRoutes] = useState([]);
  const [nightRoutes, setNightRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null); // Hinzufügen des selectedRoute Zustands
  const selectedRouteValue = useSelectedRoute();
  return (
    <RouteContext.Provider
      value={{
        dayRoutes,
        setDayRoutes,
        nightRoutes,
        setNightRoutes,
        selectedRoute,
        setSelectedRoute,
        selectedRouteValue,
      }}
    >
      {children}
    </RouteContext.Provider>
  );
}
