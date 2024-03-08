import React, { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import RouteProvider from "../store/RouteContext";

// Array mit Linien-Namen
const lineNames = ["1", "2", "3", "4"];

export default function SearchableDropdown() {
  const [searchTerm, setSearchTerm] = useState(""); // Zustand für Suchbegriff
  const [selectedLine, setSelectedLine] = useState(""); // Zustand für ausgewählte Linie
  const [open, setOpen] = useState(false); // Zustand für das Öffnen/Schließen der Dropdown-Liste

  // Handler für Änderungen der Sucheingabe
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
  };

  // Handler für Auswahl einer Linie
  const handleLineSelect = (event, value) => {
    setSelectedLine(value);
    setSearchTerm(value); // Suchbegriff auf ausgewählte Linie setzen
    setOpen(false); // Dropdown-Menü schließen
    console.log("Selected Line:", value);
  };

  return (
    <div>
      <Autocomplete
        id="searchable-dropdown"
        options={lineNames}
        value={selectedLine}
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
            onChange={handleSearchChange}
            sx={{ width: 130 }} // Hier die Breite einstellen
          />
        )}
      />
    </div>
  );
}
