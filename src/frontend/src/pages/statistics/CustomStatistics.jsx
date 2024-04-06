import * as React from "react";
import {useEffect, useState} from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {Autocomplete, Button, FormControl, FormControlLabel, Radio, RadioGroup, TextField} from "@mui/material";
import {getCustomStatistics, getLines, getStops} from "../../api.js";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";

const icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
const checkedIcon = <CheckBoxIcon fontSize="small"/>;

const statistiken = [
    "Ankunftsverspätung",
    "Abfahrtsverspätung",
    "generierte Verspätung",
    "Verspätungsrate der Abfahrten (nach Abfahrtsverspätung)",
    "Anzahl der Verspätungen",
    "Anzahl der Abfahrten pro Tag",
    "Anzahl der Abfahrtenausfälle pro Monat",
    "Ausfallrate",
];

export default function BasicTabs() {
    // workaround for the (initially planned) form object
    //todo put everything in the form object that can be put there
    const [startDateTime, setStartDateTime] = useState(dayjs().subtract(1, 'month'));
    const [endDateTime, setEndDateTime] = useState(dayjs());
    const [selectedStatistic, setSelectedStatistic] = useState(statistiken[1]);
    const [selectedRadio, setSelectedRadio] = useState("avg");
    const [lines, setLines] = useState(convertArrayToObject(["1 - Bf Mahndorf", "1 - Huchting"]));
    const [stops, setStops] = useState(convertArrayToObject(["Hauptbahnhof"]));
    const [tab, setTab] = useState(0);
    const [allValues, setAllValues] = useState(tab === 0 ? lines : stops);
    let selectedValuesMemo = React.useMemo(
        () => allValues.filter((v) => v.selected),
        [allValues],
    );

    function convertArrayToObject(array) {
        return array.map((item) => ({
            title: item,
            selected: false
        }));
    }

    useEffect(
        () => {
            getLines()
                .then((response) => {
                    const data = response.data;
                    console.log("Lines Data:", data);
                    setLines(data);
                })
                .catch((error) => {
                    console.error("Error fetching lines data:", error);
                });
            getStops()
                .then((response) => {
                    const data = response.data;
                    console.log("Stops Data:", data);
                    setStops(data);
                })
                .catch((error) => {
                    console.error("Error fetching stops data:", error);
                });
            console.log({allValues});
        }, [] // Empty dependency array ensures that the effect runs only once on component mount
    );

    const handleSubmit = (event) => {
        event.preventDefault();
        // Swap startDateTime and endDateTime if startDateTime is later than endDateTime
        if (startDateTime.isAfter(endDateTime)) {
            [startDateTime, endDateTime] = [endDateTime, startDateTime];
        }
        const formData = {
            mode: tab === 0 ? "line" : "stop",
            startDateTime: formatDate(startDateTime),
            endDateTime: formatDate(endDateTime),
            selectedItems: selectedValuesMemo.map((v) => v.title),
            selectedStatistic: selectedStatistic,
            selectedRadio: selectedRadio,
        };
        console.log({formData});
        getCustomStatistics(formData)
            .then((response) => {
                const data = response.data;
                console.log("Data:", data);
                //showCustomStatistics(data);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    };

    function formatDate(dayjsObject) {
        return dayjsObject.format('YYYY-MM-DDTHH:mm:ss');
    }

    function handleRadioGroupChange(event) {
        setSelectedRadio(event.target.value);
    }

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
        setAllValues(newValue === 0 ? lines : stops);
    };

    return (
        <div className="statistics-box">
            <h2>Benutzerdefinierte Statistiken</h2>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                    className="statistics-box-box"
                    value={startDateTime}
                    onChange={setStartDateTime}
                    referenceDate={dayjs('2022-04-17T15:30')}
                    timeSteps={{minutes: 1}}
                />
                <DateTimePicker
                    className="statistics-box-box"
                    value={endDateTime}
                    onChange={setEndDateTime}
                    referenceDate={dayjs('2022-04-17T15:30')}
                    timeSteps={{minutes: 1}}
                />
            </LocalizationProvider>
            <Box sx={{width: "100%"}}>
                <Box sx={{borderBottom: 1, borderColor: "divider"}}>
                    <Tabs
                        value={tab}
                        onChange={handleTabChange}
                        aria-label="custom statistics tabs"
                    >
                        <Tab label="Linien"/>
                        <Tab label="Haltestellen"/>
                        <Tab label="Beides"/>
                    </Tabs>
                </Box>
                <CustomTabPanel value={tab} index={0}>
                    <h3>Linienbasierte Statistiken</h3>
                    <Autocomplete
                        className="statistics-box-box"
                        multiple
                        value={selectedValuesMemo}
                        options={allValues}
                        getOptionLabel={(option) => option.title}
                        onChange={(event, newValue) => {
                            setAllValues(allValues.map((option) =>
                                newValue.includes(option) ? {...option, selected: true} : {...option, selected: false}
                            ));
                        }}
                        renderInput={(params) => <TextField {...params} label="Linien"/>}
                    />
                    <Autocomplete
                        className="statistics-box-box"
                        disablePortal
                        id="combo-box-demo"
                        options={statistiken}
                        value={selectedStatistic}
                        onChange={(event, newValue) => {
                            setSelectedStatistic(newValue);
                        }}
                        renderInput={(params) => (
                            <TextField {...params} label="Statistik"/>
                        )}
                    />
                </CustomTabPanel>
                <CustomTabPanel value={tab} index={1}>
                    <h3>Haltestellenbasierte Statistiken</h3>
                    <Autocomplete
                        className="statistics-box-box"
                        multiple
                        value={selectedValuesMemo}
                        options={allValues}
                        getOptionLabel={(option) => option.title}
                        onChange={(event, newValue) => {
                            setAllValues(allValues.map((option) =>
                                newValue.includes(option) ? {...option, selected: true} : {...option, selected: false}
                            ));
                        }}
                        renderInput={(params) => <TextField {...params} label="Haltestellen"/>}
                    />
                    <Autocomplete
                        className="statistics-box-box"
                        disablePortal
                        id="combo-box-demo"
                        options={statistiken}
                        value={selectedStatistic}
                        onChange={(event, newValue) => {
                            setSelectedStatistic(newValue);
                        }}
                        renderInput={(params) => (
                            <TextField {...params} label="Statistik"/>
                        )}
                    />
                </CustomTabPanel>
                <CustomTabPanel value={tab} index={2}>
                    <h3>Linien- und haltestellenbasierte Statistiken</h3>
                </CustomTabPanel>
                <FormControl>
                    <RadioGroup
                        row
                        name="controlled-radio-buttons-group"
                        value={selectedRadio}
                        onChange={handleRadioGroupChange}
                    >
                        <FormControlLabel value="avg" control={<Radio/>} label="Ø"/>
                        <FormControlLabel value="max" control={<Radio/>} label="Max"/>
                        <FormControlLabel value="min" control={<Radio/>} label="Min"/>
                    </RadioGroup>
                </FormControl>
            </Box>

            <Button variant="submit" onClick={handleSubmit}>
                Anzeigen
            </Button>
            <Box>
                <h3>Ergebnisse</h3>
            </Box>
        </div>
    );

    function CustomTabPanel(props) {
        const {children, value, index, ...other} = props;

        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box sx={{p: 3}}>
                        <Typography>{children}</Typography>
                    </Box>
                )}
            </div>
        );
    }
}
