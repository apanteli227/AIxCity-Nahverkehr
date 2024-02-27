import axios from 'axios';

const BASE_URL = 'http://localhost:8080/';

export async function getCardsData() {
    return await axios.get(`${BASE_URL}/getCardsData`);
}

export async function getCustomData(input) {
    return await axios.get(`${BASE_URL}/` + determineEndpoint(input));
}

function determineEndpoint(input) {

}
