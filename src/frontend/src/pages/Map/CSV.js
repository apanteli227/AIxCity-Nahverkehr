
import axios from "axios";
import StopsCSV from "../../../../backend/data_collection/resources/stops_bremen.csv";

export async function fetchCsvStops() {
  return await axios.get(StopsCSV);
}
