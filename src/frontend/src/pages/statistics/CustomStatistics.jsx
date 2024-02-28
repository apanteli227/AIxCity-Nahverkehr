import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {Autocomplete, Button, TextField} from "@mui/material";
import {DemoContainer} from '@mui/x-date-pickers/internals/demo';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {DateTimePicker} from '@mui/x-date-pickers/DateTimePicker';

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

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function BasicTabs() {
    const [value, setValue] = React.useState(0);

    const linien = ['Linie 1', 'Linie 2', 'Linie 3', 'Linie 4', 'Linie 5'];
    const haltestellen = ['Haltestelle 1', 'Haltestelle 2', 'Haltestelle 3', 'Haltestelle 4', 'Haltestelle 5'];
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

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Statistik anzeigen');
        const form = event.target;
        const data = new FormData(form);
        console.log(data);
        //axios.post('.../statistics', data)
    }

    //todo autocomplete durch multiselect Customized hook ersetzen

    return (
        <>
            <h2>Benutzerdefinierte Statistiken</h2>
            <form>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DateTimePicker']}>
                        <DateTimePicker label="Basic date time picker"/>
                    </DemoContainer>
                </LocalizationProvider>
                <Box sx={{width: '100%'}}>
                    <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                            <Tab label="Item One" {...a11yProps(0)} />
                            <Tab label="Item Two" {...a11yProps(1)} />
                            <Tab label="Item Three" {...a11yProps(2)} />
                        </Tabs>
                    </Box>
                    <CustomTabPanel value={value} index={0}>
                        <h3>Linien</h3>
                        <Autocomplete
                            multiple
                            id="tags-outlined"
                            options={linien}
                            getOptionLabel={(option) => option.title}
                            filterSelectedOptions
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="filterSelectedOptions"
                                    placeholder="Favorites"
                                />
                            )}
                        />
                        <Autocomplete
                            disablePortal
                            id="combo-box-demo"
                            options={statistiken}
                            sx={{width: 300}}
                            renderInput={(params) => <TextField {...params} label="Statistik"/>}
                        />
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={1}>
                        <h3>Haltestellen</h3>
                        <Autocomplete
                            multiple
                            id="tags-outlined"
                            options={haltestellen}
                            getOptionLabel={(option) => option.title}
                            filterSelectedOptions
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="filterSelectedOptions"
                                    placeholder="Favorites"
                                />
                            )}
                        />
                        <Autocomplete
                            disablePortal
                            id="combo-box-demo"
                            options={statistiken}
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
}