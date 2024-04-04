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
    const [value, setValue] = useState(0);
    const [lines, setLines] = useState(["1 - Bf Mahndorf", "1 - Huchting"]);
    const [stops, setStops] = useState(["Hauptbahnhof"]);
    const [formData, setFormData] = useState({
        mode: value === 0 ? "linien" : value === 1 ? "haltestellen" : "gesamt",
        startDateAndTime: "",
        endDateAndTime: "",
        selectedItems: [],
        selectedStatistic: statistiken[1],
        selectedRadio: "",
    });

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
        }, [formData] // Empty dependency array ensures that the effect runs only once on component mount
    );

    const handleSubmit = (event) => {
        event.preventDefault();
        getCustomStatistics(new FormData(formData))
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
        setFormData((prevData) => ({
            ...prevData,
            selectedItems: [...formData["selectedItems"], ...value],
        }));
        console.log(value)
        console.log({formData});
    };

    const handleInputChange = (field, value) => {
        console.log(value)
        setFormData((prevData) => ({
            ...prevData,
            [field]: value,
        }));
        console.log({formData});
    };

    const handleTabChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <main className="statistics-box">
            <h2>Benutzerdefinierte Statistiken</h2>
            <form>
                <TextField
                    className="statistics-box-box"
                    id="start-datetime"
                    label="Start Date & Time"
                    type="datetime-local"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    value={formData.startDateAndTime}
                    onChange={(e) => handleInputChange("startDateAndTime", e.target.innerText)}
                />
                <TextField
                    className="statistics-box-box"
                    id="end-datetime"
                    label="End Date & Time"
                    type="datetime-local"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    value={formData.endDateAndTime}
                    onChange={(e) => handleInputChange("endDateAndTime", e.target.innerText)}
                />

                <Box sx={{width: "100%"}}>
                    <Box sx={{borderBottom: 1, borderColor: "divider"}}>
                        <Tabs
                            value={value}
                            onChange={handleTabChange}
                            aria-label="custom statistics tabs"
                        >
                            <Tab label="Linien"{...a11yProps(0)}/>
                            <Tab label="Haltestellen" {...a11yProps(1)} />
                            <Tab label="Beides" {...a11yProps(2)} />
                        </Tabs>
                    </Box>
                    <CustomTabPanel value={value} index={0}>
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
                                console.log(event);
                                console.log(formData["selectedItems"])
                                console.log(value)
                                console.log(reason)
                                console.log(details)
                                console.log([...formData["selectedItems"], ...value])
                                const newForm = {
                                    ...formData,
                                    selectedItems: value,
                                };
                                setFormData(newForm);

                                console.log({formData});
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
                            value={formData.selectedStatistic}
                            onChange={(e) =>
                                handleInputChange(e.target.innerText)
                            }
                            renderInput={(params) => (
                                <TextField {...params} label="Statistik"/>
                            )}
                        />
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={1}>
                        <h3>Haltestellenbasierte Statistiken</h3>
                        <Autocomplete
                            className="statistics-box-box"
                            multiple
                            options={stops}
                            disableCloseOnSelect
                            onInputChange={(e, value, reason) =>
                                handleInputChangeList(e, value, reason)
                            }
                            renderOption={(props, option, {selected}) => (
                                <li {...props}>
                                    <Checkbox
                                        style={{marginRight: 8}}
                                        checked={formData.selectedItems.includes(option.title)}
                                    />
                                    {option.title}
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
                            value={formData.selectedStatistic}
                            sx={{width: 300}}
                            renderInput={(params) => (
                                <TextField {...params} label="Statistik"/>
                            )}
                        />
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={2}>
                        <h3>Linien- und haltestellenbasierte Statistiken</h3>
                    </CustomTabPanel>
                </Box>
                <Button variant="submit" onSubmit={handleSubmit}>
                    Anzeigen
                </Button>
            </form>
            <Box>
                <h3>Ergebnisse</h3>
            </Box>
        </main>
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

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            "aria-controls": `simple-tabpanel-${index}`,
        };
    }
}
