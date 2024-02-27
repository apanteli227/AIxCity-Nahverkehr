import React from 'react';
import Card from "../../components/Card.jsx";

const interestingStatistics = []

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
            <div>Graph Verspätungstrends</div>
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

