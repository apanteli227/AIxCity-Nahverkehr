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
import {CircularProgress} from "@mui/material";

const InterestingStatistics = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [statistics, setStatistics] = useState([]);
    const [colors, setColors] = useState([]);


    useEffect(() => {
        getInterestingStatistics()
            .then((response) => {
                setIsLoading(!isLoading);
                const data = response.data;
                const cleanedData = data.map(dataArray => {
                    return dataArray.map(item => {
                        return {
                            name: item[0],
                            delay: item[1]
                        };
                    });
                });
                console.log("Lines Data:", data);
                setStatistics(cleanedData);
                setColors(Array.from({length: cleanedData[3].length}, () => getRandomColor()))
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
        isLoading ? <Box sx={{display: 'flex'}}>
                <CircularProgress/>
            </Box> :
            <main className='statistics-box'>
                <h2>Interessante Statistiken der letzten 7 Tage</h2>
                <div className="cards-container">
                    {statistics.map((statistic, index) => (
                        <Card key={index} statistic={statistic}/>
                    ))}
                </div>
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
                    (jede Linie und jede Abfahrt zählt)
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={statistics[0]}
                            margin={{top: 5, right: 30, left: 20, bottom: 5}}
                        >
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="name"/>
                            <YAxis/>
                            <Tooltip/>
                            <Legend/>
                            <Bar dataKey="delay" fill="#FF0000"/>
                        </BarChart>
                    </ResponsiveContainer>
                    <h3>Durschn. Abfahrtsverspätung an Arbeitstagen vs. am Wochenende</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={statistics[1]}
                            margin={{top: 5, right: 30, left: 20, bottom: 5}}
                        >
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="name"/>
                            <YAxis/>
                            <Tooltip/>
                            <Legend/>
                            <Bar dataKey="delay"/>
                            {statistics[1].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % 20]}/> // colors is an array of colors
                            ))}
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
                            <Bar dataKey="delay"/>
                            {statistics[2].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % 20]}/> // colors is an array of colors
                            ))}
                            <LabelList dataKey="name" position="top"/>
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </main>
    );
};

export default InterestingStatistics;