import axios from "axios";
import StopsCSV from "../../../../data_collection/data_cleanup/resources/stops_bremen.csv";

export async function fetchCsvStops() {
  return await axios.get(StopsCSV);
}
