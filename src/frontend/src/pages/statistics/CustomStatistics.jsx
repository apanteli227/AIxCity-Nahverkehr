import * as React from "react";
import {useEffect, useState} from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {Autocomplete, Button, Checkbox, TextField} from "@mui/material";
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
    const [startDateTime, setStartDateTime] = useState(null);
    const [endDateTime, setEndDateTime] = useState(null);
    const [selectedStatistic, setSelectedStatistic] = useState(statistiken[1]);
    const [selectedRadio, setSelectedRadio] = useState("");
    const [lines, setLines] = useState(["1 - Bf Mahndorf", "1 - Huchting"]);
    const [stops, setStops] = useState(["Hauptbahnhof"]);
    const [tab, setTab] = useState(0);
    const [allValues, setAllValues] = useState(tab === 0 ? lines : stops);
    const selectedValues = React.useMemo(
        () => allValues.filter((v) => v.selected),
        [allValues],
    );

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
        }, [] // Empty dependency array ensures that the effect runs only once on component mount
    );

    const handleSubmit = (event) => {
        console.log("Form data:", mode);
        event.preventDefault();
        getCustomStatistics(new FormData(mode))
            .then((response) => {
                const data = response.data;
                console.log("Data:", data);
                //showCustomStatistics(data);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    };

    const handleInputChangeList = (event, value) => {
        console.log(value)
        setMode((prevData) => ({
            ...prevData,
            selectedItems: [...mode["selectedItems"], ...value],
        }));
        console.log(value)
        console.log({formData: mode});
    };

    const handleInputChange = (field, value) => {
        console.log(value)
        setMode((prevData) => ({
            ...prevData,
            [field]: value,
        }));
        console.log({formData: mode});
    };

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    };

    return (
        < className="statistics-box">
            <h2>Benutzerdefinierte Statistiken</h2>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                    className="statistics-box-box"
                    value={startDateTime}
                    onChange={setStartDateTime}
                    referenceDate={dayjs('2022-04-17T15:30')}
                />
                <DateTimePicker
                    className="statistics-box-box"
                    value={endDateTime}
                    onChange={setEndDateTime}
                    referenceDate={dayjs('2022-04-17T15:30')}
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
                        options={lines}
                        disableCloseOnSelect
                        getOptionLabel={(option) => option}
                        renderOption={(props, option, {selected}) => (
                            <li {...props}>
                                <Checkbox
                                    icon={icon}
                                    checkedIcon={checkedIcon}
                                    style={{marginRight: 8}}
                                    checked={selected}
                                />
                                {option}
                            </li>
                        )}
                        onChange={(event, value, reason, details) => {
                            const newForm = {
                                ...mode,
                                selectedItems: value,
                            };
                            setMode(newForm);
                        }
                        }
                        renderInput={(params) => (
                            <TextField {...params} label="Linien" placeholder="Linien"/>
                        )}
                    />
                    <Autocomplete
                        className="statistics-box-box"
                        disablePortal
                        id="combo-box-demo"
                        options={statistiken}
                        value={""}
                        onChange={(e) =>
                            handleInputChange(e.target.innerText)
                        }
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
                        options={stops}
                        getOptionLabel={(option) => option}
                        disableCloseOnSelect
                        onInputChange={(e, value, reason) =>
                            handleInputChangeList(e, value, reason)
                        }
                        renderOption={(props, option, {selected}) => (
                            <li {...props}>
                                <Checkbox
                                    style={{marginRight: 8}}
                                    checked={selectedItems.includes(option)}
                                />
                                {option}
                            </li>
                        )}
                        style={{width: 300}}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Haltestellen"
                                placeholder="Haltestellen"
                            />
                        )}
                    />
                    <Autocomplete
                        className="statistics-box-box"
                        disablePortal
                        options={statistiken}
                        onChange={(e) => {
                            console.log(e.target);
                            handleInputChange(e.target.innerText)
                        }}
                        value={selectedStatistic}
                        sx={{width: 300}}
                        renderInput={(params) => (
                            <TextField {...params} label="Statistik"/>
                        )}
                    />
                </CustomTabPanel>
                <CustomTabPanel value={tab} index={2}>
                    <h3>Linien- und haltestellenbasierte Statistiken</h3>
                </CustomTabPanel>
            </Box>
            <Button variant="submit"
                    onClick={() => console.log(tab, startDateTime, endDateTime, selectedValues, selectedStatistic, selectedRadio)}>
                Anzeigen
            </Button>
            <Box>
                <h3>Ergebnisse</h3>
            </Box>
        </>
    );

    function CustomTabPanel(props) {
        const {children, tab, index, ...other} = props;

        return (
            <div
                role="tabpanel"
                hidden={tab !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {tab === index && (
                    <Box sx={{p: 3}}>
                        <Typography>{children}</Typography>
                    </Box>
                )}
            </div>
        );
    }

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            "aria-controls": `simple-tabpanel-${index}`,
        };
    }
}
