import React, {useState} from "react";
import {Autocomplete, Button, FormControl, FormControlLabel, Radio, RadioGroup, TextField} from "@mui/material";
import {getML} from "../../api.js";
import Box from "@mui/material/Box";

const lines = ['10 => Gröpelingen', '10 => Sebaldsbrück', '10 => Waller Friedhof', '10E => Bremen Humboldtstraße', '10E => Hauptbahnhof', '1E => Alte Neustadt / Westerstraße', '1E => Hauptbahnhof / Domsheide', '1E => Neue Vahr-Süd / Kurt-Huber-Straße', '1E => Tenever', '1E => Waller Friedhof via Hauptbahnhof', '1S => Hauptbahnhof / Domsheide', '1S => Kirchbachstraße / 1E Westerstraße', '1S => Waller Friedhof via Hauptbahnhof', '2 => Bremen Weserwehr', '2 => Gröpelingen', '2 => Sebaldsbrück', '20 => Europahafen', '20 => Hohweg', '21 => Blockdiek', '21 => Horn', '21 => Neue Vahr / Polizeipräsidium', '21 => Sebaldsbrück', '21 => Sebaldsbrück / 44 Bf Mahndorf', '21 => Universität', '21E => Universität', '22 => Kattenturm', '22 => Kulenkampffallee', '22 => Schwachhausen / Kirchbachstraße', '22 => Universität-Ost', '22E => Habenhausen', '22E => Habenhausen / Bekenntnisschule', '22E => Universität', '22E => Universität-Ost', '24 => Neue Vahr-Nord', '24 => Rablinghausen', '24 => Rablinghausen / Lankenauer Höft', '24E => Hauptbahnhof', '25 => Bremen Schweizer Eck', '25 => Domsheide', '25 => Osterholz', '25 => Weidedamm-Süd', '26 => Hauptbahnhof', '26 => Huckelriede / N9 Neue Vahr-Nord', '26 => Kattenturm / Klinikum LdW', '26 => Überseestadt', '27 => Brinkum-Nord / IKEA/Marktkauf', '27 => Hauptbahnhof', '27 => Weidedamm-Nord', '27E => Brinkum-Nord / IKEA/Marktkauf', '27E => Huckelriede', '28 => Universität', '29 => Blockdiek', '29 => Kattenturm', '29 => Kattenturm / 52 Huchting', '29 => Neue Vahr-Nord', '2E => Sebaldsbrück', '2E => Waller Friedhof', '3 => Gröpelingen', '3 => Weserwehr', '31 => Borgfeld-Ost', '31 => Horn', '31 => Nedderland', '33 => Horn', '33 => Horn / 31 Nedderland', '33 => Sebaldsbrück', '33E => Horn', '33E => Oberneuland / Ikensdamm', '34 => Horn', '34 => Horn / 31 Nedderland', '34 => Sebaldsbrück', '34E => Horn', '37 => Bf Mahndorf', '37 => Sebaldsbrück', '37E => Mercedes-Benz', '38 => Bf Mahndorf', '38 => Bf Mahndorf / 40 Weserwehr', '38 => Bf Mahndorf / 41S Weserwehr', '38 => Bf Mahndorf / 44 Sebaldsbrück', '38 => Weserpark-Süd', '39 => Bf Mahndorf / 40 Weserwehr', '39 => Bf Mahndorf / 41 Weserwehr', '39 => Weserpark-Süd', '4 => Arsten', '4 => Borgfeld', '4 => Kirchbachstraße / 4S Lilienthal', '4 => Lilienthal', '40 => Bf Mahndorf', '40 => Bf Mahndorf / 38 Weserpark-Süd', '40 => Bf Mahndorf / 39 Weserpark-Süd', '40 => Weserwehr', '41 => Bf Mahndorf', '41 => Bf Mahndorf / 38 Weserpark-Süd', '41 => Bf Mahndorf / 39 Weserpark-Süd', '41 => Marschstraße / 41S Weserwehr', '41 => Weserwehr', '41E => Bf Sebaldsbrück / 21 Neue Vahr', '41E => Föhrenstraße / 22E Habenhausen', '41S => Bf Mahndorf / 38 Weserpark-Süd', '41S => Weserwehr', '42 => Gewerbepark Hansalinie', '42 => Weserwehr', '44 => Bf Mahndorf', '44 => Bf Mahndorf / 38 Weserpark-Süd', '44 => Sebaldsbrück', '44 => Sebaldsbrück / 21 Universität', '4E => Domsheide', '5 => Bremen Bürgerpark', '5 => Bremen Waller Ring', '52 => Huchting', '52 => Kattenturm / 29 Neue Vahr-Nord', '55 => Brinkum', '55 => Brinkum / Schule Brunnenweg', '55 => Kirchhuchting', '57 => Bremen Roland-Center', '58 => Bremen Roland-Center', '5S => Bürgerpark via Hauptbahnhof', '5S => Gröpelingen', '6 => Bremen Bürgerpark', '6 => Bremen Domsheide', '6 => Bremen Hauptbahnhof', '6 => Flughafen', '6 => Hauptbahnhof', '6 => Riensberg', '6 => Universität', '61 => Rablinghausen', '61 => Sandhausen', '62 => Hasenbüren', '62 => Rablinghausen', '62 => Rablinghausen / Stromer Straße', '63 => Bremen Franz-Stickan-Straße', '63 => Bremen Hauptbahnhof', '63 => GVZ', '63 => GVZ / Ludwig-Erhard-Straße', '63 => Hauptbahnhof', '6E => Neustadt / BSAG-Zentrum', '8 => Hauptbahnhof', '8 => Huchting', '8 => Kulenkampffallee', '80 => Bf Oslebshausen', '80 => Gröpelingen', '80 => Industriehäfen', '81 => Gröpelingen', '81 => Industriehäfen', '82 => Ringverkehr Gröpelingen', '8E => Bremen Domsheide', '90 => Bf Vegesack / N7 Gröpelingen', '90 => Bf Vegesack / N7 Hauptbahnhof', '90 => Farge-Süd / Wasserweg', '90 => Gröpelingen', '90 => Neuenkirchen', '90 => Rönnebeck', '90E => Bf Vegesack', '90E => Hammersbeck / Auf dem Flintacker', '90E => Lüssum / Neuenkirchener Weg', '90E => Neuenkirchen', '91 => Bf Burg', '91 => Gröpelingen', '91 => Lüssum', '91 => Rönnebeck', '92 => Bf Vegesack', '92 => Gröpelingen', '92 => Lüssum', '92 => Rönnebeck', '93 => Gröpelingen', '93 => Marßel', '94 => Bf Blumenthal', '94 => Bf Burg / 90 Gröpelingen', '94 => Bf Vegesack', '94 => Bockhorn', '94 => Marßel', '94 => Schwanewede-Nord', '94 => Schwanewede / Ostlandstraße', '95 => Betriebshof Blumenthal', '95 => Bf Vegesack', '95 => Lüssum / Neuenkirchener Weg', '96 => Bf Blumenthal', '96 => Bf Blumenthal / 95 Gröpelingen', '96 => Lüssum', '96 => Lüssum-Süd / An der Lehmkuhle', '98 => Bf Vegesack', '98 => Hammersbeck', '98 => Hammersbeck / Kaspar-Ohm-Straße', 'E => Alte Neustadt / Westerstraße', 'N1 => Bf Mahndorf', 'N1 => Flughafen', 'N1 => Huchting', 'N1 => Neustadt / BSAG-Zentrum', 'N10 => Gröpelingen', 'N10 => Sebaldsbrück', 'N3 => Bf Mahndorf', 'N3 => Horn-Lehe / 34 Sebaldsbrück', 'N3 => Rablinghausen', 'N4 => Arsten', 'N4 => Borgfeld', 'N4 => Lilienthal', 'N5 => Bf Mahndorf', 'N5 => Bf Mahndorf / 39 Weserpark-Süd', 'N5 => Domsheide', 'N5 => Domsheide / 25 Weidedamm-Süd', 'N6 => Bremen Roland-Center', 'N7 => Betriebshof Blumenthal', 'N7 => Bf Vegesack / 90 Neuenkirchen', 'N7 => Gröpelingen', 'N7 => Hauptbahnhof', 'N7 => Neuenkirchen', 'N9 => Kattenturm / Huckelriede', 'N9 => Neue Vahr-Nord'];

export default function Prognose() {
    const [selectedLine, setSelectedLine] = useState('22 => Universität-Ost');
    const [selectedRadio, setSelectedRadio] = useState("classification");
    const [result, setResult] = useState([]);

    function handleRadioGroupChange(event) {
        setSelectedRadio(event.target.value);
    }

    function handleSubmit(event) {
        event.preventDefault();
        getML(selectedRadio, selectedLine)
            .then((response) => {
                const data = response.data;
                console.log("Result:", result);
                setResult(data);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }

    return (
        <main className="statistics-container">
            <h1 className='statistics-header'>Machine Learning-Prognose</h1>
            <div className="statistics-box">
                <h3>Art des Algorithmus</h3>
                <FormControl>
                    <RadioGroup
                        row
                        name="controlled-radio-buttons-group"
                        value={selectedRadio}
                        onChange={handleRadioGroupChange}
                    >
                        <FormControlLabel value="classification" control={<Radio/>} label="Klassifizierung"/>
                        <FormControlLabel value="regression" control={<Radio/>} label="Regression"/>
                    </RadioGroup>
                </FormControl>
                <h3>Linie</h3>
                <Autocomplete
                    className="statistics-box-box"
                    disablePortal
                    id="combo-box-demo"
                    options={lines}
                    value={selectedLine}
                    onChange={(event, newValue) => {
                        setSelectedLine(newValue);
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="Linie"/>
                    )}/>
                <Button variant="submit" onClick={handleSubmit}>
                    Anzeigen
                </Button>
                <Box>
                    <h3>Ergebnis</h3>
                    {result}
                </Box>
            </div>
        </main>
    );
}