import axios from 'axios';

const BASE_URL = 'http://localhost:8080/';

export async function getInterestingStatistics() {
    return await axios.get(`${BASE_URL}/getCardsData`);
}

export async function getLines() {
    return await axios.get(`${BASE_URL}/getLines`);
}

export async function getStops() {
    return await axios.get(`${BASE_URL}/getStops`);
}

export async function getCustomStatistics(input) {
    return await axios.get(`${BASE_URL}/` + determineEndpoint(input));
}

function determineEndpoint(input) {

}
