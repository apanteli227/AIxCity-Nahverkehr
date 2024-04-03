import React, { useState, useEffect } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import RouteProvider, { useRouteContext } from "../store/RouteContext";
import { useNightModeContext } from "../store/NightModeContext";
import { useSelectedContext } from "../store/SelectedContext";

// Rest of the code...

export default function SearchableDropdown() {
  const {
    selectedRoute,
    setSelectedRoute,
    dayRoutes,
    nightRoutes,
    setPopupInfo,
  } = useRouteContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const { nightMode } = useNightModeContext();
  const [dayRoutesNames, setDayRoutesNames] = useState([]);
  const [nightRoutesNames, setNightRoutesNames] = useState([]);
  const [routesLoaded, setRoutesLoaded] = useState(false);
  const { toggleSelected } = useSelectedContext();

  // Prüfen ob Routen geladen sind
  useEffect(() => {
    if (dayRoutes.length > 0 && nightRoutes.length > 0) {
      setRoutesLoaded(true);
    }
  }, [nightRoutes]);

  //Routen Filtern
  useEffect(() => {
    if (routesLoaded) {
      const uniqueRoutesMapDay = {};
      const uniqueRoutesArrayDay = [];

      dayRoutes.forEach((route) => {
        const key = `${route.id}-${route.name}`;

        if (!uniqueRoutesMapDay[key]) {
          uniqueRoutesMapDay[key] = true;
          uniqueRoutesArrayDay.push({ id: route.id, name: route.name });
        }
      });
      uniqueRoutesArrayDay.sort((a, b) => a.name.localeCompare(b.name));
      setDayRoutesNames(uniqueRoutesArrayDay);

      const uniqueRoutesMapNight = {};
      const uniqueRoutesArrayNight = [];

      nightRoutes.forEach((route) => {
        const key = `${route.id}-${route.name}`;

        if (!uniqueRoutesMapNight[key]) {
          uniqueRoutesMapNight[key] = true;
          uniqueRoutesArrayNight.push({ id: route.id, name: route.name });
        }
      });
      uniqueRoutesArrayNight.sort((a, b) => a.name.localeCompare(b.name));
      setNightRoutesNames(uniqueRoutesArrayNight);
      console.log(
        "Unique Route Names:",
        uniqueRoutesArrayDay,
        uniqueRoutesArrayNight
      );
    }
  }, [routesLoaded]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    console.log("Search Term:", value);
  };

  const handleLineSelect = (event, value) => {
    console.log("Selected Line:", value);
    setSearchTerm(value ? `Tram: ${value.name}` : "");
    setSelectedRoute(selectedRoute === null ? value.id : null);
    toggleSelected();
    console.log("Selected Value:", value);
  };

  return (
    <RouteProvider>
      <div>
        <Autocomplete
          id="searchable-dropdown"
          options={nightMode ? nightRoutesNames : dayRoutesNames}
          getOptionLabel={(option) => option.name || ""}
          value={selectedRoute}
          open={open}
          onOpen={() => {
            setOpen(true);
          }}
          onClose={() => setOpen(false)}
          onChange={(event, value) => {
            handleLineSelect(event, value);
          }}
          inputValue={searchTerm}
          onInputChange={(event, value) => setSearchTerm(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Linien"
              variant="outlined"
              placeholder="Suche nach Linien"
              sx={{ width: open ? 450 : 150, left: 0, textAlign: "right" }}
              onChange={handleSearchChange}
            />
          )}
        />
      </div>
    </RouteProvider>
  );
}
