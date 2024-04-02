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
  const [tramRoutes, setTramRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null); // Hinzufügen des selectedRoute Zustands
  const selectedRouteValue = useSelectedRoute();
  return (
    <RouteContext.Provider
      value={{
        tramRoutes,
        setTramRoutes,
        selectedRoute,
        setSelectedRoute,
        selectedRouteValue,
      }}
    >
      {children}
    </RouteContext.Provider>
  );
}
