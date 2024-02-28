import React from 'react';
import Card from "../../components/Card.jsx";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

const interestingStatistics = []
const data = [];

const InterestingStatistics = () => {
    return (
        <>
            <h2>Interessante Statistiken</h2>
            <h3>Verspätungen</h3>
            <div className="cards-container">
                {interestingStatistics.map((statistic, index) => {
                    return <Card key={index} statistic={statistic}/>
                })}
            </div>
            <div className="charts">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        width={500}
                        height={300}
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="name"/>
                        <YAxis/>
                        <Tooltip/>
                        <Legend/>
                        <Bar dataKey="pv" fill="#8884d8"/>
                        <Bar dataKey="uv" fill="#82ca9d"/>
                    </BarChart>
                </ResponsiveContainer>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        width={500}
                        height={300}
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="name"/>
                        <YAxis/>
                        <Tooltip/>
                        <Legend/>
                        <Line
                            type="monotone"
                            dataKey="pv"
                            stroke="#8884d8"
                            activeDot={{r: 8}}
                        />
                        <Line type="monotone" dataKey="uv" stroke="#82ca9d"/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <h3>Ausfälle</h3>
            <div className="cards-container">
                {interestingStatistics.map((statistic, index) => {
                    return <Card key={index} statistic={statistic}/>
                })}
            </div>
        </>
    )
        ;
};

export default InterestingStatistics;

