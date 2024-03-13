import React, { createContext, useContext, useState, useMemo } from "react";

const RouteContext = createContext();

export const useRouteContext = () => useContext(RouteContext);

export default function RouteProvider({ children }) {
  const [tramRoutes, setTramRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null); // Hinzufügen des selectedRoute Zustands

  return (
    <RouteContext.Provider value={{ tramRoutes, setTramRoutes, selectedRoute, setSelectedRoute }}>
      {children}
    </RouteContext.Provider>
  );
}
function useSelectedRoute() {
  const [selectedRoute, setSelectedRoute] = useState(false);

  const toggleSelectedRoute = () => {
    setSelectedRoute(!selectedRoute);
  };

  return useMemo(
    () => ({
      selectedRoute,
      toggleSelectedRoute,
    }),
    [selectedRoute]
  );
}


