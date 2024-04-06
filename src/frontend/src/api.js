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
    const {mode, startDateTime, endDateTime, selectedItems, selectedStatistic, selectedRadio} = input;
    console.log({input})
    let endpoint = '';

    // Encode selectedItems as a URI component
    const encodedSelectedItems = encodeURIComponent(selectedItems.join(','));

    switch (selectedStatistic) {
        case "Ankunftsverspätung":
            endpoint = `/arrival/${mode}/${encodedSelectedItems}/${selectedRadio}/${startDateTime}/${endDateTime}`;
            break;
        case "Abfahrtsverspätung":
            endpoint = `/departure/${mode}/${encodedSelectedItems}/${selectedRadio}/${startDateTime}/${endDateTime}`;
            break;
        case "generierte Verspätung":
            endpoint = `/generated_delay/${mode}/${encodedSelectedItems}/${selectedRadio}/${startDateTime}/${endDateTime}`;
            break;
        case 'Verspätungsrate der Abfahrten (nach Abfahrtsverspätung)':
            endpoint = `/${mode}/${encodedSelectedItems}/${startDateTime}/${endDateTime}`;
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
    console.log(`${BASE_URL}${endpoint}`)
    return await axios.get(`${BASE_URL}${endpoint}`);
}