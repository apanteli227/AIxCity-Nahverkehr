import axios from 'axios';

const BASE_URL = 'http://134.102.23.195:8079/';

export async function getLines() {
    return await axios.get(`${BASE_URL}/getLines`);
}

export async function getStops() {
    return await axios.get(`${BASE_URL}/getStops`);
}

export async function getInterestingStatistics() {
    try {
        const response = await axios.get(`${BASE_URL}/getCardsData`);
        return response.data;
    } catch (error) {
        console.error('Error fetching interesting statistics:', error);
        throw error;
    }
}

export async function getCustomStatistics(input) {
    const {mode, startDateAndTime, endDateAndTime, selectedItems, selectedStatistic, selectedRadio} = input;
    let endpoint = '';

    switch (selectedStatistic) {
        case "Ankunftsverspätung":
            endpoint = `/arrival/${mode}/${selectedItems}/${selectedRadio}/${startDateAndTime}/${endDateAndTime}`;
            break;
        case "Abfahrtsverspätung":
            endpoint = `/departure/${mode}/${selectedItems}/${selectedRadio}/${startDateAndTime}/${endDateAndTime}`;
            break;
        case "generierte Verspätung":
            endpoint = `/generated_delay/${mode}/${selectedItems}/${selectedRadio}/${startDateAndTime}/${endDateAndTime}`;
            break;
        case 'Verspätungsrate der Abfahrten (nach Abfahrtsverspätung)':
            endpoint = `/${mode}/${selectedStatistic}/${startDateAndTime}/${endDateAndTime}`;
            break;
        default:
            throw new Error('Invalid mode');
    }

    return await axios.get(`${BASE_URL}${endpoint}`);
}

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