// InterestingStatistics.jsx
import React, {useEffect, useState} from 'react';
import Card from "../../components/Card.jsx";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import {getInterestingStatistics} from '../../api';
import Box from "@mui/material/Box";
import {CircularProgress, Grid} from "@mui/material";
import Typography from "@mui/material/Typography";

const InterestingStatistics = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [statistics, setStatistics] = useState([]);
    const [colors, setColors] = useState([]);


    useEffect(() => {
        getInterestingStatistics()
            .then((response) => {
                setIsLoading(!isLoading);
                const data = response.data;
                console.log("Lines Data:", data);
                //awful last minute fix, sry
                const normalData = [data[0][0], [data[1][0][0], data[1][0][1]]];
                const cleanedData = [data[2], data[3]].map(dataArray => {
                    return dataArray.map(item => {
                        return {
                            name: item[0],
                            delay: item[1]
                        };
                    });
                });
                const correct = [...normalData, ...cleanedData];
                console.log("Correct Data:", correct);
                setStatistics(correct);
                setColors(Array.from({length: correct[3].length}, () => getRandomColor()))
            })
            .catch((error) => {
                console.error("Error fetching interesting statistics:", error);
            });
    }, []);

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    return (
        isLoading ? <Grid container justifyContent="center" alignItems="center">
                <Box className='statistics-box'
                     sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%'}}>
                    <CircularProgress/>
                </Box>
            </Grid> :
            <main className='statistics-box'>
                <h2>Interessante Statistiken der letzten 7 Tage</h2>
                <Box>
                    <h3>Linien-Ranking der durchschn. Abfahrtsverspätung</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={statistics[3]}
                            margin={{top: 5, right: 30, left: 20, bottom: 5}}
                        >
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="name"/>
                            <YAxis/>
                            <Tooltip/>
                            <Legend/>
                            <Bar dataKey="delay">
                                {statistics[3].map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % 20]}/> // colors is an array of colors
                                ))}
                                <LabelList dataKey="name" position="top"/>
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <h3>Durschn. Abfahrtsverspätung</h3>
                    (In Sekunden, jede Linie und jede Abfahrt zählt)
                    <Box className='statistics-box'
                         sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%'}}>
                        <Typography variant="h1">
                            {statistics[0][0]}
                        </Typography>
                    </Box>
                    <h3>Durschn. Abfahrtsverspätung an Arbeitstagen vs. am Wochenende</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={statistics[1].map((value, index) => ({ name: `Item ${index + 1}`, value }))}
                            margin={{top: 5, right: 30, left: 20, bottom: 5}}
                        >
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="name"/>
                            <YAxis/>
                            <Tooltip/>
                            <Legend/>
                            <Bar dataKey="value">
                                {statistics[1].map((value, index) => ({ name: `Item ${index + 1}`, value })).map((entry, index) => {
                                    const colors = ['#4392f1', '#DC493A'];
                                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]}/>;
                                })}
                                <LabelList dataKey="name" position="top"/>
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <h3>Durchschn. Abfahrtsverspätung nach Transportart</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={statistics[2]}
                            margin={{top: 5, right: 30, left: 20, bottom: 5}}
                        >
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="name"/>
                            <YAxis/>
                            <Tooltip/>
                            <Legend/>
                            <Bar dataKey="delay">
                                {statistics[2].map((entry, index) => {
                                    const colors = ['#4392f1', '#E3EBFF', '#DC493A'];
                                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]}/>;
                                })}
                                <LabelList dataKey="name" position="top"/>
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </main>
    );
};

export default InterestingStatistics;