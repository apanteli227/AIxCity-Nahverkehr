// InterestingStatistics.jsx
import React, { useEffect, useState } from 'react';
import Card from "../../components/Card.jsx";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
import { getInterestingStatistics } from '../../api';

const InterestingStatistics = () => {
    const [statistics, setStatistics] = useState([]);

    useEffect(() => {
        async function fetchStatistics() {
            try {
                const data = await getInterestingStatistics();
                setStatistics(data);
            } catch (error) {
                console.error('Error fetching statistics:', error);
            }
        }
        fetchStatistics();
    }, []);

    return (
        <main className='statistics-box'>
            <h2>Interessante Statistiken</h2>
            <h3>Verspätungen</h3>
            <div className="cards-container">
                {statistics.map((statistic, index) => (
                    <Card key={index} statistic={statistic}/>
                ))}
            </div>
            <div className="charts">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={statistics}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                        data={statistics}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <h3>Ausfälle</h3>
            <div className="cards-container">
                {statistics.map((statistic, index) => (
                    <Card key={index} statistic={statistic}/>
                ))}
            </div>
        </main>
    );
};

export default InterestingStatistics;