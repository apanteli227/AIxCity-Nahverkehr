import React, { useState, useEffect } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import RouteProvider, { useRouteContext } from "../store/RouteContext";
import { useNightModeContext } from "../store/NightModeContext";
import { useSelectedContext } from "../store/SelectedContext";


// Rest of the code...

export default function SearchableDropdown() {
  const { selectedRoute, setSelectedRoute, dayRoutes, nightRoutes } = useRouteContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const { nightMode } = useNightModeContext();
  const [dayRoutesNames, setDayRoutesNames] = useState([]);
  const [nightRoutesNames, setNightRoutesNames] = useState([]);
  const [routesLoaded, setRoutesLoaded] = useState(false);
  const { toggleSelected } = useSelectedContext();
  //const [routesToDisplay, setRoutesToDisplay] = useState([]);

  // Prüfen ob Routen geladen sind
  useEffect(() => {
    if (dayRoutes.length > 0 && nightRoutes.length > 0) {
      setRoutesLoaded(true);
    }
  }, [nightRoutes]);

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

      nightRoutes.forEach((route) => {
        uniqueRouteNames2.add({name:route.name, id:route.id});
      });

      const uniqueRoutes2 = Array.from(uniqueRouteNames2).map((name, id) => ({
        id: id,
        name: name,
      }));
      setNightRoutesNames(uniqueRoutes2);
      console.log("Unique Route Names:", uniqueRouteNames);
    }
    
  }, [routesLoaded]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    console.log("Search Term:", value);
  };

  const handleLineSelect = (event, value) => {
    console.log("Selected Line:", value);
    setSearchTerm(value ? `Tram ${value.name}` : "");
    setSelectedRoute(selectedRoute === null ? value.id : null);
    toggleSelected();
    ;
  };

  return (
    <RouteProvider>
      <div>
        <Autocomplete
          id="searchable-dropdown"
          options={nightMode ? nightRoutesNames : dayRoutesNames}
          getOptionLabel={(option) => option.name || ""}
          value={selectedRoute} // Store the selected route in the value
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          onChange={(event, value) => handleLineSelect(event, value)} // Pass the event and value to handleLineSelect
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
      </div>
      
    </RouteProvider>
  );
}
