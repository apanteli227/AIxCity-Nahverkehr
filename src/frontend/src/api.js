import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8080';

export async function getLines() {
    return await axios.get(`${BASE_URL}/all_lines`);
}

export async function getLinesWithDirections() {
    return await axios.get(`${BASE_URL}/all_lines_with_directions`);
}

export async function getML(selectedRadio, selectedLine) {
    const encodedSelectedLine = encodeURIComponent(selectedLine);
    return await axios.get(`${BASE_URL}/forecast/${selectedRadio}/${encodedSelectedLine}`);
}

export async function getStops() {
    return await axios.get(`${BASE_URL}/all_stops`);
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

export async function getAvgStopDelay() {
    try {
        const response = await axios.get(`${BASE_URL}/get_avg_stop_delay`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

export async function getAvgLineDelay() {
    try {
        const response = await axios.get(`${BASE_URL}/get_avg_line_delay`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
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
        case 'Heatmap':
            endpoint = `/heatmap/${mode}/${encodedSelectedItems}/${startDateTime}/${endDateTime}`;
            break;
        default:
            throw new Error('Invalid mode');
    }
    console.log(`${BASE_URL}${endpoint}`)
    return await axios.get(`${BASE_URL}${endpoint}`);
}
