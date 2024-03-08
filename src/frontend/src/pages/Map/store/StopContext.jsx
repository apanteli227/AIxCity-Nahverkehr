import React, { createContext, useContext, useState } from "react";

const StopContext = createContext();

export const useStopContext = () => useContext(StopContext);

export default function StopProvider({ children }) {
  const [tramStops, setTramStops] = useState([]);

  return (
    <StopContext.Provider value={{ tramStops, setTramStops }}>
      {children}
    </StopContext.Provider>
  );
}
