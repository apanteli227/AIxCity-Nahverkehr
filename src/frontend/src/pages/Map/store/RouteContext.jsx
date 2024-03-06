import React, { createContext, useContext, useState } from "react";

const RouteContext = createContext();

export const useRouteContext = () => useContext(RouteContext);

export default function RouteProvider({ children }) {
  const [tramRoutes, setTramRoutes] = useState([]);

  return (
    <RouteContext.Provider value={{ tramRoutes, setTramRoutes }}>
      {children}
    </RouteContext.Provider>
  );
}
