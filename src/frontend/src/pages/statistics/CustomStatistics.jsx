import * as React from 'react';
import {useEffect, useState} from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {Autocomplete, Button, Checkbox, TextField} from "@mui/material";
import {getCustomStatistics, getLines, getStops} from "../../api.js";

export default function BasicTabs() {
    const [value, setValue] = useState(0);
    const [lines, setLines] = useState([]);
    const [stops, setStops] = useState([]);
    const [formData, setFormData] = useState({
        mode: (value === 0) ? 'linien' : (value === 1) ? 'haltestellen' : 'gesamt',
        startDateTime: '',
        endDateTime: '',
        selectedItems: [],
        selectedStatistic: '',
        selectedRadio: '',
    });
    const statistiken = [
        'Ankunftsverspätung',
        'Abfahrtsverspätung',
        'generierte Verspätung',
        'Verspätungsrate der Abfahrten (nach Abfahrtsverspätung)',
        'Anzahl der Verspätungen',
        'Anzahl der Abfahrten pro Tag',
        'Anzahl der Abfahrtenausfälle pro Monat',
        'Ausfallrate',
    ];

    useEffect(() => {
            getLines().then((response) => {
                const data = response.data;
                console.log('Data:', data);
                setLines(data);
            }).catch((error) => {
                console.error('Error fetching data:', error);
            });
            getStops().then((response) => {
                const data = response.data;
                console.log('Data:', data);
                setStops(data);
            }).catch((error) => {
                console.error('Error fetching data:', error);
            });
        }, [] // Empty dependency array ensures that the effect runs only once on component mount
    );

    const handleSubmit = (event) => {
        event.preventDefault();
        getCustomStatistics(new FormData(formData)).then((response) => {
            const data = response.data;
            console.log('Data:', data);
            //showCustomStatistics(data);
        }).catch((error) => {
            console.error('Error fetching data:', error);
        });
    }

    const handleInputChange = (field, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [field]: value,
        }));
    };

    const handleTabChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <>
            <h2>Benutzerdefinierte Statistiken</h2>
            <form>
                <TextField
                    id="start-datetime"
                    label="Start Date & Time"
                    type="datetime-local"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    value={formData.startDateTime}
                    onChange={(e) => handleInputChange('startDateTime', e.target.value)}
                />
                <TextField
                    id="end-datetime"
                    label="End Date & Time"
                    type="datetime-local"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    value={formData.endDateTime}
                    onChange={(e) => handleInputChange('endDateTime', e.target.value)}
                />

                <Box sx={{width: '100%'}}>
                    <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                        <Tabs value={value} onChange={handleTabChange} aria-label="basic tabs example">
                            <Tab label="Item One" {...a11yProps(0)} />
                            <Tab label="Item Two" {...a11yProps(1)} />
                            <Tab label="Item Three" {...a11yProps(2)} />
                        </Tabs>
                    </Box>
                    <CustomTabPanel value={value} index={0}>
                        <h3>Linien</h3>
                        <Autocomplete
                            multiple
                            id="checkboxes-tags-demo"
                            options={lines}
                            disableCloseOnSelect
                            getOptionLabel={(option) => option.title}
                            renderOption={(props, option, {selected}) => (
                                <li {...props}>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{marginRight: 8}}
                                        checked={formData.selectedItems.includes(option.title)}
                                    />
                                    {option.title}
                                </li>
                            )}
                            style={{width: 500}}
                            renderInput={(params) => (
                                <TextField {...params} label="Linien" placeholder="Linien"/>
                            )}
                        />
                        <Autocomplete
                            disablePortal
                            id="combo-box-demo"
                            options={statistiken}
                            value={formData.selectedStatistic}
                            onChange={(e) => handleInputChange('selectedStatistic', e.target.value)}
                            sx={{width: 300}}
                            renderInput={(params) => <TextField {...params} label="Statistik"/>}
                        />
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={1}>
                        <h3>Haltestellen</h3>
                        <Autocomplete
                            multiple
                            id="checkboxes-tags-demo"
                            options={stops}
                            disableCloseOnSelect
                            getOptionLabel={(option) => option.title}
                            renderOption={(props, option, {selected}) => (
                                <li {...props}>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{marginRight: 8}}
                                        checked={formData.selectedItems.includes(option.title)}
                                    />
                                    {option.title}
                                </li>
                            )}
                            style={{width: 500}}
                            renderInput={(params) => (
                                <TextField {...params} label="Haltestellen" placeholder="Haltestellen"/>
                            )}
                        />
                        <Autocomplete
                            disablePortal
                            id="combo-box-demo"
                            options={statistiken}
                            onChange={(e) => handleInputChange('selectedStatistic', e.target.value)}
                            value={formData.selectedStatistic}
                            sx={{width: 300}}
                            renderInput={(params) => <TextField {...params} label="Statistik"/>}
                        />
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={2}>
                        <h3>Gesamt</h3>
                    </CustomTabPanel>
                </Box>
                <Button variant="submit" onSubmit={handleSubmit}>Anzeigen</Button>
            </form>
            <Box>
                <h3>Ergebnisse</h3>
            </Box>
        </>
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
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }
}