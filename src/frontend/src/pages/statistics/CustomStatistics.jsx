import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {Autocomplete, TextField} from "@mui/material";

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

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <>
            <h2>Benutzerdefinierte Statistiken</h2>
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
                        disablePortal
                        id="combo-box-demo"
                        //options={linien}
                        sx={{width: 300}}
                        renderInput={(params) => <TextField {...params} label="Linie"/>}
                    />
                    <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        //options={statistiken_linien}
                        sx={{width: 300}}
                        renderInput={(params) => <TextField {...params} label="Statistik"/>}
                    />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                    <h3>Haltestellen</h3>
                    <Autocomplete
                        disablePortal
                        id="combo-box-linie"
                        //options={haltestellen}
                        sx={{width: 300}}
                        renderInput={(params) => <TextField {...params} label="Haltestelle"/>}
                    />
                    <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        //options={statistiken_haltestellen}
                        sx={{width: 300}}
                        renderInput={(params) => <TextField {...params} label="Statistik"/>}
                    />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={2}>
                    <h3>Gesamt</h3>
                </CustomTabPanel>
            </Box>
        </>
    );
}