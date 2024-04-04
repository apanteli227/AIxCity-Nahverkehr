import axios from 'axios';

const BASE_URL = 'http://134.102.23.195:8079';

export async function getLines() {
    return await axios.get(`${BASE_URL}/get_lines`);
}

export async function getStops() {
    return await axios.get(`${BASE_URL}/get_stops`);
}

export async function getInterestingStatistics() {
    try {
        const response = await axios.get(`${BASE_URL}/get_cards_data`);
        return response.data;
    } catch (error) {
        console.error('Error fetching interesting statistics:', error);
        throw error;
    }
}

export async function getCustomStatistics(input) {
    const {mode, startDateAndTime, endDateAndTime, selectedItems, selectedStatistic, selectedRadio} = input;
    console.log({input})
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
            endpoint = `/${mode}/${selectedItems}/${startDateAndTime}/${endDateAndTime}`;
            break;
        case 'Anzahl der Abfahrten pro Tag':
            throw new Error('Noch nicht unterstützt!');
        case 'Anzahl der Abfahrtenausfälle pro Monat':
            throw new Error('Noch nicht unterstützt!');
        case 'Ausfallrate':
            throw new Error('Noch nicht unterstützt!');
        default:
            throw new Error('Invalid mode');
    }

    return await axios.get(`${BASE_URL}${endpoint}`);
}