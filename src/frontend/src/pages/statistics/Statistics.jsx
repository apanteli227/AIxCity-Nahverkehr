import React from 'react';
import CustomStatistics from "./CustomStatistics.jsx";
import InterestingStatistics from "./InterestingStatistics.jsx";

const Statistics = () => {
    return (
        <main className="statistics-container">
            <h1 className='statistics-header'>Statistiken</h1>
            <InterestingStatistics/>
            <CustomStatistics/>
        </main>
    );
};

export default Statistics;

