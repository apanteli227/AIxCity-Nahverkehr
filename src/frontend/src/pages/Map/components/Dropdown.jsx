import React, { useState, useEffect } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import RouteProvider, { useRouteContext } from "../store/RouteContext";
import { useNightModeContext } from "../store/NightModeContext";

export default function SearchableDropdown() {
  const { setSelectedRoute, dayRoutes, nightRoutes } = useRouteContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const { nightMode } = useNightModeContext();
  const [dayRoutesNames, setDayRoutesNames] = useState([]);
  const [nightRoutesNames, setNightRoutesNames] = useState([]);
  const [routesLoaded, setRoutesLoaded] = useState(false);
  const [routesToDisplay, setRoutesToDisplay] = useState([]);

  // Prüfen ob Routen geladen sind
  useEffect(() => {
    if (dayRoutes.length > 0 && nightRoutes.length > 0) {
      setRoutesLoaded(true);
    }
  }, [dayRoutes, nightRoutes]);

  //Routen Filtern
  useEffect(() => {
    if (routesLoaded) {
      const uniqueRouteNames = new Set();
      dayRoutes.forEach((route) => {
        uniqueRouteNames.add(route.name, route.id);
      });

      const uniqueRoutes = Array.from(uniqueRouteNames).map((name, id) => ({
        id: id,
        name: name,
      }));

      setDayRoutesNames(uniqueRoutes);

      const uniqueRouteNames2 = new Set();
      console.log("Night Routes:", nightRoutes);
      nightRoutes.forEach((route) => {
        uniqueRouteNames2.add(route.name, route.id);
      });

      const uniqueRoutes2 = Array.from(uniqueRouteNames).map((name, id) => ({
        id: id,
        name: name,
      }));
      setNightRoutesNames(uniqueRoutes2);
    }
  }, [routesLoaded]);

  //Anzeige ändern ob Tag oder Nachtmodus
  useEffect(() => {
    setRoutesToDisplay(nightMode ? nightRoutesNames : dayRoutesNames);
  }, [nightMode, routesLoaded]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    console.log("Search Term:", value);
  };

  const handleLineSelect = (event, value) => {
    console.log("Selected Line:", value);
    setSearchTerm(value ? `Tram ${value}` : "");
    setSelectedRoute(value);
  };

  return (
    <RouteProvider>
      <div>
        {routesLoaded && (
          <Autocomplete
            id="searchable-dropdown"
            options={routesToDisplay} // Hinzugefügte Bedingung
            getOptionLabel={(option) => option.name}
            value={searchTerm}
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            onChange={handleLineSelect}
            inputValue={searchTerm}
            onInputChange={(event, value) => setSearchTerm(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Linien"
                variant="outlined"
                placeholder="Suche nach Linien"
                sx={{ width: open ? 450 : 150, left: 0, textAlign: "right" }}
                onFocus={() => setOpen(true)}
                onChange={handleSearchChange}
              />
            )}
          />
        )}
      </div>
    </RouteProvider>
  );
}
