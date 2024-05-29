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

      const tramRoutesDay = uniqueRoutesArrayDay.filter((route) =>
        route.name.includes("Tram")
      );
      const busRoutesDay = uniqueRoutesArrayDay.filter(
        (route) => !route.name.includes("Tram")
      );

      const sortedTramRoutesDay = tramRoutesDay.sort((a, b) => {
        // Sortiere nach Nummern, falls verfügbar
        const numA = parseInt(a.name.match(/\d+/)?.[0]);
        const numB = parseInt(b.name.match(/\d+/)?.[0]);
        return numA - numB;
      });

      const sortedBusRoutesDay = busRoutesDay.sort((a, b) => {
        // Sortiere nach Nummern, falls verfügbar
        const numA = parseInt(a.name.match(/\d+/)?.[0]);
        const numB = parseInt(b.name.match(/\d+/)?.[0]);
        return numA - numB;
      });

      const sortedRoutesArrayDay = [
        ...sortedTramRoutesDay,
        ...sortedBusRoutesDay,
      ];

      setDayRoutesNames(sortedRoutesArrayDay);

      const uniqueRoutesMapNight = {};
      const uniqueRoutesArrayNight = [];

      nightRoutes.forEach((route) => {
        const key = `${route.id}-${route.name}`;

        if (!uniqueRoutesMapNight[key]) {
          uniqueRoutesMapNight[key] = true;
          uniqueRoutesArrayNight.push({ id: route.id, name: route.name });
        }
      });

      const tramRoutesNight = uniqueRoutesArrayNight.filter((route) =>
        route.name.includes("Tram")
      );
      const busRoutesNight = uniqueRoutesArrayNight.filter(
        (route) => !route.name.includes("Tram")
      );

      const sortedTramRoutesNight = tramRoutesNight.sort((a, b) => {
        // Sortiere nach Nummern, falls verfügbar
        const numA = parseInt(a.name.match(/\d+/)?.[0]);
        const numB = parseInt(b.name.match(/\d+/)?.[0]);
        return numA - numB;
      });

      const sortedBusRoutesNight = busRoutesNight.sort((a, b) => {
        // Sortiere nach Nummern, falls verfügbar
        const numA = parseInt(a.name.match(/\d+/)?.[0]);
        const numB = parseInt(b.name.match(/\d+/)?.[0]);
        return numA - numB;
      });

      const sortedRoutesArrayNight = [
        ...sortedTramRoutesNight,
        ...sortedBusRoutesNight,
      ];

      setNightRoutesNames(sortedRoutesArrayNight);

      console.log(
        "Unique Route Names:",
        sortedRoutesArrayDay,
        sortedRoutesArrayNight
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
    setSearchTerm(""); // Leer die Suchleiste, wenn eine Linie ausgewählt wird
    setSelectedRoute(selectedRoute === null ? value.id : null);
    toggleSelected();
    setPopupInfo(
      value ? { name: value.name, position: [53.082, 8.8138] } : null
    ); // Feste Position für das Popup
    console.log("Selected Value:", value);
    setOpen(false);
  };

  return (
    <RouteProvider>
      <div>
        <Autocomplete
          id="free-solo-demo"
          freeSolo
          options={nightMode ? nightRoutesNames : dayRoutesNames}
          getOptionLabel={(option) => option.name || ""}
          value={selectedRoute}
          open={
            open && (dayRoutesNames.length > 0 || nightRoutesNames.length > 0)
          }
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
              sx={{ width: 350, left: 0, textAlign: "right" }}
              onChange={handleSearchChange}
              disabled={selectedRoute !== null}
            />
          )}
        />
      </div>
    </RouteProvider>
  );
}
